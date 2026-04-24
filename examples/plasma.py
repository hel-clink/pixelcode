# Plasma Effect
# Classic demo-scene plasma using overlapping sine waves.

import math

def draw(frame):
    t = frame * 0.05
    for y in range(getHeight()):
        for x in range(getWidth()):
            # Combine multiple sine waves for the plasma look
            v  = math.sin(x * 0.1 + t)
            v += math.sin(y * 0.1 + t * 0.7)
            v += math.sin((x + y) * 0.07 + t * 1.3)
            v += math.sin((x * x + y * y) ** 0.5 * 0.1 - t)
            # Map -2..2 to 0..255 for each channel
            r = int(127 + 127 * math.sin(v * 1.5))
            g = int(127 + 127 * math.sin(v * 1.5 + 2.09))
            b = int(127 + 127 * math.sin(v * 1.5 + 4.19))
            setPixel(x, y, r, g, b)
