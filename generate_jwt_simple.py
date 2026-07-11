#!/usr/bin/env python3
"""
Generate JWT for Ghost Admin API without external dependencies
"""

import base64
import json
import time
import hmac
import hashlib
from datetime import datetime

def base64url_encode(data):
    """Base64URL encode without padding"""
    return base64.urlsafe_b64encode(data).rstrip(b'=')

def generate_jwt():
    # Split the Admin API Key
    admin_key = "69cd083bed78410001d5501f:f2bb8d1da2236ed97c666ce2c430f9e0b4c9c2d0780084efe5bf1af43fd70117"
    key_id, key_secret = admin_key.split(":", 1)

    print("🔑 Splitting Admin API Key:")
    print(f"   ID: {key_id}")
    print(f"   Secret: {key_secret[:20]}...{key_secret[-20:]}")
    print(f"   Secret length: {len(key_secret)} chars")

    # Generate JWT payload
    now = int(time.time())
    expiry = now + 300  # 5 minutes from now

    payload = {
        "iat": now,
        "exp": expiry,
        "aud": "/admin/"
    }

    print(f"\n📝 JWT Payload:")
    print(f"   iat (issued at): {now} ({datetime.fromtimestamp(now).strftime('%Y-%m-%d %H:%M:%S')})")
    print(f"   exp (expires): {expiry} ({datetime.fromtimestamp(expiry).strftime('%Y-%m-%d %H:%M:%S')})")
    print(f"   aud (audience): /admin/")

    try:
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
            key_secret.encode('utf-8'),
            message,
            hashlib.sha256
        ).digest()
        signature_encoded = base64url_encode(signature)
        
        # Combine to create JWT
        jwt_token = (header_encoded + b'.' + payload_encoded + b'.' + signature_encoded).decode('utf-8')
        
        print(f"\n✅ JWT Generated Successfully!")
        print(f"   Token length: {len(jwt_token)} chars")
        print(f"   Full token: {jwt_token}")
        
        # Save token to file
        with open('/home/node/.openclaw/workspace/ghost_jwt_token.txt', 'w') as f:
            f.write(jwt_token)
        
        print(f"\n📁 Token saved to: ghost_jwt_token.txt")
        
        # Simple verification
        print(f"\n🔍 Token structure verified:")
        parts = jwt_token.split('.')
        print(f"   Header: {parts[0][:30]}...")
        print(f"   Payload: {parts[1][:30]}...")
        print(f"   Signature: {parts[2][:30]}...")
        
        return jwt_token
        
    except Exception as e:
        print(f"\n❌ JWT Generation Failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    generate_jwt()