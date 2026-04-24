# PixelCode

Eine browserbasierte Python-IDE zur Vermittlung von Computergrafik-Programmierung im Schulunterricht. Läuft vollständig offline – keine Serververbindung notwendig.

## Dateistruktur

```
pixelcode/
├── index.html          ← Hauptanwendung
├── README.md           ← Diese Datei
└── lib/
    ├── codemirror.min.js
    ├── codemirror.min.css
    ├── dracula.min.css
    ├── codemirror-python.min.js
    ├── closebrackets.min.js
    ├── show-hint.min.js
    ├── show-hint.min.css
    ├── skulpt.min.js
    └── skulkt-stdlib.js
```

## Deployment

### GitHub Pages
1. Ordner `pixelcode/` in ein GitHub-Repository hochladen
2. Repository → Settings → Pages → Branch: `main`, Ordner: `/ (root)`
3. Erreichbar unter: `https://<nutzername>.github.io/<repo>/`

### Lokal (ohne Server)
- `index.html` direkt im Browser öffnen
- Einschränkung: IndexedDB funktioniert in manchen Browsern nur über `localhost` oder `file://`
- Empfehlung: kleinen lokalen Server starten:
  ```bash
  python3 -m http.server 8080
  # → http://localhost:8080
  ```

### Schulnetz / USB-Stick
- Gesamten Ordner auf USB-Stick kopieren
- Schüler öffnen `index.html` direkt – alle Libs sind lokal

## Features

| Feature | Beschreibung |
|---|---|
| **Python im Browser** | Skulpt-Engine – kein Server, kein Install |
| **Pixel-API** | `setPixel(x,y,r,g,b)`, `leinwandLoeschen()`, `getBreite()`, `getHoehe()` |
| **Animations-Loop** | Alle Programme laufen als Endlosschleife; mit `def draw(frame):` volle Kontrolle |
| **Auto-Start** | Code wird beim Öffnen automatisch ausgeführt |
| **Datei-Manager** | Mehrere Dateien, IndexedDB-Speicherung im Browser |
| **Export/Import** | `.py`-Dateien auf den PC speichern und laden |
| **Einsteiger/Profi** | Einsteiger sehen nur ihren Code; Profi-Modus zeigt alles |
| **Fehler-Highlighting** | Fehlerzeile wird im Editor rot markiert |
| **Endlosschleifen-Schutz** | Step-Limit + Web Worker Watchdog (7 s) |
| **Theme** | Light/Dark-Mode, Einstellung wird gespeichert |
| **Performance** | ImageData-Buffer statt einzelner fillRect-Aufrufe |
| **Tutorials** | 4 Kapitel + Funktionsreferenz eingebettet |

## Schüler-API Kurzreferenz

```python
setPixel(x, y, r, g, b)    # Pixel setzen (alle Werte 0–255)
leinwandLoeschen()          # Leinwand schwarz füllen
getBreite()                 # Breite der Leinwand
getHoehe()                  # Höhe der Leinwand

# Animation: draw(frame) wird automatisch aufgerufen
def draw(frame):
    leinwandLoeschen()
    setPixel(frame % getBreite(), 50, 255, 0, 0)
```

## Verwendete Bibliotheken (alle lokal)

| Bibliothek | Version | Lizenz |
|---|---|---|
| [CodeMirror](https://codemirror.net/) | 5.65.16 | MIT |
| [Skulpt](https://skulpt.org/) | 1.2.0 | MIT |
