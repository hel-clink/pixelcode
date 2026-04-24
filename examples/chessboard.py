# Chessboard
# Draws a classic black-and-white chessboard pattern.

for y in range(getHeight()):
    for x in range(getWidth()):
        if (x + y) % 2 == 0:
            setPixel(x, y, 255, 255, 255)
        else:
            setPixel(x, y, 0, 0, 0)
