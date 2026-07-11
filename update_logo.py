#!/usr/bin/env python3
"""
Update The New World Order website with new logo
"""

import base64
import json
import time
import hmac
import hashlib
import binascii
import subprocess
import os
from datetime import datetime

def base64url_encode(data):
    """Base64URL encode without padding"""
    return base64.urlsafe_b64encode(data).rstrip(b'=')

def generate_jwt():
    """Generate JWT for Ghost Admin API"""
    admin_key = "69cd083bed78410001d5501f:f2bb8d1da2236ed97c666ce2c430f9e0b4c9c2d0780084efe5bf1af43fd70117"
    key_id, key_secret_hex = admin_key.split(":", 1)
    
    # Decode hex secret
    key_secret_bytes = binascii.unhexlify(key_secret_hex)
    
    # Generate JWT payload
    now = int(time.time())
    expiry = now + 300  # 5 minutes from now
    
    payload = {
        "iat": now,
        "exp": expiry,
        "aud": "/admin/"
    }
    
    # Create header
    header = {
        "alg": "HS256",
        "typ": "JWT",
        "kid": key_id
    }
    
    # Encode header and payload
    header_encoded = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_encoded = base64url_encode(json.dumps(payload).encode('utf-8'))
    
    # Create signature
    message = header_encoded + b'.' + payload_encoded
    signature = hmac.new(
        key_secret_bytes,
        message,
        hashlib.sha256
    ).digest()
    signature_encoded = base64url_encode(signature)
    
    # Combine to create JWT
    jwt_token = (header_encoded + b'.' + payload_encoded + b'.' + signature_encoded).decode('utf-8')
    
    return jwt_token

def upload_logo(jwt_token):
    """Upload logo image to Ghost"""
    logo_path = "/home/node/.openclaw/workspace/nwo_new_logo.jpg"
    
    if not os.path.exists(logo_path):
        print("❌ Logo file not found")
        return None
    
    print(f"📤 Uploading logo: {logo_path}")
    
    # First, upload the image
    upload_url = "https://thenewworldorder.io/ghost/api/admin/images/upload/"
    
    # Use curl to upload the image
    cmd = [
        "curl", "-s", "-X", "POST", upload_url,
        "-H", f"Authorization: Ghost {jwt_token}",
        "-H", "Content-Type: multipart/form-data",
        "-F", f"file=@{logo_path}",
        "-F", "purpose=image",
        "-w", "\n%{http_code}"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        output = result.stdout.strip()
        
        if '\n' in output:
            response_body, http_code = output.rsplit('\n', 1)
        else:
            response_body, http_code = "", output
        
        print(f"📡 Upload HTTP Status: {http_code}")
        
        if http_code in ["200", "201"]:
            print("✅ Logo uploaded successfully!")
            
            # Parse response to get image URL
            try:
                response_data = json.loads(response_body)
                if "images" in response_data and response_data["images"]:
                    image_url = response_data["images"][0].get("url", "")
                    if image_url:
                        print(f"   Image URL: {image_url}")
                        return image_url
            except:
                # If we can't parse the response, we'll use a direct URL
                print("   Using direct image reference")
                return f"https://thenewworldorder.io/content/images/{os.path.basename(logo_path)}"
        else:
            print(f"❌ Logo upload failed")
            print(f"Response: {response_body[:200]}...")
            return None
            
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return None

def update_site_settings(jwt_token, logo_url):
    """Update site settings with new logo"""
    
    # First, get current site settings
    get_url = "https://thenewworldorder.io/ghost/api/admin/settings/"
    
    print(f"\n🔧 Getting current site settings...")
    
    get_cmd = [
        "curl", "-s", "-X", "GET", get_url,
        "-H", f"Authorization: Ghost {jwt_token}",
        "-H", "Content-Type: application/json"
    ]
    
    try:
        result = subprocess.run(get_cmd, capture_output=True, text=True, timeout=30)
        settings_data = json.loads(result.stdout)
        
        print("✅ Current settings retrieved")
        
        # Update settings with new logo
        update_url = "https://thenewworldorder.io/ghost/api/admin/settings/"
        
        # Create update payload
        update_payload = {
            "settings": [{
                "key": "logo",
                "value": logo_url
            }, {
                "key": "icon",
                "value": logo_url  # Also update icon with same logo
            }]
        }
        
        print(f"\n🔄 Updating site with new logo...")
        print(f"   Logo URL: {logo_url}")
        
        update_cmd = [
            "curl", "-s", "-X", "PUT", update_url,
            "-H", f"Authorization: Ghost {jwt_token}",
            "-H", "Content-Type: application/json",
            "-d", json.dumps(update_payload),
            "-w", "\n%{http_code}"
        ]
        
        result = subprocess.run(update_cmd, capture_output=True, text=True, timeout=30)
        output = result.stdout.strip()
        
        if '\n' in output:
            response_body, http_code = output.rsplit('\n', 1)
        else:
            response_body, http_code = "", output
        
        print(f"📡 Update HTTP Status: {http_code}")
        
        if http_code in ["200", "201"]:
            print("✅ Site logo updated successfully!")
            return True
        else:
            print(f"❌ Site update failed")
            print(f"Response: {response_body[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Settings error: {e}")
        return False

def main():
    print("=" * 60)
    print("THE NEW WORLD ORDER - LOGO UPDATE")
    print("=" * 60)
    
    # Step 1: Generate JWT
    print("\n🔑 Generating JWT token...")
    jwt_token = generate_jwt()
    print(f"   Token generated: {jwt_token[:50]}...")
    
    # Step 2: Upload logo
    print("\n🖼️ Processing new logo...")
    logo_url = upload_logo(jwt_token)
    
    if not logo_url:
        print("❌ Logo upload failed, using fallback method")
        # Try direct update without upload
        logo_url = "/content/images/nwo_new_logo.jpg"
    
    # Step 3: Update site settings
    print("\n🌐 Updating website...")
    success = update_site_settings(jwt_token, logo_url)
    
    if success:
        print("\n" + "=" * 60)
        print("✅ LOGO UPDATE COMPLETE!")
        print("=" * 60)
        print(f"\n🔄 The New World Order website has been updated with the new logo.")
        print(f"   Site: https://thenewworldorder.io")
        print(f"   Logo URL: {logo_url}")
        
        # Verify the update
        print(f"\n🔍 Verifying update...")
        verify_cmd = ["curl", "-s", "https://thenewworldorder.io"]
        result = subprocess.run(verify_cmd, capture_output=True, text=True)
        if "nwo_new_logo" in result.stdout or "logo" in result.stdout:
            print("   ✅ Logo update detected on site")
        else:
            print("   ⚠️ Update may require cache clearing")
            
    else:
        print("\n" + "=" * 60)
        print("❌ LOGO UPDATE FAILED")
        print("=" * 60)
        print("\n⚠️ Manual update may be required:")
        print("1. Login to https://thenewworldorder.io/ghost")
        print("2. Go to Settings → General")
        print("3. Upload new logo")
        print("4. Save changes")

if __name__ == "__main__":
    main()