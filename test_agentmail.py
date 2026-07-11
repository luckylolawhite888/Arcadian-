#!/usr/bin/env python3
"""
Test AgentMail.to API
"""

import subprocess
import json

api_key = "am_us_700488d1bcdab0ae13dada6b0b713d64910a26bc8122b135a3196f3b43925388"
email = "lolawhite@agentmail.to"

# Test different possible endpoints
endpoints = [
    "https://api.agentmail.to/send",
    "https://api.agentmail.to/email/send",
    "https://agentmail.to/api/send",
    "https://agentmail.to/api/email",
    "https://agentmail.to/api/v1/send",
    "https://mail.agentmail.to/api/send",
]

email_data = {
    "from": email,
    "to": "bsdynasty@live.com",
    "subject": "Test from Lola - AgentMail.to",
    "text": "Testing AgentMail.to API connectivity."
}

print(f"🔍 Testing AgentMail.to API with key: {api_key[:20]}...")
print(f"📧 From: {email}")
print(f"📨 To: bsdynasty@live.com")

for endpoint in endpoints:
    print(f"\n--- Testing: {endpoint} ---")
    
    curl_cmd = [
        "curl", "-s", "-X", "POST", endpoint,
        "-H", f"Authorization: Bearer {api_key}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(email_data)
    ]
    
    try:
        result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=10)
        print(f"Status: {result.returncode}")
        print(f"Response: {result.stdout[:200]}")
        
        if result.returncode == 0 and result.stdout:
            try:
                json_response = json.loads(result.stdout)
                print(f"JSON Response: {json.dumps(json_response, indent=2)[:200]}")
            except:
                pass
                
    except Exception as e:
        print(f"Error: {e}")

print("\n📋 Summary: Need to find correct AgentMail.to API endpoint")
print("Possible issues:")
print("1. API key needs activation/verification")
print("2. Different API endpoint structure")
print("3. SMTP instead of REST API")
print("4. Account setup incomplete")