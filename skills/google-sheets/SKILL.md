---
name: google-sheets
description: Google Sheets API integration for data management and reporting
version: 1.0
author: Lola
created: 2026-05-16
---

# Google Sheets Integration

## Status
- **Setup:** Complete
- **Tested:** ✅ API connection verified
- **Credentials:** Google service account / OAuth in vault

## Scripts
- `test_google_sheets.py` — Connection test
- `test_google_sheet_access.sh` — Shell-based access test
- `check_google_sheets_api.py` — API status check

## Capabilities
- Read spreadsheet data
- Write/append rows
- Create new sheets
- Update cell values
- Format cells

## Use Cases
- Track Out & About shop sign-ups
- Mars Reg order log
- Morning briefing data archive
- Business expense tracking

## Notes
- Uses Google Sheets API v4
- Service account requires sheet sharing permissions
- Rate limit: 60 requests per minute per project
