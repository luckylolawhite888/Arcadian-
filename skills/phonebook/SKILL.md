---
name: phonebook
description: Contact management with phone numbers, addresses, and notes
version: 1.0
author: Lola
created: 2026-05-16
---

# Phonebook

## Script
- `phonebook.py` — Contact management system

## Features
- Store contact names, phone numbers, addresses
- Search contacts
- SMS sending integration (works with sms-works skill)

## Key Contacts
| Name | Number | Notes |
|------|--------|-------|
| Maya | Via Telegram | Primary contact |
| Michael Terry | +447936313346 | Used for SMS testing |
| Tom | (Monzo contact) | Cashpoint payment |

## Usage
```bash
python3 phonebook.py --list
python3 phonebook.py --search "name"
```

## Integration
- SMS Works API for sending texts to contacts
- Monzo for payments to contacts (Tom cashpoint sends)
