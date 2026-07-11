#!/usr/bin/env python3
"""
Sanitize product files - remove any personal/sensitive data
"""

import os
import re

def sanitize_file(filepath):
    """Remove sensitive data from a file"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        original = content
        
        # Remove any actual API keys/tokens (looks like real keys)
        content = re.sub(r'["\']?[A-Za-z0-9_\-]{20,}["\']?', '"YOUR_API_KEY_HERE"', content)
        
        # Remove email addresses
        content = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 'support@example.com', content)
        
        # Remove phone numbers
        content = re.sub(r'\b\d{10,}\b', '0000000000', content)
        
        # Remove specific usernames
        content = content.replace('Lordspring', 'YOUR_USERNAME')
        content = content.replace('Arcadian Maya', 'YOUR_NAME')
        content = content.replace('Maya', 'YOUR_NAME')
        
        # Remove any file paths that might be personal
        content = re.sub(r'/home/node/\.openclaw/[^\s"\']+', '/path/to/your/workspace', content)
        
        # Ensure all placeholders are consistent
        content = content.replace('your_key', 'YOUR_API_KEY_HERE')
        content = content.replace('your_token', 'YOUR_API_TOKEN_HERE')
        content = content.replace('your_password', 'YOUR_PASSWORD_HERE')
        
        if content != original:
            print(f"  🔧 Sanitized: {filepath}")
            with open(filepath, 'w') as f:
                f.write(content)
            return True
        else:
            print(f"  ✅ Clean: {filepath}")
            return False
            
    except Exception as e:
        print(f"  ❌ Error processing {filepath}: {e}")
        return False

def main():
    print("🧹 Sanitizing product files...")
    
    base_dir = "/home/node/.openclaw/workspace/lola_product_sanitized"
    
    files_sanitized = 0
    total_files = 0
    
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.py', '.md', '.json', '.txt', '.yml', '.yaml')):
                filepath = os.path.join(root, file)
                total_files += 1
                if sanitize_file(filepath):
                    files_sanitized += 1
    
    print(f"\n📊 Summary:")
    print(f"  Total files checked: {total_files}")
    print(f"  Files sanitized: {files_sanitized}")
    
    # Create final ZIP
    print(f"\n📦 Creating final product package...")
    os.system("cd /home/node/.openclaw/workspace && tar -czf lola_ai_assistant_kit_v1.0_sanitized.tar.gz lola_product_sanitized/")
    
    size = os.path.getsize("/home/node/.openclaw/workspace/lola_ai_assistant_kit_v1.0_sanitized.tar.gz")
    print(f"  Created: lola_ai_assistant_kit_v1.0_sanitized.tar.gz ({size/1024:.1f} KB)")
    
    print("\n✅ Product sanitization complete!")
    print("📁 Use the '_sanitized' version for Gumroad upload")

if __name__ == "__main__":
    main()