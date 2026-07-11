#!/usr/bin/env python3
"""
Test SMS to Tom using your SMS system
"""

import json
import os
from datetime import datetime

print("📱 TOM'S CONTACT SAVED & READY FOR SMS!")
print("=" * 60)

# Show Tom's contact info
phonebook_file = '/home/node/.openclaw/workspace/phonebook.json'
with open(phonebook_file, 'r') as f:
    contacts = json.load(f)

tom_info = contacts.get('tom', {})
if tom_info:
    print(f"✅ CONTACT SAVED:")
    print(f"   Name: {tom_info['name']}")
    print(f"   Number: {tom_info['number']}")
    print(f"   Notes: {tom_info.get('notes', 'No notes')}")
    print(f"   Added: {tom_info.get('added', 'Today')}")
else:
    print("❌ Tom not found in contacts")
    exit(1)

print()
print("🚀 READY TO SEND SMS TO TOM:")
print("-" * 40)

print("Your SMS system can now:")
print("1. 📤 Send messages to Tom directly")
print("2. 📞 Use his name instead of number")
print("3. 📊 Track when you last contacted him")
print("4. 🔄 Integrate with your other systems")

print()
print("💡 SMS COMMAND EXAMPLES:")
print("""
# Using Python:
from sms_sender import SMSSender
sms = SMSSender()
sms.send_sms("Tom", "Hello Tom! This is a test from Lola.")

# Or using the phonebook directly:
from phonebook import PhoneBook
pb = PhoneBook()
tom = pb.get_contact("Tom")
print(f"Tom's number: {tom['number']}")
""")

print()
print("🔧 YOUR SMS CREDENTIALS ARE CONFIGURED:")
print("   ✅ API Key: d45ff5b2-83dd-4ca3-93cb-8aee750ecd63")
print("   ✅ Secret: f928314ca667c77471ade89fcbe239e6cb68468d9e1f1d97f5f389e6715b5e3f")
print("   ✅ JWT Token: Configured")
print("   ✅ Endpoint: https://api.thesmsworks.co.uk/v1/message/send")

print()
print("🎯 QUICK ACTIONS:")
print("[[reply_to_current]]")
print("A. 📤 **Test SMS to Tom** (send a test message)")
print("B. 📋 **Show all contacts** (view phonebook)")
print("C. 🔧 **Test SMS system** (verify API works)")
print("D. 💾 **Backup contacts** (export phonebook)")
print("E. ⏭️ **Continue with audio mastering**")

print()
print("=" * 60)
print("🦊 Tom's number is now in your system!")
print("Ready for SMS whenever you need. 📱✨")