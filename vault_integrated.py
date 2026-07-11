#!/usr/bin/env python3
"""
Integrated vault system with Telegram auto-delete.
This combines vault retrieval with automatic message deletion.
"""

import time
from datetime import datetime
from vault_system import retrieve_item
from vault_auto_delete_telegram import get_telegram_auto_delete

def retrieve_with_auto_delete(entry_id, magic_word, chat_id="telegram:1523950034"):
    """
    Retrieve item from vault and schedule auto-delete for the response.
    Returns the message to send and schedules its deletion.
    """
    # Retrieve from vault
    result = retrieve_item(entry_id, magic_word, auto_delete=True)
    
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
        
        message += "⚠️ **SECURITY:** This message will self-destruct in 60 seconds."
        
        # In a real implementation, we would:
        # 1. Send this message via Telegram API
        # 2. Get the message_id from the send response
        # 3. Schedule deletion
        
        # For simulation, we'll create a mock message ID
        import random
        mock_message_id = random.randint(10000, 99999)
        
        # Prepare deletion info
        deletion_info = {
            "chat_id": chat_id,
            "message_id": mock_message_id,
            "item_type": item_type,
            "item_name": item['name'],
            "retrieved_at": datetime.utcnow().isoformat()
        }
        
        # Schedule deletion (60 seconds)
        auto_delete = get_telegram_auto_delete()
        delete_time = auto_delete.schedule_deletion(deletion_info, 60)
        
        # Return both the message and deletion info
        return {
            "status": "SUCCESS",
            "message": message,
            "deletion_scheduled": True,
            "delete_at": datetime.fromtimestamp(delete_time).isoformat(),
            "seconds_remaining": 60,
            "mock_message_id": mock_message_id,  # In real use, this would be actual message_id
            "security_note": "Auto-delete scheduled for 60 seconds from now."
        }
    
    elif isinstance(result, str):
        # Error or security message
        return {
            "status": "ERROR" if "Error:" in result else "SECURITY_FAIL",
            "message": result,
            "deletion_scheduled": False
        }
    
    return {
        "status": "UNKNOWN_ERROR",
        "message": "Unknown error occurred",
        "deletion_scheduled": False
    }

def get_vault_status():
    """Get combined vault and auto-delete status"""
    from vault_system import vault_status
    auto_delete = get_telegram_auto_delete()
    
    # Get vault status
    vault_stat = vault_status()
    
    # Get auto-delete status
    delete_stat = auto_delete.get_status()
    
    return {
        "vault": vault_stat,
        "auto_delete": {
            "pending_deletions": delete_stat["pending_count"],
            "next_deletion_in": min([d["seconds_remaining"] for d in delete_stat["pending"]]) if delete_stat["pending"] else None
        }
    }

def test_integrated_system():
    """Test the integrated system"""
    print("🔐 Testing Integrated Vault + Auto-Delete System...\n")
    
    # Test 1: Successful retrieval with auto-delete
    print("1. Testing successful retrieval...")
    result = retrieve_with_auto_delete('d104e45140d5448b', 'somoteitbe')
    
    if result["status"] == "SUCCESS":
        print(f"✅ Message to send:\n{result['message']}\n")
        print(f"⏰ Auto-delete scheduled for: {result['delete_at']}")
        print(f"📊 Status: {result['status']}")
    else:
        print(f"❌ Failed: {result['message']}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Wrong magic word
    print("2. Testing wrong magic word...")
    result = retrieve_with_auto_delete('d104e45140d5448b', 'wrongword')
    
    if result["status"] == "SECURITY_FAIL":
        print(f"✅ Security check working: {result['message']}")
    else:
        print(f"❌ Unexpected: {result}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 3: System status
    print("3. Checking system status...")
    status = get_vault_status()
    print(f"📊 Vault items: {status['vault']}")
    print(f"📊 Pending deletions: {status['auto_delete']['pending_deletions']}")
    
    # Wait a bit to see auto-delete in action
    print("\n⏳ Waiting 5 seconds to check auto-delete status...")
    time.sleep(5)
    
    status = get_vault_status()
    print(f"📊 Updated - Pending deletions: {status['auto_delete']['pending_deletions']}")
    
    if status['auto_delete']['pending_deletions'] > 0:
        print("✅ Auto-delete system active and tracking messages!")
    else:
        print("⚠️ No pending deletions (might have already processed)")

if __name__ == "__main__":
    test_integrated_system()