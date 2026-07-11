#!/usr/bin/env python3
"""
Monzo OAuth Setup for Permanent Access
"""

import secrets
import urllib.parse

class MonzoOAuth:
    def __init__(self):
        # REPLACE WITH YOUR MONZO CREDENTIALS
        self.client_id = "YOUR_MONZO_CLIENT_ID_HERE"
        self.client_secret = "YOUR_MONZO_CLIENT_SECRET_HERE"
        self.redirect_uri = "https://example.com/callback"
        self.base_url = "https://api.monzo.com"
        self.auth_url = "https://auth.monzo.com"
        
    def generate_auth_url(self):
        """Generate authorization URL for user to click"""
        # Generate random state for CSRF protection
        state = secrets.token_urlsafe(16)
        
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "state": state
        }
        
        auth_url = f"{self.auth_url}/?{urllib.parse.urlencode(params)}"
        
        print("🔐 MONZO AUTHORIZATION REQUIRED")
        print("=" * 50)
        print("\n📋 Step 1: Click this authorization link:")
        print(f"\n🔗 {auth_url}")
        print("\n📋 Step 2: Authorize 'Lola' app in Monzo")
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
    
    def exchange_code_for_tokens(self, authorization_code):
        """Exchange authorization code for access/refresh tokens"""
        import requests
        
        token_url = f"{self.base_url}/oauth2/token"
        
        data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
            "code": authorization_code
        }
        
        try:
            response = requests.post(token_url, data=data)
            
            if response.status_code == 200:
                tokens = response.json()
                print("✅ TOKENS RECEIVED!")
                print("\n🔑 Access Token:", tokens.get('access_token', 'N/A'))
                print("🔄 Refresh Token:", tokens.get('refresh_token', 'N/A'))
                print("⏰ Expires in:", tokens.get('expires_in', 'N/A'), "seconds")
                print("👤 User ID:", tokens.get('user_id', 'N/A'))
                
                # Save tokens securely
                self.save_tokens(tokens)
                return tokens
            else:
                print(f"❌ Token exchange failed: {response.status_code}")
                print("Response:", response.text)
                return None
                
        except Exception as e:
            print(f"❌ Error exchanging code: {e}")
            return None
    
    def refresh_tokens(self, refresh_token):
        """Refresh access token using refresh token"""
        import requests
        
        token_url = f"{self.base_url}/oauth2/token"
        
        data = {
            "grant_type": "refresh_token",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token
        }
        
        try:
            response = requests.post(token_url, data=data)
            
            if response.status_code == 200:
                tokens = response.json()
                print("✅ TOKENS REFRESHED!")
                print("New Access Token:", tokens.get('access_token', 'N/A'))
                print("New Refresh Token:", tokens.get('refresh_token', 'N/A'))
                
                # Save new tokens
                self.save_tokens(tokens)
                return tokens
            else:
                print(f"❌ Token refresh failed: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error refreshing tokens: {e}")
            return None
    
    def save_tokens(self, tokens):
        """Save tokens to secure file"""
        import json
        
        token_data = {
            "access_token": tokens.get('access_token'),
            "refresh_token": tokens.get('refresh_token'),
            "expires_in": tokens.get('expires_in'),
            "user_id": tokens.get('user_id'),
            "client_id": self.client_id,
            "timestamp": "2026-03-27T19:06:00Z"
        }
        
        with open("/home/node/.openclaw/workspace/monzo_tokens.json", "w") as f:
            json.dump(token_data, f, indent=2)
        
        print("💾 Tokens saved to monzo_tokens.json")
    
    def test_access(self, access_token):
        """Test if access token works"""
        import requests
        
        headers = {"Authorization": f"Bearer {access_token}"}
        
        try:
            response = requests.get(f"{self.base_url}/ping/whoami", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ ACCESS CONFIRMED!")
                print("Authenticated:", data.get('authenticated', False))
                print("User ID:", data.get('user_id', 'N/A'))
                return True
            else:
                print(f"❌ Access test failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error testing access: {e}")
            return False

# Generate authorization URL
if __name__ == "__main__":
    print("🦊 LOLA MONZO OAUTH SETUP")
    print("=" * 50)
    
    oauth = MonzoOAuth()
    
    print("\n📊 Client Details:")
    print(f"   Name: Lola")
    print(f"   Client ID: {oauth.client_id[:20]}...")
    print(f"   Redirect URL: {oauth.redirect_uri}")
    print(f"   Confidential: Yes")
    
    print("\n" + "=" * 50)
    print("🚀 Ready to generate authorization link...")
    
    # Generate and show auth URL
    auth_url, state = oauth.generate_auth_url()
    
    print("\n📝 After you get the authorization code, run:")
    print("   python3 monzo_oauth.py exchange YOUR_CODE_HERE")
    print("\nOr send me the code and I'll handle it!")