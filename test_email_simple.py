#!/usr/bin/env python3
"""
Try alternative email sending methods
"""

import subprocess
import sys

def test_sendmail():
    """Test if sendmail is available on the system"""
    try:
        # Check if sendmail exists
        result = subprocess.run(['which', 'sendmail'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ sendmail found at: {result.stdout.strip()}")
            return True
        else:
            print("❌ sendmail not found")
            return False
    except Exception as e:
        print(f"❌ Error checking sendmail: {e}")
        return False

def test_mail_command():
    """Test if mail command is available"""
    try:
        result = subprocess.run(['which', 'mail'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ mail command found at: {result.stdout.strip()}")
            return True
        else:
            print("❌ mail command not found")
            return False
    except Exception as e:
        print(f"❌ Error checking mail command: {e}")
        return False

def check_system_email_capabilities():
    """Check what email capabilities the system has"""
    print("🔍 Checking system email capabilities...\n")
    
    capabilities = {
        'sendmail': test_sendmail(),
        'mail_command': test_mail_command(),
    }
    
    print("\n📋 Available email methods:")
    for method, available in capabilities.items():
        status = "✅ Available" if available else "❌ Not available"
        print(f"  • {method}: {status}")
    
    return capabilities

def create_email_draft():
    """Create the email draft for manual sending"""
    draft = """To: bsdynasty@live.com
From: Lola White <luckylolawhite888@gmail.com>
Subject: Introduction from Lola White - Assistant to Arcadian Maya

Hello,

I hope this email finds you well!

My name is Lola White, and I'm writing to introduce myself as the new personal assistant to Arcadian Maya. Maya has asked me to reach out and let you know that I'll be handling communications and coordination on her behalf moving forward.

Maya is currently quite busy with back-to-back meetings and projects, so she's delegated me to help manage her correspondence and ensure nothing falls through the cracks. I'm here to assist with scheduling, information sharing, and any coordination you might need with Maya.

A little about me: I'm an AI-powered assistant specifically configured to help Maya stay organized and connected. I can handle emails, schedule coordination, information retrieval, and basic task management. Think of me as Maya's digital right hand!

Please feel free to reach out to me directly for:
- Scheduling meetings or calls with Maya
- Sharing information or documents
- Following up on ongoing projects
- Any coordination needs

Maya will still be involved in all important decisions and conversations, but I'll be handling the day-to-day logistics to make everything run more smoothly.

Looking forward to working with you!

Best regards,

Lola White
Personal Assistant to Arcadian Maya
Email: luckylolawhite888@gmail.com

P.S. If you ever need to reach Maya directly for urgent matters, please don't hesitate to contact her through her usual channels. I'm here to help, not to create barriers!"""
    
    return draft

if __name__ == "__main__":
    print("📧 Email System Check\n")
    
    # Check capabilities
    caps = check_system_email_capabilities()
    
    print("\n📝 Email Draft (for manual sending if needed):")
    print("=" * 60)
    draft = create_email_draft()
    print(draft)
    print("=" * 60)
    
    print("\n💡 Recommendations:")
    
    if caps['sendmail'] or caps['mail_command']:
        print("1. Try using system mail command (if configured)")
    else:
        print("1. No system email commands available")
    
    print("2. Fix Gmail authentication (App Password or security settings)")
    print("3. Send manually via Gmail web interface")
    print("4. Use a different email service (SendGrid, Mailgun, etc.)")
    
    # Save draft to file
    with open('email_draft.txt', 'w') as f:
        f.write(draft)
    print(f"\n📄 Draft saved to: email_draft.txt")