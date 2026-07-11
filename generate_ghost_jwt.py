#!/usr/bin/env python3
"""
Generate JWT for Ghost Admin API
"""

import jwt
import time
from datetime import datetime

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

    # Generate JWT
    try:
        # HS256 algorithm with the secret as key
        token = jwt.encode(payload, key_secret, algorithm="HS256", headers={"kid": key_id})
        
        print(f"\n✅ JWT Generated Successfully!")
        print(f"   Token length: {len(token)} chars")
        print(f"   Full token: {token}")
        
        # Save token to file
        with open('/home/node/.openclaw/workspace/ghost_jwt_token.txt', 'w') as f:
            f.write(token)
        
        print(f"\n📁 Token saved to: ghost_jwt_token.txt")
        
        # Verify the token can be decoded
        decoded = jwt.decode(token, key_secret, algorithms=["HS256"], audience="/admin/")
        print(f"\n🔍 Token verification:")
        print(f"   Valid: ✅")
        print(f"   Expires in: {expiry - now} seconds")
        
        return token
        
    except Exception as e:
        print(f"\n❌ JWT Generation Failed: {e}")
        return None

if __name__ == "__main__":
    generate_jwt()