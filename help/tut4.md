# Kapitel 4: Animation

Animationen entstehen, wenn sich Bilder **schnell hintereinander** verändern.
PixelCode ruft deine `draw`-Funktion automatisch immer wieder auf.

## Die draw-Funktion

```python
def draw(frame):
    leinwandLoeschen()
    setPixel(frame % getBreite(), 50, 255, 100, 0)
```

- `frame` zählt bei jedem Bild um 1 hoch: 0, 1, 2, 3, …
- `leinwandLoeschen()` am Anfang verhindert, dass alte Pixel stehen bleiben
- `%` (Modulo) sorgt dafür, dass der Pixel am rechten Rand wieder von links beginnt

## Bewegung mit Sinus

Die Sinus-Funktion erzeugt glatte, periodische Bewegungen:

```python
import math

def draw(frame):
    leinwandLoeschen()
    x = int(getBreite() / 2 + math.sin(frame * 0.05) * 60)
    y = getHoehe() // 2
    setPixel(x, y, 255, 80, 0)
```

`math.sin()` gibt Werte zwischen -1 und +1 zurück.
Multipliziert mit 60 ergibt das eine Auslenkung von ±60 Pixeln.

## FPS und Geschwindigkeit

Die Animationsgeschwindigkeit steuerst du mit dem **FPS-Regler** im Header.
Im Code kannst du die Bewegungsgeschwindigkeit über den Multiplikator steuern:

```python
# Langsam:  frame * 0.02
# Mittel:   frame * 0.05
# Schnell:  frame * 0.15
x = int(getBreite() / 2 + math.sin(frame * 0.05) * 60)
```

---

## 🎯 Aufgabe 1 – Wandernder Pixel

Lass einen roten Pixel von links nach rechts wandern und
von vorne beginnen, wenn er den Rand erreicht.

<details>
<summary>Lösung anzeigen</summary>

```python
def draw(frame):
    leinwandLoeschen()
    x = frame % getBreite()
    setPixel(x, getHoehe() // 2, 255, 0, 0)
```

</details>

---

## 🎯 Aufgabe 2 – Sinuswelle

Zeichne eine Sinuswelle, die sich von rechts nach links bewegt.

<details>
<summary>Lösung anzeigen</summary>

```python
import math

def draw(frame):
    leinwandLoeschen()
    for x in range(getBreite()):
        y = int(getHoehe() / 2 + math.sin((x + frame) * 0.1) * 40)
        if 0 <= y < getHoehe():
            setPixel(x, y,  80, 200, 255)
        if 0 <= y+1 < getHoehe():
            setPixel(x, y+1, 30, 100, 160)
```

</details>

---

## 🎯 Aufgabe 3 – Funkelnde Sterne (schwer)

Erzeuge 80 zufällige Sterne, die unterschiedlich schnell blinken.

> Tipp: `random.seed(42)` sorgt dafür, dass die Sterne jedes Mal
> an der gleichen Position erscheinen.

<details>
<summary>Lösung anzeigen</summary>

```python
import math, random
random.seed(42)

sterne = [
    (random.randint(0, getBreite()-1),
     random.randint(0, getHoehe()-1),
     random.random())
    for _ in range(80)
]

def draw(frame):
    leinwandLoeschen()
    for sx, sy, phase in sterne:
        hell = int(128 + 127 * math.sin(frame * 0.07 + phase * 6.28))
        setPixel(sx, sy, hell, hell, hell)
```

</details>
