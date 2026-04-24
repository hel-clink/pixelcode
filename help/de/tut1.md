# Kapitel 1: Dein erster Pixel

Ein **Pixel** ist der kleinste Punkt auf der Leinwand.
Du kannst ihn an jeder Stelle platzieren und ihm eine Farbe geben.

## setPixel verstehen

```python
setPixel(x, y, r, g, b)
```

- `x` – horizontale Position (von links)
- `y` – vertikale Position (von oben)
- `r`, `g`, `b` – Rot, Grün, Blau (je 0–255)

```python
# Einen roten Punkt bei (10, 20) setzen
setPixel(10, 20, 255, 0, 0)
```

## Farben mischen

Farben entstehen durch Mischung von Rot, Grün und Blau:

```python
setPixel(0, 0, 255, 255,   0)   # Gelb  (Rot + Grün)
setPixel(1, 0,   0, 255, 255)   # Cyan  (Grün + Blau)
setPixel(2, 0, 255,   0, 255)   # Magenta (Rot + Blau)
setPixel(3, 0, 128, 128, 128)   # Grau  (alle gleich)
```

---

## 🎯 Aufgabe 1 – Mittelpunkt

Setze einen **blauen** Pixel genau in die Mitte der Leinwand!

> Tipp: `getBreite()` und `getHoehe()` liefern die Abmessungen.
> Der ganzzahlige Divisionsoperator `//` rundet ab.

<details>
<summary>Lösung anzeigen</summary>

```python
mx = getBreite() // 2
my = getHoehe() // 2
setPixel(mx, my, 0, 0, 255)
```

</details>

---

## 🎯 Aufgabe 2 – Farbpalette

Setze 5 Pixel nebeneinander, jeden in einer anderen Farbe!

<details>
<summary>Lösung anzeigen</summary>

```python
setPixel(10, 10, 255,   0,   0)   # Rot
setPixel(11, 10,   0, 255,   0)   # Grün
setPixel(12, 10,   0,   0, 255)   # Blau
setPixel(13, 10, 255, 255,   0)   # Gelb
setPixel(14, 10, 255,   0, 255)   # Magenta
```

</details>

---

## 🎯 Aufgabe 3 – Diagonale

Zeichne eine diagonale Linie von oben-links nach unten-rechts!

<details>
<summary>Lösung anzeigen</summary>

```python
for i in range(min(getBreite(), getHoehe())):
    setPixel(i, i, 255, 200, 50)
```

</details>
