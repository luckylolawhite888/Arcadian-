#!/usr/bin/env python3
"""
Mark todo items as done by number
Usage: python3 mark_done.py 1  (marks item 1 as done)
"""

import sys
import os

TODO_FILE = "/home/node/.openclaw/workspace/todo.md"

def list_todos():
    """List all todo items with numbers"""
    if not os.path.exists(TODO_FILE):
        print("No todo file found!")
        return []
    
    with open(TODO_FILE, 'r') as f:
        content = f.read()
    
    items = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if '[ ]' in line:
            task = line.replace('[ ]', '').strip()
            if task and not task.startswith('#'):
                items.append((i, line, task))
    
    return items

def mark_done(item_number):
    """Mark a todo item as done by its number (1-based)"""
    items = list_todos()
    
    if not items:
        print("No todo items found!")
        return False
    
    if item_number < 1 or item_number > len(items):
        print(f"Invalid item number. Choose between 1 and {len(items)}")
        return False
    
    # Get the line index
    line_index, old_line, task = items[item_number - 1]
    
    # Read the file
    with open(TODO_FILE, 'r') as f:
        lines = f.readlines()
    
    # Update the line
    lines[line_index] = lines[line_index].replace('[ ]', '[x]')
    
    # Write back
    with open(TODO_FILE, 'w') as f:
        f.writelines(lines)
    
    print(f"✅ Marked as done: {task}")
    return True

if __name__ == "__main__":
    # Show current todos
    items = list_todos()
    
    if not items:
        print("🎉 Your todo list is empty!")
        sys.exit(0)
    
    print("📋 Current Todo Items:")
    for i, (_, _, task) in enumerate(items):
        print(f"{i+1}. {task}")
    
    print("\nTo mark an item as done, run:")
    print("  python3 mark_done.py <number>")
    print("\nExample: python3 mark_done.py 1")
    
    # If argument provided, mark it as done
    if len(sys.argv) > 1:
        try:
            item_num = int(sys.argv[1])
            mark_done(item_num)
        except ValueError:
            print("Please provide a number")
        except Exception as e:
            print(f"Error: {e}")