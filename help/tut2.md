# Kapitel 2: Farben & Schleifen

Mit einer **Schleife** kannst du viele Pixel auf einmal zeichnen,
ohne jeden einzeln zu schreiben.

## Die for-Schleife

```python
for x in range(getBreite()):
    setPixel(x, 50, 255, 128, 0)
```

`range(n)` erzeugt die Zahlen 0, 1, 2, … n-1.
Dieser Code zeichnet eine **orange Linie** quer durch Zeile 50.

## Variablen für Farben

```python
rot   = 255
gruen = 100
blau  = 0

for x in range(getBreite()):
    setPixel(x, 30, rot, gruen, blau)
```

## Farbverlauf mit Berechnung

Je weiter rechts ein Pixel liegt, desto heller kann er sein:

```python
for x in range(getBreite()):
    helligkeit = x * 255 // getBreite()
    setPixel(x, 50, helligkeit, helligkeit, helligkeit)
```

---

## 🎯 Aufgabe 1 – Senkrechte Linie

Zeichne eine **grüne senkrechte Linie** in der Mitte der Leinwand!

<details>
<summary>Lösung anzeigen</summary>

```python
mitte = getBreite() // 2
for y in range(getHoehe()):
    setPixel(mitte, y, 0, 255, 0)
```

</details>

---

## 🎯 Aufgabe 2 – Farbverlauf

Zeichne einen horizontalen Verlauf: links schwarz, rechts weiß.

<details>
<summary>Lösung anzeigen</summary>

```python
for x in range(getBreite()):
    hell = x * 255 // getBreite()
    setPixel(x, 50, hell, hell, hell)
```

</details>

---

## 🎯 Aufgabe 3 – Regenbogen-Streifen

Zeichne 3 horizontale Streifen: oben Rot, Mitte Grün, unten Blau.

<details>
<summary>Lösung anzeigen</summary>

```python
drittel = getHoehe() // 3

for x in range(getBreite()):
    for y in range(getHoehe()):
        if y < drittel:
            setPixel(x, y, 255, 0, 0)
        elif y < 2 * drittel:
            setPixel(x, y, 0, 255, 0)
        else:
            setPixel(x, y, 0, 0, 255)
```

</details>
