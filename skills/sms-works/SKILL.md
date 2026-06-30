---
name: sms-works
description: Send SMS messages via The SMS Works API
version: 1.0
author: Lola
created: 2026-05-16
---

# SMS Works Integration

## API Details
- **Endpoint:** https://api.thesmsworks.co.uk/v1/message/send
- **Auth:** JWT Bearer token
- **Status:** ✅ Verified working

## Sending an SMS
```bash
curl -X POST "https://api.thesmsworks.co.uk/v1/message/send" \
  -H "Authorization: JWT <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "SenderName",
    "destination": "+447936313346",
    "content": "Your message here",
    "encoding": "gsm"
  }'
```

## Requirements
- **Sender ID:** 3-11 chars alphanumeric, 3-15 digits numeric
- **Destination:** Include country code (+44 for UK)
- **Encoding:** "gsm" for text, "unicode" for emojis
- **JWT Token:** Use full token (don't truncate)

## Success Response
```json
{"messageid":"...","status":"SENT","credits":228,"creditsUsed":1,"messageparts":1}
```

## Common Errors
- "Sender ID length invalid" → Max 11 chars
- "Unauthorized" → JWT token truncated
- "ResourceNotFound" → Wrong endpoint

## Tools Created
- `smsworks_test.py`, `smsworks_simple.sh`, `smsworks_integration.py`
- `SMS_SKILL.md` — full documentation

## Tested
Successfully sent SMS to Michael Terry (+447936313346) on 2026-03-31

---

## Tom Reminders (Specific Use Case)
Maya occasionally needs to send Tom cashpoint reminders via SMS.

**Scripts:** `send_tom_cashpoint.py`, `send_tom_reminder.sh`, `test_tom_sms.py`

**Workflow:**
1. Maya: "remind Tom" or "send Tom a message"
2. Lola sends SMS via SMS Works API to Tom's number
3. Can also integrate with Monzo for cashpoint payments
