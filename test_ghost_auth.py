#!/usr/bin/env python3
"""
Test Ghost CMS authentication
"""

import subprocess
import json

# Test different authentication formats
formats = [
    ("Ghost 69cd083bed78410001d5501f:f2bb8d1da2236ed97c666ce2c430f9e0b4c9c2d0780084efe5bf1af43fd70117", "Standard Ghost format"),
    ("Bearer 69cd083bed78410001d5501f:f2bb8d1da2236ed97c666ce2c430f9e0b4c9c2d0780084efe5bf1af43fd70117", "Bearer token format"),
    ("69cd083bed78410001d5501f:f2bb8d1da2236ed97c666ce2c430f9e0b4c9c2d0780084efe5bf1af43fd70117", "Raw token"),
]

url = "https://thenewworldorder.io/ghost/api/admin/site/"

print("Testing Ghost CMS Admin API authentication...")
print("=" * 60)

for auth_header, description in formats:
    print(f"\nTesting: {description}")
    print(f"Header: {auth_header[:50]}...")
    
    cmd = [
        "curl", "-s", "-X", "GET", url,
        "-H", f"Authorization: {auth_header}",
        "-H", "Content-Type: application/json",
        "-w", "\n%{http_code}"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        output = result.stdout.strip()
        
        # Split HTTP code from response
        if '\n' in output:
            response_body, http_code = output.rsplit('\n', 1)
        else:
            response_body, http_code = "", output
        
        print(f"HTTP Status: {http_code}")
        
        if http_code == "200":
            print("✅ SUCCESS - Authentication valid!")
            try:
                data = json.loads(response_body)
                print(f"Site title: {data.get('site', {}).get('title', 'Unknown')}")
                break
            except:
                print("Could not parse response")
        else:
            print(f"Response: {response_body[:100]}...")
            
    except Exception as e:
        print(f"Error: {e}")

print("\n" + "=" * 60)
print("Authentication test complete.")