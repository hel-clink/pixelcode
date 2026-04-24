# Galaxy
# Simulates a spiral galaxy with two arms, a bright core,
# dust lanes and background stars.

import math, random

random.seed(11)

W  = getWidth()
H  = getHeight()
CX = W / 2
CY = H / 2
R  = min(W, H) / 2

# Black background
for y in range(H):
    for x in range(W):
        setPixel(x, y, 0, 0, 0)

# Background stars (faint, many)
for _ in range(400):
    sx = random.randint(0, W-1)
    sy = random.randint(0, H-1)
    b  = random.randint(30, 100)
    setPixel(sx, sy, b, b, b)

def put(x, y, r, g, b):
    xi, yi = int(x), int(y)
    if 0 <= xi < W and 0 <= yi < H:
        setPixel(xi, yi, min(255,r), min(255,g), min(255,b))

# Spiral arms (two arms, offset by π)
ARM_STARS = 1200
for arm in range(2):
    arm_offset = arm * math.pi
    for _ in range(ARM_STARS):
        # Logarithmic spiral
        t      = random.uniform(0.05, 1.0)
        angle  = t * 4 * math.pi + arm_offset
        radius = t * R * 0.88

        # Scatter perpendicular to arm
        scatter = random.gauss(0, R * 0.055 * (1 - t * 0.4))
        perp    = angle + math.pi / 2
        rx = radius * math.cos(angle) + scatter * math.cos(perp)
        ry = radius * math.sin(angle) + scatter * math.sin(perp)

        # Colour: young blue-white stars in outer arms, yellow-orange toward centre
        cold = t < 0.4
        if cold:
            r_c = int(160 + random.randint(0, 95))
            g_c = int(180 + random.randint(0, 75))
            b_c = int(220 + random.randint(0, 35))
        else:
            r_c = int(200 + random.randint(0, 55))
            g_c = int(160 + random.randint(0, 60))
            b_c = int(80  + random.randint(0, 80))

        put(CX + rx, CY + ry, r_c, g_c, b_c)

        # Dust lane: faint darker cloud nearby
        if random.random() < 0.25:
            dx = scatter * 0.3 + random.gauss(0, R * 0.03)
            dy = random.gauss(0, R * 0.03)
            put(CX + rx + dx, CY + ry + dy, 15, 10, 20)

# Bright core glow
for _ in range(800):
    angle  = random.uniform(0, 2 * math.pi)
    radius = abs(random.gauss(0, R * 0.06))
    rx     = radius * math.cos(angle)
    ry     = radius * math.sin(angle)
    t      = 1 - min(1, radius / (R * 0.12))
    r_c    = int(255 * t + 180 * (1-t))
    g_c    = int(230 * t + 120 * (1-t))
    b_c    = int(160 * t + 60  * (1-t))
    put(CX + rx, CY + ry, r_c, g_c, b_c)

# Central nucleus (solid bright spot)
for dy in range(-3, 4):
    for dx in range(-3, 4):
        if dx*dx + dy*dy <= 9:
            setPixel(int(CX)+dx, int(CY)+dy, 255, 245, 200)
