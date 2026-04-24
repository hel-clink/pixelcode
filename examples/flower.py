# Blooming Flower
# Draws a flower using polar coordinates.
# The petals are generated mathematically — no drawing by hand!

import math

W  = getWidth()
H  = getHeight()
CX = W // 2
CY = H // 2

# Background: soft gradient from dark purple to black
for y in range(H):
    for x in range(W):
        dx, dy = x - CX, y - CY
        d = (dx*dx + dy*dy) ** 0.5
        t = min(1.0, d / (min(W, H) * 0.6))
        r = int(20 * (1 - t))
        g = int(5  * (1 - t))
        b = int(30 * (1 - t))
        setPixel(x, y, r, g, b)

def set_aa(x, y, r, g, b, alpha):
    """Blend a pixel with given alpha over existing background."""
    if 0 <= x < W and 0 <= y < H:
        setPixel(x, y,
                 min(255, r),
                 min(255, g),
                 min(255, b))

PETALS   = 6        # number of petals
R_OUTER  = min(CX, CY) * 0.82
R_INNER  = R_OUTER  * 0.08
STEPS    = 2000

# Draw leaves / stem first
stem_len = CY * 0.6
for i in range(int(stem_len)):
    t    = i / stem_len
    wobble = int(math.sin(t * math.pi * 3) * 2)
    sx   = CX + wobble
    sy   = CY + int(i)
    if 0 <= sy < H:
        setPixel(sx, sy, 30, 120, 40)

# Draw petals
for step in range(STEPS):
    angle = step * 2 * math.pi / STEPS
    # Rose curve: r = R * cos(k * theta)
    k = PETALS / 2
    r = R_OUTER * abs(math.cos(k * angle))

    px = int(CX + r * math.cos(angle))
    py = int(CY - r * math.sin(angle))

    # Colour: hue shifts from magenta at centre to golden yellow at tips
    t  = r / R_OUTER
    red   = int(220 + 35  * t)
    green = int(30  + 160 * t)
    blue  = int(140 - 120 * t)
    setPixel(px, py, red, green, blue)

    # Petal veins: darker inner line
    r2 = r * 0.6
    vx = int(CX + r2 * math.cos(angle))
    vy = int(CY - r2 * math.sin(angle))
    setPixel(vx, vy, max(0, red - 60), max(0, green - 40), max(0, blue - 40))

# Centre disk
for dy in range(-int(R_INNER*2), int(R_INNER*2)+1):
    for dx in range(-int(R_INNER*2), int(R_INNER*2)+1):
        d = (dx*dx + dy*dy) ** 0.5
        if d <= R_INNER * 2:
            t = d / (R_INNER * 2)
            setPixel(CX + dx, CY + dy,
                     int(255 * (1-t) + 180 * t),
                     int(200 * (1-t) + 120 * t),
                     int(0))

# Pollen dots
import random
random.seed(3)
for _ in range(30):
    angle = random.uniform(0, 2 * math.pi)
    r_dot = random.uniform(0, R_INNER * 1.5)
    px = int(CX + r_dot * math.cos(angle))
    py = int(CY + r_dot * math.sin(angle))
    setPixel(px, py, 255, 240, 80)
