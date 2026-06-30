---
name: personal-vault
description: "Lola's encrypted personal cloud vault v3 — store, retrieve, search any file type with metadata and text extraction"
version: 3.0
author: Lola
created: 2026-05-16
---

# Personal Cloud Vault v3

## What It Is
Encrypted file storage on the IONOS server. AES-256-CBC at rest. Full file support with metadata tracking, text extraction (PDFs), and search.

## Storage
- **Server:** IONOS Ubuntu (212.227.93.74)
- **Path:** `/root/lola-vault/`
- **Encryption:** AES-256-CBC + PBKDF2 (100K iterations)
- **Key:** `/root/lola-vault/.vault_key` (random 256-bit, 600 permissions)

## Categories
| Category | Contents |
|----------|----------|
| `passwords` | Logins, passwords, PINs |
| `banking` | Bank cards, accounts, sort codes |
| `images` | Photos, scans, screenshots |
| `docs` | PDFs, documents, certificates |
| `apikeys` | API tokens, secrets |
| `other` | Anything else |

## v3 New Features
- **PDF text extraction** — automatically extracts text from stored PDFs for search
- **Metadata tracking** — every file stores name, type, size, date, description
- **Full-text search** — search by name, description, or PDF content
- **`info` command** — preview file metadata without downloading
- **`store-file` command** — works for PDFs, images, docs, any file type
- **Telegram auto-delete** — 15 minutes after delivery

## Commands

### Store a file (PDF, image, doc, anything)
```bash
python3 scripts/personal_vault.py store-file <category> <filepath> <name> [description]
```

### Retrieve a file
```bash
python3 scripts/personal_vault.py get-file <category> <name> <output_path>
```

### Store text data
```bash
python3 scripts/personal_vault.py store <category> <name> <value>
```

### Retrieve text data
```bash
python3 scripts/personal_vault.py get <category> <name>
```

### View file info (no download needed)
```bash
python3 scripts/personal_vault.py info <category> <name>
```

### Search vault
```bash
python3 scripts/personal_vault.py search <query>
```
Searches names, descriptions, AND text content inside PDFs.

### List contents
```bash
python3 scripts/personal_vault.py list [category]
```

### Delete an item
```bash
python3 scripts/personal_vault.py delete <category> <name>
```

## Security
- Encrypted at rest — root access to server can't read files without the vault key
- Only accessible via Lola's SSH key — no web interface, no API endpoint
- Telegram messages auto-delete after 15 minutes
- Magic word required to access vault contents

## Current Contents
Run `python3 personal_vault.py list` to see everything.
