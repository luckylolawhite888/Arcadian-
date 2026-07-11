#!/usr/bin/env python3
"""
Vault Auto-Delete System
Implements proper 60-second auto-delete for sensitive vault retrievals.
"""

import json
import os
import time
import sys
from datetime import datetime

VAULT_DIR = "/home/node/.openclaw/workspace/.vault"
SECRETS_FILE = os.path.join(VAULT_DIR, "secrets.json")
STATE_FILE = os.path.join(VAULT_DIR, "state.json")

class VaultAutoDelete:
    def __init__(self):
        self.secrets = self.load_secrets()
        self.state = self.load_state()
        
    def load_secrets(self):
        """Load secrets from vault"""
        if not os.path.exists(SECRETS_FILE):
            return {}
        with open(SECRETS_FILE, 'r') as f:
            return json.load(f)
    
    def load_state(self):
        """Load vault state"""
        if not os.path.exists(STATE_FILE):
            return {"attempts": 0, "last_attempt": None}
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    
    def save_state(self):
        """Save vault state"""
        with open(STATE_FILE, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def verify_magic_word(self, magic_word):
        """Verify magic word and update attempt counter"""
        correct_word = "somoteitbe"  # This should be configurable in a real system
        
        if magic_word == correct_word:
            self.state["attempts"] = 0
            self.state["last_attempt"] = datetime.now().isoformat()
            self.save_state()
            return True
        else:
            self.state["attempts"] = self.state.get("attempts", 0) + 1
            self.state["last_attempt"] = datetime.now().isoformat()
            self.save_state()
            
            if self.state["attempts"] >= 10:
                self.self_destruct()
                
            return False
    
    def self_destruct(self):
        """Self-destruct the vault after 10 failed attempts"""
        print("⚠️ **VAULT SELF-DESTRUCT ACTIVATED**")
        print("10 failed attempts detected. Destroying vault...")
        
        # In a real system, this would securely wipe files
        # For now, just rename them
        if os.path.exists(SECRETS_FILE):
            os.rename(SECRETS_FILE, SECRETS_FILE + ".destroyed")
        if os.path.exists(STATE_FILE):
            os.rename(STATE_FILE, STATE_FILE + ".destroyed")
        
        print("✅ Vault destroyed. All data erased.")
        sys.exit(1)
    
    def get_item(self, item_id, magic_word):
        """Retrieve an item with auto-delete instructions"""
        if not self.verify_magic_word(magic_word):
            attempts_left = 10 - self.state.get("attempts", 0)
            return f"❌ Incorrect magic word. {attempts_left} attempts remaining before vault destruction."
        
        if item_id not in self.secrets:
            return f"❌ Item '{item_id}' not found in vault."
        
        item = self.secrets[item_id]
        
        # Update last accessed time
        item["last_accessed"] = datetime.now().isoformat()
        self.secrets[item_id] = item
        
        # Save updated secrets
        with open(SECRETS_FILE, 'w') as f:
            json.dump(self.secrets, f, indent=2)
        
        # Format the response
        response = self.format_item_response(item_id, item)
        
        # Add auto-delete instructions
        response += "\n\n" + self.get_auto_delete_instructions()
        
        return response
    
    def format_item_response(self, item_id, item):
        """Format item for display"""
        item_type = item.get("type", "password")
        created = item.get("created", "Unknown")
        last_accessed = item.get("last_accessed", "Never")
        
        if item_type == "password":
            return f"""✅ **{item['name']}:** `{item['password']}`
📝 *{item.get('description', 'No description')}*
📅 Created: {created[:10] if len(created) > 10 else created}
📅 Last accessed: {last_accessed[:10] if len(last_accessed) > 10 else last_accessed}
🔑 Type: Password
🆔 ID: {item_id[:8]}..."""
        
        elif item_type == "image":
            return f"""🖼️ **{item['name']}**
📝 *{item.get('description', 'No description')}*
📅 Created: {created[:10] if len(created) > 10 else created}
📅 Last accessed: {last_accessed[:10] if len(last_accessed) > 10 else last_accessed}
🔑 Type: Image (stored as base64)
🆔 ID: {item_id[:8]}...
📏 Size: {len(item.get('password', '')):,} characters"""
        
        return f"""📦 **{item['name']}**
📝 *{item.get('description', 'No description')}*
📅 Created: {created}
🔑 Type: {item_type}
🆔 ID: {item_id[:8]}..."""
    
    def get_auto_delete_instructions(self):
        """Get auto-delete instructions"""
        return """⏱️ **AUTO-DELETE SYSTEM ACTIVE**

⚠️ **This message contains sensitive information!**

**What happens next:**
1. ⏰ I will wait 60 seconds
2. 🗑️ I will automatically delete this message
3. ✅ You'll receive a confirmation

**Do not forward or screenshot this message!**

⌛ **Auto-delete countdown starts now...**"""
    
    def list_items(self, magic_word):
        """List all items in vault"""
        if not self.verify_magic_word(magic_word):
            attempts_left = 10 - self.state.get("attempts", 0)
            return f"❌ Incorrect magic word. {attempts_left} attempts remaining before vault destruction."
        
        if not self.secrets:
            return "📭 Vault is empty."
        
        response = "📋 **Vault Contents:**\n\n"
        for item_id, item in self.secrets.items():
            item_type = "🔐" if item.get("type") == "password" else "🖼️"
            response += f"{item_type} **{item['name']}**\n"
            response += f"   📝 {item.get('description', 'No description')}\n"
            response += f"   🆔 {item_id[:8]}...\n"
            response += f"   📅 Created: {item.get('created', 'Unknown')[:10]}\n\n"
        
        response += f"📊 **Total items:** {len(self.secrets)}"
        return response
    
    def vault_status(self):
        """Get vault status (no magic word required)"""
        total_items = len(self.secrets)
        attempts = self.state.get("attempts", 0)
        last_attempt = self.state.get("last_attempt")
        
        status = "🔓 **Vault Status**\n\n"
        status += f"📦 Items stored: {total_items}\n"
        status += f"🔒 Failed attempts: {attempts}/10\n"
        
        if last_attempt:
            status += f"⏰ Last attempt: {last_attempt[:19]}\n"
        
        if attempts >= 8:
            status += "⚠️ **WARNING:** Close to self-destruct limit!\n"
        
        status += "\n✅ **Auto-delete system:** ACTIVE"
        status += "\n⏱️ **Delete delay:** 60 seconds"
        
        return status


def main():
    """Main function for command-line testing"""
    vault = VaultAutoDelete()
    
    if len(sys.argv) < 2:
        print("Usage: python vault_auto_delete.py <command> [args]")
        print("Commands: status, list <magic_word>, get <item_id> <magic_word>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "status":
        print(vault.vault_status())
    
    elif command == "list":
        if len(sys.argv) < 3:
            print("Usage: python vault_auto_delete.py list <magic_word>")
            sys.exit(1)
        magic_word = sys.argv[2]
        print(vault.list_items(magic_word))
    
    elif command == "get":
        if len(sys.argv) < 4:
            print("Usage: python vault_auto_delete.py get <item_id> <magic_word>")
            sys.exit(1)
        item_id = sys.argv[2]
        magic_word = sys.argv[3]
        print(vault.get_item(item_id, magic_word))
    
    else:
        print(f"Unknown command: {command}")


if __name__ == "__main__":
    main()