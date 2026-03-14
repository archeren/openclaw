#!/usr/bin/env python3
"""Generate Arche's avatar - 5/6 ellipse with cut facing UP (around 90 degrees)"""

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

# 2. Draw 5/6 of an ellipse with cut facing UP
# Cut should be around 90 degrees (top)
# 5/6 = 300 degrees, 1/6 = 60 degrees removed
# To have cut at top (90 degrees), we need the gap centered at 90
# Start at 90+30=120 degrees, end at 90-30+360=420 degrees (or 60 degrees)
# So: start=120, end=60 (draws from 120° through 360° to 60°)

cx, cy = 200, 160
rx, ry = 80, 100

# Draw pieslice: start=120, end=60 (skips 60-120, which is centered at 90°)
draw.pieslice([cx-rx, cy-ry, cx+rx, cy+ry], start=120, end=60, fill='#dd3030', outline='#ff5050', width=4)

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
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar-v9.png', 'PNG')
print('Avatar v9 saved - cut facing UP!')