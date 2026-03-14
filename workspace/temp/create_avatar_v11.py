#!/usr/bin/env python3
"""Generate Arche's avatar - Merged ellipse and rectangle (one shape)"""

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

# Draw the claw as ONE combined shape (ellipse + rectangle merged)
# Using polygon to draw both as a single shape

import math

cx, cy = 200, 160
rx, ry = 80, 100

# Build the combined shape points
points = []

# 1. Add the 5/6 ellipse arc (from 300° to 240°, skipping 240-300 at top)
# Going counter-clockwise: start at 300°, go to 240°
for angle in range(300, 360, 2):
    rad = math.radians(angle)
    x = cx + rx * math.cos(rad)
    y = cy + ry * math.sin(rad)
    points.append((x, y))

for angle in range(0, 241, 2):
    rad = math.radians(angle)
    x = cx + rx * math.cos(rad)
    y = cy + ry * math.sin(rad)
    points.append((x, y))

# 2. Connect to rectangle bottom
# Rectangle: x from 170 to 230, y from bottom of ellipse to 360
rect_left = 170
rect_right = 230
rect_bottom = 360

# Find where ellipse bottom is (around 180° and 0°)
# Add rectangle corners
points.append((rect_right, rect_bottom))  # Bottom right
points.append((rect_left, rect_bottom))   # Bottom left

# Draw as single polygon
draw.polygon(points, fill='#dd3030', outline='#ff5050')

# Add outline for the cut edges (the two lines from center to arc)
# Line from center to 240°
rad1 = math.radians(240)
x1 = cx + rx * math.cos(rad1)
y1 = cy + ry * math.sin(rad1)
draw.line([(cx, cy), (x1, y1)], fill='#ff5050', width=4)

# Line from center to 300°
rad2 = math.radians(300)
x2 = cx + rx * math.cos(rad2)
y2 = cy + ry * math.sin(rad2)
draw.line([(cx, cy), (x2, y2)], fill='#ff5050', width=4)

# 3. Four-point star sparkle - BIGGER
star_center = (260, 90)
star_size = 22

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
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar-v11.png', 'PNG')
print('Avatar v11 saved - merged single shape!')