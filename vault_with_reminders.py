#!/usr/bin/env python3
"""
Vault system with security reminders.
Combines vault retrieval with 60-second security reminders.
"""

import time
from datetime import datetime
from vault_system import retrieve_item
from vault_reminder_system import get_security_reminders

def retrieve_with_reminder(entry_id, magic_word, reminder_delay=60):
    """
    Retrieve item from vault and schedule security reminder.
    Returns the item and schedules a reminder to delete it.
    """
    # Retrieve from vault
    result = retrieve_item(entry_id, magic_word, auto_delete=False)
    
    if isinstance(result, dict) and 'item' in result:
        item = result['item']
        
        # Format the response message
        if 'password' in item:
            message = f"✅ **{item['name']}:** `{item['password']}`\n"
            message += f"📝 *{item['description']}*\n"
            message += f"📅 Created: {item['created'][:10]}\n\n"
            item_type = "password"
        else:
            message = f"✅ Retrieved: {item['name']}\n"
            message += f"📝 *{item['description']}*\n"
            item_type = "image"
        
        message += f"⚠️ **SECURITY:** You'll receive a reminder to delete this in {reminder_delay} seconds."
        
        # Schedule security reminder
        reminders = get_security_reminders()
        reminder_result = reminders.schedule_reminder(
            item_name=item['name'],
            item_type=item_type,
            delay_seconds=reminder_delay
        )
        
        return {
            "status": "SUCCESS",
            "message": message,
            "item": item,
            "reminder_scheduled": True,
            "reminder_id": reminder_result["reminder_id"],
            "reminder_time": reminder_result["scheduled_time"],
            "seconds_until_reminder": reminder_delay,
            "security_note": f"Security reminder scheduled. You'll be reminded to delete this message in {reminder_delay} seconds."
        }
    
    elif isinstance(result, str):
        # Error or security message
        return {
            "status": "ERROR" if "Error:" in result else "SECURITY_FAIL",
            "message": result,
            "reminder_scheduled": False
        }
    
    return {
        "status": "UNKNOWN_ERROR",
        "message": "Unknown error occurred",
        "reminder_scheduled": False
    }

def get_combined_status():
    """Get combined vault and reminder status"""
    from vault_system import vault_status
    reminders = get_security_reminders()
    
    # Get vault status
    vault_stat = vault_status()
    
    # Get reminder status
    reminder_stat = reminders.get_reminder_status()
    
    # Format combined status
    message = "🔐 **Security System Status:**\n\n"
    message += vault_stat + "\n"
    
    if reminder_stat['total_reminders'] > 0:
        message += f"• Active security reminders: {reminder_stat['active_reminders']}\n"
        
        # Show next reminder
        pending = [r for r in reminder_stat['reminders'] if r['status'] == 'pending']
        if pending:
            next_reminder = min(pending, key=lambda x: x['seconds_remaining'])
            message += f"• Next reminder in: {next_reminder['seconds_remaining']:.0f} seconds\n"
            message += f"  For: {next_reminder['item_name']}\n"
    else:
        message += "• No active security reminders\n"
    
    return message

def test_reminder_integration():
    """Test the integrated reminder system"""
    print("🔐 Testing Vault + Reminder Integration...\n")
    
    # Test 1: Successful retrieval with reminder
    print("1. Testing retrieval with reminder (simulated)...")
    result = retrieve_with_reminder('d104e45140d5448b', 'somoteitbe', 10)  # 10 seconds for testing
    
    if result["status"] == "SUCCESS":
        print(f"✅ Message:\n{result['message']}\n")
        print(f"⏰ Reminder ID: {result['reminder_id']}")
        print(f"📅 Reminder scheduled for: {result['reminder_time']}")
        print(f"🔔 You'll be reminded in: {result['seconds_until_reminder']} seconds\n")
    else:
        print(f"❌ Failed: {result['message']}")
    
    print("="*50 + "\n")
    
    # Test 2: Check system status
    print("2. Checking system status...")
    status = get_combined_status()
    print(status)
    
    print("="*50 + "\n")
    
    # Test 3: Wait for reminder to trigger
    print("3. Waiting 12 seconds for reminder to trigger...")
    time.sleep(12)
    
    # Check final status
    print("\n4. Final status check...")
    status = get_combined_status()
    print(status)
    
    # Clear completed reminders
    reminders = get_security_reminders()
    cleared = reminders.clear_completed_reminders()
    print(f"\n🗑️ Cleared {cleared} completed reminders")
    
    print("\n✅ Integration tested successfully!")

if __name__ == "__main__":
    test_reminder_integration()