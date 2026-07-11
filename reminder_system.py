#!/usr/bin/env python3
"""
Simple reminder system for Maya
Stores reminders in JSON file and checks them periodically
"""

import json
import os
import time
from datetime import datetime, timedelta
import subprocess

REMINDER_FILE = "/home/node/.openclaw/workspace/reminders.json"
TIMEZONE = "Europe/London"

def load_reminders():
    """Load reminders from JSON file"""
    if os.path.exists(REMINDER_FILE):
        with open(REMINDER_FILE, 'r') as f:
            return json.load(f)
    return {"reminders": []}

def save_reminders(reminders):
    """Save reminders to JSON file"""
    with open(REMINDER_FILE, 'w') as f:
        json.dump(reminders, f, indent=2)

def add_reminder(task, due_datetime, context=""):
    """Add a new reminder"""
    reminders = load_reminders()
    
    new_reminder = {
        "id": len(reminders["reminders"]) + 1,
        "task": task,
        "due_datetime": due_datetime.isoformat(),
        "context": context,
        "status": "pending",  # pending, triggered, completed, overdue
        "created_at": datetime.now().isoformat(),
        "triggered_at": None,
        "completed_at": None
    }
    
    reminders["reminders"].append(new_reminder)
    save_reminders(reminders)
    
    return new_reminder

def check_reminders():
    """Check for due reminders and trigger them"""
    reminders = load_reminders()
    now = datetime.now()
    triggered = []
    
    for reminder in reminders["reminders"]:
        if reminder["status"] == "pending":
            due_time = datetime.fromisoformat(reminder["due_datetime"])
            
            # Check if reminder is due (within last 5 minutes)
            if now >= due_time and now <= due_time + timedelta(minutes=5):
                # Trigger the reminder
                reminder["status"] = "triggered"
                reminder["triggered_at"] = now.isoformat()
                triggered.append(reminder)
    
    if triggered:
        save_reminders(reminders)
    
    return triggered

def mark_completed(reminder_id):
    """Mark a reminder as completed"""
    reminders = load_reminders()
    
    for reminder in reminders["reminders"]:
        if reminder["id"] == reminder_id:
            reminder["status"] = "completed"
            reminder["completed_at"] = datetime.now().isoformat()
            break
    
    save_reminders(reminders)

def list_reminders(status_filter=None):
    """List all reminders, optionally filtered by status"""
    reminders = load_reminders()
    
    if status_filter:
        return [r for r in reminders["reminders"] if r["status"] == status_filter]
    
    return reminders["reminders"]

def create_telegram_message(reminder):
    """Create a Telegram message for a triggered reminder"""
    due_time = datetime.fromisoformat(reminder["due_datetime"])
    
    message = f"⏰ **REMINDER** ⏰\n\n"
    message += f"**Task:** {reminder['task']}\n"
    message += f"**Due:** {due_time.strftime('%I:%M %p')} ({TIMEZONE})\n"
    
    if reminder.get('context'):
        message += f"**Context:** {reminder['context']}\n"
    
    message += f"\nStatus: ⚠️ **DUE NOW**\n"
    
    return message

if __name__ == "__main__":
    # Example usage
    print("Reminder System")
    print("=" * 50)
    
    # Check for due reminders
    triggered = check_reminders()
    
    if triggered:
        print(f"Triggered {len(triggered)} reminder(s):")
        for reminder in triggered:
            print(f"- {reminder['task']} (ID: {reminder['id']})")
    else:
        print("No reminders due at this time.")
    
    # List all reminders
    print("\nAll reminders:")
    reminders = list_reminders()
    for reminder in reminders:
        status_emoji = {
            "pending": "⏳",
            "triggered": "🔔", 
            "completed": "✅",
            "overdue": "⚠️"
        }.get(reminder["status"], "❓")
        
        due_time = datetime.fromisoformat(reminder["due_datetime"])
        print(f"{status_emoji} [{reminder['id']}] {reminder['task']} - Due: {due_time.strftime('%Y-%m-%d %I:%M %p')}")