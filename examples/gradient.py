# Color Gradient
# 2D gradient: x controls red, y controls green.

for y in range(getHeight()):
    for x in range(getWidth()):
        r = x * 255 // getWidth()
        g = y * 255 // getHeight()
        b = 128
        setPixel(x, y, r, g, b)
