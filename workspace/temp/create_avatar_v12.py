#!/usr/bin/env python3
"""Generate Arche's avatar - Full ellipse with cut, arm extends from bottom"""

from PIL import Image, ImageDraw
import math

# Create 400x400 image with dark blue background
bg_color = '#1a2a4a'
img = Image.new('RGB', (400, 400), bg_color)
draw = ImageDraw.Draw(img)

# Background gradient
for r in range(200, 0, -1):
    intensity = int(26 + (200 - r) * 0.15)
    color = f'#{intensity:02x}{int(intensity*0.5):02x}{int(intensity*1.3):02x}'
    draw.ellipse([200-r, 200-r, 200+r, 200+r], fill=color)

# Draw the claw as ONE shape:
# - 5/6 ellipse (cut at top facing up)
# - Arm extends from the bottom of the ellipse
# No empty triangles, no center point lines

cx, cy = 200, 160
rx, ry = 80, 100

# Build the shape points
points = []

# Draw the ellipse arc from 300° to 240° (skipping 240-300 at top)
# But instead of going to center, we trace the full ellipse body
# and extend the bottom into a rectangle/arm

# Start at 300° (right side of cut), go around to 240° (left side of cut)
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

# Now extend the bottom into an arm
# Find the bottom-most points of the ellipse (around 180°)
# The ellipse bottom is at cy + ry = 260
# Rectangle should extend from there

# Get the left and right points at bottom of ellipse
bottom_left_angle = 200
bottom_right_angle = 340

rad_left = math.radians(180)
left_x = cx + rx * math.cos(rad_left)
left_y = cy + ry * math.sin(rad_left)

rad_right = math.radians(0)
right_x = cx + rx * math.cos(rad_right)
right_y = cy + ry * math.sin(rad_right)

# Add rectangle extension at bottom
# Width should match the ellipse bottom width
arm_width = 60  # Width of the arm
arm_bottom = 360

# Insert arm corners into the points list
# Find where to insert (after going past bottom, before coming back up)
# Actually, let's rebuild the points more carefully

points = []

# Right side of cut (300°) going down the right side
for angle in range(300, 360, 2):
    rad = math.radians(angle)
    x = cx + rx * math.cos(rad)
    y = cy + ry * math.sin(rad)
    points.append((x, y))

# Continue from 0° to 180° (right side to bottom)
for angle in range(0, 181, 2):
    rad = math.radians(angle)
    x = cx + rx * math.cos(rad)
    y = cy + ry * math.sin(rad)
    points.append((x, y))

# At bottom (180°), extend down into arm
arm_left = cx - 30  # 60 wide
arm_right = cx + 30
arm_bottom = 360

points.append((arm_right, arm_bottom))  # Bottom right of arm
points.append((arm_left, arm_bottom))   # Bottom left of arm

# Continue from 180° to 240° (bottom to left side of cut)
for angle in range(180, 241, 2):
    rad = math.radians(angle)
    x = cx + rx * math.cos(rad)
    y = cy + ry * math.sin(rad)
    points.append((x, y))

# Draw as single polygon
draw.polygon(points, fill='#dd3030', outline='#ff5050', width=3)

# Draw the cut edges (two lines from the arc endpoints)
rad1 = math.radians(240)
x1 = cx + rx * math.cos(rad1)
y1 = cy + ry * math.sin(rad1)

rad2 = math.radians(300)
x2 = cx + rx * math.cos(rad2)
y2 = cy + ry * math.sin(rad2)

# Draw lines closing the cut
draw.line([(x1, y1), (x2, y2)], fill='#ff5050', width=3)

# Four-point star sparkle
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
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar-v12.png', 'PNG')
print('Avatar v12 saved - no empty triangles, arm extends from bottom!')