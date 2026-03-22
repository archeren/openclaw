#!/usr/bin/env python3
"""Generate Clawish logo - v3: Circular badge style"""

from PIL import Image, ImageDraw

# Create 512x512 image
size = 512
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Colors
claw_red = '#dd3030'
claw_dark = '#aa2020'
bg_blue = '#1a2a4a'
star_white = '#ffffff'

# Center
cx, cy = size // 2, size // 2

# 1. Background circle
draw.ellipse([cx-200, cy-200, cx+200, cy+200], fill=bg_blue)

# 2. Inner glow
for r in range(180, 150, -5):
    alpha = int(255 * (180 - r) / 30)
    color = f'#{0x1a:02x}{0x2a:02x}{0x4a + int(alpha*0.3):02x}'
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=color, width=2)

# 3. Claw - centered and scaled
# Main claw body
rx, ry = 80, 110
claw_cy = cy + 10
draw.pieslice([cx-rx, claw_cy-ry, cx+rx, claw_cy+ry], start=300, end=240, 
              fill=claw_red, outline=claw_dark, width=4)

# Rectangle arm
draw.rectangle([cx-30, claw_cy+50, cx+30, claw_cy+140], fill=claw_red, outline=claw_dark, width=3)

# 4. Star
star_center = (cx + 55, claw_cy - 55)
star_size = 18

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

draw.ellipse([star_center[0]-3, star_center[1]-3, star_center[0]+3, star_center[1]+3], 
             fill=star_white)

# Save
img.save('/home/ubuntu/.openclaw/workspace/projects/clawish/branding/logo-v3-badge.png', 'PNG')
print('Clawish logo v3 (badge) saved!')
