# Chapter 4: Animation

Animations are created when images change **rapidly in sequence**.
PixelCode calls your `draw` function automatically, over and over.

## The draw Function

```python
def draw(frame):
    clearCanvas()
    setPixel(frame % getWidth(), 50, 255, 100, 0)
```

- `frame` increments by 1 with each image: 0, 1, 2, 3, …
- `clearCanvas()` at the start prevents old pixels from lingering
- `%` (modulo) makes the pixel wrap back from the right edge to the left

## Movement with Sine

The sine function creates smooth, periodic motion:

```python
import math

def draw(frame):
    clearCanvas()
    x = int(getWidth() / 2 + math.sin(frame * 0.05) * 60)
    y = getHeight() // 2
    setPixel(x, y, 255, 80, 0)
```

`math.sin()` returns values between -1 and +1.
Multiplied by 60, that gives a displacement of ±60 pixels.

## FPS and Speed

Control the animation speed with the **FPS slider** in the header.
In code, tune movement speed via the multiplier:

```python
# Slow:   frame * 0.02
# Medium: frame * 0.05
# Fast:   frame * 0.15
x = int(getWidth() / 2 + math.sin(frame * 0.05) * 60)
```

---

## 🎯 Task 1 – Travelling Pixel

Make a red pixel travel from left to right and
wrap back to the start when it reaches the edge.

<details>
<summary>Show solution</summary>

```python
def draw(frame):
    clearCanvas()
    x = frame % getWidth()
    setPixel(x, getHeight() // 2, 255, 0, 0)
```

</details>

---

## 🎯 Task 2 – Sine Wave

Draw a sine wave that moves from right to left.

<details>
<summary>Show solution</summary>

```python
import math

def draw(frame):
    clearCanvas()
    for x in range(getWidth()):
        y = int(getHeight() / 2 + math.sin((x + frame) * 0.1) * 40)
        if 0 <= y < getHeight():
            setPixel(x, y,  80, 200, 255)
        if 0 <= y+1 < getHeight():
            setPixel(x, y+1, 30, 100, 160)
```

</details>

---

## 🎯 Task 3 – Twinkling Stars (hard)

Create 80 random stars that blink at different speeds.

> Hint: `random.seed(42)` ensures the stars always appear
> at the same position.

<details>
<summary>Show solution</summary>

```python
import math, random
random.seed(42)

stars = [
    (random.randint(0, getWidth()-1),
     random.randint(0, getHeight()-1),
     random.random())
    for _ in range(80)
]

def draw(frame):
    clearCanvas()
    for sx, sy, phase in stars:
        bright = int(128 + 127 * math.sin(frame * 0.07 + phase * 6.28))
        setPixel(sx, sy, bright, bright, bright)
```

</details>
