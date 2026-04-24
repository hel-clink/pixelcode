# Sine Wave Animation
# A scrolling sine wave drawn frame by frame.

import math

def draw(frame):
    clearCanvas()
    for x in range(getWidth()):
        y = int(getHeight() / 2 + math.sin((x + frame) * 0.1) * 40)
        if 0 <= y < getHeight():
            setPixel(x, y,  80, 200, 255)
        if 0 <= y + 1 < getHeight():
            setPixel(x, y + 1, 30, 100, 160)
