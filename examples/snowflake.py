# Koch Snowflake
# A fractal built by replacing every line segment with a spike.
# After enough iterations it looks like a perfect snowflake.

import math

W  = getWidth()
H  = getHeight()
CX = W / 2
CY = H / 2

# Dark blue background
for y in range(H):
    for x in range(W):
        setPixel(x, y, 5, 10, 30)

def draw_line(x0, y0, x1, y1, r, g, b):
    steps = max(abs(int(x1)-int(x0)), abs(int(y1)-int(y0)), 1)
    for i in range(steps + 1):
        t  = i / steps
        px = int(x0 + (x1 - x0) * t)
        py = int(y0 + (y1 - y0) * t)
        if 0 <= px < W and 0 <= py < H:
            setPixel(px, py, r, g, b)

def koch_points(x0, y0, x1, y1, depth):
    """Return list of (x,y) points for a Koch segment."""
    if depth == 0:
        return [(x0, y0), (x1, y1)]
    dx = x1 - x0
    dy = y1 - y0
    # Trisection points
    ax = x0 + dx / 3
    ay = y0 + dy / 3
    bx = x0 + dx * 2 / 3
    by = y0 + dy * 2 / 3
    # Peak of the equilateral triangle
    mx = ax + (bx - ax) * 0.5 - (by - ay) * (3**0.5 / 2)
    my = ay + (by - ay) * 0.5 + (bx - ax) * (3**0.5 / 2)
    pts  = koch_points(x0, y0, ax, ay, depth - 1)
    pts += koch_points(ax, ay, mx, my, depth - 1)[1:]
    pts += koch_points(mx, my, bx, by, depth - 1)[1:]
    pts += koch_points(bx, by, x1, y1, depth - 1)[1:]
    return pts

# Build equilateral triangle vertices
radius = min(W, H) * 0.38
verts  = []
for i in range(3):
    angle = math.pi / 2 + i * 2 * math.pi / 3
    verts.append((CX + radius * math.cos(angle),
                  CY - radius * math.sin(angle)))

DEPTH = 4

# Collect all edge points
all_pts = []
for i in range(3):
    x0, y0 = verts[i]
    x1, y1 = verts[(i + 1) % 3]
    edge = koch_points(x0, y0, x1, y1, DEPTH)
    all_pts.extend(edge[:-1])
all_pts.append(all_pts[0])

# Draw with a colour gradient along the perimeter
n = len(all_pts)
for i in range(n - 1):
    t  = i / n
    r  = int(120 + 100 * math.sin(t * math.pi * 2))
    g  = int(180 + 60  * math.sin(t * math.pi * 2 + 2))
    b  = int(220 + 35  * math.cos(t * math.pi * 2))
    draw_line(all_pts[i][0], all_pts[i][1],
              all_pts[i+1][0], all_pts[i+1][1], r, g, b)

# Small white sparkles
import random
random.seed(5)
for _ in range(40):
    sx = random.randint(0, W-1)
    sy = random.randint(0, H-1)
    setPixel(sx, sy, 255, 255, 255)
