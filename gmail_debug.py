#!/usr/bin/env python3
"""
Debug Gmail authentication issues
"""

import smtplib
import ssl

def test_gmail_connection():
    """Test various Gmail connection methods"""
    
    sender_email = "luckylolawhite888@gmail.com"
    
    print("🔍 Gmail Connection Debug\n")
    
    # Test 1: Try different ports
    ports_to_test = [
        (465, "SSL"),
        (587, "TLS"), 
        (25, "Standard")
    ]
    
    for port, method in ports_to_test:
        print(f"Testing port {port} ({method})...")
        try:
            if port == 465:
                context = ssl.create_default_context()
                server = smtplib.SMTP_SSL("smtp.gmail.com", port, context=context)
            elif port == 587:
                server = smtplib.SMTP("smtp.gmail.com", port)
                server.starttls()
            else:
                server = smtplib.SMTP("smtp.gmail.com", port)
            
            print(f"  ✅ Connected to port {port}")
            server.quit()
        except Exception as e:
            print(f"  ❌ Failed: {str(e)[:60]}")
    
    print("\n📋 Common Gmail Issues & Solutions:")
    print("=" * 60)
    
    issues = [
        {
            "issue": "New account restrictions",
            "symptoms": "Authentication fails even with correct password",
            "solution": "Wait 24-48 hours after account creation",
            "check": "Can you log into Gmail web interface?"
        },
        {
            "issue": "App Password not generated correctly",
            "symptoms": "16-char password doesn't work",
            "solution": "Generate new App Password, copy EXACTLY",
            "check": "Is it 16 chars? 4 groups of 4 like 'abcd efgh ijkl mnop'?"
        },
        {
            "issue": "Account not fully set up",
            "symptoms": "Various authentication errors",
            "solution": "Complete all Gmail setup steps in browser",
            "check": "Have you verified recovery email/phone?"
        },
        {
            "issue": "IP/device restrictions",
            "symptoms": "Works from some locations but not others",
            "solution": "Check Google security alerts page",
            "check": "Any 'suspicious sign-in' alerts?"
        }
    ]
    
    for i, issue in enumerate(issues, 1):
        print(f"\n{i}. {issue['issue']}")
        print(f"   Symptoms: {issue['symptoms']}")
        print(f"   Solution: {issue['solution']}")
        print(f"   Check: {issue['check']}")
    
    print("\n" + "=" * 60)
    
    print("\n🎯 Immediate Actions:")
    print("1. Log into https://mail.google.com with the credentials")
    print("2. Check for any security alerts or setup steps")
    print("3. Generate a NEW App Password (if current one doesn't work)")
    print("4. Copy it EXACTLY: 'xxxx xxxx xxxx xxxx' → 'xxxxxxxxxxxxxxxx'")
    print("5. Try again with the new password")
    
    print("\n🔄 While we fix this, I can:")
    print("• Draft the email for you to send manually")
    print("• Set up calendar integration separately")
    print("• Configure other Google services once email works")

if __name__ == "__main__":
    test_gmail_connection()