# Function Reference

All commands available in PixelCode.

## Set a Pixel

```python
setPixel(x, y, r, g, b)
```

Sets a pixel at position `(x, y)` with color `(r, g, b)`.
All color values are between **0** and **255**.

```python
# Example: red pixel at (10, 20)
setPixel(10, 20, 255, 0, 0)
```

## Clear Canvas

```python
clearCanvas()
```

Clears the entire canvas — all pixels turn black.
Alias: `leinwandLoeschen()`

## Query Canvas Size

```python
getWidth()    # width in pixels  (alias: getBreite())
getHeight()   # height in pixels (alias: getHoehe())
```

```python
# Place a pixel exactly in the center
mx = getWidth()  // 2
my = getHeight() // 2
setPixel(mx, my, 255, 255, 0)
```

## Animation

```python
def draw(frame):
    ...
```

If you define a function named `draw`, it will be called repeatedly and automatically. The `frame` parameter increments by 1 each time (0, 1, 2, …).

Without a `draw` function, your code also runs as an endless loop — every frame re-executes the entire script.

```python
import math

def draw(frame):
    clearCanvas()
    x = int(getWidth() / 2 + math.sin(frame * 0.05) * 50)
    y = getHeight() // 2
    setPixel(x, y, 255, 100, 0)
```

## Color Table

| Color   | r   | g   | b   |
|---------|-----|-----|-----|
| Red     | 255 | 0   | 0   |
| Green   | 0   | 255 | 0   |
| Blue    | 0   | 0   | 255 |
| Yellow  | 255 | 255 | 0   |
| Cyan    | 0   | 255 | 255 |
| Magenta | 255 | 0   | 255 |
| White   | 255 | 255 | 255 |
| Black   | 0   | 0   | 0   |
| Gray    | 128 | 128 | 128 |

## Coordinate System

```
(0,0) ──────────── x →
  │
  │
  y
  ↓
```

The canvas starts at the top-left corner at `(0, 0)`.
X grows to the **right**, Y grows **downward**.
