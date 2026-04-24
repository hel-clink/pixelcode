# Minecraft World
# A side-on pixel-art scene with grass, dirt, stone, ores and a sky.

import random

random.seed(42)

W = getWidth()
H = getHeight()

# --- Colour palette ---
SKY_TOP    = (100, 160, 255)
SKY_BOT    = (160, 200, 255)
CLOUD      = (240, 240, 245)
SUN        = (255, 220,  50)
GRASS_TOP  = ( 80, 170,  50)
GRASS_SIDE = ( 60, 130,  40)
DIRT       = (130,  90,  60)
DIRT_DARK  = (110,  75,  50)
STONE      = (120, 120, 120)
STONE_DARK = ( 90,  90,  90)
COAL       = ( 40,  40,  40)
IRON       = (180, 140, 110)
GOLD       = (220, 180,  40)
DIAMOND    = ( 60, 200, 220)
BEDROCK    = ( 30,  30,  30)
WATER      = ( 50, 100, 200)
WATER_L    = ( 80, 140, 230)
LEAF       = ( 50, 140,  40)
LEAF_D     = ( 35, 110,  30)
WOOD       = (130,  90,  50)
WOOD_D     = (100,  70,  40)

BLOCK = max(4, min(12, min(W, H) // 20))
COLS  = W  // BLOCK
ROWS  = H  // BLOCK

def block(col, row, color, dark=None):
    if col < 0 or col >= COLS or row < 0 or row >= ROWS:
        return
    x0, y0 = col * BLOCK, row * BLOCK
    dark = dark or tuple(max(0, c - 25) for c in color)
    for dy in range(BLOCK):
        for dx in range(BLOCK):
            # Simple shading: edges slightly darker
            edge = (dx == 0 or dy == 0)
            c = dark if edge else color
            setPixel(x0 + dx, y0 + dy, *c)

# --- Sky ---
for row in range(ROWS):
    for col in range(COLS):
        t = row / ROWS
        r = int(SKY_TOP[0] + t * (SKY_BOT[0] - SKY_TOP[0]))
        g = int(SKY_TOP[1] + t * (SKY_BOT[1] - SKY_TOP[1]))
        b = int(SKY_TOP[2] + t * (SKY_BOT[2] - SKY_TOP[2]))
        x0, y0 = col * BLOCK, row * BLOCK
        for dy in range(BLOCK):
            for dx in range(BLOCK):
                setPixel(x0+dx, y0+dy, r, g, b)

# --- Sun ---
for dy in range(-BLOCK, BLOCK + 1):
    for dx in range(-BLOCK, BLOCK + 1):
        sx = COLS // 5 * BLOCK + dx
        sy = ROWS // 6 * BLOCK + dy
        if 0 <= sx < W and 0 <= sy < H:
            setPixel(sx, sy, *SUN)

# --- Clouds ---
cloud_shapes = [(COLS*2//5, 1), (COLS*2//5+1, 1), (COLS*2//5+2, 1),
                (COLS*2//5+1, 0), (COLS*3//5, 2), (COLS*3//5+1, 2),
                (COLS*3//5+2, 2), (COLS*3//5-1, 2), (COLS*3//5+1, 1)]
for (cc, cr) in cloud_shapes:
    block(cc, cr, CLOUD)

# --- Terrain height map ---
surface = []
h = ROWS * 6 // 10
for col in range(COLS):
    h += random.randint(-1, 1)
    h  = max(ROWS * 4 // 10, min(ROWS * 7 // 10, h))
    surface.append(h)

# Water level
WATER_ROW = ROWS * 62 // 100

# --- Render terrain ---
for col in range(COLS):
    surf = surface[col]

    # Water fill
    for row in range(WATER_ROW, surf):
        c = WATER_L if row == WATER_ROW else WATER
        x0, y0 = col * BLOCK, row * BLOCK
        for dy in range(BLOCK):
            for dx in range(BLOCK):
                setPixel(x0+dx, y0+dy, *c)

    # Grass or submerged dirt top
    if surf <= WATER_ROW:
        block(col, surf, DIRT)
    else:
        block(col, surf, GRASS_TOP)
        # Grass sides: 1 pixel-row below top
        for dy in range(BLOCK // 3):
            for dx in range(BLOCK):
                setPixel(col*BLOCK+dx, surf*BLOCK+BLOCK-1-dy, *GRASS_SIDE)

    # Dirt layer (3 rows)
    for row in range(surf + 1, min(surf + 4, ROWS)):
        d = DIRT if random.random() > 0.3 else DIRT_DARK
        block(col, row, d)

    # Stone layer
    for row in range(surf + 4, ROWS - 1):
        # Ore veins
        r = random.random()
        if   row > ROWS * 9 // 10 and r < 0.04:
            block(col, row, DIAMOND)
        elif row > ROWS * 8 // 10 and r < 0.06:
            block(col, row, GOLD)
        elif row > ROWS * 7 // 10 and r < 0.09:
            block(col, row, IRON)
        elif r < 0.08:
            block(col, row, COAL)
        else:
            s = STONE if random.random() > 0.4 else STONE_DARK
            block(col, row, s)

    # Bedrock
    block(col, ROWS - 1, BEDROCK)

# --- Trees ---
def tree(col):
    surf = surface[col]
    if surf >= WATER_ROW or col < 2 or col > COLS - 3:
        return
    # Trunk (2 blocks)
    block(col, surf - 1, WOOD, WOOD_D)
    block(col, surf - 2, WOOD, WOOD_D)
    # Leaves
    for dc in [-1, 0, 1]:
        block(col + dc, surf - 3, LEAF, LEAF_D)
        block(col + dc, surf - 4, LEAF, LEAF_D)
    block(col, surf - 5, LEAF, LEAF_D)

tree_cols = random.sample(range(2, COLS - 2), min(5, COLS // 5))
for tc in tree_cols:
    tree(tc)
