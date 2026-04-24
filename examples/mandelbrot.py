# Mandelbrot Fractal
# The most famous fractal in mathematics.
# Each pixel is coloured by how quickly it escapes to infinity.

MAX_ITER = 64

def draw(frame):
    W = getWidth()
    H = getHeight()

    # Slowly zoom in toward an interesting point over time
    zoom  = 1.0 + frame * 0.015
    cx    = -0.7269
    cy    =  0.1889
    scale = 3.0 / (min(W, H) * zoom)

    for py in range(H):
        for px in range(W):
            # Map pixel to complex plane
            x0 = (px - W / 2) * scale + cx
            y0 = (py - H / 2) * scale + cy

            x, y, i = 0.0, 0.0, 0
            while x*x + y*y <= 4.0 and i < MAX_ITER:
                x, y = x*x - y*y + x0, 2*x*y + y0
                i += 1

            if i == MAX_ITER:
                setPixel(px, py, 0, 0, 0)
            else:
                # Smooth colour gradient
                t = i / MAX_ITER
                r = int(9   * (1-t) * t**3       * 255)
                g = int(15  * (1-t)**2 * t**2    * 255)
                b = int(8.5 * (1-t)**3 * t       * 255)
                setPixel(px, py, r, g, b)
