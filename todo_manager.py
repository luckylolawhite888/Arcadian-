#!/usr/bin/env python3
"""
Todo Manager with Interactive Buttons for Maya
Allows marking todo items as done via Telegram buttons
"""

import re
import os

TODO_FILE = "/home/node/.openclaw/workspace/todo.md"

def read_todo():
    """Read current todo items"""
    if not os.path.exists(TODO_FILE):
        return []
    
    with open(TODO_FILE, 'r') as f:
        content = f.read()
    
    # Find all unchecked items
    items = []
    lines = content.split('\n')
    for line in lines:
        if '[ ]' in line:
            # Extract the task text
            task = line.replace('[ ]', '').strip()
            if task and not task.startswith('#'):
                items.append(task)
    
    return items

def mark_done(task_text):
    """Mark a specific task as done in the todo file"""
    if not os.path.exists(TODO_FILE):
        return False
    
    with open(TODO_FILE, 'r') as f:
        content = f.read()
    
    # Find and replace [ ] with [x] for this task
    lines = content.split('\n')
    updated = False
    
    for i, line in enumerate(lines):
        if '[ ]' in line and task_text in line:
            lines[i] = line.replace('[ ]', '[x]')
            updated = True
            break
    
    if updated:
        with open(TODO_FILE, 'w') as f:
            f.write('\n'.join(lines))
        return True
    
    return False

def create_button_message():
    """Create a message with buttons for current todo items"""
    items = read_todo()
    
    if not items:
        return "🎉 Your todo list is empty! Nothing to mark as done."
    
    message = "📋 **Mark Todo Items as Done:**\n\n"
    for i, item in enumerate(items[:10]):  # Limit to 10 items for buttons
        message += f"{i+1}. {item}\n"
    
    message += "\nClick a button below to mark it as done:"
    
    return message

def create_buttons():
    """Create button data for Telegram"""
    items = read_todo()
    
    if not items:
        return []
    
    # Create buttons (max 10 due to Telegram limits)
    buttons = []
    for i, item in enumerate(items[:10]):
        # Shorten long item text for button label
        label = item[:30] + "..." if len(item) > 30 else item
        buttons.append([{
            "text": f"✅ {i+1}. {label}",
            "callback_data": f"todo_done_{i}"
        }])
    
    return buttons

if __name__ == "__main__":
    # Test the functions
    print("Current todo items:")
    items = read_todo()
    for i, item in enumerate(items):
        print(f"{i+1}. {item}")
    
    print("\nButton message:")
    print(create_button_message())