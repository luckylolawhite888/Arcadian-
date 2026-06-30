---
name: email-management
description: Monitor and manage Gmail inbox, especially The Rundown newsletter
version: 1.0
author: Lola
created: 2026-05-16
---

# Email Management

## Account
- **Email:** luckylolawhite@gmail.com
- **Method:** IMAP via `gmail_reader.py`
- **IMAP server:** imap.gmail.com:993
- **App password:** Stored in `gmail_reader.py`

## Gmail Reader Usage
```python
from gmail_reader import GmailReader

reader = GmailReader()
reader.connect()
reader.mail.select('INBOX')
status, data = reader.mail.search(None, 'UNSEEN')
# Process emails...
reader.mail.logout()
```

## Key Monitoring Tasks
1. **Check unread count** every heartbeat (2-3x daily)
2. **Look for "The Rundown"** in subject line — priority newsletter
3. **Alert Maya** on important/flagged emails
4. **Log findings** in daily memory file

## The Rundown Newsletter
- Arrives ~10:00 AM weekdays
- Subject prefix: emoji + topic (e.g., "💰 OpenAI's...")
- Summary goes into morning briefing
- Must check daily — missed editions are a critical failure

## Common Issues
- IMAP app passwords expire — need replacement if connection fails
- Unread count can accumulate if system doesn't mark as read
- iRedMail (thenewworldorder.io) alternative email system also available
