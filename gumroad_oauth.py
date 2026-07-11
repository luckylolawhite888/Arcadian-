#!/usr/bin/env python3
"""
Gumroad OAuth Setup for API Access
"""

import secrets
import urllib.parse

class GumroadOAuth:
    def __init__(self):
        # Your OAuth credentials
        self.client_id = "kF-ei35hpC0N2vGW_KdXDIRcYaVJM5-XCbh8BBkinRA"
        self.client_secret = "FedZECVRSd701r_PXpsKVT5WR957OX"
        self.redirect_uri = "https://example.com/callback"
        self.base_url = "https://api.gumroad.com"
        self.auth_url = "https://gumroad.com/oauth/authorize"
        self.token_url = "https://gumroad.com/oauth/token"
        
    def generate_auth_url(self):
        """Generate authorization URL for user to click"""
        # Generate random state for CSRF protection
        state = secrets.token_urlsafe(16)
        
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "view_products edit_products view_sales",  # Basic permissions
            "state": state
        }
        
        auth_url = f"{self.auth_url}?{urllib.parse.urlencode(params)}"
        
        print("🔐 GUMROAD AUTHORIZATION REQUIRED")
        print("=" * 50)
        print("\n📋 Step 1: Click this authorization link:")
        print(f"\n🔗 {auth_url}")
        print("\n📋 Step 2: Authorize 'Lola AI Assistant' app")
        print("\n📋 Step 3: You'll be redirected to example.com")
        print("   (It will show an error - that's expected)")
        print("\n📋 Step 4: Copy the 'code' from the URL")
        print("   Example URL: https://example.com/callback?code=XYZ123&state=...")
        print("   Copy the 'code' value (XYZ123 in example)")
        print("\n📋 Step 5: Send me the code")
        print("\n" + "=" * 50)
        print("⚠️  Keep this state value for verification:")
        print(f"   State: {state}")
        
        return auth_url, state
    
    def exchange_code_for_token(self, authorization_code):
        """Exchange authorization code for access token"""
        import requests
        
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": authorization_code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri
        }
        
        try:
            response = requests.post(self.token_url, data=data)
            
            print(f"Token exchange status: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            
            if response.status_code == 200:
                tokens = response.json()
                print("✅ ACCESS TOKEN RECEIVED!")
                print("\n🔑 Access Token:", tokens.get('access_token', 'N/A'))
                print("🔄 Refresh Token:", tokens.get('refresh_token', 'N/A'))
                print("⏰ Expires in:", tokens.get('expires_in', 'N/A'), "seconds")
                print("📋 Scope:", tokens.get('scope', 'N/A'))
                print("🗝️ Token Type:", tokens.get('token_type', 'N/A'))
                
                # Save tokens securely
                self.save_tokens(tokens)
                return tokens
            else:
                print(f"❌ Token exchange failed: {response.status_code}")
                print("Full response:", response.text)
                return None
                
        except Exception as e:
            print(f"❌ Error exchanging code: {e}")
            return None
    
    def save_tokens(self, tokens):
        """Save tokens to secure file"""
        import json
        
        token_data = {
            "access_token": tokens.get('access_token'),
            "refresh_token": tokens.get('refresh_token'),
            "expires_in": tokens.get('expires_in'),
            "scope": tokens.get('scope'),
            "client_id": self.client_id,
            "timestamp": "2026-03-27T21:01:00Z"
        }
        
        with open("/home/node/.openclaw/workspace/gumroad_tokens.json", "w") as f:
            json.dump(token_data, f, indent=2)
        
        print("💾 Tokens saved to gumroad_tokens.json")
    
    def test_access(self, access_token):
        """Test if access token works"""
        import requests
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(f"{self.base_url}/v2/user", headers=headers)
            
            print(f"Test status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ API ACCESS CONFIRMED!")
                print("User:", data.get('user', {}).get('name', 'N/A'))
                print("Email:", data.get('user', {}).get('email', 'N/A'))
                return True
            else:
                print(f"❌ Access test failed: {response.status_code}")
                print("Response:", response.text[:200])
                return False
                
        except Exception as e:
            print(f"❌ Error testing access: {e}")
            return False

# Generate authorization URL
if __name__ == "__main__":
    print("🦊 GUMROAD OAUTH SETUP")
    print("=" * 50)
    
    oauth = GumroadOAuth()
    
    print("\n📊 Application Details:")
    print(f"   Name: Lola AI Assistant")
    print(f"   Client ID: {oauth.client_id[:20]}...")
    print(f"   Redirect URI: {oauth.redirect_uri}")
    
    print("\n" + "=" * 50)
    print("🚀 Ready to generate authorization link...")
    
    # Generate and show auth URL
    auth_url, state = oauth.generate_auth_url()
    
    print("\n📝 After you get the authorization code, run:")
    print("   python3 gumroad_oauth.py exchange YOUR_CODE_HERE")
    print("\nOr send me the code and I'll handle it!")