/**
 * PixelCode — app.js
 * Logic fully separated from index.html.
 * Modules: Canvas, Console, Errors, Watchdog, Runner,
 *          VideoExport, Panels, Markdown, Help, Theme,
 *          DB, FileManager, ProfiMode, wireEvents, init
 */
'use strict';

/* ════════════════════════════════════════
   CONFIG
════════════════════════════════════════ */
const CFG = {
  EXEC_STEP_LIMIT:  5_000_000,
  EXEC_TIMEOUT_MS:  7_000,
  LIVE_DEBOUNCE_MS: 800,
  SAVE_DEBOUNCE_MS: 600,
  MAX_CONSOLE_LINES:250,
  MAX_CANVAS:       800,
  MIN_CANVAS:       16,
  DB_NAME:          'pixelcode',
  DB_VERSION:       1,
  DB_STORE:         'files',
  HELP_INDEX:       'help/index.json',
  THEME_KEY:        'pixelcode-theme',
  PANEL_KEY:        'pixelcode-panels',
};

/* ════════════════════════════════════════
   GLOBAL STATE
════════════════════════════════════════ */
const S = {
  /* canvas */
  W: 256, H: 256,
  /* runtime */
  fps: 30,
  running: false,
  rafId: null,
  frameCount: 0,
  lastTs: 0,
  hasDraw: false,
  workerReady: false,
  /* editor */
  isProfi: false,
  cmMain: null,
  cmProfi: null,
  /* files */
  db: null,
  activeFileId: null,
  /* timers */
  liveTimer: null,
  saveTimer: null,
  /* recording */
  mediaRec: null,
  recording: false,
  /* skulpt worker */
  worker: null,
  /* i18n */
  lang: null,
};

/* ════════════════════════════════════════
   I18N — Internationalization
   Loads JSON from lang/<code>.json.
   Priority: localStorage → navigator.language → 'en'
════════════════════════════════════════ */
const I18n = (() => {
  const STORAGE_KEY = 'pixelcode-lang';
  let current = {};
  let available = [];

  function _preferredCode() {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) return s; } catch(e) {}
    return (navigator.language || 'en').slice(0, 2).toLowerCase();
  }

  async function init() {
    try {
      const r = await fetch('lang/index.json');
      available = await r.json();
    } catch(e) {
      available = [{ code: 'en', label: 'English', flag: '\u{1F1EC}\u{1F1E7}' }];
    }
    const preferred = _preferredCode();
    const code = available.find(l => l.code === preferred) ? preferred : (available[0] ? available[0].code : 'en');
    await _load(code);
    _buildSelector();
  }

  async function _load(code) {
    try {
      const r = await fetch('lang/' + code + '.json');
      if (!r.ok) throw new Error(r.status);
      current = await r.json();
      S.lang = current;
    } catch(e) {
      if (code !== 'en') {
        try { const r = await fetch('lang/en.json'); current = await r.json(); S.lang = current; } catch(e2) {}
      }
    }
    try { localStorage.setItem(STORAGE_KEY, current.lang || code); } catch(e) {}
  }

  /** Get translated string by dot-path. Supports {var} substitution. */
  function t(path, vars) {
    const parts = path.split('.');
    let val = current;
    for (const p of parts) { if (val == null) break; val = val[p]; }
    if (val == null || typeof val !== 'string') return path;
    if (vars) return val.replace(/\{(\w+)\}/g, (_, k) => vars[k] != null ? vars[k] : '{' + k + '}');
    return val;
  }

  /** Apply data-i18n attributes in the DOM */
  function applyDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n, attr = el.dataset.i18nAttr;
      if (attr) el.setAttribute(attr, t(key));
      else el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
  }

  function _buildSelector() {
    const sel = document.getElementById('lang-select');
    if (!sel) return;
    sel.innerHTML = '';
    available.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.flag + ' ' + l.label;
      if (l.code === (current.lang || 'en')) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', async function() {
      await _load(this.value);
      applyDOM();
      Help.reload();
      _updateDynamic();
    });
  }

  function _updateDynamic() {
    const pill = document.getElementById('mode-pill');
    if (pill) pill.textContent = S.isProfi ? t('modeBadge.profi') : t('modeBadge.beginner');
    const btnProfi = document.getElementById('btn-profi');
    if (btnProfi) btnProfi.textContent = S.isProfi ? t('header.beginnerMode') : t('header.profiMode');
    Status.refresh();
  }

  function currentCode() { return current.lang || 'en'; }

  return { init, t, applyDOM, currentCode };
})();


/* ════════════════════════════════════════
   EXAMPLES
════════════════════════════════════════ */
/* ════════════════════════════════════════
   EXAMPLES — loaded dynamically from examples/
   index.json lists all examples with per-language names.
   .py files are fetched on demand when the user clicks Load.
════════════════════════════════════════ */
const Examples = (() => {
  let index = [];  // array of { id, file, names: {en, de, …} }

  async function load() {
    try {
      const r = await fetch('examples/index.json');
      if (!r.ok) throw new Error(r.status);
      index = await r.json();
    } catch(e) {
      console.warn('Could not load examples/index.json:', e);
      index = [];
    }
  }

  /** Fetch the .py source for one example (on demand). */
  async function fetchCode(item) {
    const r = await fetch('examples/' + item.file);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  }

  /** Localised display name for an example item. */
  function nameFor(item) {
    const lang = I18n.currentCode();
    return (item.names && (item.names[lang] || item.names['en'])) || item.id;
  }

  function getIndex() { return index; }

  return { load, fetchCode, nameFor, getIndex };
})();

/** Returns the default starter code in the current language */
function defaultCode() {
  return (
    '# ' + I18n.t('editor.defaultComment') + '\n' +
    '# ' + I18n.t('editor.defaultTip') + '\n' +
    '\n' +
    'setPixel(10, 10, 255, 0, 0)\n'
  );
}

/* ════════════════════════════════════════
   CANVAS MODULE
════════════════════════════════════════ */
const Canvas = (() => {
  let el, ctx, imgData, buf;
  const pending = new Map();
  let doClear = false;

  function init() {
    el  = document.getElementById('pixel-canvas');
    ctx = el.getContext('2d');
    _alloc(S.W, S.H);
  }

  function _alloc(w, h) {
    imgData = ctx.createImageData(w, h);
    buf     = new Uint8ClampedArray(w * h * 4);
    for (let i = 3; i < buf.length; i += 4) buf[i] = 255; // alpha
  }

  function resize(w, h) {
    S.W = w; S.H = h;
    el.width = w; el.height = h;
    _alloc(w, h);
    document.getElementById('canvas-info').textContent = w + '×' + h;
    clear(); fit();
    // Restart the run loop so the worker gets the new dimensions
    // and all draw calls use the updated canvas size
    Runner.start();
  }

  function fit() {
    const wrap = document.getElementById('canvas-wrap');
    const ww = wrap.clientWidth  - 4;
    const wh = wrap.clientHeight - 4;
    if (ww <= 0 || wh <= 0) return;
    const scale = Math.max(1, Math.min(12, Math.floor(Math.min(ww / S.W, wh / S.H))));
    el.style.width  = (S.W * scale) + 'px';
    el.style.height = (S.H * scale) + 'px';
  }

  function clear() {
    buf.fill(0);
    for (let i = 3; i < buf.length; i += 4) buf[i] = 255;
    imgData.data.set(buf);
    ctx.putImageData(imgData, 0, 0);
    pending.clear(); doClear = false;
  }

  /* called from Skulpt builtin */
  function setPixel(x, y, r, g, b) {
    if (x >= 0 && x < S.W && y >= 0 && y < S.H) {
      pending.set(y * S.W + x, [
        Math.max(0, Math.min(255, r)),
        Math.max(0, Math.min(255, g)),
        Math.max(0, Math.min(255, b)),
      ]);
    }
  }

  function scheduleClear() { doClear = true; pending.clear(); }

  function flush() {
    if (doClear) {
      buf.fill(0);
      for (let i = 3; i < buf.length; i += 4) buf[i] = 255;
      doClear = false;
    }
    pending.forEach(([r, g, b], idx) => {
      const o = idx * 4;
      buf[o] = r; buf[o+1] = g; buf[o+2] = b; buf[o+3] = 255;
    });
    pending.clear();
    imgData.data.set(buf);
    ctx.putImageData(imgData, 0, 0);
  }

  function fromWorker(pixelData, w, h) {
    // Pixel data arrives as Uint8ClampedArray from worker (transferred)
    if (w !== S.W || h !== S.H) return; // stale frame from old worker
    if (!(pixelData instanceof Uint8ClampedArray)) {
      pixelData = new Uint8ClampedArray(pixelData);
    }
    imgData.data.set(pixelData);
    ctx.putImageData(imgData, 0, 0);
  }

  function exportPNG() {
    const a = document.createElement('a');
    a.href = el.toDataURL('image/png'); a.download = 'pixelcode.png'; a.click();
  }

  function getEl() { return el; }

  return { init, resize, fit, clear, setPixel, scheduleClear, flush, fromWorker, exportPNG, getEl };
})();

/* ════════════════════════════════════════
   CONSOLE MODULE
════════════════════════════════════════ */
const Con = (() => {
  let body;
  let lastErr = '', errCount = 0;

  function init() { body = document.getElementById('console-body'); }

  function log(msg, cls) {
    const d = document.createElement('div');
    d.className = 'con-line ' + (cls || 'con-out');
    d.textContent = msg;
    body.appendChild(d);
    _trim();
    body.scrollTop = body.scrollHeight;
  }

  function err(msg) {
    if (msg === lastErr) {
      errCount++;
      const last = body.querySelector('[data-err]:last-child') || body.lastElementChild;
      if (last && last.dataset.err) { last.textContent = msg + ' (×' + errCount + ')'; return; }
    } else {
      errCount = 1; lastErr = msg;
    }
    const d = document.createElement('div');
    d.className = 'con-line con-err';
    d.dataset.err = '1';
    d.textContent = msg;
    body.appendChild(d);
    _trim();
    body.scrollTop = body.scrollHeight;
  }

  function clear() { body.innerHTML = ''; lastErr = ''; errCount = 0; }

  function _trim() {
    while (body.children.length > CFG.MAX_CONSOLE_LINES)
      body.removeChild(body.firstChild);
  }

  return { init, log, err, clear };
})();

/* ════════════════════════════════════════
   STATUS INDICATOR
════════════════════════════════════════ */
const Status = (() => {
  let el;
  let _cur = 'stopped';

  function init() { el = document.getElementById('run-status'); }

  function set(state) {
    _cur = state;
    if (!el) return;
    el.className = 'run-status ' + state;
    const labels = {
      running: I18n.t('status.running'),
      error:   I18n.t('status.error'),
      stopped: I18n.t('status.stopped'),
    };
    el.textContent = labels[state] || '';
  }

  function refresh() { set(_cur); }

  return { init, set, refresh };
})();

/* ════════════════════════════════════════
   ERROR HANDLER
════════════════════════════════════════ */
const Errors = (() => {
  function clearMarker() {
    const ed = _activeEd();
    if (ed) ed.eachLine(lh => ed.removeLineClass(lh, 'background', 'cm-error-line'));
  }

  function _activeEd() {
    return (S.isProfi && S.cmProfi) ? S.cmProfi : S.cmMain;
  }

  function highlight(line1) {
    clearMarker();
    const ed = _activeEd();
    if (!ed || line1 < 1) return;
    let el = line1 - 1; // convert to 0-based
    if (el < 0) return;
    ed.addLineClass(el, 'background', 'cm-error-line');
    ed.scrollIntoView({ line: el, ch: 0 }, 80);
  }

  function report(err) {
    let msg = '', line = -1;

    if (err && err.args && err.args.v && err.args.v[0])
      msg = err.args.v[0].v || String(err.args.v[0]);
    if (!msg && err && err.toString) msg = err.toString();

    if (err && err.traceback && err.traceback.length)
      line = err.traceback[err.traceback.length - 1].lineno || -1;
    else if (err && err.lineno) line = err.lineno;

    msg = msg.replace(/\s*\(<stdin>,\s*line\s*\d+\)/g, '').trim();

    const errStr = err && err.toString ? err.toString() : String(err);
    if (errStr.includes('Execution exceeded') || errStr.includes('execLimit')) {
      Con.err('⚠ Schrittlimit erreicht – mögliche Endlosschleife.');
      Status.set('error'); return;
    }

    let display = 'Fehler: ';
    if (line > 0) {
      let ul = line;
      if (!S.isProfi) {
        // In beginner mode line numbers map directly since builtins are native
      }
      display += '[Line ' + ul + '] ';
    }
    display += msg || String(err);
    Con.err(display);
    if (line > 0) highlight(line);
    Status.set('error');
  }

  function reportRaw(message, lineNo) {
    let display = 'Fehler: ';
    if (lineNo > 0) display += '[Line ' + lineNo + '] ';
    display += (message || '(unbekannter Fehler)');
    Con.err(display);
    if (lineNo > 0) highlight(lineNo);
  }

  return { clearMarker, report, reportRaw };
})();

/* ════════════════════════════════════════
   RUNNER — Web Worker based (infinite loop safe)
   Skulpt runs in a Worker → terminate() kills any infinite loop.
════════════════════════════════════════ */
function getUserCode() {
  if (S.isProfi && S.cmProfi) return S.cmProfi.getValue();
  return S.cmMain ? S.cmMain.getValue() : '';
}

const Runner = (() => {
  let killTimer = null;

  function start() {
    _halt();
    Con.clear();
    Errors.clearMarker();
    Con.log(I18n.t('console.running'), 'con-sys');
    Status.set('running');
    _setBtns(true);
    S.running = true;
    S.frameCount = 0;
    S.hasDraw = false;
    _spawnWorker();
    _runInitial();
  }

  function stop(log = true) {
    _halt();
    if (log) Con.log(I18n.t('console.stopped'), 'con-sys');
    Status.set('stopped');
  }

  function _spawnWorker() {
    if (S.worker) { S.worker.terminate(); S.worker = null; }
    S.worker = new Worker('lib/skulpt-worker.js');
    S.worker.onmessage = _onMsg;
    S.worker.onerror   = e => {
      Con.err(I18n.t('console.workerError', {msg: e.message || e}));
      Status.set('error');
      _scheduleRetry();
    };
  }

  function _killWorker() {
    if (killTimer) { clearTimeout(killTimer); killTimer = null; }
    if (S.worker)  { S.worker.terminate(); S.worker = null; }
  }

  function _armTimeout(msg) {
    if (killTimer) clearTimeout(killTimer);
    killTimer = setTimeout(() => {
      Con.err(msg);
      Status.set('error');
      _killWorker();
      _scheduleRetry();
    }, CFG.EXEC_TIMEOUT_MS);
  }

  function _runInitial() {
    if (!S.running || !S.worker) return;
    _armTimeout(I18n.t('console.timeout', {sec: CFG.EXEC_TIMEOUT_MS/1000}));
    S.worker.postMessage({ type: 'run', code: getUserCode(), canvasW: S.W, canvasH: S.H, frame: 0 });
  }

  function _onMsg(e) {
    const m = e.data;

    if (m.type === 'pixels') {
      if (killTimer) { clearTimeout(killTimer); killTimer = null; }
      Canvas.fromWorker(m.data, m.w, m.h);
      S.hasDraw = m.hasDraw;
      if (m.hasDraw) _scheduleFrame(); // draw() returned — schedule next
    }

    if (m.type === 'print') Con.log(m.text, 'con-out');

    if (m.type === 'error') {
      Errors.reportRaw(m.message, m.lineNo);
      Status.set('error');
      // never stop — keep looping
    }

    if (m.type === 'done') {
      // static code done, start loop
      if (!S.hasDraw) {
        Con.log(I18n.t('console.loopRunning'), 'con-sys');
        _scheduleFrame();
      } else {
        Con.log(I18n.t('console.animRunning'), 'con-sys');
      }
    }
  }

  function _scheduleFrame() {
    if (!S.running) return;
    S.rafId = requestAnimationFrame(ts => {
      if (!S.running) return;
      if (ts - S.lastTs < 1000 / S.fps) { _scheduleFrame(); return; }
      S.lastTs = ts;
      _sendFrame();
    });
  }

  function _sendFrame() {
    if (!S.running) return;
    if (!S.worker) { _spawnWorker(); _runInitial(); return; }
    _armTimeout(I18n.t('console.frameTimeout'));
    if (S.hasDraw) {
      S.worker.postMessage({ type: 'frame', canvasW: S.W, canvasH: S.H, frame: S.frameCount });
    } else {
      S.worker.postMessage({ type: 'rerun_static', code: getUserCode(), canvasW: S.W, canvasH: S.H });
    }
    S.frameCount++;
    Status.set('running');
  }

  function _scheduleRetry() {
    S.running = false;
    _setBtns(false);
    setTimeout(() => {
      if (!S.running) { S.running = true; _setBtns(true); _spawnWorker(); _runInitial(); }
    }, 600);
  }

  function _halt() {
    if (S.rafId)  { cancelAnimationFrame(S.rafId); S.rafId = null; }
    _killWorker();
    S.running = false;
    _setBtns(false);
  }

  function _setBtns(running) {
    const r = document.getElementById('btn-run');
    const s = document.getElementById('btn-stop');
    if (r) r.disabled =  running;
    if (s) s.disabled = !running;
  }

  return { start, stop };
})();

/* ════════════════════════════════════════
   VIDEO EXPORT
════════════════════════════════════════ */
const VideoExport = (() => {
  let chunks = [], stopTimer = null;

  function start(sec) {
    if (S.recording) return;
    const canvasEl = Canvas.getEl();
    let stream;
    try { stream = canvasEl.captureStream(S.fps); }
    catch (e) { Con.err(I18n.t('console.recUnsupported')); return; }

    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9' : 'video/webm';
    chunks = [];
    S.mediaRec = new MediaRecorder(stream, { mimeType: mime });
    S.mediaRec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    S.mediaRec.onstop = () => {
      const blob = new Blob(chunks, { type: mime });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'pixelcode.webm'; a.click();
      URL.revokeObjectURL(url);
      S.recording = false;
      document.getElementById('rec-indicator').classList.remove('recording');
      Con.log(I18n.t('console.recDone', {sec}), 'con-ok');
    };
    S.mediaRec.start();
    S.recording = true;
    document.getElementById('rec-indicator').classList.add('recording');
    Con.log(I18n.t('console.recStart', {sec}), 'con-sys');
    stopTimer = setTimeout(() => S.mediaRec && S.mediaRec.stop(), sec * 1000);
  }

  function abort() {
    clearTimeout(stopTimer);
    if (S.mediaRec && S.recording) S.mediaRec.stop();
  }

  return { start, abort };
})();

/* ════════════════════════════════════════
   CODEMIRROR HELPERS
════════════════════════════════════════ */
function cmTheme() {
  return document.documentElement.classList.contains('light') ? 'default' : 'dracula';
}

function cmBaseCfg() {
  return {
    mode: 'python', theme: cmTheme(),
    lineNumbers: true, matchBrackets: true, autoCloseBrackets: true,
    indentUnit: 4, tabSize: 4, indentWithTabs: false,
    extraKeys: {
      'Tab':        cm => cm.replaceSelection('    '),
      'Ctrl-Enter': () => Runner.start(),
      'Cmd-Enter':  () => Runner.start(),
    },
  };
}

function initEditors() {
  S.cmMain = CodeMirror.fromTextArea(document.getElementById('cm-editor'), cmBaseCfg());
  S.cmMain.setValue(defaultCode());
  S.cmMain.setSize('100%', '100%');

  S.cmMain.on('change', () => {
    // live-reload debounce
    clearTimeout(S.liveTimer);
    S.liveTimer = setTimeout(() => { Runner.start(); }, CFG.LIVE_DEBOUNCE_MS);
    // auto-save debounce
    clearTimeout(S.saveTimer);
    S.saveTimer = setTimeout(() => {
      if (S.activeFileId !== null)
        DB.save(S.activeFileId, Files.currentName(), S.cmMain.getValue(), false);
    }, CFG.SAVE_DEBOUNCE_MS);
  });
}

/* ════════════════════════════════════════
   PROFI MODE
════════════════════════════════════════ */
const SYSTEM_MARKER = '# ════ Dein Code ════';

function sysCodeDisplay() {
  return `# PixelCode System-Code
# (setPixel, leinwandLoeschen, getBreite, getHoehe sind eingebaut)

`;
}

const Profi = (() => {
  function on() {
    if (!confirm(I18n.t('modals.profi.confirm'))) return;
    S.isProfi = true;
    const user = S.cmMain.getValue();
    const full = sysCodeDisplay() + SYSTEM_MARKER + '\n' + user;

    document.getElementById('profi-top-wrap').style.display = 'block';
    document.getElementById('profi-divider').style.display  = 'block';
    document.getElementById('bg-banner').style.display      = 'none';
    document.getElementById('editor-wrap').style.display    = 'none';

    if (!S.cmProfi) {
      S.cmProfi = CodeMirror.fromTextArea(
        document.getElementById('profi-top-code'), cmBaseCfg()
      );
      S.cmProfi.setSize('100%', '100%');
    }
    S.cmProfi.setValue(full);

    document.getElementById('mode-pill').textContent = I18n.t('modeBadge.profi');
    document.getElementById('mode-pill').classList.add('profi');
    document.getElementById('btn-profi').textContent = I18n.t('header.beginnerMode');
    Con.log(I18n.t('console.profiOn'), 'con-sys');
    setTimeout(() => S.cmProfi && S.cmProfi.refresh(), 50);
  }

  function off() {
    if (!confirm(I18n.t('modals.profi.revert'))) return;
    S.isProfi = false;
    if (S.cmProfi) {
      const full = S.cmProfi.getValue();
      const idx  = full.indexOf(SYSTEM_MARKER);
      S.cmMain.setValue(idx > -1 ? full.slice(idx + SYSTEM_MARKER.length + 1) : '');
    }
    document.getElementById('profi-top-wrap').style.display = 'none';
    document.getElementById('profi-divider').style.display  = 'none';
    document.getElementById('bg-banner').style.display      = 'flex';
    document.getElementById('editor-wrap').style.display    = 'flex';
    document.getElementById('mode-pill').textContent = I18n.t('modeBadge.beginner');
    document.getElementById('mode-pill').classList.remove('profi');
    document.getElementById('btn-profi').textContent = I18n.t('header.profiMode');
    Con.log(I18n.t('console.profiOff'), 'con-sys');
    setTimeout(() => S.cmMain && S.cmMain.refresh(), 50);
  }

  function toggle() { S.isProfi ? off() : on(); }
  return { on, off, toggle };
})();

/* ════════════════════════════════════════
   PANEL COLLAPSE  (left/right = narrow column)
════════════════════════════════════════ */
const Panels = (() => {
  // Map panelId → colId they live in (for width-collapsing)
  const PANEL_COL = {
    'panel-files':   'col-files',
    'panel-canvas':  'col-left',
    'panel-console': 'col-left',
    'panel-editor':  'col-mid',
    'panel-help':    'col-right',
  };

  // Some columns have multiple panels; collapse the column only when ALL panels in it are collapsed
  const COL_PANELS = {};
  Object.entries(PANEL_COL).forEach(([pid, cid]) => {
    if (!COL_PANELS[cid]) COL_PANELS[cid] = [];
    COL_PANELS[cid].push(pid);
  });

  // Saved collapsed widths per column
  const savedW = {};
  let state = {};

  function init() {
    try { state = JSON.parse(localStorage.getItem(CFG.PANEL_KEY) || '{}'); } catch(e) {}

    document.querySelectorAll('[data-panel]').forEach(btn => {
      const pid = btn.dataset.panel;
      // Single listener on the button only — stopPropagation prevents double-fire
      btn.addEventListener('click', e => { e.stopPropagation(); toggle(pid); });
      if (state[pid]) _collapsePanel(pid);
    });

    // After initial collapse, sync column widths
    Object.values(PANEL_COL).forEach(cid => _syncColVisibility(cid));
  }

  function toggle(pid) {
    const panel = document.getElementById(pid);
    if (!panel) return;
    if (panel.classList.contains('collapsed')) _expandPanel(pid);
    else                                        _collapsePanel(pid);
    state[pid] = panel.classList.contains('collapsed');
    _save();
    _syncColVisibility(PANEL_COL[pid]);
  }

  function _collapsePanel(pid) {
    const panel = document.getElementById(pid);
    if (panel) panel.classList.add('collapsed');
  }

  function _expandPanel(pid) {
    const panel = document.getElementById(pid);
    if (!panel) return;
    panel.classList.remove('collapsed');
    setTimeout(() => {
      if (S.cmMain)  S.cmMain.refresh();
      if (S.cmProfi) S.cmProfi.refresh();
      Canvas.fit();
    }, 50);
  }

  function _syncColVisibility(cid) {
    if (!cid) return;
    const col    = document.getElementById(cid);
    const resId  = { 'col-files':'res-files', 'col-left':'res-left', 'col-right':'res-right' };
    const res    = document.getElementById(resId[cid]);
    const panels = COL_PANELS[cid] || [];

    const allCollapsed = panels.every(pid => {
      const p = document.getElementById(pid);
      return p && p.classList.contains('collapsed');
    });

    if (allCollapsed) {
      // Save current width before shrinking
      if (savedW[cid] == null) savedW[cid] = col.offsetWidth + 'px';
      col.classList.add('col-strip');
      col.style.width    = '36px';
      col.style.minWidth = '36px';
      if (res) res.style.pointerEvents = 'none';
      // Make the whole strip clickable to re-expand
      col._stripClick = () => {
        panels.forEach(pid => {
          const p = document.getElementById(pid);
          if (p && p.classList.contains('collapsed')) toggle(pid);
        });
      };
      col.addEventListener('click', col._stripClick);
    } else {
      // Remove strip mode
      col.classList.remove('col-strip');
      if (col._stripClick) { col.removeEventListener('click', col._stripClick); delete col._stripClick; }
      const restore = savedW[cid];
      delete savedW[cid];
      col.style.width    = restore || '';
      col.style.minWidth = '';
      if (res) res.style.pointerEvents = '';
    }

    Canvas.fit();
    if (S.cmMain)  S.cmMain.refresh();
    if (S.cmProfi) S.cmProfi.refresh();
  }

  function _save() {
    try { localStorage.setItem(CFG.PANEL_KEY, JSON.stringify(state)); } catch(e) {}
  }

  return { init };
})();

/* ════════════════════════════════════════
   MARKDOWN RENDERER
════════════════════════════════════════ */
const Markdown = (() => {
  function render(raw) {
    // 1. Extract fenced code blocks before escaping
    const blocks = [];
    let md = raw.replace(/```[^\n]*\n([\s\S]*?)```/g, (_, code) => {
      blocks.push(code);
      return `\x00CODE${blocks.length - 1}\x00`;
    });

    // 2. Escape HTML
    md = md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // 3. Details/summary (after escape, restore tags)
    md = md
      .replace(/&lt;details&gt;/g, '<details>')
      .replace(/&lt;\/details&gt;/g, '</details>')
      .replace(/&lt;summary&gt;(.*?)&lt;\/summary&gt;/g, '<summary>$1</summary>');

    // 4. Headings
    md = md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,   '<h1>$1</h1>');

    // 5. HR / blockquote
    md = md
      .replace(/^---$/gm, '<hr>')
      .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // 6. Bold / italic
    md = md
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>');

    // 7. Inline code
    md = md.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // 8. Tables
    md = _tables(md);

    // 9. Lists
    md = md
      .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    md = md.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => '<ul>' + m + '</ul>');

    // 10. Paragraphs (lines not already block-level tags)
    md = md.replace(/^(?!<[hublpd]|#|\x00)(.+)$/gm, '<p>$1</p>');

    // 11. Restore code blocks with copy button
    md = md.replace(/\x00CODE(\d+)\x00/g, (_, i) => {
      const code = blocks[+i].trimEnd();
      const id   = 'cb' + Math.random().toString(36).slice(2, 8);
      const esc  = code
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<div class="md-code-block" id="${id}">` +
        `<button class="md-copy-btn" onclick="Markdown.copy('${id}',this)">Kopieren</button>` +
        `<pre><code>${esc}</code></pre></div>`;
    });

    return md;
  }

  function _tables(md) {
    const rows = md.split('\n');
    const out  = [];
    let inTable = false, isHeader = true;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (/^\|.+\|$/.test(row.trim())) {
        const cells = row.split('|').filter((_,j,a)=>j>0&&j<a.length-1).map(c=>c.trim());
        if (cells.every(c => /^[-: ]+$/.test(c))) { isHeader = false; continue; }
        if (!inTable) { out.push('<table>'); inTable = true; isHeader = true; }
        const tag = isHeader ? 'th' : 'td';
        out.push('<tr>' + cells.map(c=>`<${tag}>${c}</${tag}>`).join('') + '</tr>');
        isHeader = false;
      } else {
        if (inTable) { out.push('</table>'); inTable = false; }
        out.push(row);
      }
    }
    if (inTable) out.push('</table>');
    return out.join('\n');
  }

  function copy(id, btn) {
    const el = document.getElementById(id);
    if (!el) return;
    const code = el.querySelector('code').textContent;
    const doMark = () => {
      btn.textContent = '✓ Kopiert!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Kopieren'; btn.classList.remove('copied'); }, 1800);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(doMark).catch(() => _fallback(code, doMark));
    } else {
      _fallback(code, doMark);
    }
  }

  function _fallback(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    cb();
  }

  return { render, copy };
})();

window.Markdown = Markdown; // needed for inline onclick in rendered MD

/* ════════════════════════════════════════
   HELP SYSTEM
════════════════════════════════════════ */
const Help = (() => {
  let index = [];
  let currentId = null;

  async function init() {
    try {
      const r = await fetch(CFG.HELP_INDEX);
      if (!r.ok) throw new Error(r.status);
      index = await r.json();
      _buildNav();
      await _load(index[0].id);
    } catch (e) {
      document.getElementById('tutorial-body').innerHTML =
        '<p style="color:var(--text-dim);padding:10px;">' +
        I18n.t('help.notFound').replace('\n', '<br>') + '</p>';
    }
  }

  /** Called by I18n when language changes — reload current page in new language */
  function reload() {
    _buildNav();
    if (currentId) _load(currentId);
    else if (index.length) _load(index[0].id);
  }

  function _buildNav() {
    const nav = document.getElementById('help-nav');
    nav.innerHTML = '';
    index.forEach(item => {
      const btn = document.createElement('button');
      btn.className   = 'help-nav-item';
      // Title comes from i18n, keyed by item.id
      btn.textContent = I18n.t('helpNav.' + item.id);
      btn.dataset.id  = item.id;
      btn.addEventListener('click', () => _load(item.id));
      nav.appendChild(btn);
    });
  }

  async function _load(id) {
    const item = index.find(i => i.id === id);
    if (!item) return;
    currentId = id;
    document.querySelectorAll('.help-nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.id === id);
      b.textContent = I18n.t('helpNav.' + b.dataset.id);
    });
    const body = document.getElementById('tutorial-body');
    // Load from language-specific subfolder: help/<lang>/ref.md
    const lang = I18n.currentCode();
    const url  = 'help/' + lang + '/' + item.file;
    try {
      const r  = await fetch(url);
      if (!r.ok) throw new Error(r.status);
      const md = await r.text();
      body.innerHTML = Markdown.render(md);
    } catch (e) {
      // Fallback to English
      try {
        const r2 = await fetch('help/en/' + item.file);
        if (!r2.ok) throw new Error(r2.status);
        body.innerHTML = Markdown.render(await r2.text());
      } catch (e2) {
        body.innerHTML = '<p style="color:var(--red);padding:10px;">Error loading: ' + url + '</p>';
      }
    }
  }

  return { init, reload };
})();

/* ════════════════════════════════════════
   THEME
════════════════════════════════════════ */
const Theme = (() => {
  function apply(light) {
    document.documentElement.classList.toggle('light', light);
    const btn = document.getElementById('btn-theme');
    if (btn) { btn.textContent = light ? '☀️' : '🌙'; btn.title = light ? 'Dark Mode' : 'Light Mode'; }
    const t = cmTheme();
    if (S.cmMain)  S.cmMain.setOption('theme', t);
    if (S.cmProfi) S.cmProfi.setOption('theme', t);
    try { localStorage.setItem(CFG.THEME_KEY, light ? 'light' : 'dark'); } catch(e) {}
  }
  function toggle() { apply(!document.documentElement.classList.contains('light')); }
  function restore() { try { if (localStorage.getItem(CFG.THEME_KEY) === 'light') apply(true); } catch(e) {} }
  return { apply, toggle, restore };
})();

/* ════════════════════════════════════════
   INDEXEDDB
════════════════════════════════════════ */
const DB = (() => {
  function open() {
    return new Promise((res, rej) => {
      const req = indexedDB.open(CFG.DB_NAME, CFG.DB_VERSION);
      req.onupgradeneeded = e => {
        const s = e.target.result.createObjectStore(CFG.DB_STORE, { keyPath:'id', autoIncrement:true });
        s.createIndex('name', 'name', { unique:false });
      };
      req.onsuccess = e => { S.db = e.target.result; res(S.db); };
      req.onerror   = e => rej(e.target.error);
    });
  }
  function _tx(mode) { return S.db.transaction(CFG.DB_STORE, mode).objectStore(CFG.DB_STORE); }
  function all()     { return new Promise((r,j) => { const q=_tx('readonly').getAll(); q.onsuccess=()=>r(q.result); q.onerror=()=>j(q.error); }); }
  function get(id)   { return new Promise((r,j) => { const q=_tx('readonly').get(id);  q.onsuccess=()=>r(q.result); q.onerror=()=>j(q.error); }); }
  function del(id)   { return new Promise((r,j) => { const q=_tx('readwrite').delete(id); q.onsuccess=()=>r(); q.onerror=()=>j(q.error); }); }
  function save(id, name, code, refresh=true) {
    return new Promise((res, rej) => {
      const store = _tx('readwrite');
      const obj   = { name, code, updatedAt: Date.now() };
      if (id !== null) obj.id = id;
      const req   = id !== null ? store.put(obj) : store.add(obj);
      req.onsuccess = () => { if (refresh) Files.render(); res(req.result); };
      req.onerror   = () => rej(req.error);
    });
  }
  return { open, all, get, del, save };
})();

/* ════════════════════════════════════════
   FILE MANAGER
════════════════════════════════════════ */
const Files = (() => {
  async function render() {
    const list  = document.getElementById('file-list');
    const files = await DB.all();
    list.innerHTML = '';
    files.sort((a,b) => b.updatedAt - a.updatedAt);
    files.forEach(f => {
      const item  = document.createElement('div');
      item.className = 'file-item' + (f.id === S.activeFileId ? ' active' : '');

      const name = document.createElement('span');
      name.className = 'file-item-name';
      name.textContent = f.name; name.title = f.name;
      name.addEventListener('dblclick', e => { e.stopPropagation(); _rename(item, name, f); });

      const ren = document.createElement('button');
      ren.className = 'file-btn'; ren.textContent = '✎'; ren.title = I18n.t('files.rename');
      ren.addEventListener('click', e => { e.stopPropagation(); _rename(item, name, f); });

      const del = document.createElement('button');
      del.className = 'file-btn del'; del.textContent = '✕'; del.title = I18n.t('files.delete');
      del.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm(I18n.t('files.confirmDelete', {name: f.name}))) return;
        await DB.del(f.id);
        if (S.activeFileId === f.id) { S.activeFileId = null; _setTitle(''); }
        render();
      });

      item.append(name, ren, del);
      item.addEventListener('click', () => open(f.id));
      list.appendChild(item);
    });
  }

  function _rename(item, nameEl, f) {
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'file-item-name editing'; inp.value = f.name;
    nameEl.replaceWith(inp); inp.focus(); inp.select();
    const commit = async () => {
      const n   = inp.value.trim() || f.name;
      const cur = await DB.get(f.id);
      await DB.save(f.id, n, cur ? cur.code : '', true);
      if (S.activeFileId === f.id) _setTitle(n);
    };
    inp.addEventListener('blur', commit);
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { e.preventDefault(); inp.blur(); }
      if (e.key === 'Escape') { inp.value = f.name; inp.blur(); }
    });
  }

  async function open(id) {
    if (S.activeFileId !== null && S.cmMain)
      await DB.save(S.activeFileId, currentName(), S.cmMain.getValue(), false);
    const f = await DB.get(id);
    if (!f) return;
    S.activeFileId = id;
    if (S.cmMain) S.cmMain.setValue(f.code || '');
    _setTitle(f.name);
    render();
  }

  function currentName() {
    return document.getElementById('current-filename')
      .textContent.replace(/^–\s*/, '').trim() || 'unbenannt.py';
  }

  function _setTitle(n) {
    document.getElementById('current-filename').textContent = n ? '– ' + n : '';
  }

  async function newFile(name) {
    if (!name.endsWith('.py')) name += '.py';
    if (S.activeFileId !== null && S.cmMain)
      await DB.save(S.activeFileId, currentName(), S.cmMain.getValue(), false);
    const code = '# ' + name + '\n# ' + I18n.t('editor.defaultTip') + '\n\nsetPixel(10, 10, 255, 0, 0)\n';
    const id   = await DB.save(null, name, code, true);
    S.activeFileId = id;
    if (S.cmMain) S.cmMain.setValue(code);
    _setTitle(name);
  }

  async function importFile(file) {
    const text = await file.text();
    if (S.activeFileId !== null && S.cmMain)
      await DB.save(S.activeFileId, currentName(), S.cmMain.getValue(), false);
    const id = await DB.save(null, file.name, text, true);
    S.activeFileId = id;
    if (S.cmMain) S.cmMain.setValue(text);
    _setTitle(file.name);
    render();
  }

  async function exportFile() {
    if (S.activeFileId !== null && S.cmMain)
      await DB.save(S.activeFileId, currentName(), S.cmMain.getValue(), false);
    const code = S.cmMain ? S.cmMain.getValue() : '';
    const name = currentName();
    const blob = new Blob([code], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  return { render, open, currentName, newFile, importFile, exportFile };
})();

/* ════════════════════════════════════════
   RESIZER
════════════════════════════════════════ */
function makeResizer(resId, colId, dir) {
  const res = document.getElementById(resId);
  const col = document.getElementById(colId);
  if (!res || !col) return;
  res.addEventListener('mousedown', e => {
    const sx = e.clientX, sw = col.offsetWidth;
    res.classList.add('dragging');
    Object.assign(document.body.style, { cursor: 'col-resize', userSelect: 'none' });
    const mv = e2 => {
      const dx = e2.clientX - sx;
      col.style.width = Math.max(100, sw + (dir === 'right' ? dx : -dx)) + 'px';
      Canvas.fit();
      if (S.cmMain)  S.cmMain.refresh();
      if (S.cmProfi) S.cmProfi.refresh();
    };
    const up = () => {
      res.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', mv);
      document.removeEventListener('mouseup',   up);
    };
    document.addEventListener('mousemove', mv);
    document.addEventListener('mouseup',   up);
  });
}

/* ════════════════════════════════════════
   AUTOCOMPLETE
════════════════════════════════════════ */
const HINTS = ['setPixel','leinwandLoeschen','clearCanvas','getBreite','getHoehe',
  'getWidth','getHeight','draw','frame','range','print','import','math','random',
  'int','float','abs','min','max','len','for','in','if','elif','else','def',
  'return','while','True','False','None'];

function applyAutocomplete(enabled) {
  if (!S.cmMain) return;
  const keys = {
    'Tab': cm => cm.replaceSelection('    '),
    'Ctrl-Enter': () => Runner.start(),
    'Cmd-Enter':  () => Runner.start(),
  };
  if (enabled) {
    keys['Ctrl-Space'] = cm => CodeMirror.showHint(cm, () => {
      const cur = cm.getCursor(), tok = cm.getTokenAt(cur);
      return { list: HINTS.filter(h => h.startsWith(tok.string)),
               from: CodeMirror.Pos(cur.line, tok.start), to: cur };
    });
  }
  S.cmMain.setOption('extraKeys', keys);
}

/* ════════════════════════════════════════
   MODAL HELPERS
════════════════════════════════════════ */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
window.closeModal = closeModal; // for inline onclick in modal HTML

function bgClose(id) {
  document.getElementById(id).addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal(id);
  });
}

/* ════════════════════════════════════════
   WIRE EVENTS
════════════════════════════════════════ */
function wireEvents() {
  // Run / Stop
  document.getElementById('btn-run').addEventListener('click', () => Runner.start());
  document.getElementById('btn-stop').addEventListener('click', () => Runner.stop(true));

  // Canvas clear / console clear
  document.getElementById('btn-clear-canvas').addEventListener('click', Canvas.clear);
  document.getElementById('btn-clear-console').addEventListener('click', Con.clear);

  // FPS
  document.getElementById('fps-slider').addEventListener('input', function() {
    S.fps = +this.value;
    document.getElementById('fps-val').textContent = S.fps;
  });

  // Canvas size
  document.getElementById('canvas-size-sel').addEventListener('change', function() {
    const v = this.value;
    if (v === 'custom')  { openModal('modal-layout'); return; }
    if (v === '320x240') { Canvas.resize(320, 240); return; }
    Canvas.resize(+v, +v);
  });

  // Autocomplete
  document.getElementById('chk-autocomplete').addEventListener('change', function() {
    applyAutocomplete(this.checked);
  });

  // Theme
  document.getElementById('btn-theme').addEventListener('click', Theme.toggle);

  // Profi mode
  document.getElementById('btn-profi').addEventListener('click', Profi.toggle);
  document.getElementById('banner-profi-link').addEventListener('click', Profi.on);

  // Layout modal
  document.getElementById('btn-layout').addEventListener('click', () => openModal('modal-layout'));
  document.getElementById('modal-layout-close').addEventListener('click', () => closeModal('modal-layout'));
  bgClose('modal-layout');
  document.getElementById('toggle-files').addEventListener('change', function() {
    document.getElementById('col-files').classList.toggle('col-hidden', !this.checked);
    document.getElementById('res-files').style.display = this.checked ? '' : 'none';
  });
  document.getElementById('toggle-left').addEventListener('change', function() {
    document.getElementById('col-left').classList.toggle('col-hidden', !this.checked);
    document.getElementById('res-left').style.display = this.checked ? '' : 'none';
    Canvas.fit();
  });
  document.getElementById('toggle-right').addEventListener('change', function() {
    document.getElementById('col-right').classList.toggle('col-hidden', !this.checked);
    document.getElementById('res-right').style.display = this.checked ? '' : 'none';
  });
  document.getElementById('btn-apply-custom').addEventListener('click', () => {
    const w = Math.max(CFG.MIN_CANVAS, Math.min(CFG.MAX_CANVAS, +document.getElementById('custom-w').value || 256));
    const h = Math.max(CFG.MIN_CANVAS, Math.min(CFG.MAX_CANVAS, +document.getElementById('custom-h').value || 256));
    Canvas.resize(w, h);
    closeModal('modal-layout');
    document.getElementById('canvas-size-sel').value = 'custom';
  });

  // Hints / examples
  document.getElementById('btn-hint').addEventListener('click', () => {
    const list = document.getElementById('hint-list');
    list.innerHTML = '<p style="color:var(--text-dim);padding:8px;font-size:.78rem;">Loading…</p>';
    openModal('modal-hint');

    const index = Examples.getIndex();
    list.innerHTML = '';

    if (index.length === 0) {
      list.innerHTML = '<p style="color:var(--text-dim);padding:8px;font-size:.78rem;">No examples found.</p>';
      return;
    }

    index.forEach(item => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;padding:2px 0;';

      const lbl = document.createElement('span');
      lbl.style.fontSize = '.8rem';
      lbl.textContent = Examples.nameFor(item);

      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.cssText = 'padding:2px 8px;font-size:.74rem;flex-shrink:0;';
      btn.textContent = I18n.t('modals.hint.load');

      btn.onclick = async () => {
        btn.disabled = true;
        btn.textContent = '…';
        try {
          const code = await Examples.fetchCode(item);
          if (S.isProfi && S.cmProfi) {
            const full = S.cmProfi.getValue();
            const idx  = full.indexOf(SYSTEM_MARKER);
            S.cmProfi.setValue(idx > -1
              ? full.slice(0, idx) + SYSTEM_MARKER + '\n' + code
              : code);
          } else {
            S.cmMain.setValue(code);
          }
          closeModal('modal-hint');
        } catch(e) {
          btn.textContent = '✗';
          console.error('Failed to load example:', e);
          setTimeout(() => {
            btn.disabled = false;
            btn.textContent = I18n.t('modals.hint.load');
          }, 1500);
        }
      };

      row.append(lbl, btn);
      list.appendChild(row);
    });
  });
  document.getElementById('hint-close').addEventListener('click', () => closeModal('modal-hint'));
  bgClose('modal-hint');

  // New file
  document.getElementById('btn-file-new').addEventListener('click', () => {
    document.getElementById('newfile-name').value = '';
    openModal('modal-newfile');
    setTimeout(() => document.getElementById('newfile-name').focus(), 50);
  });
  document.getElementById('btn-newfile-ok').addEventListener('click', async () => {
    const n = document.getElementById('newfile-name').value.trim();
    if (!n) return;
    await Files.newFile(n);
    closeModal('modal-newfile');
    Files.render();
  });
  document.getElementById('btn-newfile-cancel').addEventListener('click', () => closeModal('modal-newfile'));
  bgClose('modal-newfile');
  document.getElementById('newfile-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-newfile-ok').click();
  });

  // Import / export
  document.getElementById('btn-file-import').addEventListener('click', () =>
    document.getElementById('file-import-input').click()
  );
  document.getElementById('file-import-input').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    await Files.importFile(f); e.target.value = '';
  });
  document.getElementById('btn-file-export').addEventListener('click', Files.exportFile);

  // Export PNG / Video
  document.getElementById('btn-export-png').addEventListener('click', Canvas.exportPNG);
  document.getElementById('btn-export-video').addEventListener('click', () => openModal('modal-video'));
  document.getElementById('btn-start-rec').addEventListener('click', () => {
    const sec = +(document.getElementById('rec-duration').value) || 5;
    closeModal('modal-video');
    VideoExport.start(sec);
  });
  document.getElementById('btn-stop-rec').addEventListener('click', VideoExport.abort);
  bgClose('modal-video');

  // Window resize
  window.addEventListener('resize', () => {
    Canvas.fit();
    if (S.cmMain)  S.cmMain.refresh();
    if (S.cmProfi) S.cmProfi.refresh();
  });
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
window.addEventListener('load', async () => {
  // I18n must be first — everything else depends on translations
  await I18n.init();
  I18n.applyDOM();

  // Load example index in parallel with other setup
  await Examples.load();

  Theme.restore();
  Canvas.init();
  Con.init();
  Status.init();
  initEditors();
  Canvas.fit();
  Panels.init();
  wireEvents();
  makeResizer('res-files', 'col-files', 'right');
  makeResizer('res-left',  'col-left',  'right');
  makeResizer('res-right', 'col-right', 'left');

  await Help.init();

  try {
    await DB.open();
    const files = await DB.all();
    if (files.length > 0) {
      files.sort((a, b) => b.updatedAt - a.updatedAt);
      await Files.open(files[0].id);
    } else {
      const defaultName = I18n.t('files.defaultName');
      const code = defaultCode();
      const id = await DB.save(null, defaultName, code, true);
      S.activeFileId = id;
      document.getElementById('current-filename').textContent = '– ' + defaultName;
    }
    await Files.render();
  } catch (err) {
    Con.log(I18n.t('console.dbUnavailable'), 'con-warn');
    console.error('DB:', err);
  }

  Runner.start();
});
