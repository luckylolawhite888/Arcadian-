#!/usr/bin/env python3
"""
Test script for The SMS Works API
Based on credentials provided by Maya
"""

import requests
import json
import sys

# API credentials
API_KEY = "d45ff5b2-83dd-4ca3-93cb-8aee750ecd63"
SECRET = "f928314ca667c77471ade89fcbe239e6cb68468d9e1f1d97f5f389e6715b5e3f"
JWT_TOKEN = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJkNDVmZjViMi04M2RkLTRjYTMtOTNjYi04YWVlNzUwZWNkNjMiLCJzZWNyZXQiOiJmOTI4MzE0Y2E2NjdjNzc0NzFhZGU4OWZjYmUyMzllNmNiNjg0NjhkOWUxZjFkOTdmNWYzODllNjcxNWI1ZTNmIiwiaWF0IjoxNzc0MjgyODk3LCJleHAiOjI1NjI2ODI4OTd9.ryPQIES-0CkG6fXraFc4m0d9rZkLdioPLk4_gWEd1k8"

# API endpoints
BASE_URL = "https://api.thesmsworks.co.uk"
SEND_ENDPOINT = f"{BASE_URL}/message/send"

def test_api_connection():
    """Test basic API connection"""
    print("Testing SMS Works API connection...")
    
    headers = {
        "Authorization": JWT_TOKEN,
        "Content-Type": "application/json"
    }
    
    # First, let's try a simple GET request to check balance or status
    try:
        # Try to get account info or balance
        response = requests.get(f"{BASE_URL}/balance", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✓ API connection successful!")
            return True
        else:
            print(f"✗ API returned error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Connection error: {e}")
        return False

def send_test_sms():
    """Send a test SMS"""
    print("\nAttempting to send test SMS...")
    
    headers = {
        "Authorization": JWT_TOKEN,
        "Content-Type": "application/json"
    }
    
    # Test payload - need a valid phone number
    # Note: You'll need to provide a real phone number for testing
    payload = {
        "sender": "Lola",  # Sender ID
        "destination": "+447123456789",  # Replace with actual number
        "content": "Test message from Lola via SMS Works API",
        "encoding": "gsm"  # or "unicode" for special characters
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(SEND_ENDPOINT, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✓ SMS sent successfully!")
            return True
        else:
            print(f"✗ Failed to send SMS: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Error sending SMS: {e}")
        return False

def main():
    print("=" * 50)
    print("SMS Works API Test")
    print("=" * 50)
    
    # Test connection
    if test_api_connection():
        print("\nAPI credentials are valid!")
        
        # Ask if user wants to send a test SMS
        print("\nDo you want to send a test SMS?")
        print("Note: You'll need to provide a valid phone number.")
        choice = input("Enter phone number (with country code, e.g., +447123456789) or 'skip': ")
        
        if choice.lower() != 'skip' and choice:
            # Update payload with actual number
            headers = {
                "Authorization": JWT_TOKEN,
                "Content-Type": "application/json"
            }
            
            payload = {
                "sender": "Lola",
                "destination": choice,
                "content": "Test message from Lola via SMS Works API. If you receive this, the setup works!",
                "encoding": "gsm"
            }
            
            try:
                response = requests.post(SEND_ENDPOINT, headers=headers, json=payload)
                print(f"\nSMS Send Status: {response.status_code}")
                print(f"Response: {response.text}")
                
                if response.status_code == 200:
                    print("✓ Test SMS sent successfully!")
                else:
                    print(f"✗ Failed to send test SMS")
                    
            except Exception as e:
                print(f"✗ Error: {e}")
    else:
        print("\n✗ API connection failed. Please check credentials.")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()