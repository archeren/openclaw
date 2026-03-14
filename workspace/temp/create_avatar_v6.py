#!/usr/bin/env python3
"""Generate Arche's avatar - Fixed: triangle inside ellipse, same background color"""

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

# 1. Rectangle arm FIRST (will be covered by ellipse)
draw.rectangle([170, 250, 230, 360], fill='#bb1818', outline='#ff4040', width=3)

# 2. Main ellipse - covers the rectangle top
draw.ellipse([120, 60, 280, 260], fill='#dd3030', outline='#ff5050', width=4)

# 3. Triangle cut - INSIDE the ellipse, using SAME background color
# Triangle should be fully inside the ellipse bounds
# Ellipse top is at y=60, so triangle top should be below that
triangle_cut = [
    (165, 65),   # Left side (inside ellipse edge)
    (235, 65),   # Right side (inside ellipse edge)
    (200, 155),  # Point in center
]
draw.polygon(triangle_cut, fill=bg_color)  # Use SAME background color

# Outline the cut
draw.line([(165, 65), (200, 155)], fill='#ff5050', width=3)
draw.line([(200, 155), (235, 65)], fill='#ff5050', width=3)

# 4. Four-point star sparkle at top right of ellipse
star_center = (260, 90)
star_size = 15

# Draw the star as overlapping triangles
for angle in [0, 90]:
    if angle == 0:  # Vertical
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
    else:  # Horizontal
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

# Small center dot
draw.ellipse([star_center[0]-3, star_center[1]-3, star_center[0]+3, star_center[1]+3], fill='#ffffff')

# Save
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar-v6.png', 'PNG')
print('Avatar v6 saved - triangle inside ellipse, same background color!')