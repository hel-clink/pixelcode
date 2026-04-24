# Chapter 1: Your First Pixel

A **pixel** is the smallest dot on the canvas.
You can place it anywhere and give it a color.

## Understanding setPixel

```python
setPixel(x, y, r, g, b)
```

- `x` – horizontal position (from the left)
- `y` – vertical position (from the top)
- `r`, `g`, `b` – Red, Green, Blue (each 0–255)

```python
# Set a red dot at (10, 20)
setPixel(10, 20, 255, 0, 0)
```

## Mixing Colors

Colors are created by mixing Red, Green, and Blue:

```python
setPixel(0, 0, 255, 255,   0)   # Yellow  (Red + Green)
setPixel(1, 0,   0, 255, 255)   # Cyan    (Green + Blue)
setPixel(2, 0, 255,   0, 255)   # Magenta (Red + Blue)
setPixel(3, 0, 128, 128, 128)   # Gray    (all equal)
```

---

## 🎯 Task 1 – Center Point

Set a **blue** pixel exactly in the center of the canvas!

> Hint: `getWidth()` and `getHeight()` return the canvas dimensions.
> The integer division operator `//` rounds down.

<details>
<summary>Show solution</summary>

```python
mx = getWidth()  // 2
my = getHeight() // 2
setPixel(mx, my, 0, 0, 255)
```

</details>

---

## 🎯 Task 2 – Color Palette

Set 5 pixels side by side, each in a different color!

<details>
<summary>Show solution</summary>

```python
setPixel(10, 10, 255,   0,   0)   # Red
setPixel(11, 10,   0, 255,   0)   # Green
setPixel(12, 10,   0,   0, 255)   # Blue
setPixel(13, 10, 255, 255,   0)   # Yellow
setPixel(14, 10, 255,   0, 255)   # Magenta
```

</details>

---

## 🎯 Task 3 – Diagonal Line

Draw a diagonal line from top-left to bottom-right!

<details>
<summary>Show solution</summary>

```python
for i in range(min(getWidth(), getHeight())):
    setPixel(i, i, 255, 200, 50)
```

</details>
