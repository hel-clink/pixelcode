# Circle
# Draws the outline of a circle using the distance formula.

cx = getWidth()  // 2
cy = getHeight() // 2
r  = min(cx, cy) - 5

for y in range(getHeight()):
    for x in range(getWidth()):
        dx   = x - cx
        dy   = y - cy
        dist = (dx * dx + dy * dy) ** 0.5
        if abs(dist - r) < 1.5:
            setPixel(x, y, 80, 200, 255)
