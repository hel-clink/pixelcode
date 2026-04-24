# Fractal Landscape
# Generates a mountain silhouette using the midpoint displacement algorithm.
# Each run produces a different landscape.

import random, math

random.seed(42)

W = getWidth()
H = getHeight()

def midpoint_displacement(points, roughness, depth):
    """Recursively add midpoints with random height offsets."""
    if depth == 0:
        return points
    result = []
    for i in range(len(points) - 1):
        x0, y0 = points[i]
        x1, y1 = points[i + 1]
        mx = (x0 + x1) / 2
        my = (y0 + y1) / 2 + random.uniform(-roughness, roughness)
        result.append(points[i])
        result.append((mx, my))
    result.append(points[-1])
    return midpoint_displacement(result, roughness * 0.55, depth - 1)

# --- Sky gradient ---
for y in range(H):
    t = y / H
    r = int(20  + t * 60)
    g = int(30  + t * 80)
    b = int(80  + t * 120)
    for x in range(W):
        setPixel(x, y, r, g, b)

# --- Stars ---
random.seed(7)
for _ in range(120):
    sx = random.randint(0, W - 1)
    sy = random.randint(0, H // 2)
    bright = random.randint(160, 255)
    setPixel(sx, sy, bright, bright, bright)

# --- Moon ---
moon_x, moon_y, moon_r = W * 3 // 4, H // 6, max(6, min(W, H) // 18)
for dy in range(-moon_r, moon_r + 1):
    for dx in range(-moon_r, moon_r + 1):
        if dx*dx + dy*dy <= moon_r*moon_r:
            setPixel(moon_x + dx, moon_y + dy, 255, 250, 200)

# --- Far mountains (blue-grey) ---
random.seed(3)
far_pts = [(0, H * 0.65)] + [(x, H * 0.65) for x in range(0, W + 1, W // 4)] + [(W, H * 0.65)]
far_pts = midpoint_displacement(far_pts, H * 0.10, 6)
horizon_far = {}
for x, y in far_pts:
    ix = int(x)
    if 0 <= ix < W:
        horizon_far[ix] = int(max(0, min(H - 1, y)))
for ix in range(W):
    top = horizon_far.get(ix, H // 2)
    for y in range(top, H):
        t = (y - top) / max(1, H - top)
        setPixel(ix, y, int(40 + t * 20), int(50 + t * 30), int(80 + t * 40))

# --- Near mountains (dark green) ---
random.seed(17)
near_pts = [(0, H * 0.75)] + [(x, H * 0.75) for x in range(0, W + 1, W // 6)] + [(W, H * 0.75)]
near_pts = midpoint_displacement(near_pts, H * 0.12, 7)
horizon_near = {}
for x, y in near_pts:
    ix = int(x)
    if 0 <= ix < W:
        horizon_near[ix] = int(max(0, min(H - 1, y)))
for ix in range(W):
    top = horizon_near.get(ix, H * 2 // 3)
    for y in range(top, H):
        t = (y - top) / max(1, H - top)
        setPixel(ix, y, int(10 + t * 20), int(40 + t * 30), int(15 + t * 10))

# --- Foreground (near black) ---
random.seed(99)
fore_pts = [(0, H * 0.88)] + [(x, H * 0.88) for x in range(0, W + 1, W // 8)] + [(W, H * 0.88)]
fore_pts = midpoint_displacement(fore_pts, H * 0.05, 6)
for x, y in fore_pts:
    ix = int(x)
    if 0 <= ix < W:
        for fy in range(int(y), H):
            setPixel(ix, fy, 5, 10, 5)

# --- Water reflection ---
water_top = H * 7 // 8
for y in range(water_top, H):
    t = (y - water_top) / max(1, H - water_top)
    for x in range(W):
        r = int(10 + t * 10)
        g = int(20 + t * 20)
        b = int(50 + t * 60)
        # Ripple
        ripple = int(5 * math.sin(x * 0.3 + y * 0.5))
        setPixel(x, y, r + ripple, g + ripple, b + ripple)
