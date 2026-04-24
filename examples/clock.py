# Analog Clock
# Draws a ticking analog clock face.

import math

W  = getWidth()
H  = getHeight()
CX = W // 2
CY = H // 2
R  = min(CX, CY) - 4

def _line(x0, y0, x1, y1, r, g, b):
    """Draw a line using linear interpolation."""
    steps = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(steps + 1):
        t  = i / steps
        px = int(x0 + (x1 - x0) * t)
        py = int(y0 + (y1 - y0) * t)
        if 0 <= px < W and 0 <= py < H:
            setPixel(px, py, r, g, b)

def draw(frame):
    clearCanvas()

    # Clock face
    for y in range(H):
        for x in range(W):
            dx, dy = x - CX, y - CY
            d = (dx * dx + dy * dy) ** 0.5
            if abs(d - R) < 1.5:
                setPixel(x, y, 180, 180, 180)

    # Hour markers
    for i in range(12):
        angle = i * math.pi / 6
        ox = int(CX + (R - 2) * math.sin(angle))
        oy = int(CY - (R - 2) * math.cos(angle))
        ix = int(CX + (R - 8) * math.sin(angle))
        iy = int(CY - (R - 8) * math.cos(angle))
        _line(ox, oy, ix, iy, 200, 200, 200)

    # Derive hours/minutes/seconds from frame count (1 frame = 1 second)
    total_sec = frame
    secs  = total_sec % 60
    mins  = (total_sec // 60) % 60
    hours = (total_sec // 3600) % 12

    sec_angle  = secs  * math.pi / 30
    min_angle  = (mins  + secs  / 60) * math.pi / 30
    hour_angle = (hours + mins  / 60) * math.pi / 6

    # Second hand (red)
    _line(CX, CY,
          int(CX + (R - 4) * math.sin(sec_angle)),
          int(CY - (R - 4) * math.cos(sec_angle)),
          220, 50, 50)

    # Minute hand (white)
    _line(CX, CY,
          int(CX + (R - 10) * math.sin(min_angle)),
          int(CY - (R - 10) * math.cos(min_angle)),
          220, 220, 220)

    # Hour hand (light blue)
    _line(CX, CY,
          int(CX + (R - 22) * math.sin(hour_angle)),
          int(CY - (R - 22) * math.cos(hour_angle)),
          100, 180, 255)

    # Center dot
    setPixel(CX, CY, 255, 255, 255)
