#!/usr/bin/env python3
"""
Quick test of Google Vision API with Maya's key
"""

import requests
import json

# Maya's API key
API_KEY = "AIzaSyBVzV_4pOUxqWq_DthDfW_dZq9jXCc0WjI"
ENDPOINT = "https://vision.googleapis.com/v1/images:annotate"

def test_api_key():
    """Test if the API key is valid"""
    print("🔑 Testing Google Vision API key...")
    print(f"Key: {API_KEY[:15]}...")
    
    # Simple test request with Wikipedia logo
    test_request = {
        "requests": [{
            "image": {
                "source": {
                    "imageUri": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png"
                }
            },
            "features": [
                {"type": "LABEL_DETECTION", "maxResults": 5},
                {"type": "LOGO_DETECTION", "maxResults": 5}
            ]
        }]
    }
    
    try:
        response = requests.post(
            ENDPOINT,
            params={"key": API_KEY},
            json=test_request,
            timeout=10
        )
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API key is VALID and working!")
            
            # Show what was detected
            if 'responses' in result and result['responses']:
                resp = result['responses'][0]
                
                if 'labelAnnotations' in resp:
                    print("\n🏷️  Labels detected:")
                    for label in resp['labelAnnotations'][:3]:
                        print(f"  • {label['description']} ({label['score']:.0%})")
                
                if 'logoAnnotations' in resp:
                    print("\n🏢 Logos detected:")
                    for logo in resp['logoAnnotations']:
                        print(f"  • {logo['description']} ({logo['score']:.0%})")
            
            return True
            
        elif response.status_code == 403:
            print("❌ API key is INVALID or disabled")
            print("   Check: https://console.cloud.google.com/apis/credentials")
            return False
            
        else:
            print(f"❌ Unexpected error: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def check_quota():
    """Check API quota status"""
    print("\n📊 Checking API quota...")
    
    # Try to make a simple request to check quota
    test_request = {
        "requests": [{
            "image": {
                "source": {
                    "imageUri": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
                }
            },
            "features": [{"type": "LABEL_DETECTION", "maxResults": 1}]
        }]
    }
    
    try:
        response = requests.post(
            ENDPOINT,
            params={"key": API_KEY},
            json=test_request,
            timeout=5
        )
        
        if response.status_code == 200:
            print("✅ Quota available - API is ready to use!")
            return True
        elif response.status_code == 429:
            print("⚠️  Quota exceeded - check Google Cloud Console")
            return False
        else:
            print(f"📡 Status {response.status_code} - API responding")
            return True
            
    except Exception as e:
        print(f"⚠️  Could not check quota: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("GOOGLE VISION API TEST")
    print("=" * 60)
    
    # Test the API key
    if test_api_key():
        # Check quota
        check_quota()
        
        print("\n" + "=" * 60)
        print("🎉 SUCCESS! Your Vision API is ready.")
        print("\nNext steps:")
        print("1. Run: python3 vision_api_system.py")
        print("2. Try: python3 -c \"from vision_api_system import quick_analyze; quick_analyze('your_image.jpg')\"")
        print("3. Check: https://console.cloud.google.com/apis/dashboard")
    else:
        print("\n" + "=" * 60)
        print("❌ API key needs attention.")
        print("\nTo fix:")
        print("1. Enable Vision API: https://console.cloud.google.com/apis/library/vision.googleapis.com")
        print("2. Check billing is enabled")
        print("3. Verify API key has proper permissions")
    
    print("=" * 60)