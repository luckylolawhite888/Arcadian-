---
name: gog
description: Google Workspace CLI — Gmail, Calendar, Drive, Sheets, Docs, Contacts
version: 1.0
requires:
  binaries: [gog]
install:
  cli: gog
---

# Gog — Google Workspace CLI

## Setup (required first time)

```bash
# Auth with Google OAuth credentials
gog auth credentials /path/to/client_secret.json

# Add your Google account
gog auth add you@gmail.com --services gmail,calendar,drive,contacts,sheets,docs

# Set default account so we don't repeat --account
export GOG_ACCOUNT=you@gmail.com
```

## Gmail

```bash
# Search recent messages
gog gmail search 'newer_than:7d' --max 10

# Search unread
gog gmail search 'is:unread' --max 20

# Send email
gog gmail send --to a@b.com --subject "Hi" --body "Hello"

# Get message details
gog gmail get <message-id> --json
```

## Calendar

```bash
# Upcoming events
gog calendar events --from today --to tomorrow
gog calendar events --from "2026-06-30" --to "2026-07-07"

# Create event
gog calendar create --title "Meeting" --start "2026-07-01T10:00:00" --end "2026-07-01T11:00:00"
```

## Drive

```bash
# Search files
gog drive search "query" --max 10

# Get file info
gog drive info <file-id> --json
```

## Contacts

```bash
# List contacts
gog contacts list --max 20

# Search contacts
gog contacts search "name"
```

## Sheets

```bash
# Read a range
gog sheets get "Sheet1!A1:D10" --json

# Update cells
gog sheets update "Sheet1!A1:B2" --values-json '[["A","B"],["1","2"]]' --input USER_ENTERED

# Append rows
gog sheets append "Sheet1!A:C" --values-json '[["x","y","z"]]' --insert INSERT_ROWS

# Clear range
gog sheets clear "Sheet1!A2:Z"

# Sheet metadata
gog sheets metadata --json
```

## Docs

```bash
# Export as txt
gog docs export --format txt --out /tmp/doc.txt

# Read content
gog docs cat
```

## Tips

- Export `GOG_ACCOUNT=you@gmail.com` to avoid repeating `--account`
- Always use `--json --no-input` for scripting
- Confirm before sending mail or creating events
- The binary is at: `workspace/bin/gog` — add to PATH or use full path
