#!/usr/bin/env python3
"""
Publish to Ghost CMS with correct API format
"""

import subprocess
import json
import re

def read_article():
    """Read and parse the article"""
    with open('/home/node/.openclaw/workspace/nwo_analysis.md', 'r') as f:
        content = f.read()
    
    # Extract title
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else "Analysis Article"
    
    # Extract content between second set of ---
    parts = content.split('---')
    if len(parts) >= 3:
        article_content = parts[2].strip()
    else:
        article_content = content
    
    # Convert markdown to simple HTML
    html_content = article_content
    
    # Basic markdown to HTML conversion
    html_content = re.sub(r'### (.+)', r'<h3>\1</h3>', html_content)
    html_content = re.sub(r'## (.+)', r'<h2>\1</h2>', html_content)
    html_content = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html_content)
    html_content = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html_content)
    
    # Paragraphs
    lines = html_content.split('\n')
    html_lines = []
    for line in lines:
        line = line.strip()
        if line and not line.startswith('<h') and not line.startswith('<'):
            html_lines.append(f'<p>{line}</p>')
        elif line:
            html_lines.append(line)
    
    html_content = '\n'.join(html_lines)
    
    return title, html_content

def publish_article(title, content):
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
    
    auth_header = "Ghost 69cd083bed78410001d5501f:f2bb8d1da2236ed97c666ce2c430f9e0b4c9c2d0780084efe5bf1af43fd70117"
    url = "https://thenewworldorder.io/ghost/api/admin/posts/?source=html"
    
    print(f"Publishing: {title}")
    print(f"Content length: {len(content)} characters")
    
    # Create curl command
    cmd = [
        "curl", "-s", "-X", "POST", url,
        "-H", f"Authorization: {auth_header}",
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
        
        print(f"HTTP Status: {http_code}")
        
        if http_code in ["200", "201"]:
            print("✅ Publication successful!")
            
            # Parse response
            try:
                response_data = json.loads(response_body)
                if "posts" in response_data and response_data["posts"]:
                    post = response_data["posts"][0]
                    post_url = post.get("url", "")
                    post_id = post.get("id", "")
                    
                    if post_url:
                        print(f"🌐 Post URL: {post_url}")
                        return post_url
                    elif post_id:
                        # Construct URL from ID
                        slug = post.get("slug", "")
                        if slug:
                            post_url = f"https://thenewworldorder.io/{slug}/"
                        else:
                            post_url = f"https://thenewworldorder.io/posts/{post_id}/"
                        print(f"🌐 Post URL (constructed): {post_url}")
                        return post_url
            except json.JSONDecodeError:
                print("⚠️ Could not parse response JSON")
            
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
    print("THE NEW WORLD ORDER - GHOST CMS PUBLISHER")
    print("=" * 60)
    
    # Read article
    title, content = read_article()
    print(f"\n📝 Article: {title}")
    print(f"   Content prepared ({len(content)} chars)")
    
    # Publish
    print("\n🚀 Publishing to Ghost CMS...")
    post_url = publish_article(title, content)
    
    if post_url:
        print("\n✅ PUBLICATION COMPLETE")
        print("=" * 60)
        print(f"\n🌐 LIVE POST:")
        print(f"   {post_url}")
        
        # Save URL
        with open('/home/node/.openclaw/workspace/nwo_post_url.txt', 'w') as f:
            f.write(post_url)
        print(f"\n📁 URL saved to: nwo_post_url.txt")
    else:
        print("\n❌ PUBLICATION FAILED")
        print("=" * 60)

if __name__ == "__main__":
    main()