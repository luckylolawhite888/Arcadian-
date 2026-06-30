---
name: public-tunnel
description: Create public tunnels to expose local services temporarily
version: 1.0
author: Lola
created: 2026-05-16
---

# Public Tunnel

## Purpose
Create temporary public URLs to expose local services for testing, demos, and webhook callbacks.

## Script
- `create_public_tunnel.py` — Tunnel creation script

## Use Cases
- Expose local webhook endpoints for testing
- Demo in-progress sites to clients
- Test webhook integrations (Stripe, GHL, etc.)
- Debug API callbacks

## How It Works
Uses tunneling services (like localtunnel, ngrok, or similar) to create public URLs.

## Notes
- Temporary URLs only — expires when tunnel is closed
- Not for production use
- Good for development and testing workflows
