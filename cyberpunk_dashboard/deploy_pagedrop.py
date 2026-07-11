#!/usr/bin/env python3
"""
Deploy to PageDrop.io via their public API
"""

import json
import subprocess
import sys
from pathlib import Path

def deploy_to_pagedrop():
    """Deploy HTML to PageDrop.io"""
    
    print("🚀 Deploying to PageDrop.io...")
    
    # Read the HTML file
    html_file = Path(__file__).parent / "arcadian_media_standalone.html"
    if not html_file.exists():
        print("❌ HTML file not found")
        return None
    
    with open(html_file, 'r') as f:
        html_content = f.read()
    
    print(f"📏 HTML size: {len(html_content)} bytes")
    
    # Create JSON payload
    payload = {
        "html": html_content,
        "ttl": "30d"  # 30 days
    }
    
    # Try to deploy via curl
    print("📤 Uploading to PageDrop API...")
    
    try:
        # Use curl to post to PageDrop API
        curl_cmd = [
            'curl', '-s', '-X', 'POST',
            'https://pagedrop.io/api/upload',
            '-H', 'Content-Type: application/json',
            '-d', json.dumps(payload)
        ]
        
        result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ API call successful!")
            print("Response:", result.stdout[:200] + "..." if len(result.stdout) > 200 else result.stdout)
            
            # Try to parse response
            try:
                response_data = json.loads(result.stdout)
                if 'url' in response_data:
                    url = response_data['url']
                    print(f"🎉 DEPLOYED! URL: {url}")
                    return url
                else:
                    print("⚠️ Response doesn't contain URL")
                    print("Full response:", json.dumps(response_data, indent=2)[:500])
            except json.JSONDecodeError:
                print("⚠️ Could not parse JSON response")
                print("Raw response:", result.stdout[:500])
        else:
            print("❌ curl failed")
            print("Error:", result.stderr)
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return None

def main():
    print("=" * 60)
    print("🦊 ARCADIAN MEDIA - PAGEDROP.IO DEPLOYMENT")
    print("=" * 60)
    
    url = deploy_to_pagedrop()
    
    if url:
        print("\n" + "=" * 60)
        print("🎯 SUCCESS! One-Click Dashboard Ready!")
        print("=" * 60)
        print(f"🔗 URL: {url}")
        print("")
        print("📋 Bookmark this URL and click it every morning!")
        print("🦊 No setup needed - just click and view your briefing!")
        print("")
        print("💡 The dashboard includes:")
        print("   • Orange/black cyberpunk theme")
        print("   • Live news ticker")
        print("   • Breaking news alerts")
        print("   • Sports & horoscopes")
        print("   • Interactive elements")
        print("")
        return True
    else:
        print("\n" + "=" * 60)
        print("❌ PageDrop deployment failed")
        print("=" * 60)
        print("")
        print("📋 ALTERNATIVE: Use Netlify Drop")
        print("1. Go to: https://app.netlify.com/drop")
        print("2. Drag & drop the HTML file:")
        print(f"   {Path(__file__).parent / 'arcadian_media_standalone.html'}")
        print("3. Get your URL instantly!")
        print("4. Bookmark it for one-click access")
        print("")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)