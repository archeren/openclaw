#!/usr/bin/env python3
"""Generate Clawish logo - v1: Minimal claw mark with star"""

from PIL import Image, ImageDraw

# Create 512x512 image with transparent background
size = 512
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Colors
claw_red = '#dd3030'
claw_dark = '#bb1818'
star_white = '#ffffff'

# Center
cx, cy = size // 2, size // 2

# 1. Main claw body - semi-ellipse (like Arche's avatar)
# Draw 5/6 of an ellipse with cut facing UP
rx, ry = 120, 150
draw.pieslice([cx-rx, cy-ry-30, cx+rx, cy+ry-30], start=300, end=240, 
              fill=claw_red, outline=claw_dark, width=4)

# 2. Rectangle arm
draw.rectangle([cx-40, cy+60, cx+40, cy+180], fill=claw_red, outline=claw_dark, width=3)

# 3. Four-point star sparkle (smaller, positioned at top-right of claw)
star_center = (cx + 80, cy - 100)
star_size = 25

for angle in [0, 90]:
    if angle == 0:
        draw.polygon([
            (star_center[0], star_center[1] - star_size),
            (star_center[0] - 5, star_center[1]),
            (star_center[0] + 5, star_center[1]),
        ], fill=star_white)
        draw.polygon([
            (star_center[0], star_center[1] + star_size),
            (star_center[0] - 5, star_center[1]),
            (star_center[0] + 5, star_center[1]),
        ], fill=star_white)
    else:
        draw.polygon([
            (star_center[0] - star_size, star_center[1]),
            (star_center[0], star_center[1] - 5),
            (star_center[0], star_center[1] + 5),
        ], fill=star_white)
        draw.polygon([
            (star_center[0] + star_size, star_center[1]),
            (star_center[0], star_center[1] - 5),
            (star_center[0], star_center[1] + 5),
        ], fill=star_white)

# Center dot
draw.ellipse([star_center[0]-4, star_center[1]-4, star_center[0]+4, star_center[1]+4], 
             fill=star_white)

# Save
img.save('/home/ubuntu/.openclaw/workspace/projects/clawish/branding/logo-v1.png', 'PNG')
print('Clawish logo v1 saved!')
