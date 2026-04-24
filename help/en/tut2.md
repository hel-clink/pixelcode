# Chapter 2: Colors & Loops

With a **loop** you can draw many pixels at once
without writing each one individually.

## The for Loop

```python
for x in range(getWidth()):
    setPixel(x, 50, 255, 128, 0)
```

`range(n)` produces the numbers 0, 1, 2, … n-1.
This code draws an **orange line** across row 50.

## Variables for Colors

```python
red   = 255
green = 100
blue  = 0

for x in range(getWidth()):
    setPixel(x, 30, red, green, blue)
```

## Color Gradient by Calculation

The further right a pixel is, the brighter it can be:

```python
for x in range(getWidth()):
    brightness = x * 255 // getWidth()
    setPixel(x, 50, brightness, brightness, brightness)
```

---

## 🎯 Task 1 – Vertical Line

Draw a **green vertical line** in the center of the canvas!

<details>
<summary>Show solution</summary>

```python
center = getWidth() // 2
for y in range(getHeight()):
    setPixel(center, y, 0, 255, 0)
```

</details>

---

## 🎯 Task 2 – Gradient

Draw a horizontal gradient: black on the left, white on the right.

<details>
<summary>Show solution</summary>

```python
for x in range(getWidth()):
    bright = x * 255 // getWidth()
    setPixel(x, 50, bright, bright, bright)
```

</details>

---

## 🎯 Task 3 – Rainbow Stripes

Draw 3 horizontal stripes: red on top, green in the middle, blue at the bottom.

<details>
<summary>Show solution</summary>

```python
third = getHeight() // 3

for x in range(getWidth()):
    for y in range(getHeight()):
        if y < third:
            setPixel(x, y, 255, 0, 0)
        elif y < 2 * third:
            setPixel(x, y, 0, 255, 0)
        else:
            setPixel(x, y, 0, 0, 255)
```

</details>
