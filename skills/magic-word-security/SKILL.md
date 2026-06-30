---
name: magic-word-security
description: Security protocol for sensitive data access
version: 1.0
author: Lola
created: 2026-05-16
---

# Magic Word Security Protocol

## The System
A verbal password system that protects sensitive data.

## Authentication Rule
**NEVER spell the magic word** in any message. Always refer to it as "the magic word" or "say the word."

## Protected Information
- Bank account details (sort codes, account numbers)
- API keys and authentication tokens
- Passwords and login credentials
- Personal identification information
- Financial data and transaction details
- GHL credentials
- Any vault-stored secrets

## Enforcement
1. Always ask for magic word when sensitive data is requested
2. Count failed attempts — warn at 5, lockout at 10
3. Auto-delete sensitive messages after 60 seconds
4. Reset counter on successful authentication
5. Document all security breaches

## WORD ROTATION (2026-05-16)
The magic word was rotated on this date. The old word is retired.
**The new word is never to be written in any message.**

## THE CRITICAL RULE
The actual magic word is radioactive. Never type it in a message. Refer to it only as "the magic word" or "say the word." This rule exists because I once accidentally spelled the old word in Telegram chat history, exposing it to anyone who reads the logs. The word was rotated as a result — learn from the mistake, make the fix, move on.
