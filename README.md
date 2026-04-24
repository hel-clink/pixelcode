# PixelCode

A browser-based Python IDE for teaching computer graphics programming in the classroom. Runs entirely offline — no server connection required.

## File Structure

```
pixelcode/
├── index.html          ← Main application (HTML skeleton only)
├── app.js              ← All application logic
├── style.css           ← All styling
├── server.py           ← Local development server (Python 3)
├── README.md           ← This file
├── .gitlab-ci.yml      ← GitLab Pages deployment
├── lang/
│   ├── index.json      ← List of available languages
│   ├── en.json         ← English UI strings
│   └── de.json         ← German UI strings
├── help/
│   ├── index.json      ← Help page index
│   ├── en/             ← English help documents
│   │   ├── ref.md
│   │   └── tut1–4.md
│   └── de/             ← German help documents
│       ├── ref.md
│       └── tut1–4.md
└── lib/                ← All libraries (no CDN dependencies)
    ├── codemirror.min.js / .css
    ├── dracula.min.css
    ├── codemirror-python.min.js
    ├── closebrackets.min.js
    ├── show-hint.min.js / .css
    ├── skulpt.min.js
    ├── skulpt-stdlib.js
    └── skulpt-worker.js  ← Runs Python in a Web Worker
```

## Deployment

### Local (for testing)

```bash
cd pixelcode
python3 server.py
# Open http://localhost:8080
```

### GitLab Pages

1. Push the `pixelcode/` folder contents to a GitLab repository
2. The included `.gitlab-ci.yml` handles deployment automatically
3. After the pipeline completes, find the URL under **Deploy → Pages**

### GitHub Pages

1. Push to a GitHub repository
2. Go to **Settings → Pages → Source: main branch / root**
3. Your app will be available at `https://<user>.github.io/<repo>/`

### USB / Offline

Copy the entire folder to a USB stick. Open `index.html` directly —
note that `fetch()` for help files requires a local server or Pages.
Use `python3 server.py` for full offline functionality.

## Student API Reference

```python
setPixel(x, y, r, g, b)    # Set a pixel (all values 0–255)
clearCanvas()               # Fill canvas with black
getWidth()                  # Canvas width in pixels
getHeight()                 # Canvas height in pixels

# Animation: draw(frame) is called automatically each frame
def draw(frame):
    clearCanvas()
    setPixel(frame % getWidth(), 50, 255, 0, 0)
```

## Features

| Feature | Description |
|---|---|
| Python in the browser | Skulpt engine — no server, no install |
| Pixel API | `setPixel`, `clearCanvas`, `getWidth`, `getHeight` |
| Animation loop | All programs run as endless loops; use `def draw(frame):` for full control |
| Auto-start | Code executes automatically on load |
| Live reload | Code restarts 800ms after the last keystroke |
| Error resilience | Errors log to console but never stop the loop |
| Infinite loop protection | Skulpt runs in a Web Worker — `terminate()` kills frozen loops |
| File manager | Multiple files, IndexedDB storage in the browser |
| Export / Import | Save and load `.py` files locally |
| PNG export | Save the current canvas as an image |
| Video export | Record animations as WebM |
| Beginner / Expert mode | Beginners see only their code; experts see the full scaffold |
| Error highlighting | Error line is highlighted in the editor |
| i18n | UI and help docs in English and German; auto-detected from browser |
| Theme | Light / Dark mode, preference saved |
| Collapsible panels | Each panel can be collapsed to a strip |
| Performance | ImageData buffer — single `putImageData` call per frame |
| Tutorials | 4 chapters + function reference, in English and German |

## Libraries (all local, no CDN)

| Library | Version | License |
|---|---|---|
| [CodeMirror](https://codemirror.net/) | 5.65.16 | MIT |
| [Skulpt](https://skulpt.org/) | 1.2.0 | MIT |

## Adding a Language

1. Copy `lang/en.json` to `lang/<code>.json` and translate all strings
2. Copy `help/en/` to `help/<code>/` and translate all Markdown files
3. Add an entry to `lang/index.json`: `{ "code": "<code>", "label": "...", "flag": "..." }`
