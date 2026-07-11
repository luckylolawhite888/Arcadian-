# 🔐 Vault Commands Reference

## Overview
Secure vault system for storing passwords and images with magic word protection and auto-delete.

## 🔐 **Vault Security Features (UPDATED)**

### ✅ **Working Features:**
- **Magic Word Protection:** "somoteitbe" required for access (case-sensitive)
- **Attempt Limit:** 10 incorrect attempts → vault self-destructs
- **Auto-reset:** Counter resets on successful access
- **Auto-delete System:** **NEW** - Messages auto-delete after 60 seconds
- **Security Audit:** Tracks access times and attempts

### ⚠️ **Important Notes:**
1. **Auto-delete is now active** - Messages will self-destruct after 60 seconds
2. **Magic word cleanup** - Still manual (delete messages containing "somoteitbe")
3. **Forwarding warning** - Don't forward auto-delete messages (breaks security)
4. **System integration** - Uses new `vault_auto_delete.py` system

### 🚨 **Security Best Practices:**
1. Never screenshot or forward auto-delete messages
2. Manually delete any messages containing the magic word
3. Use the vault only for truly sensitive information
4. Report any security issues immediately

## Commands

### Store Items
1. **Save a password:**
   ```
   Lola, save this password for [service]: [password]
   Description: [optional description]
   ```

2. **Save an image:**
   ```
   Lola, save this image as [filename]
   [attach image]
   Description: [optional description]
   ```

### Retrieve Items
1. **Get an item:**
   ```
   Lola, get item [entry_id]
   ```
   *I'll ask for the magic word → 60-second auto-delete starts*

2. **List all items:**
   ```
   Lola, list vault contents
   ```
   *I'll ask for the magic word*

### Status & System
```
Lola, vault status
```
*Shows basic vault info - no magic word needed*

```
Lola, system status
```
*Shows complete system status including pending auto-deletions*

## Example Workflow

**Saving:**
```
You: Lola, save this password for Netflix: SuperSecret123
Me: ✅ Password 'Netflix' saved with ID: a1b2c3d4e5f6
```

**Retrieving with Auto-Delete:**
```
You: Lola, get item a1b2c3d4e5f6
Me: 🔐 Please provide the magic word:
You: somoteitbe
Me: ✅ **Netflix:** `SuperSecret123`
   📝 *Streaming service password*
   📅 Created: 2026-03-20
   
   ⏱️ **AUTO-DELETE ACTIVE:** This message will self-destruct in 60 seconds.
   ⚠️ **DO NOT forward or screenshot!**

[60 seconds later...]
Me: 🗑️ Auto-delete: Sensitive information deleted.
   ✅ Security cleanup complete.
```

**Security Response:**
```
You: Lola, get item a1b2c3d4e5f6
Me: 🔐 Please provide the magic word:
You: wrongword
Me: ❌ Incorrect magic word. 9 attempts remaining before vault destruction.
```

## Example Workflow

**Saving:**
```
You: Lola, save this password for Netflix: SuperSecret123
Me: ✅ Password 'Netflix' saved with ID: a1b2c3d4e5f6
```

**Retrieving:**
```
You: Lola, get item a1b2c3d4e5f6
Me: 🔐 Please provide the magic word:
You: somoteitbe
Me: ✅ Here's your Netflix password: SuperSecret123
```

**Security Response:**
```
You: Lola, get item a1b2c3d4e5f6
Me: 🔐 Please provide the magic word:
You: wrongword
Me: ❌ Incorrect magic word. 9 attempts remaining before vault destruction.
```

## Important Notes
- The magic word "somoteitbe" will be automatically deleted from chat logs
- **Auto-delete:** Sensitive information self-destructs after 60 seconds
- After 10 failed attempts, the vault self-destructs permanently
- All files are stored with strict permissions (600)
- Vault location: `.vault/` in workspace

## ✅ **AUTO-DELETE SYSTEM (NOW ACTIVE)**

**New Feature:** Proper 60-second auto-delete is now implemented!

**How it works:**
1. Sensitive information is displayed with auto-delete warning
2. 60-second countdown begins automatically
3. After 60 seconds, the message is deleted
4. Confirmation is sent when deletion occurs

**Technical implementation:**
- Uses `vault_auto_delete.py` Python script
- Tracks deletion timers automatically
- Integrates with vault security system
- Provides audit logging

**Example workflow:**
```
✅ **Netflix Password:** `SuperSecret123`
📝 *Streaming service password*
📅 Created: 2026-03-20

⏱️ **AUTO-DELETE ACTIVE:** This message will self-destruct in 60 seconds.
⚠️ **DO NOT forward or screenshot!**

[60 seconds later...]
🗑️ Auto-delete: Sensitive information deleted.
✅ Security cleanup complete.
```

## Vault Structure
```
.vault/
├── secrets.json      # Encrypted metadata
├── state.json        # Security state (attempts, etc.)
└── images/           # Stored images
```