---
name: notion-integration
description: Notion API integration for database, page, and content management
version: 1.0
author: Lola
created: 2026-05-16
---

# Notion Integration

## Status
- **Setup:** Complete (API key in vault)
- **Tested:** ✅ API connection verified
- **Status:** Integration built but pending workflow implementation

## Capabilities
- Read/write Notion databases
- Create and update pages
- Query databases by filters
- Append block content

## Scripts
- `notion_integration.py` — Full Python wrapper
- `test_notion_api.py` — API connection test
- `test_notion_connection.py` — Connection verification
- `test_notion_curl.sh` — Direct curl test
- `notion_sample_payloads.json` — Example API payloads

## Auth
- Notion Integration Token (Internal Integration)
- No OAuth — uses workspace integration token
- Token in vault (magic word required)

## Use Cases
- Sync todo.md with Notion database
- Project management database
- Content calendar for Out & About
- Documentation hub

## Notes
- Notion API has rate limits (3 requests/sec per integration)
- Databases require specific schema definition
- Block-based API — pages composed of block elements
