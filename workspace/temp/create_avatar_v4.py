#!/usr/bin/env python3
"""Generate Arche's avatar - Fixed: reversed triangle, ellipse covers rectangle"""

from PIL import Image, ImageDraw

# Create 400x400 image
img = Image.new('RGB', (400, 400), '#1a2a4a')
draw = ImageDraw.Draw(img)

# Background gradient
for r in range(200, 0, -1):
    intensity = int(26 + (200 - r) * 0.15)
    color = f'#{intensity:02x}{int(intensity*0.5):02x}{int(intensity*1.3):02x}'
    draw.ellipse([200-r, 200-r, 200+r, 200+r], fill=color)

# Allan's design v4:
# 1. Rectangle arm FIRST (will be covered by ellipse)
# 2. Ellipse covers the top of rectangle
# 3. Triangle cut - WIDE at top, POINT at center (like pizza slice removed)

# Rectangle arm at bottom (draw first, ellipse will cover top)
draw.rectangle([170, 250, 230, 360], fill='#bb1818', outline='#ff4040', width=3)

# Main ellipse - covers the rectangle top
# Position it so the bottom of ellipse overlaps the rectangle
draw.ellipse([120, 60, 280, 260], fill='#dd3030', outline='#ff5050', width=4)

# Triangle cut - REVERSED: wide at top, point at center
# Like a pizza slice taken away (1/6 of the claw)
# Wide part at top edge of ellipse, point goes down into center
triangle_cut = [
    (160, 60),   # Left side of wide opening (at top of ellipse)
    (240, 60),   # Right side of wide opening (at top of ellipse)
    (200, 160),  # Point in center of ellipse
]
draw.polygon(triangle_cut, fill='#1a2a4a')  # Fill with background to "cut"

# Redraw the outline around the cut for clean edges
draw.line([(160, 60), (200, 160)], fill='#ff5050', width=3)
draw.line([(200, 160), (240, 60)], fill='#ff5050', width=3)

# Add some depth/highlights
# Left pincer highlight
draw.arc([125, 65, 195, 180], 200, 280, fill='#ff8080', width=4)
# Right pincer highlight  
draw.arc([205, 65, 275, 180], 260, 340, fill='#ff8080', width=4)

# Small shine dots on each pincer
draw.ellipse([140, 100, 152, 112], fill='#ffaaaa')
draw.ellipse([248, 100, 260, 112], fill='#ffaaaa')

# Arm segment line
draw.line([(175, 300), (225, 300)], fill='#aa1010', width=3)

# Save
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar-v4.png', 'PNG')
print('Avatar v4 saved - reversed triangle, ellipse covers rectangle!')