#!/usr/bin/env python3
"""
SMS Works Integration for OpenClaw
A simple wrapper around The SMS Works API
"""

import json
import os
import sys
from datetime import datetime

# Try to import requests, fall back to curl if not available
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    import subprocess

class SMSWorks:
    """SMS Works API client"""
    
    def __init__(self, api_key=None, secret=None, jwt_token=None):
        self.base_url = "https://api.thesmsworks.co.uk"
        
        # Use provided credentials or try to get from environment
        self.jwt_token = jwt_token or os.environ.get('SMSWORKS_JWT_TOKEN')
        
        if not self.jwt_token:
            # Construct JWT from API key and secret if provided
            if api_key and secret:
                # Note: In reality, you'd need to generate a JWT token
                # For now, we'll use the provided JWT
                pass
        
        if not self.jwt_token:
            raise ValueError("JWT token is required. Set SMSWORKS_JWT_TOKEN environment variable or pass jwt_token parameter.")
    
    def _make_request(self, method, endpoint, data=None):
        """Make HTTP request to API"""
        url = f"{self.base_url}{endpoint}"
        headers = {
            "Authorization": self.jwt_token,
            "Content-Type": "application/json"
        }
        
        if HAS_REQUESTS:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response.status_code, response.text
        else:
            # Fall back to curl
            import subprocess
            import shlex
            
            curl_cmd = ["curl", "-s", "-X", method, url]
            for key, value in headers.items():
                curl_cmd.extend(["-H", f"{key}: {value}"])
            
            if data and method == "POST":
                data_str = json.dumps(data)
                curl_cmd.extend(["-d", data_str])
            
            try:
                result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)
                return result.returncode, result.stdout
            except subprocess.TimeoutExpired:
                return 408, "Request timeout"
    
    def send_sms(self, destination, content, sender="Lola"):
        """Send an SMS message"""
        payload = {
            "sender": sender,
            "destination": destination,
            "content": content,
            "encoding": "gsm"  # or "unicode" for special characters
        }
        
        status, response = self._make_request("POST", "/message/send", payload)
        
        try:
            response_data = json.loads(response) if response else {}
        except:
            response_data = {"raw_response": response}
        
        return {
            "success": status == 200,
            "status_code": status,
            "response": response_data,
            "timestamp": datetime.now().isoformat()
        }
    
    def check_balance(self):
        """Check account balance/credits"""
        # Try different possible endpoints
        endpoints = ["/balance", "/credits", "/account/balance"]
        
        for endpoint in endpoints:
            status, response = self._make_request("GET", endpoint)
            if status == 200:
                try:
                    return json.loads(response)
                except:
                    return {"raw": response}
        
        return {"error": "Could not find balance endpoint", "status": status}
    
    def test_connection(self):
        """Test API connection"""
        status, response = self._make_request("GET", "/")
        
        if status == 200:
            try:
                data = json.loads(response)
                return {"connected": True, "message": data.get("message", "Connected")}
            except:
                return {"connected": True, "raw_response": response}
        else:
            return {"connected": False, "status": status, "response": response}

def main():
    """Command-line interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description="SMS Works CLI")
    parser.add_argument("--test", action="store_true", help="Test API connection")
    parser.add_argument("--balance", action="store_true", help="Check account balance")
    parser.add_argument("--send", nargs=2, metavar=("PHONE", "MESSAGE"), 
                       help="Send SMS: PHONE_NUMBER \"MESSAGE TEXT\"")
    parser.add_argument("--sender", default="Lola", help="Sender ID (default: Lola)")
    
    args = parser.parse_args()
    
    # Get JWT token from environment or use provided one
    jwt_token = os.environ.get('SMSWORKS_JWT_TOKEN')
    
    if not jwt_token:
        # Use the hardcoded token from Maya's credentials
        jwt_token = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJkNDVmZjViMi04M2RkLTRjYTMtOTNjYi04YWVlNzUwZWNkNjMiLCJzZWNyZXQiOiJmOTI4MzE0Y2E2NjdjNzc0NzFhZGU4OWZjYmUyMzllNmNiNjg0NjhkOWUxZjFkOTdmNWYzODllNjcxNWI1ZTNmIiwiaWF0IjoxNzc0MjgyODk3LCJleHAiOjI1NjI2ODI4OTd9.ryPQIES-0CkG6fXraFc4m0d9rZkLdioPLk4_gWEd1k8"
    
    sms = SMSWorks(jwt_token=jwt_token)
    
    if args.test:
        print("Testing SMS Works API connection...")
        result = sms.test_connection()
        print(json.dumps(result, indent=2))
    
    elif args.balance:
        print("Checking account balance...")
        result = sms.check_balance()
        print(json.dumps(result, indent=2))
    
    elif args.send:
        phone, message = args.send
        print(f"Sending SMS to {phone}...")
        result = sms.send_sms(phone, message, args.sender)
        print(json.dumps(result, indent=2))
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()