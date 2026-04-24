# Chapter 3: Images & Patterns

With **two nested loops** you fill the entire canvas —
pixel by pixel, row by row.

## The Double Loop

```python
for y in range(getHeight()):
    for x in range(getWidth()):
        setPixel(x, y, 100, 100, 200)
```

The outer loop goes through all **rows** (y),
the inner loop through all **columns** (x).

## Patterns with Conditions

```python
for y in range(getHeight()):
    for x in range(getWidth()):
        if (x + y) % 2 == 0:
            setPixel(x, y, 255, 255, 255)  # white
        else:
            setPixel(x, y, 0, 0, 0)        # black
```

The expression `(x + y) % 2` alternates between 0 and 1 →
classic **chessboard pattern**.

## Drawing Circles

Using the Pythagorean theorem you can check whether a point
is inside a circle:

```python
cx = getWidth()  // 2
cy = getHeight() // 2
r  = 40

for y in range(getHeight()):
    for x in range(getWidth()):
        dx   = x - cx
        dy   = y - cy
        dist = (dx*dx + dy*dy) ** 0.5
        if dist < r:
            setPixel(x, y, 80, 180, 255)
```

---

## 🎯 Task 1 – Chessboard

Create a classic chessboard pattern!

<details>
<summary>Show solution</summary>

```python
for y in range(getHeight()):
    for x in range(getWidth()):
        if (x + y) % 2 == 0:
            setPixel(x, y, 255, 255, 255)
        else:
            setPixel(x, y, 0, 0, 0)
```

</details>

---

## 🎯 Task 2 – 2D Color Gradient

Use x for Red and y for Green — what does the canvas look like?

<details>
<summary>Show solution</summary>

```python
for y in range(getHeight()):
    for x in range(getWidth()):
        r = x * 255 // getWidth()
        g = y * 255 // getHeight()
        setPixel(x, y, r, g, 128)
```

</details>

---

## 🎯 Task 3 – Circle Ring (hard)

Draw only the **outline** of a circle, not the filled area!

> Hint: the outline is where `dist` is almost exactly equal to `r`.
> Try `abs(dist - r) < 1.5`.

<details>
<summary>Show solution</summary>

```python
cx = getWidth()  // 2
cy = getHeight() // 2
r  = min(cx, cy) - 5

for y in range(getHeight()):
    for x in range(getWidth()):
        dx   = x - cx
        dy   = y - cy
        dist = (dx*dx + dy*dy) ** 0.5
        if abs(dist - r) < 1.5:
            setPixel(x, y, 255, 200, 50)
```

</details>
