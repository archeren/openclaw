#!/usr/bin/env python3
"""Generate Arche's avatar - Clean version with optional star sparkle"""

from PIL import Image, ImageDraw

# Create 400x400 image
img = Image.new('RGB', (400, 400), '#1a2a4a')
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

# 3. Triangle cut - wide at top, point at center (pizza slice removed)
triangle_cut = [
    (160, 60),   # Left side of wide opening
    (240, 60),   # Right side of wide opening
    (200, 160),  # Point in center
]
draw.polygon(triangle_cut, fill='#1a2a4a')

# Outline the cut
draw.line([(160, 60), (200, 160)], fill='#ff5050', width=3)
draw.line([(200, 160), (240, 60)], fill='#ff5050', width=3)

# 4. Four-point star sparkle at top right of ellipse
# A four-point star is like an X overlay
star_center = (260, 90)
star_size = 15

# Draw the star as two overlapping triangles
# Vertical point
draw.polygon([
    (star_center[0], star_center[1] - star_size),  # Top
    (star_center[0] - 4, star_center[1]),           # Left
    (star_center[0] + 4, star_center[1]),           # Right
], fill='#ffffff')
draw.polygon([
    (star_center[0], star_center[1] + star_size),  # Bottom
    (star_center[0] - 4, star_center[1]),           # Left
    (star_center[0] + 4, star_center[1]),           # Right
], fill='#ffffff')

# Horizontal point
draw.polygon([
    (star_center[0] - star_size, star_center[1]),  # Left
    (star_center[0], star_center[1] - 4),           # Top
    (star_center[0], star_center[1] + 4),           # Bottom
], fill='#ffffff')
draw.polygon([
    (star_center[0] + star_size, star_center[1]),  # Right
    (star_center[0], star_center[1] - 4),           # Top
    (star_center[0], star_center[1] + 4),           # Bottom
], fill='#ffffff')

# Small center dot
draw.ellipse([star_center[0]-3, star_center[1]-3, star_center[0]+3, star_center[1]+3], fill='#ffffff')

# Save
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar-v5.png', 'PNG')
print('Avatar v5 saved - clean with star sparkle!')