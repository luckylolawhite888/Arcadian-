#!/usr/bin/env python3
"""
Check Gmail setup and provide solutions for email sending.
"""

def check_gmail_issues():
    """Provide troubleshooting steps for Gmail sending"""
    
    issues = [
        {
            "issue": "2-Factor Authentication (2FA) enabled",
            "solution": "Generate an 'App Password'",
            "steps": [
                "1. Go to https://myaccount.google.com/security",
                "2. Under 'Signing in to Google', select '2-Step Verification'",
                "3. Scroll down to 'App passwords'",
                "4. Generate a new app password for 'Mail'",
                "5. Use the 16-character password instead of your regular password"
            ]
        },
        {
            "issue": "'Less secure app access' disabled",
            "solution": "Enable it temporarily or use App Password",
            "steps": [
                "1. Go to https://myaccount.google.com/security",
                "2. Under 'Less secure app access', turn it ON",
                "3. Note: Google may disable this option for new accounts",
                "4. Recommended: Use App Password instead (more secure)"
            ]
        },
        {
            "issue": "New account security restrictions",
            "solution": "Complete account setup and verification",
            "steps": [
                "1. Log into the Gmail account in a browser",
                "2. Complete any initial setup steps",
                "3. Verify recovery email/phone if prompted",
                "4. Wait 24-48 hours for new account restrictions to lift"
            ]
        }
    ]
    
    print("🔍 Gmail Sending Issues - Troubleshooting Guide\n")
    print("The password '@Luckylola888' is not working with SMTP.")
    print("This is a common issue with Gmail accounts.\n")
    
    for i, issue in enumerate(issues, 1):
        print(f"{i}. {issue['issue']}")
        print(f"   Solution: {issue['solution']}")
        print(f"   Steps:")
        for step in issue['steps']:
            print(f"   {step}")
        print()
    
    print("📋 Recommended Action:")
    print("1. First, try logging into https://mail.google.com with the credentials")
    print("2. If 2FA is enabled, generate an App Password")
    print("3. If it's a new account, complete all setup steps")
    print("4. Update the password in the vault with the working credentials")
    
    return issues

def alternative_solutions():
    """Alternative ways to send emails"""
    
    alternatives = [
        {
            "method": "Use Gmail API with OAuth 2.0",
            "complexity": "High",
            "security": "Excellent",
            "description": "Most secure method, requires OAuth setup"
        },
        {
            "method": "Use third-party email service",
            "complexity": "Medium",
            "security": "Good",
            "description": "Services like SendGrid, Mailgun, etc."
        },
        {
            "method": "Use system's sendmail",
            "complexity": "Low",
            "security": "Basic",
            "description": "If sendmail is configured on the server"
        },
        {
            "method": "Use web interface manually",
            "complexity": "Manual",
            "security": "Good",
            "description": "Log into Gmail and send manually"
        }
    ]
    
    print("\n🔄 Alternative Email Sending Methods:\n")
    
    for alt in alternatives:
        print(f"• {alt['method']}")
        print(f"  Complexity: {alt['complexity']}")
        print(f"  Security: {alt['security']}")
        print(f"  {alt['description']}")
        print()
    
    return alternatives

if __name__ == "__main__":
    check_gmail_issues()
    alternative_solutions()