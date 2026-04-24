# Butterfly Effect — Lorenz Attractor
# A chaotic system that draws a butterfly-shaped pattern.
# Tiny changes in starting conditions lead to completely different paths.

import math

W  = getWidth()
H  = getHeight()

# Lorenz parameters (classic values)
SIGMA = 10.0
RHO   = 28.0
BETA  = 8.0 / 3.0
DT    = 0.005

# Integrate the Lorenz system
x, y, z = 0.1, 0.0, 0.0
points = []
for _ in range(12000):
    dx = SIGMA * (y - x)
    dy = x * (RHO - z) - y
    dz = x * y - BETA * z
    x += dx * DT
    y += dy * DT
    z += dz * DT
    points.append((x, y, z))

# Project onto XZ plane (classic butterfly view)
xs = [p[0] for p in points]
zs = [p[2] for p in points]

min_x, max_x = min(xs), max(xs)
min_z, max_z = min(zs), max(zs)

def to_screen(xi, zi):
    px = int((xi - min_x) / (max_x - min_x) * (W - 4) + 2)
    py = int((1 - (zi - min_z) / (max_z - min_z)) * (H - 4) + 2)
    return px, py

# Black background
for y in range(H):
    for x in range(W):
        setPixel(x, y, 0, 0, 0)

# Draw the attractor — colour shifts from blue → cyan → magenta over time
n = len(points)
for i, (xi, _, zi) in enumerate(points):
    t  = i / n
    px, py = to_screen(xi, zi)
    r  = int(60  + 180 * math.sin(t * math.pi))
    g  = int(20  + 180 * math.sin(t * math.pi + 1.0))
    b  = int(180 + 75  * math.cos(t * math.pi))
    if 0 <= px < W and 0 <= py < H:
        setPixel(px, py, r, g, b)
