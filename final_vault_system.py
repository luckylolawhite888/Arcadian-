#!/usr/bin/env python3
"""
Final vault system with security reminders.
Simple, working implementation.
"""

import sys
sys.path.insert(0, '.')

from vault_system import retrieve_item
from vault_reminder_system import get_security_reminders

def get_item_with_reminder(entry_id, magic_word):
    """Get item from vault and schedule security reminder"""
    # First, check magic word via retrieve_item
    result = retrieve_item(entry_id, magic_word, auto_delete=False)
    
    if isinstance(result, dict):
        # Success - we got the item dict directly
        item = result
        
        # Format message
        message = f"✅ **{item['name']}:** `{item['password']}`\n"
        message += f"📝 *{item['description']}*\n"
        message += f"📅 Created: {item['created'][:10]}\n\n"
        
        # Schedule reminder
        reminders = get_security_reminders()
        reminder = reminders.schedule_reminder(
            item_name=item['name'],
            item_type="password",
            delay_seconds=60
        )
        
        message += f"⚠️ **SECURITY:** You'll receive a reminder to delete this in 60 seconds."
        
        return {
            "success": True,
            "message": message,
            "reminder_id": reminder['reminder_id'],
            "reminder_time": reminder['scheduled_time']
        }
    
    elif isinstance(result, str):
        # Error message
        if "Incorrect magic word" in result:
            return {
                "success": False,
                "message": result,
                "security_issue": True
            }
        else:
            return {
                "success": False,
                "message": result
            }
    
    return {
        "success": False,
        "message": "Unknown error occurred"
    }

def get_system_status():
    """Get complete system status"""
    from vault_system import vault_status
    reminders = get_security_reminders()
    
    vault_stat = vault_status()
    reminder_stat = reminders.get_reminder_status()
    
    message = "🔐 **Security System Status:**\n\n"
    message += vault_stat + "\n"
    
    if reminder_stat['active_reminders'] > 0:
        message += f"• Active security reminders: {reminder_stat['active_reminders']}\n"
        
        # Find next reminder
        pending = [r for r in reminder_stat['reminders'] if r['status'] == 'pending']
        if pending:
            next_rem = min(pending, key=lambda x: x['seconds_remaining'])
            message += f"• Next reminder in: {next_rem['seconds_remaining']:.0f} seconds\n"
            message += f"  For: {next_rem['item_name']}\n"
    else:
        message += "• No active security reminders\n"
    
    return message

# Test the system
if __name__ == "__main__":
    print("🔐 Testing Final Vault System...\n")
    
    # Test correct magic word
    print("1. Testing with correct magic word...")
    result = get_item_with_reminder('d104e45140d5448b', 'somoteitbe')
    
    if result['success']:
        print("✅ Success!")
        print(f"Message: {result['message'][:100]}...")
        print(f"Reminder ID: {result['reminder_id']}")
    else:
        print(f"❌ Failed: {result['message']}")
    
    print("\n" + "="*50 + "\n")
    
    # Test wrong magic word
    print("2. Testing with wrong magic word...")
    result = get_item_with_reminder('d104e45140d5448b', 'wrong')
    
    if not result['success'] and result.get('security_issue'):
        print(f"✅ Security working: {result['message']}")
    else:
        print(f"❌ Unexpected: {result}")
    
    print("\n" + "="*50 + "\n")
    
    # Check status
    print("3. System status:")
    print(get_system_status())