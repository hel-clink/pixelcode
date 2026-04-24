/**
 * skulpt-worker.js
 * Runs Python code via Skulpt in a Web Worker.
 * The main thread can terminate() this worker at any time to kill infinite loops.
 *
 * Message protocol (main → worker):
 *   { type: 'run', code: string, canvasW: number, canvasH: number, frame: number, hasDraw: boolean }
 *
 * Message protocol (worker → main):
 *   { type: 'ready' }                          — worker loaded and Skulpt initialised
 *   { type: 'pixels', data: Uint8Array,
 *           w, h, hasDraw }                    — after successful run / draw frame
 *   { type: 'print', text: string }            — Python print() output
 *   { type: 'error', message: string,
 *           lineNo: number }                   — Python runtime / syntax error
 *   { type: 'done' }                           — execution finished (no draw loop)
 */

'use strict';

importScripts('skulpt.min.js', 'skulpt-stdlib.js');

/* ── pixel buffer ── */
let canvasW = 256, canvasH = 256;
let pixBuf  = new Uint8ClampedArray(256 * 256 * 4);
let pending = new Map();
let doClear = false;

function allocBuf(w, h) {
  canvasW = w; canvasH = h;
  pixBuf  = new Uint8ClampedArray(w * h * 4);
  for (let i = 3; i < pixBuf.length; i += 4) pixBuf[i] = 255;
}

function flushBuf() {
  if (doClear) {
    pixBuf.fill(0);
    for (let i = 3; i < pixBuf.length; i += 4) pixBuf[i] = 255;
    doClear = false;
  }
  pending.forEach(([r, g, b], idx) => {
    const o = idx * 4;
    pixBuf[o]=r; pixBuf[o+1]=g; pixBuf[o+2]=b; pixBuf[o+3]=255;
  });
  pending.clear();
  return pixBuf.slice(); // copy so transfer is safe
}

/* ── Skulpt config ── */
let hasDraw = false;
let mod     = null;

function setupSkulpt(w, h) {
  allocBuf(w, h);
  pending.clear(); doClear = false;

  Sk.configure({
    output: txt => {
      const t = txt.replace(/\n$/, '');
      if (t) self.postMessage({ type: 'print', text: t });
    },
    read: fn => {
      if (Sk.builtinFiles && Sk.builtinFiles.files[fn]) return Sk.builtinFiles.files[fn];
      throw 'File not found: ' + fn;
    },
    __future__: Sk.python3,
    execLimit:  10_000_000,  // safety net inside worker (worker can still be terminated externally)
  });

  Sk.builtins['setPixel'] = new Sk.builtin.func((x, y, r, g, b) => {
    const xi = Sk.ffi.remapToJs(x)|0, yi = Sk.ffi.remapToJs(y)|0;
    if (xi >= 0 && xi < canvasW && yi >= 0 && yi < canvasH) {
      pending.set(yi * canvasW + xi, [
        Math.max(0, Math.min(255, Sk.ffi.remapToJs(r)|0)),
        Math.max(0, Math.min(255, Sk.ffi.remapToJs(g)|0)),
        Math.max(0, Math.min(255, Sk.ffi.remapToJs(b)|0)),
      ]);
    }
    return Sk.builtin.none.none$;
  });

  Sk.builtins['leinwandLoeschen'] = new Sk.builtin.func(() => {
    doClear = true; pending.clear(); return Sk.builtin.none.none$;
  });
  Sk.builtins['clearCanvas']  = Sk.builtins['leinwandLoeschen'];
  Sk.builtins['getBreite']    = new Sk.builtin.func(() => new Sk.builtin.int_(canvasW));
  Sk.builtins['getHoehe']     = new Sk.builtin.func(() => new Sk.builtin.int_(canvasH));
  Sk.builtins['getWidth']     = Sk.builtins['getBreite'];
  Sk.builtins['getHeight']    = Sk.builtins['getHoehe'];
}

/* ── parse Skulpt error ── */
function parseErr(err) {
  let msg  = '', line = -1;
  if (err && err.args && err.args.v && err.args.v[0])
    msg = err.args.v[0].v || String(err.args.v[0]);
  if (!msg && err && err.toString) msg = err.toString();
  if (err && err.traceback && err.traceback.length)
    line = err.traceback[err.traceback.length - 1].lineno || -1;
  else if (err && err.lineno) line = err.lineno;
  msg = msg.replace(/\s*\(<stdin>,\s*line\s*\d+\)/g, '').trim();

  const s = err && err.toString ? err.toString() : '';
  if (s.includes('Execution exceeded') || s.includes('execLimit'))
    msg = 'Schrittlimit erreicht – mögliche Endlosschleife (zu viele Schritte).';

  return { msg, line };
}

/* ── message handler ── */
self.onmessage = async function(e) {
  const { type, code, canvasW: w, canvasH: h, frame } = e.data;

  if (type === 'init') {
    setupSkulpt(w || 256, h || 256);
    self.postMessage({ type: 'ready' });
    return;
  }

  if (type === 'run') {
    setupSkulpt(w, h);
    mod = null; hasDraw = false;

    try {
      mod = await Sk.misceval.asyncToPromise(() =>
        Sk.importMainWithBody('<stdin>', false, code, true)
      );
      hasDraw = !!(mod && mod.$d && mod.$d.draw);
      const pixels = flushBuf();
      self.postMessage({ type: 'pixels', data: pixels, w, h, hasDraw }, [pixels.buffer]);
      if (!hasDraw) self.postMessage({ type: 'done' });
    } catch (err) {
      const { msg, line } = parseErr(err);
      const pixels = flushBuf();
      self.postMessage({ type: 'pixels', data: pixels, w, h, hasDraw: false }, [pixels.buffer]);
      self.postMessage({ type: 'error', message: msg, lineNo: line });
    }
    return;
  }

  if (type === 'frame') {
    if (!mod || !mod.$d || !mod.$d.draw) return;
    try {
      await Sk.misceval.asyncToPromise(() =>
        Sk.misceval.callsimOrSuspend(mod.$d.draw, Sk.ffi.remapToPy(frame))
      );
      const pixels = flushBuf();
      self.postMessage({ type: 'pixels', data: pixels, w, h, hasDraw: true }, [pixels.buffer]);
    } catch (err) {
      const { msg, line } = parseErr(err);
      const pixels = flushBuf();
      self.postMessage({ type: 'pixels', data: pixels, w, h, hasDraw: true }, [pixels.buffer]);
      self.postMessage({ type: 'error', message: msg, lineNo: line });
    }
    return;
  }

  if (type === 'rerun_static') {
    // For static code (no draw fn): re-run entire script each logical frame
    setupSkulpt(w, h);
    try {
      mod = await Sk.misceval.asyncToPromise(() =>
        Sk.importMainWithBody('<stdin>', false, code, true)
      );
      const pixels = flushBuf();
      self.postMessage({ type: 'pixels', data: pixels, w, h, hasDraw: false }, [pixels.buffer]);
    } catch (err) {
      const { msg, line } = parseErr(err);
      const pixels = flushBuf();
      self.postMessage({ type: 'pixels', data: pixels, w, h, hasDraw: false }, [pixels.buffer]);
      self.postMessage({ type: 'error', message: msg, lineNo: line });
    }
  }
};
