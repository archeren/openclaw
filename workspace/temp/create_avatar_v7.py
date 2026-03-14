#!/usr/bin/env python3
"""Generate Arche's avatar - Ellipse with curved bite cut out (no triangle overlay)"""

from PIL import Image, ImageDraw

# Create 400x400 image with dark blue background
bg_color = '#1a2a4a'
img = Image.new('RGB', (400, 400), bg_color)
draw = ImageDraw.Draw(img)

# Background gradient
for r in range(200, 0, -1):
    intensity = int(26 + (200 - r) * 0.15)
    color = f'#{intensity:02x}{int(intensity*0.5):02x}{int(intensity*1.3):02x}'
    draw.ellipse([200-r, 200-r, 200+r, 200+r], fill=color)

# 1. Rectangle arm FIRST
draw.rectangle([170, 250, 230, 360], fill='#bb1818', outline='#ff4040', width=3)

# 2. Draw the ellipse with a curved bite using polygon with many points
# Create a shape that's an ellipse with a curved "V" cut out of the top

import math

# Generate points for ellipse with curved bite
points = []
ellipse_cx, ellipse_cy = 200, 160  # Center of ellipse
ellipse_rx, ellipse_ry = 80, 100   # Radius x and y

# Draw the ellipse from left side, going around, but skip the top center
# and add curved bite instead

# Left side of ellipse (from bottom-left, up to where bite starts)
for angle in range(180, 360, 3):  # Left half, bottom to top
    rad = math.radians(angle)
    x = ellipse_cx + ellipse_rx * math.cos(rad)
    y = ellipse_cy + ellipse_ry * math.sin(rad)
    points.append((x, y))

# Curved bite - a concave curve going inward (like a pizza slice removed)
# This creates the two "fingers" of the claw
bite_depth = 80  # How deep the bite goes
bite_width = 35  # Half-width of the bite opening

# Right side of the bite (curves inward then back out)
for i in range(10):
    t = i / 9
    # Curve that goes inward toward center
    x = ellipse_cx - bite_width + (bite_width * 2 * t)
    y = ellipse_cy - ellipse_ry - 5 + (bite_depth * (1 - abs(t - 0.5) * 2))
    points.append((x, y))

# Right side of ellipse (from where bite ends, down to bottom-right)
for angle in range(0, 180, 3):  # Right half, top to bottom
    rad = math.radians(angle)
    x = ellipse_cx + ellipse_rx * math.cos(rad)
    y = ellipse_cy + ellipse_ry * math.sin(rad)
    points.append((x, y))

# Draw the claw shape
draw.polygon(points, fill='#dd3030', outline='#ff5050')

# 3. Four-point star sparkle at top right
star_center = (260, 90)
star_size = 15

for angle in [0, 90]:
    if angle == 0:
        draw.polygon([
            (star_center[0], star_center[1] - star_size),
            (star_center[0] - 4, star_center[1]),
            (star_center[0] + 4, star_center[1]),
        ], fill='#ffffff')
        draw.polygon([
            (star_center[0], star_center[1] + star_size),
            (star_center[0] - 4, star_center[1]),
            (star_center[0] + 4, star_center[1]),
        ], fill='#ffffff')
    else:
        draw.polygon([
            (star_center[0] - star_size, star_center[1]),
            (star_center[0], star_center[1] - 4),
            (star_center[0], star_center[1] + 4),
        ], fill='#ffffff')
        draw.polygon([
            (star_center[0] + star_size, star_center[1]),
            (star_center[0], star_center[1] - 4),
            (star_center[0], star_center[1] + 4),
        ], fill='#ffffff')

draw.ellipse([star_center[0]-3, star_center[1]-3, star_center[0]+3, star_center[1]+3], fill='#ffffff')

# Save
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar-v7.png', 'PNG')
print('Avatar v7 saved - ellipse with curved bite!')