#!/usr/bin/env python3
"""
Create a simple cat image using PIL/Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_cat_image():
    # Create a new image with white background
    width, height = 400, 400
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)
    
    # Draw a simple cat face
    # Face (circle)
    face_center = (width // 2, height // 2)
    face_radius = 100
    draw.ellipse([face_center[0] - face_radius, face_center[1] - face_radius,
                  face_center[0] + face_radius, face_center[1] + face_radius],
                 fill='gray', outline='black', width=2)
    
    # Ears
    ear_height = 40
    # Left ear
    draw.polygon([(face_center[0] - 70, face_center[1] - 90),
                  (face_center[0] - 40, face_center[1] - 140),
                  (face_center[0] - 10, face_center[1] - 90)],
                 fill='gray', outline='black', width=2)
    # Right ear
    draw.polygon([(face_center[0] + 10, face_center[1] - 90),
                  (face_center[0] + 40, face_center[1] - 140),
                  (face_center[0] + 70, face_center[1] - 90)],
                 fill='gray', outline='black', width=2)
    
    # Eyes
    eye_radius = 15
    # Left eye
    draw.ellipse([face_center[0] - 40 - eye_radius, face_center[1] - 20 - eye_radius,
                  face_center[0] - 40 + eye_radius, face_center[1] - 20 + eye_radius],
                 fill='green', outline='black', width=2)
    # Right eye
    draw.ellipse([face_center[0] + 40 - eye_radius, face_center[1] - 20 - eye_radius,
                  face_center[0] + 40 + eye_radius, face_center[1] - 20 + eye_radius],
                 fill='green', outline='black', width=2)
    
    # Pupils
    pupil_radius = 5
    draw.ellipse([face_center[0] - 40 - pupil_radius, face_center[1] - 20 - pupil_radius,
                  face_center[0] - 40 + pupil_radius, face_center[1] - 20 + pupil_radius],
                 fill='black')
    draw.ellipse([face_center[0] + 40 - pupil_radius, face_center[1] - 20 - pupil_radius,
                  face_center[0] + 40 + pupil_radius, face_center[1] - 20 + pupil_radius],
                 fill='black')
    
    # Nose (triangle)
    draw.polygon([(face_center[0] - 10, face_center[1] + 10),
                  (face_center[0] + 10, face_center[1] + 10),
                  (face_center[0], face_center[1] + 25)],
                 fill='pink', outline='black', width=2)
    
    # Mouth
    draw.arc([face_center[0] - 30, face_center[1] + 10,
              face_center[0] + 30, face_center[1] + 50],
             start=0, end=180, fill='black', width=2)
    
    # Whiskers
    whisker_length = 40
    # Left whiskers
    draw.line([(face_center[0] - 50, face_center[1] + 5),
               (face_center[0] - 50 - whisker_length, face_center[1] + 5)],
              fill='black', width=2)
    draw.line([(face_center[0] - 50, face_center[1] + 15),
               (face_center[0] - 50 - whisker_length, face_center[1] + 15)],
              fill='black', width=2)
    draw.line([(face_center[0] - 50, face_center[1] - 5),
               (face_center[0] - 50 - whisker_length, face_center[1] - 5)],
              fill='black', width=2)
    
    # Right whiskers
    draw.line([(face_center[0] + 50, face_center[1] + 5),
               (face_center[0] + 50 + whisker_length, face_center[1] + 5)],
              fill='black', width=2)
    draw.line([(face_center[0] + 50, face_center[1] + 15),
               (face_center[0] + 50 + whisker_length, face_center[1] + 15)],
              fill='black', width=2)
    draw.line([(face_center[0] + 50, face_center[1] - 5),
               (face_center[0] + 50 + whisker_length, face_center[1] - 5)],
              fill='black', width=2)
    
    # Add text
    try:
        # Try to use a system font
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    draw.text((width // 2 - 40, height - 40), "Meow! 🐱", fill='black', font=font)
    
    # Save the image
    output_path = "/home/node/.openclaw/workspace/cat_image.png"
    image.save(output_path, "PNG")
    
    print(f"✅ Cat image created: {output_path}")
    print(f"   Size: {width}x{height} pixels")
    
    return output_path

if __name__ == "__main__":
    try:
        image_path = create_cat_image()
        print(f"🎨 Image saved to: {image_path}")
    except Exception as e:
        print(f"❌ Error creating image: {e}")
        print("Trying alternative approach...")
        
        # Create a simpler image if PIL fails
        try:
            from PIL import Image, ImageDraw
            img = Image.new('RGB', (200, 200), color='lightblue')
            d = ImageDraw.Draw(img)
            d.text((50, 80), "🐱 Cat", fill='black')
            simple_path = "/home/node/.openclaw/workspace/simple_cat.png"
            img.save(simple_path)
            print(f"✅ Simple cat image created: {simple_path}")
        except:
            print("❌ Could not create image. PIL/Pillow might not be installed.")