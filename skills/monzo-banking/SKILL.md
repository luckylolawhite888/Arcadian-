---
name: monzo-banking
description: Monzo banking API for payments, balance checks, and transaction management
version: 1.0
author: Lola
created: 2026-05-16
---

# Monzo Banking

## Status
- **Setup:** OAuth tokens in vault
- **Tested:** ✅ Working

## Capabilities
- Check account balance
- List transactions
- Make payments
- View spending by category
- Detect pot balances

## Scripts
- `monzo_oauth.py` — OAuth flow for token refresh
- `monzo_payments.py` — Payment workflows
- `monzo_test.py` — Connection test
- `monzo_credentials.json` — Stored tokens

## Security
- Monzo credentials require magic word authentication
- OAuth tokens stored in vault with auto-delete protection
- Can initiate payments but only with explicit Maya approval

## Use Cases
- Balance check in morning briefing
- Transaction alerts
- Payment automation for business expenses
- Monitor Out & About revenue

## Notes
- OAuth tokens expire — need periodic refresh via `monzo_oauth.py`
- API rate limits apply (not publicly documented)
- Read-only operations are safe; write operations require Maya confirmation
