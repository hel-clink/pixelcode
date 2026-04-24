# Funktions-Referenz

Alle Befehle, die du in PixelCode verwenden kannst.

## Pixel setzen

```python
setPixel(x, y, r, g, b)
```

Setzt einen Pixel an Position `(x, y)` mit der Farbe `(r, g, b)`.
Alle Farbwerte liegen zwischen **0** und **255**.

```python
# Beispiel: roter Pixel bei (10, 20)
setPixel(10, 20, 255, 0, 0)
```

## Leinwand löschen

```python
leinwandLoeschen()
```

Löscht die gesamte Leinwand – alle Pixel werden schwarz.
Alias: `clearCanvas()`

## Leinwandgröße abfragen

```python
getBreite()   # Breite in Pixeln  (alias: getWidth())
getHoehe()    # Höhe in Pixeln    (alias: getHeight())
```

```python
# Pixel genau in die Mitte setzen
mx = getBreite() // 2
my = getHoehe() // 2
setPixel(mx, my, 255, 255, 0)
```

## Animation

```python
def draw(frame):
    ...
```

Definierst du eine Funktion namens `draw`, wird sie automatisch und immer wieder aufgerufen. Der Parameter `frame` zählt bei jedem Bild um 1 hoch (0, 1, 2, …).

Ohne `draw`-Funktion läuft dein Code ebenfalls als Endlosschleife – jeder Frame führt den gesamten Code neu aus.

```python
import math

def draw(frame):
    leinwandLoeschen()
    x = int(getBreite() / 2 + math.sin(frame * 0.05) * 50)
    y = getHoehe() // 2
    setPixel(x, y, 255, 100, 0)
```

## Farbtabelle

| Farbe   | r   | g   | b   |
|---------|-----|-----|-----|
| Rot     | 255 | 0   | 0   |
| Grün    | 0   | 255 | 0   |
| Blau    | 0   | 0   | 255 |
| Gelb    | 255 | 255 | 0   |
| Cyan    | 0   | 255 | 255 |
| Magenta | 255 | 0   | 255 |
| Weiß    | 255 | 255 | 255 |
| Schwarz | 0   | 0   | 0   |
| Grau    | 128 | 128 | 128 |

## Koordinatensystem

```
(0,0) ──────────── x →
  │
  │
  y
  ↓
```

Die Leinwand startet oben links bei `(0, 0)`.
X wächst nach **rechts**, Y wächst nach **unten**.
