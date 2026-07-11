#!/usr/bin/env python3
"""
Gmail IMAP Reader for Lola
Reads emails from luckylolawhite@gmail.com
"""

import imaplib
import email
from email.header import decode_header
import os
from datetime import datetime, timedelta
import html
import re

class GmailReader:
    def __init__(self):
        self.email = "luckylolawhite@gmail.com"
        self.app_password = "dvnx ltjw mhxp iwnt".replace(" ", "")  # Remove spaces
        self.imap_server = "imap.gmail.com"
        self.imap_port = 993
        
    def connect(self):
        """Connect to Gmail IMAP server"""
        try:
            self.mail = imaplib.IMAP4_SSL(self.imap_server, self.imap_port)
            self.mail.login(self.email, self.app_password)
            print("✅ IMAP connection successful")
            return True
        except Exception as e:
            print(f"❌ IMAP connection failed: {e}")
            return False
    
    def get_unread_count(self):
        """Get count of unread emails"""
        try:
            self.mail.select("INBOX")
            status, messages = self.mail.search(None, 'UNSEEN')
            if status == 'OK':
                unread_ids = messages[0].split()
                return len(unread_ids)
            return 0
        except Exception as e:
            print(f"Error getting unread count: {e}")
            return 0
    
    def fetch_recent_emails(self, limit=10, unread_only=False):
        """Fetch recent emails from inbox"""
        emails = []
        
        try:
            # Select inbox
            self.mail.select("INBOX")
            
            # Search for emails
            if unread_only:
                status, messages = self.mail.search(None, 'UNSEEN')
            else:
                status, messages = self.mail.search(None, 'ALL')
            
            if status != 'OK':
                return emails
            
            # Get email IDs
            email_ids = messages[0].split()
            
            # Get most recent emails (reverse order)
            recent_ids = email_ids[-limit:] if len(email_ids) > limit else email_ids
            recent_ids = list(reversed(recent_ids))  # Newest first
            
            for email_id in recent_ids:
                try:
                    # Fetch email
                    status, msg_data = self.mail.fetch(email_id, '(RFC822)')
                    
                    if status != 'OK':
                        continue
                    
                    # Parse email
                    raw_email = msg_data[0][1]
                    msg = email.message_from_bytes(raw_email)
                    
                    # Decode subject
                    subject, encoding = decode_header(msg["Subject"])[0]
                    if isinstance(subject, bytes):
                        subject = subject.decode(encoding if encoding else 'utf-8')
                    
                    # Decode sender
                    from_header = msg.get("From", "")
                    # Simple extraction of sender name/email
                    sender_match = re.search(r'([^<]+)<([^>]+)>', from_header)
                    if sender_match:
                        sender_name = sender_match.group(1).strip()
                        sender_email = sender_match.group(2).strip()
                        sender = f"{sender_name} ({sender_email})"
                    else:
                        sender = from_header
                    
                    # Get date
                    date_str = msg.get("Date", "")
                    
                    # Check if read
                    flags = msg.get("X-GM-LABELS", "")
                    is_unread = '\\Seen' not in str(flags)
                    
                    # Get body preview
                    body_preview = self._extract_body_preview(msg)
                    
                    emails.append({
                        'id': email_id.decode(),
                        'subject': subject,
                        'sender': sender,
                        'date': date_str,
                        'unread': is_unread,
                        'preview': body_preview[:200] + "..." if len(body_preview) > 200 else body_preview
                    })
                    
                except Exception as e:
                    print(f"Error processing email {email_id}: {e}")
                    continue
            
            return emails
            
        except Exception as e:
            print(f"Error fetching emails: {e}")
            return emails
    
    def _extract_body_preview(self, msg):
        """Extract text preview from email body"""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                
                # Skip attachments
                if "attachment" in content_disposition:
                    continue
                
                # Get text/plain or text/html
                if content_type == "text/plain":
                    try:
                        body = part.get_payload(decode=True).decode()
                        return self._clean_text(body)
                    except:
                        pass
                elif content_type == "text/html":
                    try:
                        body = part.get_payload(decode=True).decode()
                        # Strip HTML tags for preview
                        clean = re.sub(r'<[^>]+>', '', body)
                        return self._clean_text(clean)
                    except:
                        pass
        else:
            # Not multipart
            content_type = msg.get_content_type()
            if content_type == "text/plain":
                try:
                    body = msg.get_payload(decode=True).decode()
                    return self._clean_text(body)
                except:
                    pass
        
        return "[No text content]"
    
    def _clean_text(self, text):
        """Clean text for display"""
        # Decode HTML entities
        text = html.unescape(text)
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove email signatures (common patterns)
        text = re.sub(r'--\s*\n.*', '', text, flags=re.DOTALL)
        text = re.sub(r'Sent from my.*', '', text, flags=re.IGNORECASE)
        return text.strip()
    
    def mark_as_read(self, email_id):
        """Mark an email as read"""
        try:
            self.mail.select("INBOX")
            self.mail.store(email_id, '+FLAGS', '\\Seen')
            return True
        except Exception as e:
            print(f"Error marking email as read: {e}")
            return False
    
    def disconnect(self):
        """Close IMAP connection"""
        try:
            self.mail.close()
            self.mail.logout()
        except:
            pass
    
    def get_email_summary(self):
        """Get a summary of inbox status"""
        try:
            self.connect()
            
            unread_count = self.get_unread_count()
            recent_emails = self.fetch_recent_emails(limit=5, unread_only=True)
            
            summary = {
                'unread_count': unread_count,
                'recent_unread': recent_emails
            }
            
            self.disconnect()
            return summary
            
        except Exception as e:
            print(f"Error getting email summary: {e}")
            return {'unread_count': 0, 'recent_unread': []}

# Quick test and display
if __name__ == "__main__":
    print("📧 Gmail Email Reader Test")
    print("=" * 50)
    
    reader = GmailReader()
    
    if reader.connect():
        # Get unread count
        unread = reader.get_unread_count()
        print(f"📬 Unread emails: {unread}")
        
        if unread > 0:
            print(f"\n📋 Recent unread emails:")
            emails = reader.fetch_recent_emails(limit=5, unread_only=True)
            
            for i, email_info in enumerate(emails, 1):
                status = "🆕" if email_info['unread'] else "📭"
                print(f"\n{i}. {status} {email_info['sender']}")
                print(f"   📌 {email_info['subject']}")
                print(f"   🕒 {email_info['date']}")
                print(f"   📝 {email_info['preview']}")
                
                # Mark as read after displaying
                reader.mark_as_read(email_info['id'])
        else:
            print("\n✅ No unread emails.")
        
        reader.disconnect()
        print("\n" + "=" * 50)
        print("✅ Email check complete.")
    else:
        print("❌ Failed to connect to Gmail IMAP.")
        print("\n⚠️ Make sure:")
        print("1. IMAP is enabled in Gmail Settings")
        print("2. App Password is correct")
        print("3. Less secure apps access might need enabling")