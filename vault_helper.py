#!/usr/bin/env python3
"""
Vault Helper - Integration between chat and vault auto-delete system
"""

import subprocess
import sys
import time

def get_vault_item(item_id, magic_word):
    """Get item from vault with auto-delete"""
    try:
        # Run the vault auto-delete script
        result = subprocess.run(
            ['python3', '/home/node/.openclaw/workspace/vault_auto_delete.py', 
             'get', item_id, magic_word],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            return f"❌ Error accessing vault: {result.stderr}"
        
        return result.stdout.strip()
        
    except subprocess.TimeoutExpired:
        return "❌ Vault access timeout. Please try again."
    except Exception as e:
        return f"❌ System error: {str(e)}"

def list_vault_items(magic_word):
    """List all items in vault"""
    try:
        result = subprocess.run(
            ['python3', '/home/node/.openclaw/workspace/vault_auto_delete.py', 
             'list', magic_word],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            return f"❌ Error listing vault: {result.stderr}"
        
        return result.stdout.strip()
        
    except subprocess.TimeoutExpired:
        return "❌ Vault access timeout. Please try again."
    except Exception as e:
        return f"❌ System error: {str(e)}"

def get_vault_status():
    """Get vault status"""
    try:
        result = subprocess.run(
            ['python3', '/home/node/.openclaw/workspace/vault_auto_delete.py', 
             'status'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            return f"❌ Error getting vault status: {result.stderr}"
        
        return result.stdout.strip()
        
    except subprocess.TimeoutExpired:
        return "❌ Vault status timeout. Please try again."
    except Exception as e:
        return f"❌ System error: {str(e)}"

if __name__ == "__main__":
    # Simple command-line interface for testing
    if len(sys.argv) < 2:
        print("Usage: python vault_helper.py <command> [args]")
        print("Commands: status, list <magic_word>, get <item_id> <magic_word>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "status":
        print(get_vault_status())
    
    elif command == "list":
        if len(sys.argv) < 3:
            print("Usage: python vault_helper.py list <magic_word>")
            sys.exit(1)
        magic_word = sys.argv[2]
        print(list_vault_items(magic_word))
    
    elif command == "get":
        if len(sys.argv) < 4:
            print("Usage: python vault_helper.py get <item_id> <magic_word>")
            sys.exit(1)
        item_id = sys.argv[2]
        magic_word = sys.argv[3]
        print(get_vault_item(item_id, magic_word))
    
    else:
        print(f"Unknown command: {command}")