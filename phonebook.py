#!/usr/bin/env python3
"""
Phone Book System for OpenClaw
Store and manage contacts for SMS messaging
"""

import json
import os
import sys
from datetime import datetime

PHONEBOOK_FILE = "/home/node/.openclaw/workspace/phonebook.json"

class PhoneBook:
    def __init__(self):
        self.contacts = self.load_contacts()
    
    def load_contacts(self):
        """Load contacts from JSON file"""
        if os.path.exists(PHONEBOOK_FILE):
            try:
                with open(PHONEBOOK_FILE, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def save_contacts(self):
        """Save contacts to JSON file"""
        with open(PHONEBOOK_FILE, 'w') as f:
            json.dump(self.contacts, f, indent=2)
    
    def add_contact(self, name, number, notes=""):
        """Add a new contact"""
        # Clean the number (remove spaces, dashes, etc.)
        clean_number = ''.join(c for c in number if c.isdigit() or c == '+')
        
        contact = {
            "name": name,
            "number": clean_number,
            "notes": notes,
            "added": datetime.now().isoformat(),
            "last_contacted": None
        }
        
        self.contacts[name.lower()] = contact
        self.save_contacts()
        return contact
    
    def get_contact(self, name):
        """Get contact by name"""
        return self.contacts.get(name.lower())
    
    def search_contacts(self, search_term):
        """Search contacts by name or number"""
        search_term = search_term.lower()
        results = []
        
        for contact in self.contacts.values():
            if (search_term in contact["name"].lower() or 
                search_term in contact["number"] or
                search_term in contact.get("notes", "").lower()):
                results.append(contact)
        
        return results
    
    def list_contacts(self):
        """List all contacts"""
        return list(self.contacts.values())
    
    def update_last_contacted(self, name):
        """Update last contacted timestamp"""
        contact = self.get_contact(name)
        if contact:
            contact["last_contacted"] = datetime.now().isoformat()
            self.save_contacts()
            return True
        return False
    
    def delete_contact(self, name):
        """Delete a contact"""
        if name.lower() in self.contacts:
            del self.contacts[name.lower()]
            self.save_contacts()
            return True
        return False
    
    def format_contact(self, contact):
        """Format contact for display"""
        last_contacted = contact.get("last_contacted")
        if last_contacted:
            last_contacted = datetime.fromisoformat(last_contacted).strftime("%Y-%m-%d %H:%M")
        
        return f"""**{contact['name']}**
📱 {contact['number']}
📝 {contact.get('notes', 'No notes')}
📅 Added: {datetime.fromisoformat(contact['added']).strftime("%Y-%m-%d")}
{"🕐 Last contacted: " + last_contacted if last_contacted else "⏳ Never contacted"}"""

def main():
    """Command-line interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Phone Book CLI")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Add contact
    add_parser = subparsers.add_parser("add", help="Add a contact")
    add_parser.add_argument("name", help="Contact name")
    add_parser.add_argument("number", help="Phone number")
    add_parser.add_argument("--notes", help="Notes about contact", default="")
    
    # Search contacts
    search_parser = subparsers.add_parser("search", help="Search contacts")
    search_parser.add_argument("query", help="Search term")
    
    # List all
    subparsers.add_parser("list", help="List all contacts")
    
    # Get contact
    get_parser = subparsers.add_parser("get", help="Get contact details")
    get_parser.add_argument("name", help="Contact name")
    
    # Delete contact
    delete_parser = subparsers.add_parser("delete", help="Delete a contact")
    delete_parser.add_argument("name", help="Contact name")
    
    args = parser.parse_args()
    
    phonebook = PhoneBook()
    
    if args.command == "add":
        contact = phonebook.add_contact(args.name, args.number, args.notes)
        print(f"✅ Added contact: {contact['name']} ({contact['number']})")
    
    elif args.command == "search":
        results = phonebook.search_contacts(args.query)
        if results:
            print(f"Found {len(results)} contact(s):")
            for contact in results:
                print(f"\n{phonebook.format_contact(contact)}")
        else:
            print("❌ No contacts found")
    
    elif args.command == "list":
        contacts = phonebook.list_contacts()
        if contacts:
            print(f"📖 Phone Book ({len(contacts)} contacts):")
            for contact in contacts:
                print(f"\n{phonebook.format_contact(contact)}")
        else:
            print("📭 Phone book is empty")
    
    elif args.command == "get":
        contact = phonebook.get_contact(args.name)
        if contact:
            print(phonebook.format_contact(contact))
        else:
            print(f"❌ Contact '{args.name}' not found")
    
    elif args.command == "delete":
        if phonebook.delete_contact(args.name):
            print(f"✅ Deleted contact: {args.name}")
        else:
            print(f"❌ Contact '{args.name}' not found")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()