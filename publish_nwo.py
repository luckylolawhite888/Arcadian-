#!/usr/bin/env python3
"""
Publish article to The New World Order site
"""

import requests
import json
import sys

# API Configuration
API_URL = "https://thenewworldorder.io/api"
CONTENT_API_KEY = "64278e9eaf4ac0f4b71a628ed1"

def read_article():
    """Read the article content from file"""
    try:
        with open('/home/node/.openclaw/workspace/nwo_analysis.md', 'r') as f:
            content = f.read()
        
        # Parse the article
        lines = content.split('\n')
        title = ""
        body_lines = []
        in_body = False
        
        for line in lines:
            if line.startswith('# ') and not title:
                title = line[2:].strip()
            elif line.startswith('---'):
                in_body = True
            elif in_body:
                body_lines.append(line)
        
        body = '\n'.join(body_lines).strip()
        
        return {
            'title': title,
            'content': body,
            'word_count': len(content.split())
        }
        
    except Exception as e:
        print(f"Error reading article: {e}")
        return None

def publish_article(article_data):
    """Publish article to NWO site"""
    
    # Prepare the post data
    post_data = {
        'title': article_data['title'],
        'content': article_data['content'],
        'status': 'published',
        'meta': {
            'category': 'Geopolitical Analysis',
            'tags': ['AI Regulation', 'CBDC', 'Digital Control', 'New World Order'],
            'word_count': article_data['word_count']
        }
    }
    
    headers = {
        'Authorization': f'Bearer {CONTENT_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    try:
        print(f"Publishing: {article_data['title']}")
        print(f"Word count: {article_data['word_count']}")
        print(f"API URL: {API_URL}/posts")
        
        # Try to publish
        response = requests.post(
            f"{API_URL}/posts",
            headers=headers,
            json=post_data,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            result = response.json()
            print(f"✅ Success! Post ID: {result.get('id', 'Unknown')}")
            return result
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def main():
    """Main execution"""
    print("=" * 60)
    print("THE NEW WORLD ORDER - PUBLISHING SYSTEM")
    print("=" * 60)
    
    # Read article
    article = read_article()
    if not article:
        print("Failed to read article")
        sys.exit(1)
    
    print(f"\n📝 Article loaded:")
    print(f"   Title: {article['title']}")
    print(f"   Words: {article['word_count']}")
    
    # Publish article
    print("\n🚀 Publishing to NWO site...")
    result = publish_article(article)
    
    if result:
        print("\n✅ PUBLICATION SUCCESSFUL")
        print("=" * 60)
        
        # Extract the post URL
        post_id = result.get('id')
        slug = result.get('slug', '').lower().replace(' ', '-')
        
        if post_id and slug:
            post_url = f"https://thenewworldorder.io/posts/{slug}-{post_id}"
        elif post_id:
            post_url = f"https://thenewworldorder.io/posts/{post_id}"
        else:
            post_url = "https://thenewworldorder.io"
        
        print(f"\n🌐 LIVE POST URL:")
        print(f"   {post_url}")
        
        # Save the URL
        with open('/home/node/.openclaw/workspace/nwo_post_url.txt', 'w') as f:
            f.write(post_url)
            
        print(f"\n📁 URL saved to: nwo_post_url.txt")
    else:
        print("\n❌ PUBLICATION FAILED")
        print("Check API credentials and network connection")
        sys.exit(1)

if __name__ == "__main__":
    main()