#!/usr/bin/env python3
"""
Test Google Sheets API Connection
"""

import json
import os
from datetime import datetime

def check_credentials():
    """Check if we have Google credentials"""
    print("🔍 Checking Google credentials...")
    
    # Check vault for OAuth credentials
    vault_file = '/home/node/.openclaw/workspace/vault/google_oauth_credentials_secured.json'
    
    if os.path.exists(vault_file):
        with open(vault_file, 'r') as f:
            creds = json.load(f)
            print(f"✅ Found OAuth credentials")
            print(f"   Client ID: {creds['client_id'][:30]}...")
            print(f"   Client Secret: {creds['client_secret'][:10]}...")
            return True
    else:
        print("❌ No OAuth credentials found in vault")
        return False

def check_google_apis():
    """Check if Google API libraries are available"""
    print("\n🔧 Checking Google API libraries...")
    
    libraries = [
        ('google-auth', 'google.auth'),
        ('google-auth-oauthlib', 'google_auth_oauthlib'),
        ('google-api-python-client', 'googleapiclient')
    ]
    
    available = []
    missing = []
    
    for lib_name, import_name in libraries:
        try:
            __import__(import_name.replace('-', '_').split('.')[0])
            available.append(lib_name)
            print(f"   ✅ {lib_name}")
        except ImportError:
            missing.append(lib_name)
            print(f"   ❌ {lib_name}")
    
    return available, missing

def create_simple_sheets_test():
    """Create a simple Sheets test using REST API"""
    print("\n📋 Creating Google Sheets test plan...")
    
    print("1. Need to enable Google Sheets API:")
    print("   - Go to: https://console.cloud.google.com/apis/library/sheets.googleapis.com")
    print("   - Click 'Enable'")
    
    print("\n2. Create OAuth consent screen:")
    print("   - Go to: https://console.cloud.google.com/apis/credentials/consent")
    print("   - Add 'https://www.googleapis.com/auth/spreadsheets' scope")
    
    print("\n3. Create a test spreadsheet:")
    print("   - Create Google Sheet: https://sheets.new")
    print("   - Share with: lucklolawhite@gmail.com")
    print("   - Copy Spreadsheet ID from URL")
    
    print("\n4. Generate OAuth token:")
    print("   - Use client_id/client_secret")
    print("   - Get authorization code")
    print("   - Exchange for access token")
    
    return True

def main():
    print("=" * 50)
    print("Google Sheets Integration Test")
    print("=" * 50)
    
    # Check credentials
    if not check_credentials():
        print("\n❌ Cannot proceed without credentials")
        return
    
    # Check libraries
    available, missing = check_google_apis()
    
    if missing:
        print(f"\n⚠️ Missing libraries: {', '.join(missing)}")
        print("Install with: pip install google-auth google-auth-oauthlib google-api-python-client")
    
    # Create test plan
    create_simple_sheets_test()
    
    print("\n" + "=" * 50)
    print("Next Steps:")
    print("1. Enable Google Sheets API")
    print("2. Create test spreadsheet")
    print("3. Get spreadsheet ID")
    print("4. I'll create sync script")
    print("=" * 50)

if __name__ == "__main__":
    main()