#!/usr/bin/env python3
"""
Gmail SMTP Configuration for Lola
Use this to send emails from luckylolawhite@gmail.com
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime

class GmailSender:
    def __init__(self):
        self.email = "luckylolawhite@gmail.com"
        self.app_password = "dvnx ltjw mhxp iwnt".replace(" ", "")  # Remove spaces
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587  # TLS
        # self.smtp_port = 465  # SSL
        
    def send_email(self, to_email, subject, body, html_body=None):
        """Send an email via Gmail SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"Lola 🦊 <{self.email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            msg['Date'] = datetime.now().strftime("%a, %d %b %Y %H:%M:%S %z")
            
            # Attach plain text
            msg.attach(MIMEText(body, 'plain'))
            
            # Attach HTML if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))
            
            # Connect and send
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Upgrade to TLS
                server.login(self.email, self.app_password)
                server.send_message(msg)
                
            print(f"✅ Email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False
    
    def send_to_maya(self, subject, body):
        """Convenience method to send to Maya's Telegram-connected email"""
        # You might want to use your actual email here, not the Gmail account itself
        return self.send_email(self.email, subject, body)
    
    def test_connection(self):
        """Test SMTP connection"""
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email, self.app_password)
                print("✅ Gmail SMTP connection successful")
                return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False

# Quick test
if __name__ == "__main__":
    gmail = GmailSender()
    
    if gmail.test_connection():
        print("Testing email send...")
        success = gmail.send_email(
            to_email="luckylolawhite@gmail.com",  # Send to self for testing
            subject="Lola Gmail Test",
            body="This is a test email from your Lola assistant Gmail setup.\n\nIf you receive this, everything is working! 🦊"
        )
        
        if success:
            print("🎉 Gmail setup complete! Check your inbox.")
        else:
            print("⚠️ Email sending failed. Check credentials.")
    else:
        print("❌ Cannot proceed - SMTP connection failed.")