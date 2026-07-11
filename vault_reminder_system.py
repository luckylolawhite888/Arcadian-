#!/usr/bin/env python3
"""
Reminder system for vault security.
Sends reminders to delete sensitive messages after 60 seconds.
"""

import time
import threading
from datetime import datetime, timedelta

class SecurityReminderSystem:
    """Manages security reminders for sensitive vault information"""
    
    def __init__(self):
        self.active_reminders = {}
        self.reminder_lock = threading.Lock()
        self.reminder_thread = None
    
    def schedule_reminder(self, item_name, item_type="password", delay_seconds=60):
        """
        Schedule a security reminder
        Returns reminder ID and scheduled time
        """
        reminder_id = f"rem_{int(time.time())}_{hash(item_name) % 10000:04d}"
        reminder_time = datetime.utcnow() + timedelta(seconds=delay_seconds)
        
        with self.reminder_lock:
            self.active_reminders[reminder_id] = {
                "item_name": item_name,
                "item_type": item_type,
                "scheduled_time": reminder_time,
                "created": datetime.utcnow(),
                "delay_seconds": delay_seconds,
                "status": "pending"
            }
        
        # Start reminder thread if not running
        self._ensure_reminder_thread()
        
        return {
            "reminder_id": reminder_id,
            "scheduled_time": reminder_time.isoformat(),
            "seconds_remaining": delay_seconds,
            "message": f"⏰ Security reminder scheduled for {delay_seconds} seconds from now."
        }
    
    def _ensure_reminder_thread(self):
        """Start the reminder checking thread if not already running"""
        if self.reminder_thread is None or not self.reminder_thread.is_alive():
            self.reminder_thread = threading.Thread(target=self._check_reminders, daemon=True)
            self.reminder_thread.start()
    
    def _check_reminders(self):
        """Background thread to check and trigger reminders"""
        while True:
            time.sleep(1)  # Check every second
            
            now = datetime.utcnow()
            reminders_to_trigger = []
            
            with self.reminder_lock:
                for reminder_id, reminder in list(self.active_reminders.items()):
                    if now >= reminder["scheduled_time"] and reminder["status"] == "pending":
                        reminders_to_trigger.append((reminder_id, reminder))
                        reminder["status"] = "triggered"
            
            # Trigger reminders outside the lock
            for reminder_id, reminder in reminders_to_trigger:
                self._trigger_reminder(reminder_id, reminder)
    
    def _trigger_reminder(self, reminder_id, reminder):
        """Trigger a reminder (in a real implementation, this would send a message)"""
        item_name = reminder["item_name"]
        item_type = reminder["item_type"]
        delay = reminder["delay_seconds"]
        
        reminder_message = (
            f"🔔 **SECURITY REMINDER**\n\n"
            f"⏰ {delay} seconds have passed since you retrieved:\n"
            f"• **Item:** {item_name}\n"
            f"• **Type:** {item_type}\n\n"
            f"🗑️ **Please delete the sensitive information from the chat now.**\n"
            f"_(This helps prevent accidental exposure of your credentials.)_"
        )
        
        # In a real implementation, this would send a Telegram message
        print(f"[REMINDER TRIGGERED] {reminder_message}")
        
        # Log the reminder
        self._log_reminder(reminder_id, reminder)
    
    def _log_reminder(self, reminder_id, reminder):
        """Log reminder activity"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "reminder_id": reminder_id,
            "action": "security_reminder",
            "item_name": reminder["item_name"],
            "item_type": reminder["item_type"],
            "delay_seconds": reminder["delay_seconds"]
        }
        
        # In a real implementation, log to file
        print(f"[LOG] {log_entry}")
    
    def cancel_reminder(self, reminder_id):
        """Cancel a scheduled reminder"""
        with self.reminder_lock:
            if reminder_id in self.active_reminders:
                del self.active_reminders[reminder_id]
                return True
        return False
    
    def get_reminder_status(self, reminder_id=None):
        """Get status of reminders"""
        with self.reminder_lock:
            if reminder_id:
                if reminder_id in self.active_reminders:
                    reminder = self.active_reminders[reminder_id]
                    now = datetime.utcnow()
                    seconds_remaining = max(0, (reminder["scheduled_time"] - now).total_seconds())
                    
                    return {
                        "reminder_id": reminder_id,
                        "item_name": reminder["item_name"],
                        "status": reminder["status"],
                        "scheduled_time": reminder["scheduled_time"].isoformat(),
                        "seconds_remaining": round(seconds_remaining, 1),
                        "created": reminder["created"].isoformat()
                    }
                return None
            
            # Return all reminders
            now = datetime.utcnow()
            reminders = []
            
            for rid, reminder in self.active_reminders.items():
                seconds_remaining = max(0, (reminder["scheduled_time"] - now).total_seconds())
                reminders.append({
                    "reminder_id": rid,
                    "item_name": reminder["item_name"],
                    "status": reminder["status"],
                    "seconds_remaining": round(seconds_remaining, 1),
                    "scheduled_time": reminder["scheduled_time"].isoformat()
                })
            
            return {
                "total_reminders": len(reminders),
                "active_reminders": len([r for r in reminders if r["status"] == "pending"]),
                "reminders": reminders
            }
    
    def clear_completed_reminders(self):
        """Clear completed reminders from memory"""
        with self.reminder_lock:
            to_remove = [rid for rid, reminder in self.active_reminders.items() 
                        if reminder["status"] == "triggered"]
            for rid in to_remove:
                del self.active_reminders[rid]
            return len(to_remove)


# Global instance
security_reminders = SecurityReminderSystem()

def get_security_reminders():
    """Get the global security reminder system"""
    return security_reminders

def test_reminder_system():
    """Test the reminder system"""
    print("🔔 Testing Security Reminder System...\n")
    
    reminders = get_security_reminders()
    
    # Schedule a test reminder (10 seconds for testing)
    print("1. Scheduling test reminder (10 seconds)...")
    result = reminders.schedule_reminder(
        "DeepSeek API Key",
        "password",
        10  # 10 seconds for testing
    )
    
    print(f"✅ {result['message']}")
    print(f"📋 Reminder ID: {result['reminder_id']}")
    print(f"⏰ Scheduled for: {result['scheduled_time']}\n")
    
    # Check initial status
    print("2. Checking reminder status...")
    status = reminders.get_reminder_status()
    print(f"📊 Total reminders: {status['total_reminders']}")
    print(f"📊 Active reminders: {status['active_reminders']}")
    
    for reminder in status['reminders']:
        print(f"   • {reminder['item_name']}: {reminder['seconds_remaining']}s remaining\n")
    
    # Wait for reminder to trigger
    print("3. Waiting 12 seconds for reminder to trigger...")
    time.sleep(12)
    
    # Check final status
    print("\n4. Checking final status...")
    status = reminders.get_reminder_status()
    print(f"📊 Total reminders: {status['total_reminders']}")
    print(f"📊 Active reminders: {status['active_reminders']}")
    
    # Clear completed reminders
    cleared = reminders.clear_completed_reminders()
    print(f"🗑️ Cleared {cleared} completed reminders")
    
    final_status = reminders.get_reminder_status()
    print(f"📊 Final count: {final_status['total_reminders']} reminders remaining")
    
    print("\n✅ Reminder system tested successfully!")

if __name__ == "__main__":
    test_reminder_system()