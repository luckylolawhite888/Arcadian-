#!/usr/bin/env python3
"""
Notion Integration for Lola
This script will sync between Notion databases and local workspace files.
"""

import json
import os
from datetime import datetime

# Load credentials
CREDS_FILE = "/home/node/.openclaw/workspace/notion_credentials.json"
TODO_FILE = "/home/node/.openclaw/workspace/todo.md"
SHOPPING_FILE = "/home/node/.openclaw/workspace/shopping.md"

def load_credentials():
    """Load Notion credentials"""
    with open(CREDS_FILE, 'r') as f:
        return json.load(f)

def check_files():
    """Check if workspace files exist"""
    print("📁 Checking workspace files...")
    
    files = {
        "todo.md": TODO_FILE,
        "shopping.md": SHOPPING_FILE,
        "notion_credentials.json": CREDS_FILE
    }
    
    for name, path in files.items():
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"  ✅ {name}: {size} bytes")
        else:
            print(f"  ❌ {name}: Missing")
    
    return all(os.path.exists(path) for path in [TODO_FILE, SHOPPING_FILE, CREDS_FILE])

def read_todo_file():
    """Read and parse todo.md"""
    if not os.path.exists(TODO_FILE):
        return []
    
    todos = []
    with open(TODO_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                # Simple parsing - can be enhanced
                todos.append({
                    "task": line,
                    "status": "Todo",
                    "added": datetime.now().isoformat()
                })
    
    print(f"  📝 Found {len(todos)} todos in todo.md")
    return todos

def read_shopping_file():
    """Read and parse shopping.md"""
    if not os.path.exists(SHOPPING_FILE):
        return []
    
    items = []
    with open(SHOPPING_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                # Simple parsing - can be enhanced
                items.append({
                    "item": line,
                    "quantity": 1,
                    "purchased": False,
                    "added": datetime.now().isoformat()
                })
    
    print(f"  🛒 Found {len(items)} items in shopping.md")
    return items

def create_notion_payloads(todos, shopping_items):
    """Create Notion API payloads for syncing"""
    
    # Todo payloads
    todo_payloads = []
    for todo in todos:
        payload = {
            "parent": {"database_id": "TODO_DATABASE_ID_HERE"},
            "properties": {
                "Task": {
                    "title": [
                        {
                            "text": {
                                "content": todo["task"]
                            }
                        }
                    ]
                },
                "Status": {
                    "select": {
                        "name": todo["status"]
                    }
                }
            }
        }
        todo_payloads.append(payload)
    
    # Shopping payloads
    shopping_payloads = []
    for item in shopping_items:
        payload = {
            "parent": {"database_id": "SHOPPING_DATABASE_ID_HERE"},
            "properties": {
                "Item": {
                    "title": [
                        {
                            "text": {
                                "content": item["item"]
                            }
                        }
                    ]
                },
                "Quantity": {
                    "number": item["quantity"]
                },
                "Purchased": {
                    "checkbox": item["purchased"]
                }
            }
        }
        shopping_payloads.append(payload)
    
    return {
        "todos": todo_payloads,
        "shopping": shopping_payloads
    }

def generate_sample_data():
    """Generate sample data for testing"""
    print("\n🎨 Generating sample data...")
    
    sample_todos = [
        {"task": "Set up Notion integration", "status": "In Progress"},
        {"task": "Test morning briefing delivery", "status": "Todo"},
        {"task": "Configure SMS Works API", "status": "Todo"}
    ]
    
    sample_shopping = [
        {"item": "Milk", "quantity": 1, "purchased": False},
        {"item": "Bread", "quantity": 1, "purchased": False},
        {"item": "Coffee", "quantity": 1, "purchased": True}
    ]
    
    return sample_todos, sample_shopping

def main():
    print("🚀 Lola Notion Integration Setup")
    print("=" * 50)
    
    # Check files
    if not check_files():
        print("\n⚠️  Some files are missing. Please check the setup.")
        return
    
    # Load credentials
    creds = load_credentials()
    print(f"\n🔑 Credentials loaded:")
    print(f"   Bot: {creds['notion']['bot_name']}")
    print(f"   Workspace: {creds['notion']['workspace_name']}")
    
    # Read existing data
    print("\n📊 Reading existing data...")
    todos = read_todo_file()
    shopping = read_shopping_file()
    
    # If no data, use samples
    if not todos and not shopping:
        print("  No data found. Using sample data for demonstration.")
        todos, shopping = generate_sample_data()
    
    # Create payloads
    payloads = create_notion_payloads(todos, shopping)
    
    print(f"\n📦 Created payloads:")
    print(f"   {len(payloads['todos'])} todo items")
    print(f"   {len(payloads['shopping'])} shopping items")
    
    print("\n📋 Next steps:")
    print("1. Share 'Lola central' page with 'Lola AI Assistant'")
    print("2. Create databases in Notion (see NOTION_SETUP_GUIDE.md)")
    print("3. Share databases with the bot")
    print("4. Send me the database IDs")
    print("5. I'll update this script with real IDs and run the sync")
    
    # Save sample payload for reference
    with open("/home/node/.openclaw/workspace/notion_sample_payloads.json", "w") as f:
        json.dump(payloads, f, indent=2)
    
    print("\n💾 Sample payloads saved to notion_sample_payloads.json")

if __name__ == "__main__":
    main()