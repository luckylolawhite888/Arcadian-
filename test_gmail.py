#!/usr/bin/env python3
"""
Test Gmail API connection with provided credentials
"""

import os
import sys
import imaplib
import email
from email.header import decode_header

# Read credentials from environment or file
GMAIL_USER = os.getenv('GMAIL_USER', 'luckylolawhite@gmail.com')
GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD', 'cyuj ikil jaup lgep')

def test_gmail_connection():
    """Test basic Gmail IMAP connection"""
    print(f"Testing Gmail connection for: {GMAIL_USER}")
    print(f"Using app password: {'*' * len(GMAIL_APP_PASSWORD)}")
    
    try:
        # Connect to Gmail IMAP server
        print("\n1. Connecting to Gmail IMAP server...")
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        
        print("2. Logging in...")
        mail.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        print("✅ Login successful!")
        
        # List mailboxes
        print("\n3. Listing mailboxes...")
        status, mailboxes = mail.list()
        if status == 'OK':
            print(f"Found {len(mailboxes)} mailboxes")
            for mbox in mailboxes[:5]:  # Show first 5
                print(f"  - {mbox.decode('utf-8', errors='ignore')}")
        
        # Check INBOX
        print("\n4. Checking INBOX...")
        mail.select("INBOX")
        status, messages = mail.search(None, 'UNSEEN')
        
        if status == 'OK':
            unread_ids = messages[0].split()
            unread_count = len(unread_ids)
            print(f"✅ Found {unread_count} unread emails")
            
            if unread_count > 0:
                print("\n5. Checking for 'The Rundown' emails...")
                status, all_messages = mail.search(None, 'ALL')
                if status == 'OK':
                    all_ids = all_messages[0].split()
                    recent_ids = all_ids[-10:] if len(all_ids) > 10 else all_ids
                    
                    rundown_count = 0
                    for msg_id in recent_ids[-5:]:  # Check last 5 emails
                        status, msg_data = mail.fetch(msg_id, '(RFC822)')
                        if status == 'OK':
                            msg = email.message_from_bytes(msg_data[0][1])
                            subject = decode_header(msg["Subject"])[0][0]
                            if isinstance(subject, bytes):
                                subject = subject.decode()
                            
                            if 'rundown' in subject.lower() or 'the rundown' in subject.lower():
                                rundown_count += 1
                                print(f"  - Found: {subject}")
                    
                    print(f"\n✅ Found {rundown_count} Rundown emails in recent messages")
        
        # Logout
        mail.logout()
        print("\n✅ Gmail API test completed successfully!")
        return True
        
    except imaplib.IMAP4.error as e:
        print(f"❌ IMAP Error: {e}")
        print("Possible issues:")
        print("1. App password incorrect or expired")
        print("2. Less secure app access not enabled")
        print("3. 2-Step Verification not set up for app passwords")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("GMAIL API CONNECTION TEST")
    print("=" * 60)
    
    success = test_gmail_connection()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ TEST PASSED: Gmail connection working!")
        print("\nNext steps:")
        print("1. Update todo.md to mark email monitoring as fixed")
        print("2. Check for missed Rundown emails")
        print("3. Update memory file with status")
    else:
        print("❌ TEST FAILED: Check credentials and settings")
        print("\nTroubleshooting:")
        print("1. Verify app password at: https://myaccount.google.com/apppasswords")
        print("2. Ensure 2-Step Verification is enabled")
        print("3. Check if 'Less secure app access' needs enabling")
    print("=" * 60)