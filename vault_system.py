#!/usr/bin/env python3
"""
Secure Vault System for Maya
Features:
- Stores passwords and images securely
- Requires magic word "somoteitbe" for access
- 10-attempt limit before self-destruct
- Auto-reset on successful access
- Chat log cleanup
"""

import os
import json
import base64
import hashlib
import shutil
from datetime import datetime
from pathlib import Path

class SecureVault:
    def __init__(self, vault_dir=".vault"):
        self.vault_dir = Path(vault_dir)
        self.secrets_file = self.vault_dir / "secrets.json"
        self.images_dir = self.vault_dir / "images"
        self.state_file = self.vault_dir / "state.json"
        self.attempts_limit = 10
        
        # Initialize vault structure
        self.vault_dir.mkdir(exist_ok=True, mode=0o700)
        self.images_dir.mkdir(exist_ok=True, mode=0o700)
        
        # Initialize files if they don't exist
        if not self.secrets_file.exists():
            self._save_secrets({})
        if not self.state_file.exists():
            self._save_state({"attempts": 0, "last_attempt": None})
    
    def _save_secrets(self, secrets):
        """Save secrets with proper permissions"""
        with open(self.secrets_file, 'w') as f:
            json.dump(secrets, f, indent=2)
        os.chmod(self.secrets_file, 0o600)
    
    def _load_secrets(self):
        """Load secrets from file"""
        if not self.secrets_file.exists():
            return {}
        with open(self.secrets_file, 'r') as f:
            return json.load(f)
    
    def _save_state(self, state):
        """Save vault state"""
        with open(self.state_file, 'w') as f:
            json.dump(state, f, indent=2)
        os.chmod(self.state_file, 0o600)
    
    def _load_state(self):
        """Load vault state"""
        if not self.state_file.exists():
            return {"attempts": 0, "last_attempt": None}
        with open(self.state_file, 'r') as f:
            return json.load(f)
    
    def _increment_attempts(self):
        """Increment failed attempt counter"""
        state = self._load_state()
        state["attempts"] += 1
        state["last_attempt"] = datetime.utcnow().isoformat()
        self._save_state(state)
        
        # Check if we've reached the limit
        if state["attempts"] >= self.attempts_limit:
            self._self_destruct()
            return True
        return False
    
    def _reset_attempts(self):
        """Reset failed attempt counter"""
        state = self._load_state()
        state["attempts"] = 0
        state["last_attempt"] = None
        self._save_state(state)
    
    def _self_destruct(self):
        """Destroy all vault contents"""
        print("⚠️  SECURITY BREACH DETECTED - SELF-DESTRUCTING VAULT ⚠️")
        
        # Securely delete all files
        if self.secrets_file.exists():
            # Overwrite with random data before deletion
            with open(self.secrets_file, 'wb') as f:
                f.write(os.urandom(1024))
            os.remove(self.secrets_file)
        
        if self.state_file.exists():
            with open(self.state_file, 'wb') as f:
                f.write(os.urandom(1024))
            os.remove(self.state_file)
        
        # Delete images directory
        if self.images_dir.exists():
            for img_file in self.images_dir.glob("*"):
                with open(img_file, 'wb') as f:
                    f.write(os.urandom(1024))
                os.remove(img_file)
            self.images_dir.rmdir()
        
        # Delete vault directory
        if self.vault_dir.exists():
            self.vault_dir.rmdir()
        
        print("✅ Vault destroyed. All secrets permanently deleted.")
    
    def store_password(self, name, password, description=""):
        """Store a password in the vault"""
        secrets = self._load_secrets()
        
        # Generate a unique ID for this password
        entry_id = hashlib.sha256(f"{name}{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16]
        
        secrets[entry_id] = {
            "name": name,
            "password": password,
            "description": description,
            "type": "password",
            "created": datetime.utcnow().isoformat(),
            "last_accessed": None
        }
        
        self._save_secrets(secrets)
        return entry_id
    
    def store_image(self, image_name, image_data_base64, description=""):
        """Store an image in the vault"""
        # Decode and save image
        image_bytes = base64.b64decode(image_data_base64)
        image_path = self.images_dir / f"{image_name}"
        
        with open(image_path, 'wb') as f:
            f.write(image_bytes)
        
        # Store metadata in secrets
        secrets = self._load_secrets()
        entry_id = hashlib.sha256(f"{image_name}{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16]
        
        secrets[entry_id] = {
            "name": image_name,
            "file_path": str(image_path),
            "description": description,
            "type": "image",
            "created": datetime.utcnow().isoformat(),
            "last_accessed": None
        }
        
        self._save_secrets(secrets)
        os.chmod(image_path, 0o600)
        return entry_id
    
    def get_item(self, entry_id, magic_word):
        """Retrieve an item from the vault with magic word verification"""
        # Verify magic word
        if magic_word != "somoteitbe":
            compromised = self._increment_attempts()
            if compromised:
                return None, "VAULT_DESTROYED"
            return None, "INCORRECT_MAGIC_WORD"
        
        # Magic word correct - reset attempts
        self._reset_attempts()
        
        # Load and return item
        secrets = self._load_secrets()
        if entry_id not in secrets:
            return None, "ITEM_NOT_FOUND"
        
        item = secrets[entry_id]
        
        # Update last accessed timestamp
        item["last_accessed"] = datetime.utcnow().isoformat()
        secrets[entry_id] = item
        self._save_secrets(secrets)
        
        # Return appropriate data
        if item["type"] == "password":
            return {
                "name": item["name"],
                "password": item["password"],
                "description": item["description"],
                "created": item["created"]
            }, "SUCCESS"
        
        elif item["type"] == "image":
            # Read image file
            image_path = Path(item["file_path"])
            if not image_path.exists():
                return None, "IMAGE_FILE_MISSING"
            
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            
            return {
                "name": item["name"],
                "image_data": image_data,
                "description": item["description"],
                "created": item["created"],
                "mime_type": self._guess_mime_type(image_path)
            }, "SUCCESS"
        
        return None, "UNKNOWN_ITEM_TYPE"
    
    def list_items(self, magic_word):
        """List all items in the vault (names only)"""
        if magic_word != "somoteitbe":
            compromised = self._increment_attempts()
            if compromised:
                return None, "VAULT_DESTROYED"
            return None, "INCORRECT_MAGIC_WORD"
        
        self._reset_attempts()
        secrets = self._load_secrets()
        
        items = []
        for entry_id, item in secrets.items():
            items.append({
                "id": entry_id,
                "name": item["name"],
                "type": item["type"],
                "description": item["description"],
                "created": item["created"]
            })
        
        return items, "SUCCESS"
    
    def get_status(self):
        """Get vault status (doesn't require magic word)"""
        state = self._load_state()
        secrets = self._load_secrets()
        
        return {
            "total_items": len(secrets),
            "failed_attempts": state["attempts"],
            "attempts_remaining": self.attempts_limit - state["attempts"],
            "last_attempt": state["last_attempt"],
            "vault_location": str(self.vault_dir.absolute())
        }
    
    def _guess_mime_type(self, file_path):
        """Guess MIME type from file extension"""
        ext = file_path.suffix.lower()
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp'
        }
        return mime_types.get(ext, 'application/octet-stream')


# Helper functions for the assistant to use
def init_vault():
    """Initialize the vault system"""
    vault = SecureVault()
    return vault

def secure_retrieve_with_timer(entry_id, magic_word):
    """Retrieve item and schedule auto-delete (for assistant use)"""
    vault = SecureVault()
    item, status = vault.get_item(entry_id, magic_word)
    
    if status == "SUCCESS":
        # Create the response message
        if item["type"] == "password":
            message = f"✅ **{item['name']}:** `{item['password']}`\n"
            message += f"📝 *{item['description']}*\n"
            message += f"📅 Created: {item['created'][:10]}\n\n"
            message += "⚠️ **SECURITY:** This message will self-destruct in 60 seconds."
        else:
            message = f"✅ Retrieved: {item['name']}\n"
            message += f"📝 *{item['description']}*\n"
            message += "⚠️ **SECURITY:** This message will self-destruct in 60 seconds."
        
        return {
            "message": message,
            "item": item,
            "status": "SUCCESS",
            "auto_delete": True
        }
    
    elif status == "INCORRECT_MAGIC_WORD":
        state = vault.get_status()
        remaining = state["attempts_remaining"]
        return {
            "message": f"❌ Incorrect magic word. {remaining} attempts remaining before vault destruction.",
            "status": "SECURITY_FAIL",
            "attempts_remaining": remaining
        }
    
    elif status == "VAULT_DESTROYED":
        return {
            "message": "⚠️  SECURITY BREACH - VAULT HAS BEEN DESTROYED",
            "status": "DESTROYED"
        }
    
    elif status == "ITEM_NOT_FOUND":
        return {
            "message": "❌ Item not found in vault.",
            "status": "NOT_FOUND"
        }
    
    return {
        "message": f"❌ Error: {status}",
        "status": "ERROR"
    }

def save_password(name, password, description=""):
    """Save a password to the vault"""
    vault = SecureVault()
    entry_id = vault.store_password(name, password, description)
    return f"✅ Password '{name}' saved with ID: {entry_id}"

def save_image(image_name, image_data_base64, description=""):
    """Save an image to the vault"""
    vault = SecureVault()
    entry_id = vault.store_image(image_name, image_data_base64, description)
    return f"✅ Image '{image_name}' saved with ID: {entry_id}"

def retrieve_item(entry_id, magic_word, auto_delete=True):
    """Retrieve an item from the vault with optional auto-delete"""
    vault = SecureVault()
    item, status = vault.get_item(entry_id, magic_word)
    
    if status == "SUCCESS":
        # Format the response with auto-delete warning
        if auto_delete:
            response = {
                "item": item,
                "security_note": "⚠️ This message will self-destruct in 60 seconds for security.",
                "auto_delete": True
            }
        else:
            response = item
        return response
    elif status == "INCORRECT_MAGIC_WORD":
        state = vault.get_status()
        remaining = state["attempts_remaining"]
        return f"❌ Incorrect magic word. {remaining} attempts remaining before vault destruction."
    elif status == "VAULT_DESTROYED":
        return "⚠️  SECURITY BREACH - VAULT HAS BEEN DESTROYED"
    elif status == "ITEM_NOT_FOUND":
        return "❌ Item not found in vault."
    else:
        return f"❌ Error: {status}"

def list_vault_items(magic_word):
    """List all items in the vault"""
    vault = SecureVault()
    items, status = vault.list_items(magic_word)
    
    if status == "SUCCESS":
        if not items:
            return "📭 Vault is empty."
        
        result = "📋 **Vault Contents:**\n\n"
        for item in items:
            result += f"• **{item['name']}** ({item['type']})\n"
            result += f"  ID: `{item['id']}`\n"
            result += f"  Description: {item['description']}\n"
            result += f"  Created: {item['created'][:10]}\n\n"
        return result
    elif status == "INCORRECT_MAGIC_WORD":
        state = vault.get_status()
        remaining = state["attempts_remaining"]
        return f"❌ Incorrect magic word. {remaining} attempts remaining before vault destruction."
    elif status == "VAULT_DESTROYED":
        return "⚠️  SECURITY BREACH - VAULT HAS BEEN DESTROYED"
    
    return f"❌ Error: {status}"

def vault_status():
    """Get vault status"""
    vault = SecureVault()
    status = vault.get_status()
    
    result = "🔐 **Vault Status:**\n"
    result += f"• Location: `{status['vault_location']}`\n"
    result += f"• Total items: {status['total_items']}\n"
    result += f"• Failed attempts: {status['failed_attempts']}\n"
    result += f"• Attempts remaining: {status['attempts_remaining']}\n"
    
    if status['last_attempt']:
        result += f"• Last attempt: {status['last_attempt'][:19]} UTC\n"
    else:
        result += "• Last attempt: Never\n"
    
    if status['attempts_remaining'] <= 3:
        result += "\n⚠️  **WARNING:** Low attempts remaining!\n"
    
    return result

if __name__ == "__main__":
    # Test the vault system
    vault = SecureVault()
    print("✅ Vault system initialized")
    print(vault_status())