# Twinkling Stars
# 80 stars at fixed positions that blink at different speeds.

import math, random

random.seed(42)
stars = [
    (random.randint(0, getWidth()  - 1),
     random.randint(0, getHeight() - 1),
     random.random())
    for _ in range(80)
]

def draw(frame):
    clearCanvas()
    for sx, sy, phase in stars:
        bright = int(128 + 127 * math.sin(frame * 0.07 + phase * 6.28))
        setPixel(sx, sy, bright, bright, bright)
