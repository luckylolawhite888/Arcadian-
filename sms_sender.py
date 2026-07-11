#!/usr/bin/env python3
"""
SMS Sender with Phonebook Integration
Send SMS using The SMS Works API with contacts from phonebook
"""

import json
import os
import sys
import subprocess
from phonebook import PhoneBook

class SMSSender:
    """Send SMS using The SMS Works API"""
    
    def __init__(self):
        self.jwt_token = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJkNDVmZjViMi04M2RkLTRjYTMtOTNjYi04YWVlNzUwZWNkNjMiLCJzZWNyZXQiOiJmOTI4MzE0Y2E2NjdjNzc0NzFhZGU4OWZjYmUyMzllNmNiNjg0NjhkOWUxZjFkOTdmNWYzODllNjcxNWI1ZTNmIiwiaWF0IjoxNzc0MjgyODk3LCJleHAiOjI1NjI2ODI4OTd9.ryPQIES-0CkG6fXraFc4m0d9rZkLdioPLk4_gWEd1k8"
        self.api_url = "https://api.thesmsworks.co.uk/v1/message/send"
        self.phonebook = PhoneBook()
    
    def send_sms(self, destination, content, sender="Lola"):
        """Send an SMS message"""
        # Clean destination if it's a phone number
        if not destination.startswith("+"):
            # Assume it's a contact name
            contact = self.phonebook.get_contact(destination)
            if contact:
                destination = contact["number"]
                # Update last contacted timestamp
                self.phonebook.update_last_contacted(destination)
            else:
                return {
                    "success": False,
                    "error": f"Contact '{destination}' not found in phonebook"
                }
        
        # Prepare payload
        payload = {
            "sender": sender,
            "destination": destination,
            "content": content,
            "encoding": "gsm"
        }
        
        # Send via curl (since requests module might not be available)
        curl_cmd = [
            "curl", "-s", "-X", "POST", self.api_url,
            "-H", f"Authorization: {self.jwt_token}",
            "-H", "Content-Type: application/json",
            "-d", json.dumps(payload)
        ]
        
        try:
            result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                response = json.loads(result.stdout) if result.stdout else {}
                
                # If we sent to a contact by name, update last contacted
                if not destination.startswith("+"):
                    self.phonebook.update_last_contacted(destination)
                
                return {
                    "success": True,
                    "response": response,
                    "destination": destination,
                    "message": content[:50] + "..." if len(content) > 50 else content
                }
            else:
                return {
                    "success": False,
                    "error": f"Curl error: {result.stderr}",
                    "destination": destination
                }
                
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Request timeout",
                "destination": destination
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "destination": destination
            }
    
    def send_to_contact(self, contact_name, content, sender="Lola"):
        """Send SMS to a contact by name"""
        contact = self.phonebook.get_contact(contact_name)
        
        if not contact:
            return {
                "success": False,
                "error": f"Contact '{contact_name}' not found"
            }
        
        return self.send_sms(contact["number"], content, sender)
    
    def broadcast(self, contact_names, content, sender="Lola"):
        """Send SMS to multiple contacts"""
        results = []
        
        for name in contact_names:
            contact = self.phonebook.get_contact(name)
            if contact:
                result = self.send_sms(contact["number"], content, sender)
                result["contact"] = name
                results.append(result)
            else:
                results.append({
                    "success": False,
                    "error": f"Contact '{name}' not found",
                    "contact": name
                })
        
        return results

def main():
    """Command-line interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description="SMS Sender CLI")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Send to contact
    send_parser = subparsers.add_parser("send", help="Send SMS to contact")
    send_parser.add_argument("contact", help="Contact name or phone number")
    send_parser.add_argument("message", help="Message text")
    send_parser.add_argument("--sender", default="Lola", help="Sender ID")
    
    # Send to phone number directly
    direct_parser = subparsers.add_parser("direct", help="Send SMS directly to phone number")
    direct_parser.add_argument("number", help="Phone number (with country code)")
    direct_parser.add_argument("message", help="Message text")
    direct_parser.add_argument("--sender", default="Lola", help="Sender ID")
    
    args = parser.parse_args()
    
    sender = SMSSender()
    
    if args.command == "send":
        result = sender.send_to_contact(args.contact, args.message, args.sender)
        print(json.dumps(result, indent=2))
    
    elif args.command == "direct":
        result = sender.send_sms(args.number, args.message, args.sender)
        print(json.dumps(result, indent=2))
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()