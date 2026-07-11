#!/usr/bin/env python3
"""
Generate Gumroad thumbnail for AI Assistant Kit using ModelsLab API
"""

import json
import os
import time
from datetime import datetime

def load_api_key():
    """Load API key from secure vault"""
    vault_file = "/home/node/.openclaw/workspace/.vault/modelslab_credentials.json"
    
    try:
        with open(vault_file, 'r') as f:
            credentials = json.load(f)
        
        api_key = credentials['modelslab']['api_key']
        print(f"✅ API key loaded from secure vault")
        print(f"   Key: {api_key[:8]}...{api_key[-8:]}")
        return api_key
        
    except Exception as e:
        print(f"❌ Could not load API key: {e}")
        return None

def generate_thumbnail(api_key, prompt, output_dir="generated_images"):
    """Generate thumbnail using ModelsLab API"""
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # API endpoint from documentation
    url = "https://modelslab.com/api/v6/realtime/text2img"
    
    # Request payload for Gumroad thumbnail
    payload = {
        "key": api_key,
        "prompt": prompt,
        "negative_prompt": "blurry, low quality, watermark, text, ugly, deformed",
        "width": 1024,  # Max for realtime API
        "height": 1024,
        "samples": 1,
        "safety_checker": False,
        "seed": None,
        "base64": False,
        "webhook": None,
        "track_id": None
    }
    
    print(f"🎨 Generating thumbnail with prompt: {prompt[:80]}...")
    print(f"📡 Sending request to: {url}")
    
    # Use curl since requests module not installed
    import subprocess
    
    # Create temp file for payload
    temp_file = "/tmp/modelslab_payload.json"
    with open(temp_file, 'w') as f:
        json.dump(payload, f)
    
    # Make API call
    try:
        result = subprocess.run([
            'curl', '-s', '-X', 'POST', url,
            '-H', 'Content-Type: application/json',
            '--data', f'@{temp_file}'
        ], capture_output=True, text=True, timeout=60)
        
        # Clean up temp file
        os.remove(temp_file)
        
        print(f"Status Code: Returned via curl")
        
        if result.returncode != 0:
            print(f"❌ Curl error: {result.stderr}")
            return None
        
        response = json.loads(result.stdout)
        
        if response.get('status') == 'success':
            print("✅ Image generated successfully!")
            
            # Get image URL
            image_url = response.get('output', [])[0]
            
            # Download image
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"gumroad_thumbnail_{timestamp}.png"
            filepath = os.path.join(output_dir, filename)
            
            # Download with curl
            subprocess.run(['curl', '-s', '-o', filepath, image_url])
            
            print(f"💾 Image saved to: {filepath}")
            print(f"🔗 Image URL: {image_url}")
            
            return filepath
            
        elif response.get('status') == 'processing':
            print("⏳ Image is processing...")
            print(f"   ETA: {response.get('eta', 'unknown')} seconds")
            print(f"   Fetch URL: {response.get('fetch_result')}")
            return None
            
        else:
            print(f"❌ API error: {response.get('message', 'Unknown error')}")
            return None
            
    except Exception as e:
        print(f"❌ Error generating image: {e}")
        return None

def create_thumbnail_variants():
    """Generate multiple thumbnail variants for Gumroad product"""
    
    api_key = load_api_key()
    if not api_key:
        return
    
    print("\n" + "=" * 60)
    print("🛒 GENERATING GUMROAD PRODUCT THUMBNAILS")
    print("=" * 60)
    
    # Different prompts for thumbnail variations
    prompts = [
        # Professional tech product thumbnail
        "Professional AI assistant setup kit thumbnail, digital product, clean modern design, blue and white color scheme, tech aesthetic, minimalist, high quality, product display, 3D render, studio lighting",
        
        # Friendly assistant concept
        "Friendly robot assistant helping with computer tasks, cartoon style, bright colors, digital product kit, clean background, engaging, professional thumbnail, vector art style",
        
        # Modern dashboard concept
        "AI assistant dashboard interface, futuristic tech, glowing elements, data visualization, clean design, digital product thumbnail, professional, dark theme with blue accents",
        
        # Simple clean design
        "AI Assistant Kit text on clean background, minimalist design, professional digital product thumbnail, soft shadows, modern typography, tech product, simple and elegant"
    ]
    
    generated_images = []
    
    for i, prompt in enumerate(prompts, 1):
        print(f"\n📸 Generating variant {i}/4...")
        print(f"   Prompt: {prompt[:100]}...")
        
        image_path = generate_thumbnail(api_key, prompt)
        
        if image_path:
            generated_images.append(image_path)
            print(f"   ✅ Success: {os.path.basename(image_path)}")
        else:
            print(f"   ❌ Failed to generate variant {i}")
        
        # Small delay between requests
        if i < len(prompts):
            print("   ⏳ Waiting 2 seconds before next request...")
            time.sleep(2)
    
    print("\n" + "=" * 60)
    print("📊 GENERATION SUMMARY")
    print("=" * 60)
    
    if generated_images:
        print(f"✅ Successfully generated {len(generated_images)} thumbnails:")
        for img in generated_images:
            print(f"   • {os.path.basename(img)}")
        
        print("\n🎯 Recommended use:")
        print("   1. Use first image as main Gumroad thumbnail")
        print("   2. Use others for social media, ads, or A/B testing")
        print("   3. All images saved in: generated_images/")
        
        print("\n💡 Next steps:")
        print("   1. Review images and select best one")
        print("   2. Upload to Gumroad product page")
        print("   3. Use for social media marketing")
        print("   4. Test different thumbnails for conversion")
    else:
        print("❌ No images were generated successfully")
        print("\n🔧 Troubleshooting:")
        print("   1. Check API key is valid and has credits")
        print("   2. Verify internet connection")
        print("   3. Try simpler prompts")
        print("   4. Check ModelsLab service status")

def main():
    print("🎨 Gumroad Thumbnail Generator")
    print("=" * 60)
    print("Product: AI Assistant Setup Kit - Lola Edition")
    print("Purpose: Generate professional product thumbnails")
    print("API: ModelsLab Realtime Stable Diffusion")
    print("=" * 60)
    
    create_thumbnail_variants()
    
    print("\n" + "=" * 60)
    print("🚀 Thumbnail generation complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()