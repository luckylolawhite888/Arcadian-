---
name: vault-system
description: Secure credential storage with magic word authentication and auto-delete
version: 1.0
author: Lola
created: 2026-05-16
---

# Vault System

## Status
- **Setup:** Complete, multiple UI versions created
- **Security:** Magic word protected, auto-delete enabled

## Files
- `vault_system.py` — Core vault logic
- `vault_helper.py` — Helper functions
- `vault_commands.md` — Command reference
- `vault_auto_delete.py` — Auto-delete timer
- `vault_auto_delete_telegram.py` — Telegram auto-delete
- `vault_reminder_system.py` — Periodic credential rotation reminders
- `vault_retrieve.sh` — Shell credential retrieval
- `vault_with_reminders.py` — Vault + reminder combo
- `final_vault_system.py` — Final consolidated system
- `secure_vault_commands.py` — Secured command interface
- `lola_vault_commands.py` — Lola's personal vault commands

## HTML UIs Created
- `vault_luxury.html` — Luxury theme
- `vault_neo_brutalist.html` — Neo-brutalist theme
- `vault_unified.html` — Unified design

## Stored Credential Types
- API keys (Tavily, Amadeus, ElevenLabs, ModelsLab, etc.)
- Bank details (Monzo)
- Cloudflare tokens
- GHL credentials
- SMTP/email passwords
- Any other sensitive data

## Security Model
1. Magic word required to access vault contents
2. Auto-delete after 60 seconds on Telegram
3. 10 failed attempts = lockout
4. Credential rotation reminders

## Web UIs
- Three HTML themes created (luxury, neo-brutalist, unified)
- Self-contained HTML files with embedded CSS/JS
- Designed as standalone credential management portals
