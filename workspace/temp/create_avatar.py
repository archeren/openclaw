#!/usr/bin/env python3
"""Generate Arche's avatar - a stylized lobster claw"""

from PIL import Image, ImageDraw

# Create 400x400 image with dark blue background
img = Image.new('RGB', (400, 400), '#0d1f33')
draw = ImageDraw.Draw(img)

# Draw radial gradient background (simplified)
for r in range(200, 0, -1):
    intensity = int(26 + (200 - r) * 0.2)
    color = f'#{intensity:02x}{int(intensity*0.6):02x}{int(intensity*1.5):02x}'
    draw.ellipse([200-r, 200-r, 200+r, 200+r], fill=color)

# Draw stylized claw shape
# Upper claw
upper_claw = [
    (140, 220), (120, 120), (160, 80), (220, 70),
    (280, 100), (300, 150), (280, 200), (140, 220)
]
draw.polygon(upper_claw, fill='#d63031', outline='#ff6b35')

# Lower claw  
lower_claw = [
    (140, 220), (130, 300), (180, 340), (250, 330),
    (290, 280), (280, 200), (140, 220)
]
draw.polygon(lower_claw, fill='#c02020', outline='#ff6b35')

# Claw arm/joint
draw.ellipse([90, 180, 150, 260], fill='#a01010', outline='#ff6b35')

# Highlight on upper claw
draw.line([(170, 130), (230, 110)], fill='#ff8c5a', width=8)

# Shine dots
draw.ellipse([215, 145, 227, 157], fill='white')
draw.ellipse([185, 125, 193, 133], fill='white')

# Add glow effect (simplified - lighter circle behind)
for i in range(5):
    alpha = 30 - i * 5
    glow_color = f'#{alpha:02x}0000'
    r = 150 + i * 10
    draw.ellipse([200-r, 200-r, 200+r, 200+r], outline=glow_color, width=2)

# Save
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar.png', 'PNG')
print('Avatar saved to /home/ubuntu/.openclaw/workspace/temp/arche-avatar.png')
