---
name: product-sanitization
description: Sanitize product content for Gumroad — remove credentials, private data
version: 1.0
author: Lola
created: 2026-05-16
---

# Product Sanitization

## Purpose
Prepare content for the Gumroad "AI Assistant Setup Kit — Lola Edition" by removing all personal credentials, API keys, and private data.

## Script
- `sanitize_product.py` — Automated sanitization tool

## What Gets Removed
- API keys (Tavily, Amadeus, ElevenLabs, etc.)
- Email addresses and passwords
- Bank details and financial data
- SSH private keys and connection details
- Server IP addresses
- Personal names and contact info
- Vault credentials

## Workflow
1. Run `sanitize_product.py` on source files
2. Review output for any missed data
3. Package into Gumroad zip download
4. Upload and publish

## Status
Ready for launch — Maya just needs to give the go-ahead.
