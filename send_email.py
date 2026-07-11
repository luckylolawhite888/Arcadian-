#!/usr/bin/env python3
"""
Simple Gmail email sending script.
Uses SMTP with Gmail credentials.
"""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

def send_gmail(sender_email, sender_password, recipient_email, subject, body, is_html=False):
    """
    Send an email via Gmail SMTP.
    
    Args:
        sender_email: Gmail address
        sender_password: Gmail password or app password
        recipient_email: Recipient email address
        subject: Email subject
        body: Email body content
        is_html: Whether body is HTML (default: False, plain text)
    
    Returns:
        dict with success status and message
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = sender_email
        message["To"] = recipient_email
        
        # Add body
        if is_html:
            part = MIMEText(body, "html")
        else:
            part = MIMEText(body, "plain")
        message.attach(part)
        
        # Create secure SSL context
        context = ssl.create_default_context()
        
        # Connect to Gmail SMTP server
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, message.as_string())
        
        return {
            "success": True,
            "message": f"✅ Email sent successfully to {recipient_email}",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"❌ Failed to send email: {str(e)}",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

def send_introduction_email():
    """Send introduction email from Lola White"""
    sender_email = "luckylolawhite888@gmail.com"
    sender_password = "@Luckylola888"
    recipient_email = "bsdynasty@live.com"
    
    subject = "Introduction from Lola White - Assistant to Arcadian Maya"
    
    body = """Hello,

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
    
    print(f"📧 Preparing to send email...")
    print(f"From: {sender_email}")
    print(f"To: {recipient_email}")
    print(f"Subject: {subject}")
    print(f"Body length: {len(body)} characters")
    
    result = send_gmail(sender_email, sender_password, recipient_email, subject, body)
    
    return result

if __name__ == "__main__":
    print("🧪 Testing Gmail email sending...\n")
    
    # Test with a simple email first (to myself for testing)
    test_result = send_gmail(
        "luckylolawhite888@gmail.com",
        "@Luckylola888",
        "luckylolawhite888@gmail.com",  # Send to myself for testing
        "Test Email from Lola White",
        "This is a test email to verify Gmail sending works correctly."
    )
    
    print(f"Test result: {test_result['message']}")
    
    if test_result['success']:
        print("\n✅ Test successful! Now sending introduction email...\n")
        
        intro_result = send_introduction_email()
        print(f"Introduction email result: {intro_result['message']}")
    else:
        print(f"\n❌ Test failed: {test_result.get('error', 'Unknown error')}")
        print("\n⚠️  Common issues:")
        print("1. Incorrect password")
        print("2. Need to use an 'App Password' if 2FA is enabled")
        print("3. Gmail security settings blocking less secure apps")
        print("4. Account access restrictions")