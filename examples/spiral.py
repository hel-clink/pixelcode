# Color Spiral
# An animated spiral that rotates and shifts hue over time.

import math

def draw(frame):
    clearCanvas()
    cx = getWidth()  / 2
    cy = getHeight() / 2
    t  = frame * 0.03

    for y in range(getHeight()):
        for x in range(getWidth()):
            dx = x - cx
            dy = y - cy
            dist  = (dx * dx + dy * dy) ** 0.5
            angle = math.atan2(dy, dx)

            # Spiral wave: combine angle, distance and time
            wave = math.sin(angle * 4 - dist * 0.18 + t * 3)

            # HSV-like colour rotation
            hue = (dist * 0.05 + t) % 1.0
            h6  = hue * 6
            s   = h6 % 1.0
            if   h6 < 1: rv, gv, bv = 1,   s,   0
            elif h6 < 2: rv, gv, bv = 1-s, 1,   0
            elif h6 < 3: rv, gv, bv = 0,   1,   s
            elif h6 < 4: rv, gv, bv = 0,   1-s, 1
            elif h6 < 5: rv, gv, bv = s,   0,   1
            else:         rv, gv, bv = 1,   0,   1-s

            bright = int(128 + 127 * wave)
            r = int(rv * bright)
            g = int(gv * bright)
            b = int(bv * bright)
            setPixel(x, y, r, g, b)
