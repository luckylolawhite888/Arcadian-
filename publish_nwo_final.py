#!/usr/bin/env python3
"""
Publish NWO article to Ghost CMS with proper JWT authentication
"""

import base64
import json
import time
import hmac
import hashlib
import binascii
import subprocess
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

def read_article():
    """Read the NWO analysis article"""
    with open('/home/node/.openclaw/workspace/nwo_analysis.md', 'r') as f:
        content = f.read()
    
    # Extract title (first line after #)
    lines = content.split('\n')
    title = ""
    for line in lines:
        if line.startswith('# ') and not title:
            title = line[2:].strip()
            break
    
    # Extract content between second set of ---
    parts = content.split('---')
    if len(parts) >= 3:
        article_content = parts[2].strip()
    else:
        article_content = content
    
    # Convert markdown to HTML (simplified)
    html_content = article_content
    
    # Replace markdown with HTML
    html_content = html_content.replace('### ', '<h3>').replace('\n', '</h3>\n')
    html_content = html_content.replace('## ', '<h2>').replace('\n', '</h2>\n')
    html_content = html_content.replace('**', '<strong>').replace('**', '</strong>')
    html_content = html_content.replace('*', '<em>').replace('*', '</em>')
    
    # Convert paragraphs
    lines = html_content.split('\n')
    html_lines = []
    for line in lines:
        line = line.strip()
        if line and not line.startswith('<'):
            html_lines.append(f'<p>{line}</p>')
        elif line:
            html_lines.append(line)
    
    html_content = '\n'.join(html_lines)
    
    return title, html_content

def publish_article(jwt_token, title, content):
    """Publish article to Ghost CMS"""
    
    # Ghost API payload
    payload = {
        "posts": [{
            "title": title,
            "html": content,
            "status": "published",
            "tags": [
                {"name": "AI Regulation"},
                {"name": "CBDC"},
                {"name": "Digital Control"},
                {"name": "New World Order"}
            ],
            "custom_excerpt": "An investigative analysis of how global AI regulation and Central Bank Digital Currencies are converging to create unprecedented digital control systems.",
            "featured": False,
            "visibility": "public"
        }]
    }
    
    url = "https://thenewworldorder.io/ghost/api/admin/posts/?source=html"
    
    print(f"📝 Publishing: {title}")
    print(f"   Content: {len(content)} characters")
    print(f"   JWT Token: {jwt_token[:50]}...")
    
    # Create curl command
    cmd = [
        "curl", "-s", "-X", "POST", url,
        "-H", f"Authorization: Ghost {jwt_token}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload),
        "-w", "\n%{http_code}"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        output = result.stdout.strip()
        
        if '\n' in output:
            response_body, http_code = output.rsplit('\n', 1)
        else:
            response_body, http_code = "", output
        
        print(f"📡 HTTP Status: {http_code}")
        
        if http_code in ["200", "201"]:
            print("✅ Publication successful!")
            
            # Parse response for URL
            try:
                response_data = json.loads(response_body)
                if "posts" in response_data and response_data["posts"]:
                    post = response_data["posts"][0]
                    post_url = post.get("url", "")
                    
                    if post_url:
                        return post_url
                    else:
                        # Construct URL from slug or ID
                        slug = post.get("slug", "")
                        if slug:
                            return f"https://thenewworldorder.io/{slug}/"
            except:
                pass
            
            return "https://thenewworldorder.io/"
        else:
            print(f"❌ Publication failed")
            print(f"Response: {response_body[:200]}...")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    print("=" * 60)
    print("THE NEW WORLD ORDER - AUTOMATED PUBLISHING SYSTEM")
    print("=" * 60)
    
    # Step 1: Generate JWT
    print("\n🔑 Generating JWT token...")
    jwt_token = generate_jwt()
    print(f"   Token generated: {jwt_token[:50]}...")
    
    # Step 2: Read article
    print("\n📝 Loading article...")
    title, content = read_article()
    print(f"   Title: {title}")
    print(f"   Content prepared ({len(content)} chars)")
    
    # Step 3: Publish
    print("\n🚀 Publishing to The New World Order...")
    post_url = publish_article(jwt_token, title, content)
    
    if post_url:
        print("\n" + "=" * 60)
        print("✅ AUTOMATED PUBLICATION SUCCESSFUL!")
        print("=" * 60)
        print(f"\n🌐 LIVE POST URL:")
        print(f"   {post_url}")
        
        # Save URL
        with open('/home/node/.openclaw/workspace/nwo_live_url.txt', 'w') as f:
            f.write(post_url)
        
        print(f"\n📁 URL saved to: nwo_live_url.txt")
        
        # Verify the post is accessible
        print(f"\n🔍 Verifying post accessibility...")
        verify_cmd = ["curl", "-s", "-I", post_url]
        result = subprocess.run(verify_cmd, capture_output=True, text=True)
        if "200" in result.stdout:
            print("   ✅ Post is live and accessible!")
        else:
            print("   ⚠️ Post created but verification pending")
            
    else:
        print("\n" + "=" * 60)
        print("❌ PUBLICATION FAILED")
        print("=" * 60)

if __name__ == "__main__":
    main()