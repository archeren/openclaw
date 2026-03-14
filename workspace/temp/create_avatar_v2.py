#!/usr/bin/env python3
"""Generate Arche's avatar - a more recognizable lobster claw"""

from PIL import Image, ImageDraw

# Create 400x400 image
img = Image.new('RGB', (400, 400), '#1a2a4a')
draw = ImageDraw.Draw(img)

# Background gradient
for r in range(200, 0, -1):
    intensity = int(26 + (200 - r) * 0.15)
    color = f'#{intensity:02x}{int(intensity*0.5):02x}{int(intensity*1.3):02x}'
    draw.ellipse([200-r, 200-r, 200+r, 200+r], fill=color)

# Draw a clearer lobster claw shape
# Main upper claw arm
draw.ellipse([60, 150, 180, 280], fill='#cc2020', outline='#ff4040', width=3)

# Upper pincer - more curved and recognizable
upper_pincer = [
    (150, 170),   # start at arm
    (130, 100),   # go up
    (150, 60),    # curve up
    (200, 50),    # top of claw
    (250, 70),    # curve down
    (260, 120),   # down
    (220, 170),   # meet lower pincer
]
draw.polygon(upper_pincer, fill='#dd3030', outline='#ff5050')

# Lower pincer
lower_pincer = [
    (150, 230),   # start at arm
    (140, 280),   # go down
    (180, 320),   # curve
    (240, 310),   # bottom of claw
    (270, 260),   # curve up
    (260, 200),   # up
    (220, 170),   # meet upper pincer
]
draw.polygon(lower_pincer, fill='#bb1818', outline='#ff4040')

# Inner claw detail - the "thumb" part
draw.ellipse([170, 160, 230, 200], fill='#aa1010', outline='#cc3030', width=2)

# Teeth/serrations on the claw
for i in range(4):
    x = 200 + i * 12
    draw.line([(x, 175), (x+5, 180)], fill='#ff6060', width=2)
    
# Highlight on upper pincer
draw.arc([140, 60, 240, 140], 200, 320, fill='#ff8080', width=6)

# Small shine
draw.ellipse([180, 90, 195, 105], fill='#ffaaaa')
draw.ellipse([210, 80, 218, 88], fill='#ffcccc')

# Arm segment lines
draw.line([(80, 200), (140, 200)], fill='#aa1010', width=4)
draw.line([(90, 220), (140, 220)], fill='#aa1010', width=3)

# Save
img.save('/home/ubuntu/.openclaw/workspace/temp/arche-avatar-v2.png', 'PNG')
print('Avatar v2 saved!')