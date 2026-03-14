#!/usr/bin/env python3
"""Generate Arche's avatar - Cut facing UP (+180), bigger star"""

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
# Previous was centered at 90° (facing down), add 180 to face up = 270°
# Cut centered at 270°, so gap from 240° to 300°
# Draw from 300° through 360° to 240°
# start=300, end=240

cx, cy = 200, 160
rx, ry = 80, 100

draw.pieslice([cx-rx, cy-ry, cx+rx, cy+ry], start=300, end=240, fill='#dd3030', outline='#ff5050', width=4)

# 3. Four-point star sparkle - BIGGER
star_center = (260, 90)
star_size = 22  # Increased from 15

for angle in [0, 90]:
    if angle == 0:
        draw.polygon([
            (star_center[0], star_center[1] - star_size),
            (star_center[0] - 5, star_center[1]),
            (star_center[0] + 5, star_center[1]),
        ], fill='#ffffff')
        draw.polygon([
            (star_center[0], star_center[1] + star_size),
            (star_center[0] - 5, star_center[1]),
            (star_center[0] + 5, star_center[1]),
        ], fill='#ffffff')
    else:
        draw.polygon([
            (star_center[0] - star_size, star_center[1]),
            (star_center[0], star_center[1] - 5),
            (star_center[0], star_center[1] + 5),
        ], fill='#ffffff')
        draw.polygon([
            (star_center[0] + star_size, star_center[1]),
            (star_center[0], star_center[1] - 5),
            (star_center[0], star_center[1] + 5),
        ], fill='#ffffff')

draw.ellipse([star_center[0]-4, star_center[1]-4, star_center[0]+4, star_center[1]+4], fill='#ffffff')

# Save
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar-v10.png', 'PNG')
print('Avatar v10 saved - cut facing UP, bigger star!')