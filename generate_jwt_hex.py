#!/usr/bin/env python3
"""
Generate JWT with hex-decoded secret
"""

import base64
import json
import time
import hmac
import hashlib
from datetime import datetime
import binascii

def base64url_encode(data):
    """Base64URL encode without padding"""
    return base64.urlsafe_b64encode(data).rstrip(b'=')

def generate_jwt_hex_secret():
    # Split the Admin API Key
    admin_key = "69cd083bed78410001d5501f:f2bb8d1da2236ed97c666ce2c430f9e0b4c9c2d0780084efe5bf1af43fd70117"
    key_id, key_secret_hex = admin_key.split(":", 1)

    print("🔑 Splitting Admin API Key:")
    print(f"   ID: {key_id}")
    print(f"   Secret (hex): {key_secret_hex}")
    print(f"   Hex length: {len(key_secret_hex)} chars")
    
    # Try decoding hex secret
    try:
        key_secret_bytes = binascii.unhexlify(key_secret_hex)
        print(f"   Secret bytes length: {len(key_secret_bytes)} bytes")
        print(f"   Secret (first 16 bytes): {binascii.hexlify(key_secret_bytes[:16])}")
    except:
        print("   ❌ Not valid hex, using as-is")
        key_secret_bytes = key_secret_hex.encode('utf-8')

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
        
        # Create signature with hex-decoded secret
        message = header_encoded + b'.' + payload_encoded
        signature = hmac.new(
            key_secret_bytes,
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
        with open('/home/node/.openclaw/workspace/ghost_jwt_token_hex.txt', 'w') as f:
            f.write(jwt_token)
        
        print(f"\n📁 Token saved to: ghost_jwt_token_hex.txt")
        
        return jwt_token
        
    except Exception as e:
        print(f"\n❌ JWT Generation Failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    generate_jwt_hex_secret()