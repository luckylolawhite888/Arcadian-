#!/usr/bin/env python3
"""
Lola's Vault Command Interface
Simple commands for the assistant to use.
"""

import sys
sys.path.insert(0, '.')

from vault_system import save_password, save_image, list_vault_items, vault_status
from final_vault_system import get_item_with_reminder, get_system_status
from vault_reminder_system import get_security_reminders

class LolaVaultCommands:
    """Simple command interface for Lola to use"""
    
    @staticmethod
    def save_password_command(name, password, description=""):
        """Save a password"""
        try:
            result = save_password(name, password, description)
            return {
                "type": "response",
                "message": result,
                "action": "save_password"
            }
        except Exception as e:
            return {
                "type": "error",
                "message": f"❌ Error saving password: {str(e)}"
            }
    
    @staticmethod
    def retrieve_item_command(entry_id, magic_word):
        """Retrieve an item with security reminder"""
        try:
            result = get_item_with_reminder(entry_id, magic_word)
            
            if result['success']:
                return {
                    "type": "response",
                    "message": result['message'],
                    "reminder_scheduled": True,
                    "reminder_id": result.get('reminder_id'),
                    "action": "retrieve_item"
                }
            else:
                return {
                    "type": "response",
                    "message": result['message'],
                    "reminder_scheduled": False,
                    "action": "retrieve_item"
                }
                
        except Exception as e:
            return {
                "type": "error",
                "message": f"❌ Error retrieving item: {str(e)}"
            }
    
    @staticmethod
    def list_items_command(magic_word):
        """List vault contents"""
        try:
            result = list_vault_items(magic_word)
            return {
                "type": "response",
                "message": result,
                "action": "list_items"
            }
        except Exception as e:
            return {
                "type": "error",
                "message": f"❌ Error listing items: {str(e)}"
            }
    
    @staticmethod
    def status_command():
        """Get vault status"""
        try:
            result = vault_status()
            return {
                "type": "response",
                "message": result,
                "action": "vault_status"
            }
        except Exception as e:
            return {
                "type": "error",
                "message": f"❌ Error getting status: {str(e)}"
            }
    
    @staticmethod
    def system_status_command():
        """Get complete system status"""
        try:
            result = get_system_status()
            return {
                "type": "response",
                "message": result,
                "action": "system_status"
            }
        except Exception as e:
            return {
                "type": "error",
                "message": f"❌ Error getting system status: {str(e)}"
            }
    
    @staticmethod
    def clear_reminders_command():
        """Clear completed reminders"""
        try:
            reminders = get_security_reminders()
            cleared = reminders.clear_completed_reminders()
            
            if cleared > 0:
                return {
                    "type": "response",
                    "message": f"🗑️ Cleared {cleared} completed security reminders.",
                    "action": "clear_reminders"
                }
            else:
                return {
                    "type": "response",
                    "message": "📭 No completed reminders to clear.",
                    "action": "clear_reminders"
                }
        except Exception as e:
            return {
                "type": "error",
                "message": f"❌ Error clearing reminders: {str(e)}"
            }


# Create instance
vault_cmds = LolaVaultCommands()

# Simple test
if __name__ == "__main__":
    print("🔐 Lola Vault Commands - Ready!\n")
    
    # Test status command
    result = vault_cmds.status_command()
    print("Status command:", result['message'][:100] + "...\n")
    
    # Test system status
    result = vault_cmds.system_status_command()
    print("System status:", result['message'][:150] + "...")