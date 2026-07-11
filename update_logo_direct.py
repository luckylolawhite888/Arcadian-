#!/usr/bin/env python3
"""
Try direct logo update with different approaches
"""

import base64
import json
import time
import hmac
import hashlib
import binascii
import subprocess

def generate_jwt():
    """Generate JWT for Ghost Admin API"""
    admin_key = "69cd083bed78410001d5501f:f2bb8d1da2236ed97c666ce2c430f9e0b4c9c2d0780084efe5bf1af43fd70117"
    key_id, key_secret_hex = admin_key.split(":", 1)
    key_secret_bytes = binascii.unhexlify(key_secret_hex)
    
    now = int(time.time())
    expiry = now + 300
    
    payload = {"iat": now, "exp": expiry, "aud": "/admin/"}
    header = {"alg": "HS256", "typ": "JWT", "kid": key_id}
    
    def b64e(data): return base64.urlsafe_b64encode(data).rstrip(b'=')
    
    header_enc = b64e(json.dumps(header).encode())
    payload_enc = b64e(json.dumps(payload).encode())
    message = header_enc + b'.' + payload_enc
    signature = hmac.new(key_secret_bytes, message, hashlib.sha256).digest()
    sig_enc = b64e(signature)
    
    return (header_enc + b'.' + payload_enc + b'.' + sig_enc).decode()

def try_different_approaches(jwt_token, logo_url):
    """Try different methods to update logo"""
    
    approaches = [
        {
            "name": "Direct PUT to settings",
            "url": "https://thenewworldorder.io/ghost/api/admin/settings/",
            "method": "PUT",
            "payload": {
                "settings": [{
                    "key": "logo",
                    "value": logo_url
                }]
            }
        },
        {
            "name": "PATCH to settings",
            "url": "https://thenewworldorder.io/ghost/api/admin/settings/",
            "method": "PATCH",
            "payload": {
                "settings": [{
                    "key": "logo", 
                    "value": logo_url
                }]
            }
        },
        {
            "name": "POST to settings (create)",
            "url": "https://thenewworldorder.io/ghost/api/admin/settings/",
            "method": "POST",
            "payload": {
                "settings": [{
                    "key": "logo",
                    "value": logo_url
                }]
            }
        },
        {
            "name": "Update site config",
            "url": "https://thenewworldorder.io/ghost/api/admin/site/",
            "method": "PUT",
            "payload": {
                "site": {
                    "logo": logo_url
                }
            }
        }
    ]
    
    print("🔄 Trying different update approaches...")
    print("=" * 50)
    
    for approach in approaches:
        print(f"\n🔧 Approach: {approach['name']}")
        print(f"   Method: {approach['method']}")
        print(f"   URL: {approach['url']}")
        
        cmd = [
            "curl", "-s", "-X", approach["method"], approach["url"],
            "-H", f"Authorization: Ghost {jwt_token}",
            "-H", "Content-Type: application/json",
            "-d", json.dumps(approach["payload"]),
            "-w", "\n%{http_code}"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            output = result.stdout.strip()
            
            if '\n' in output:
                body, code = output.rsplit('\n', 1)
            else:
                body, code = "", output
            
            print(f"   HTTP Status: {code}")
            
            if code in ["200", "201", "204"]:
                print(f"   ✅ SUCCESS!")
                return True, approach["name"]
            else:
                print(f"   ❌ Failed")
                if "permission" in body.lower():
                    print(f"   Permission error")
                elif body:
                    print(f"   Response: {body[:100]}...")
                    
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    return False, None

def main():
    print("=" * 60)
    print("THE NEW WORLD ORDER - DIRECT LOGO UPDATE")
    print("=" * 60)
    
    # Generate JWT
    print("\n🔑 Generating JWT token...")
    jwt_token = generate_jwt()
    
    # Logo URL from previous upload
    logo_url = "https://thenewworldorder.io/content/images/2026/04/nwo_new_logo.jpg"
    print(f"\n🖼️ Logo URL: {logo_url}")
    
    # Try different approaches
    success, method = try_different_approaches(jwt_token, logo_url)
    
    if success:
        print(f"\n" + "=" * 60)
        print(f"✅ LOGO UPDATE SUCCESSFUL!")
        print(f"   Method: {method}")
        print("=" * 60)
        
        # Verify
        print(f"\n🔍 Verifying update...")
        verify_cmd = ["curl", "-s", "https://thenewworldorder.io"]
        result = subprocess.run(verify_cmd, capture_output=True, text=True)
        if logo_url in result.stdout:
            print("   ✅ Logo URL found on site")
        else:
            print("   ⚠️ Logo may require cache clearing")
            
    else:
        print(f"\n" + "=" * 60)
        print("❌ ALL UPDATE ATTEMPTS FAILED")
        print("=" * 60)
        print("\n🎯 Final option: Update via theme customization")
        
        # Create theme customization code
        print("\n💡 Add to Ghost Admin → Design → Code injection → Site header:")
        print(f"""<script>
document.addEventListener('DOMContentLoaded', function() {{
    var logo = document.querySelector('.site-logo, .site-title, .gh-head-logo');
    if (logo) {{
        logo.innerHTML = '<img src=\"{logo_url}\" alt=\"The New World Order\" style=\"max-height: 40px;\">';
    }}
}});
</script>""")

if __name__ == "__main__":
    main()