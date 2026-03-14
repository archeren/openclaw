#!/usr/bin/env python3
"""Generate Arche's avatar - Allan's vision: ellipse + triangle cut + rectangle arm"""

from PIL import Image, ImageDraw

# Create 400x400 image
img = Image.new('RGB', (400, 400), '#1a2a4a')
draw = ImageDraw.Draw(img)

# Background gradient
for r in range(200, 0, -1):
    intensity = int(26 + (200 - r) * 0.15)
    color = f'#{intensity:02x}{int(intensity*0.5):02x}{int(intensity*1.3):02x}'
    draw.ellipse([200-r, 200-r, 200+r, 200+r], fill=color)

# Allan's design:
# 1. Ellipse (main claw body)
# 2. Triangle cut on top (the pincer opening)
# 3. Rectangle at bottom (the arm)

# Main ellipse - the claw body
# Center at (200, 180), size 160x200
draw.ellipse([120, 80, 280, 280], fill='#dd3030', outline='#ff5050', width=4)

# Triangle cut on top (the opening between pincers)
# This creates the two "fingers" of the claw
triangle_cut = [
    (200, 80),    # Top center point (deepest cut)
    (160, 130),   # Left side of cut
    (240, 130),   # Right side of cut
]
draw.polygon(triangle_cut, fill='#1a2a4a')  # Fill with background color to "cut"

# Redraw the outline around the cut for clean edges
draw.line([(160, 130), (200, 80)], fill='#ff5050', width=3)
draw.line([(200, 80), (240, 130)], fill='#ff5050', width=3)

# Rectangle arm at bottom
draw.rectangle([170, 280, 230, 360], fill='#bb1818', outline='#ff4040', width=3)

# Add some depth/highlights
# Left pincer highlight
draw.arc([125, 85, 190, 180], 180, 270, fill='#ff8080', width=4)
# Right pincer highlight  
draw.arc([210, 85, 275, 180], 270, 360, fill='#ff8080', width=4)

# Small shine dots
draw.ellipse([145, 120, 155, 130], fill='#ffaaaa')
draw.ellipse([245, 120, 255, 130], fill='#ffaaaa')

# Arm segment line
draw.line([(175, 310), (225, 310)], fill='#aa1010', width=3)

# Save
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar-v3.png', 'PNG')
print('Avatar v3 saved - ellipse with triangle cut!')