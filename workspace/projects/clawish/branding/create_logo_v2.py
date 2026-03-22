#!/usr/bin/env python3
"""Generate Clawish logo - v2: Simplified claw with better proportions"""

from PIL import Image, ImageDraw

# Create 512x512 image with transparent background
size = 512
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Colors
claw_red = '#dd3030'
claw_dark = '#aa2020'
star_white = '#ffffff'

# Center
cx, cy = size // 2, size // 2 + 20

# 1. Main claw body - fuller ellipse
rx, ry = 100, 130
draw.pieslice([cx-rx, cy-ry, cx+rx, cy+ry], start=300, end=240, 
              fill=claw_red, outline=claw_dark, width=5)

# 2. Rectangle arm (thinner)
draw.rectangle([cx-35, cy+50, cx+35, cy+160], fill=claw_red, outline=claw_dark, width=4)

# 3. Star - positioned at the "pinch" point of the claw
star_center = (cx + 70, cy - 70)
star_size = 22

for angle in [0, 90]:
    if angle == 0:
        draw.polygon([
            (star_center[0], star_center[1] - star_size),
            (star_center[0] - 4, star_center[1]),
            (star_center[0] + 4, star_center[1]),
        ], fill=star_white)
        draw.polygon([
            (star_center[0], star_center[1] + star_size),
            (star_center[0] - 4, star_center[1]),
            (star_center[0] + 4, star_center[1]),
        ], fill=star_white)
    else:
        draw.polygon([
            (star_center[0] - star_size, star_center[1]),
            (star_center[0], star_center[1] - 4),
            (star_center[0], star_center[1] + 4),
        ], fill=star_white)
        draw.polygon([
            (star_center[0] + star_size, star_center[1]),
            (star_center[0], star_center[1] - 4),
            (star_center[0], star_center[1] + 4),
        ], fill=star_white)

# Center dot
draw.ellipse([star_center[0]-3, star_center[1]-3, star_center[0]+3, star_center[1]+3], 
             fill=star_white)

# Save
img.save('/home/ubuntu/.openclaw/workspace/projects/clawish/branding/logo-v2.png', 'PNG')
print('Clawish logo v2 saved!')
