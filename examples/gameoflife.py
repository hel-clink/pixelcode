# Conway's Game of Life
# Classic cellular automaton. Starts with a random grid.

import random

W = getWidth()
H = getHeight()

# Scale: each cell is SCALE x SCALE pixels
SCALE = max(2, min(8, min(W, H) // 32))
COLS  = W // SCALE
ROWS  = H // SCALE

# Initialise grid with ~30% live cells
random.seed(7)
grid = [[1 if random.random() < 0.30 else 0 for _ in range(COLS)] for _ in range(ROWS)]

ALIVE = (120, 220, 120)
DEAD  = (15,  20,  30)

def count_neighbours(g, r, c):
    total = 0
    for dr in [-1, 0, 1]:
        for dc in [-1, 0, 1]:
            if dr == 0 and dc == 0:
                continue
            nr = (r + dr) % ROWS
            nc = (c + dc) % COLS
            total += g[nr][nc]
    return total

def draw(frame):
    global grid

    # Compute next generation
    next_grid = [[0] * COLS for _ in range(ROWS)]
    for r in range(ROWS):
        for c in range(COLS):
            n = count_neighbours(grid, r, c)
            if grid[r][c] == 1:
                next_grid[r][c] = 1 if n in (2, 3) else 0
            else:
                next_grid[r][c] = 1 if n == 3 else 0
    grid = next_grid

    # Render
    for r in range(ROWS):
        for c in range(COLS):
            color = ALIVE if grid[r][c] else DEAD
            for dy in range(SCALE):
                for dx in range(SCALE):
                    setPixel(c * SCALE + dx, r * SCALE + dy, *color)
