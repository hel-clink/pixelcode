# Random Maze
# Generates a new maze using recursive backtracking each time you run it.

import random

W = getWidth()
H = getHeight()

# Cell size in pixels (must be odd for walls to work out)
CELL = max(4, min(16, min(W, H) // 16))
COLS = (W - 1) // (CELL + 1)
ROWS = (H - 1) // (CELL + 1)

# Build maze grid using recursive backtracking
visited = [[False] * COLS for _ in range(ROWS)]
walls_h = [[True]  * COLS for _ in range(ROWS + 1)]  # horizontal walls
walls_v = [[True]  * (COLS + 1) for _ in range(ROWS)]  # vertical walls

def carve(r, c):
    visited[r][c] = True
    dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    random.shuffle(dirs)
    for dr, dc in dirs:
        nr, nc = r + dr, c + dc
        if 0 <= nr < ROWS and 0 <= nc < COLS and not visited[nr][nc]:
            # Remove wall between (r,c) and (nr,nc)
            if dr == 0:   # horizontal move → remove vertical wall
                walls_v[r][min(c, nc) + 1] = False
            else:         # vertical move → remove horizontal wall
                walls_h[min(r, nr) + 1][c] = False
            carve(nr, nc)

carve(0, 0)

# Render
clearCanvas()

def px(col, row):
    """Top-left pixel of a cell."""
    return 1 + col * (CELL + 1), 1 + row * (CELL + 1)

WALL_C  = (60,  60,  80)
FLOOR_C = (220, 220, 240)

for r in range(ROWS):
    for c in range(COLS):
        x0, y0 = px(c, r)
        for dy in range(CELL):
            for dx in range(CELL):
                setPixel(x0 + dx, y0 + dy, *FLOOR_C)

# Draw walls
for r in range(ROWS + 1):
    for c in range(COLS):
        if walls_h[r][c]:
            x0, y0 = px(c, r)
            for dx in range(-1, CELL + 1):
                nx = x0 + dx
                if 0 <= nx < W and 0 <= y0 - 1 < H:
                    setPixel(nx, y0 - 1, *WALL_C)

for r in range(ROWS):
    for c in range(COLS + 1):
        if walls_v[r][c]:
            x0, y0 = px(c, r)
            for dy in range(-1, CELL + 1):
                ny = y0 + dy
                if 0 <= x0 - 1 < W and 0 <= ny < H:
                    setPixel(x0 - 1, ny, *WALL_C)

# Mark start (green) and end (red)
sx, sy = px(0, 0)
ex, ey = px(COLS - 1, ROWS - 1)
for dy in range(CELL):
    for dx in range(CELL):
        setPixel(sx + dx, sy + dy, 80,  200, 80)
        setPixel(ex + dx, ey + dy, 220,  80, 80)
