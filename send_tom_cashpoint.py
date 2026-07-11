#!/usr/bin/env python3
"""
Send SMS to Tom about cash point
"""

import sys
import os
from datetime import datetime

# Add workspace to path
sys.path.append('/home/node/.openclaw/workspace')

try:
    from sms_sender import SMSSender
    from phonebook import PhoneBook
    
    print("📱 SENDING SMS TO TOM - CASH POINT REMINDER")
    print("=" * 60)
    
    # Initialize
    sms = SMSSender()
    phonebook = PhoneBook()
    
    # Get Tom's contact
    tom_contact = phonebook.get_contact("tom")
    if not tom_contact:
        print("❌ Tom not found in contacts")
        sys.exit(1)
    
    print(f"✅ Contact: {tom_contact['name']} ({tom_contact['number']})")
    
    # Message options
    message_options = [
        "Hey Tom, just checking - did you make it to the cash point?",
        "Tom, reminder about the cash point trip. All good?",
        "Hi Tom, cash point reminder. Need me to transfer anything?",
        "Tom, regarding the cash point - let me know if you need help.",
        "Hey Tom, just following up on the cash point visit. Everything OK?"
    ]
    
    print("\n💬 MESSAGE OPTIONS:")
    for i, msg in enumerate(message_options, 1):
        print(f"{i}. {msg}")
    
    print("\n🎯 SELECTED MESSAGE:")
    selected_message = message_options[0]  # Default to first option
    print(f"\"{selected_message}\"")
    
    print(f"\n📊 MESSAGE DETAILS:")
    print(f"   Length: {len(selected_message)} characters")
    print(f"   To: {tom_contact['name']} ({tom_contact['number']})")
    print(f"   From: Maya")
    print(f"   Time: {datetime.now().strftime('%H:%M')}")
    
    print("\n🚀 READY TO SEND!")
    print("\n[[reply_to_current]]")
    print("A. ✅ **Send this message now**")
    print("B. ✏️ **Customize message first**")
    print("C. ⏰ **Schedule for later**")
    print("D. 📋 **Choose different message**")
    print("E. ⏸️ **Cancel**")
    
    print("\n" + "=" * 60)
    print("🦊 Your SMS system is ready. Choose A to send! 📱")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure sms_sender.py and phonebook.py are in workspace")
except Exception as e:
    print(f"❌ Error: {e}")