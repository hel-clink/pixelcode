# Fire Simulation
# Classic fire effect using a heat buffer that rises and cools.

import random

W = getWidth()
H = getHeight()

# Heat buffer: one value per pixel (0 = cold, 255 = hot)
heat = [[0] * W for _ in range(H)]

def draw(frame):
    # Ignite the bottom row randomly
    for x in range(W):
        heat[H - 1][x] = random.randint(160, 255)

    # Propagate heat upward with slight cooling and spreading
    for y in range(H - 2, 0, -1):
        for x in range(W):
            left  = heat[y + 1][max(x - 1, 0)]
            mid   = heat[y + 1][x]
            right = heat[y + 1][min(x + 1, W - 1)]
            avg   = (left + mid + right) // 3
            heat[y][x] = max(0, avg - random.randint(0, 8))

    # Render: map heat value to fire colours
    for y in range(H):
        for x in range(W):
            h = heat[y][x]
            if h < 80:
                r, g, b = 0, 0, 0
            elif h < 140:
                r, g, b = h * 2, 0, 0
            elif h < 200:
                r, g, b = 255, (h - 140) * 4, 0
            else:
                r, g, b = 255, 255, (h - 200) * 5
            setPixel(x, y, r, g, b)
