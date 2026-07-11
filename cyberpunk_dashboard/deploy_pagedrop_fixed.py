#!/usr/bin/env python3
"""
Deploy to PageDrop.io - FIXED VERSION
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
    
    # Try different TTL values
    for ttl in ["3d", "1d", "once"]:
        print(f"\n🔄 Trying TTL: {ttl}")
        
        # Create JSON payload
        payload = {
            "html": html_content,
            "ttl": ttl
        }
        
        # Try to deploy via curl
        try:
            curl_cmd = [
                'curl', '-s', '-X', 'POST',
                'https://pagedrop.io/api/upload',
                '-H', 'Content-Type: application/json',
                '-d', json.dumps(payload)
            ]
            
            result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print(f"✅ API call successful for TTL={ttl}")
                
                # Try to parse response
                try:
                    response_data = json.loads(result.stdout)
                    if response_data.get('success') and 'url' in response_data:
                        url = response_data['url']
                        print(f"🎉 DEPLOYED! URL: {url}")
                        print(f"📅 Will expire after: {ttl}")
                        return url
                    else:
                        print(f"⚠️ Response: {result.stdout[:200]}")
                except json.JSONDecodeError:
                    print(f"⚠️ Could not parse JSON: {result.stdout[:200]}")
            else:
                print(f"❌ curl failed: {result.stderr[:200]}")
                
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
        print("🎯🎯🎯 SUCCESS! One-Click Dashboard Ready! 🎯🎯🎯")
        print("=" * 60)
        print(f"🔗 URL: {url}")
        print("")
        print("📋 BOOKMARK THIS URL NOW!")
        print("🦊 Click it every morning for your briefing!")
        print("")
        print("🎨 Features included:")
        print("   • 🎯 Orange/black cyberpunk theme")
        print("   • 📰 Live news ticker")
        print("   • 🚨 Breaking news alerts")
        print("   • ⚽ Sports news")
        print("   • 🔮 Daily horoscopes")
        print("   • ⏰ Live updating clock")
        print("   • 🔄 Interactive buttons")
        print("")
        print("💡 No setup needed - just click and view!")
        print("")
        return True
    else:
        print("\n" + "=" * 60)
        print("❌ PageDrop deployment failed")
        print("=" * 60)
        print("")
        print("📋 QUICK MANUAL DEPLOYMENT:")
        print("1. Download the HTML file")
        print("2. Go to: https://app.netlify.com/drop")
        print("3. Drag & drop the file")
        print("4. Get URL instantly!")
        print("5. Bookmark it!")
        print("")
        print("📁 File location:")
        print(f"   {Path(__file__).parent / 'arcadian_media_standalone.html'}")
        print("")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)