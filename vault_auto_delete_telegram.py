#!/usr/bin/env python3
"""
Telegram auto-delete implementation for vault responses.
This handles the 60-second self-destruct for sensitive information.
"""

import asyncio
import time
import threading
from datetime import datetime

class TelegramAutoDelete:
    """Manages auto-deletion of sensitive vault responses in Telegram"""
    
    def __init__(self):
        self.pending_deletions = {}
        self.lock = threading.Lock()
    
    def schedule_deletion(self, message_info, delay_seconds=60):
        """
        Schedule a message for deletion
        message_info should contain: message_id, chat_id, etc.
        """
        with self.lock:
            deletion_time = time.time() + delay_seconds
            key = f"{message_info.get('chat_id')}:{message_info.get('message_id')}"
            self.pending_deletions[key] = {
                "delete_at": deletion_time,
                "info": message_info,
                "scheduled": datetime.fromtimestamp(deletion_time).isoformat()
            }
        
        # Start background thread to check deletions
        self._start_check_thread()
        return deletion_time
    
    def _start_check_thread(self):
        """Start background thread to check for pending deletions"""
        if not hasattr(self, '_check_thread') or not self._check_thread.is_alive():
            self._check_thread = threading.Thread(target=self._check_deletions, daemon=True)
            self._check_thread.start()
    
    def _check_deletions(self):
        """Background thread to check and process deletions"""
        while True:
            time.sleep(1)  # Check every second
            self.process_pending_deletions()
    
    def process_pending_deletions(self):
        """Check and process messages ready for deletion"""
        now = time.time()
        to_delete = []
        
        with self.lock:
            for key, data in list(self.pending_deletions.items()):
                if now >= data["delete_at"]:
                    to_delete.append((key, data["info"]))
                    del self.pending_deletions[key]
        
        # Process deletions (in a real implementation, this would call Telegram API)
        for key, info in to_delete:
            self._delete_message(info)
    
    def _delete_message(self, message_info):
        """Delete a message (placeholder for Telegram API call)"""
        # In a real implementation, this would call:
        # bot.delete_message(chat_id=message_info['chat_id'], message_id=message_info['message_id'])
        
        print(f"🗑️ [AUTO-DELETE] Deleting message {message_info.get('message_id')} "
              f"from chat {message_info.get('chat_id')}")
        
        # Log the deletion
        self._log_deletion(message_info)
    
    def _log_deletion(self, message_info):
        """Log the deletion event"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": "auto_delete",
            "message_id": message_info.get('message_id'),
            "chat_id": message_info.get('chat_id'),
            "item_type": message_info.get('item_type', 'unknown')
        }
        
        # In a real implementation, log to file or database
        print(f"📝 [LOG] {log_entry}")
    
    def cancel_deletion(self, chat_id, message_id):
        """Cancel a scheduled deletion"""
        with self.lock:
            key = f"{chat_id}:{message_id}"
            if key in self.pending_deletions:
                del self.pending_deletions[key]
                return True
        return False
    
    def get_status(self):
        """Get status of pending deletions"""
        with self.lock:
            now = time.time()
            status = {
                "pending_count": len(self.pending_deletions),
                "pending": []
            }
            
            for key, data in self.pending_deletions.items():
                seconds_remaining = max(0, data["delete_at"] - now)
                status["pending"].append({
                    "key": key,
                    "delete_at": data["scheduled"],
                    "seconds_remaining": round(seconds_remaining, 1),
                    "message_info": data["info"]
                })
            
            return status
    
    def simulate_message_send(self, chat_id="telegram:1523950034", item_type="password"):
        """Simulate sending a message and scheduling deletion (for testing)"""
        import random
        message_id = random.randint(1000, 9999)
        
        message_info = {
            "chat_id": chat_id,
            "message_id": message_id,
            "item_type": item_type,
            "sent_at": datetime.utcnow().isoformat()
        }
        
        delete_time = self.schedule_deletion(message_info, 10)  # 10 seconds for testing
        print(f"✅ Simulated message {message_id} sent to {chat_id}")
        print(f"⏰ Scheduled for deletion at {datetime.fromtimestamp(delete_time)}")
        
        return message_info


# Global instance
telegram_auto_delete = TelegramAutoDelete()

def get_telegram_auto_delete():
    """Get the global Telegram auto-delete manager"""
    return telegram_auto_delete

def test_auto_delete():
    """Test the auto-delete system"""
    print("🧪 Testing Telegram Auto-Delete System...")
    
    manager = get_telegram_auto_delete()
    
    # Simulate sending 3 messages
    messages = []
    for i in range(3):
        msg = manager.simulate_message_send(item_type=f"password_{i}")
        messages.append(msg)
        time.sleep(1)
    
    # Check initial status
    status = manager.get_status()
    print(f"\n📊 Initial status: {status['pending_count']} pending deletions")
    
    # Wait for deletions to process
    print("\n⏳ Waiting 15 seconds for deletions to process...")
    time.sleep(15)
    
    # Check final status
    status = manager.get_status()
    print(f"\n📊 Final status: {status['pending_count']} pending deletions")
    
    if status['pending_count'] == 0:
        print("✅ All messages auto-deleted successfully!")
    else:
        print(f"⚠️ {status['pending_count']} messages still pending")

if __name__ == "__main__":
    test_auto_delete()