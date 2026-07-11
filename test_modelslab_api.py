#!/usr/bin/env python3
"""
ModelsLab API Test Script
"""

import requests
import json
import os

def test_modelslab_api():
    """Test connection to ModelsLab API"""
    print("🔌 Testing ModelsLab API connection...")
    
    # Load API key from vault
    try:
        vault_file = "/home/node/.openclaw/workspace/.vault/modelslab_credentials.json"
        with open(vault_file, 'r') as f:
            credentials = json.load(f)
        
        api_key = credentials['modelslab']['api_key']
        print(f"✅ API key loaded from secure vault")
        print(f"   Key: {api_key[:8]}...{api_key[-8:]}")
        
    except Exception as e:
        print(f"❌ Could not load API key: {e}")
        print("   Please ensure the vault file exists and is accessible")
        return False
    
    # Test API endpoint
    url = "https://api.modelslab.com/v1/images/generations"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Simple test payload
    payload = {
        "model": "stable-diffusion-v1.5",
        "prompt": "test image, simple circle",
        "width": 512,
        "height": 512,
        "num_images": 1
    }
    
    print(f"\n📡 Testing API endpoint: {url}")
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ ModelsLab API connection successful!")
            data = response.json()
            print(f"   Response keys: {list(data.keys())}")
            return True
        elif response.status_code == 401:
            print("❌ API key invalid or expired")
            print(f"   Response: {response.text[:200]}")
            return False
        else:
            print(f"❌ API error: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def main():
    print("🛠️ ModelsLab API Test")
    print("=" * 50)
    
    if test_modelslab_api():
        print("\n🎉 ModelsLab API is ready to use!")
        print("\n📋 Next steps:")
        print("1. Create image generation scripts")
        print("2. Generate product thumbnails")
        print("3. Set up automated image pipeline")
        print("4. Integrate with Gumroad product system")
    else:
        print("\n❌ ModelsLab API test failed")
        print("\n🔧 Troubleshooting:")
        print("1. Check API key is valid")
        print("2. Verify internet connection")
        print("3. Check ModelsLab service status")
        print("4. Ensure API key has proper permissions")

if __name__ == "__main__":
    main()
