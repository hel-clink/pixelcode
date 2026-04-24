# Kapitel 3: Bilder & Muster

Mit **zwei verschachtelten Schleifen** füllst du die gesamte Leinwand –
Pixel für Pixel, Zeile für Zeile.

## Die doppelte Schleife

```python
for y in range(getHoehe()):
    for x in range(getBreite()):
        setPixel(x, y, 100, 100, 200)
```

Die äußere Schleife geht durch alle **Zeilen** (y),
die innere durch alle **Spalten** (x).

## Muster mit Bedingungen

```python
for y in range(getHoehe()):
    for x in range(getBreite()):
        if (x + y) % 2 == 0:
            setPixel(x, y, 255, 255, 255)  # weiß
        else:
            setPixel(x, y, 0, 0, 0)        # schwarz
```

Der Ausdruck `(x + y) % 2` ist abwechselnd 0 und 1 →
klassisches **Schachbrettmuster**.

## Kreise zeichnen

Mit dem Satz des Pythagoras kann man prüfen, ob ein Punkt
innerhalb eines Kreises liegt:

```python
mx = getBreite() // 2
my = getHoehe() // 2
r  = 40

for y in range(getHoehe()):
    for x in range(getBreite()):
        dx   = x - mx
        dy   = y - my
        dist = (dx*dx + dy*dy) ** 0.5
        if dist < r:
            setPixel(x, y, 80, 180, 255)
```

---

## 🎯 Aufgabe 1 – Schachbrett

Erzeuge ein klassisches Schachbrettmuster!

<details>
<summary>Lösung anzeigen</summary>

```python
for y in range(getHoehe()):
    for x in range(getBreite()):
        if (x + y) % 2 == 0:
            setPixel(x, y, 255, 255, 255)
        else:
            setPixel(x, y, 0, 0, 0)
```

</details>

---

## 🎯 Aufgabe 2 – 2D-Farbverlauf

Nutze x für Rot und y für Grün – wie sieht die Leinwand aus?

<details>
<summary>Lösung anzeigen</summary>

```python
for y in range(getHoehe()):
    for x in range(getBreite()):
        r = x * 255 // getBreite()
        g = y * 255 // getHoehe()
        setPixel(x, y, r, g, 128)
```

</details>

---

## 🎯 Aufgabe 3 – Kreisring (schwer)

Zeichne nur den **Rand** eines Kreises, nicht die Fläche!

> Tipp: Der Rand liegt dort, wo `dist` fast genau gleich `r` ist.
> Probiere `abs(dist - r) < 1.5`.

<details>
<summary>Lösung anzeigen</summary>

```python
mx = getBreite() // 2
my = getHoehe() // 2
r  = min(mx, my) - 5

for y in range(getHoehe()):
    for x in range(getBreite()):
        dx   = x - mx
        dy   = y - my
        dist = (dx*dx + dy*dy) ** 0.5
        if abs(dist - r) < 1.5:
            setPixel(x, y, 255, 200, 50)
```

</details>
