import os
from PIL import Image, ImageDraw, ImageFont

output_dir = r"C:\Users\jeeva\.gemini\antigravity\scratch\recruitment-portal\frontend\public\avatars\presets"
os.makedirs(output_dir, exist_ok=True)

# 10 Professional Color Palettes and Avatar Initials / Shapes
presets = [
    {"filename": "preset-01.png", "bg": (37, 99, 235), "label": "P1", "role": "Software Developer"},
    {"filename": "preset-02.png", "bg": (5, 150, 105), "label": "P2", "role": "Product Manager"},
    {"filename": "preset-03.png", "bg": (124, 58, 237), "label": "P3", "role": "Data Scientist"},
    {"filename": "preset-04.png", "bg": (217, 119, 6), "label": "P4", "role": "UX Designer"},
    {"filename": "preset-05.png", "bg": (79, 70, 229), "label": "P5", "role": "Architect"},
    {"filename": "preset-06.png", "bg": (13, 148, 136), "label": "P6", "role": "QA Specialist"},
    {"filename": "preset-07.png", "bg": (71, 85, 105), "label": "P7", "role": "Security Engineer"},
    {"filename": "preset-08.png", "bg": (225, 29, 72), "label": "P8", "role": "Talent Specialist"},
    {"filename": "preset-09.png", "bg": (2, 132, 199), "label": "P9", "role": "DevOps Engineer"},
    {"filename": "preset-10.png", "bg": (147, 51, 234), "label": "P10", "role": "Fullstack Engineer"}
]

size = (160, 160)

for p in presets:
    # Create image with solid background
    img = Image.new("RGBA", size, p["bg"] + (255,))
    draw = ImageDraw.Draw(img)
    
    # Draw subtle inner border ring
    draw.ellipse([4, 4, 156, 156], outline=(255, 255, 255, 180), width=3)
    
    # Draw head (circle)
    draw.ellipse([56, 32, 104, 80], fill=(255, 255, 255, 240))
    
    # Draw shoulders (arc / rounded polygon)
    draw.chord([30, 90, 130, 160], start=180, end=360, fill=(255, 255, 255, 240))
    
    filepath = os.path.join(output_dir, p["filename"])
    img.save(filepath, "PNG")
    print(f"Saved {filepath}")

print("All 10 preset avatars generated successfully.")
