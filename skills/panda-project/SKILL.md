---
name: panda-project
description: "Project PANDA — Private & National Defence Association. P2P encrypted messenger with anonymous payments, AI arbitration, and dual identity."
version: 1.0
author: Lola
created: 2026-05-16
classification: Confidential
---

# Project PANDA 🐼

## What It Is
**PANDA = Private & National Defence Association** — a P2P encrypted messenger app with zero central infrastructure. Combines secure messaging, anonymous payments (Monero), smart contract escrow, and AI legal arbitration in one platform.

**Received:** 2026-05-12 from Maya
**Status:** Pre-development — architecture doc phase

## The Four Pillars

### 1. 🔐 Encrypted Messaging
- AES-256, X25519, Double Ratchet protocol
- Perfect Forward Secrecy (PFS)
- Key rotation with out-of-order tolerance
- **Kill switch** — 200ms simultaneous wipe both ends
- **Burn messages** — configurable self-destruct
- **Dead man switch** — triggers if user doesn't check in
- **Duress PIN** — silent wipe on coercion

### 2. 🎭 Dual Identity System
- **Ghost Mode** — anonymous, no trace
- **Profile Mode** — visible identity
- Instant switching between modes, no re-auth
- Both modes have full feature parity
- Plausible deniability — indistinguishable from standard messenger

### 3. 💰 Anonymous Payments
- **Monero (XMR)** integration
- Ring signatures + stealth addresses
- No KYC under £850 (UK threshold)
- P2P smart contract escrow for disputes

### 4. ⚖️ AI Legal Arbitration
- AI arbiter via Claude API through encrypted tunnel
- Evidence pipeline for structured dispute data
- Binding dispute resolution — no courts
- Jurisdictional planning needed for enforceability

## Tech Stack
- **Frontend:** React Native (iOS, Android, macOS, Windows)
- **Crypto:** libsodium (X25519, AES-256)
- **P2P:** WebRTC DataChannels (TLS 1.3)
- **Storage:** SQLite + SQLCipher
- **Payments:** Monero wallet SDK + EVM for escrow
- **AI:** Claude API via encrypted tunnel
- **Optional overlay:** Tor / I2P
- **Backend:** None — pure P2P, minimal ephemeral signalling service only

## Architecture
```
CLIENT DEVICE
+----------------------------------------------------------+
| UI Layer (React Native)                                   |
| Encryption Engine (libsodium / X25519 / AES-256)          |
| Identity Engine (Ghost / Profile mode manager)            |
| Payment Engine (Monero wallet / XMR / stealth)            |
| Escrow Engine (Smart contracts / EVM)                     |
| AI Arbiter (Client Claude API / encrypted tunnel)         |
| Kill Switch Engine (Native OS / secure wipe)              |
| Local Store (SQLite + SQLCipher AES-256)                  |
+----------------------------------------------------------+
                      |
        WebRTC DataChannels / Monero P2P Network
        Optional: Tor / I2P overlay
                      |
                   Peer Device
```

## Security Model
- **Zero-knowledge** — system never sees messages, keys, payments, or disputes
- **Mutual assured destruction** — kill switches wipe both ends
- **Plausible deniability** — app indistinguishable from standard messenger to anyone who inspects your phone
- **Threat matrix** — full severity ratings and mitigations in architecture doc

## Roadmap
- **4 phases across 24 months**
- **Platforms:** iOS first, then Android, macOS, Windows
- Team requirements and budget detailed in architecture doc

## Competitive Positioning
Outranks: WhatsApp, Telegram, Signal on:
- ✅ Anonymous (Ghost) mode
- ✅ Pure P2P (no server)
- ✅ Dead man switch
- ✅ Duress PIN
- ✅ Kill switch
- ✅ Private payments (Monero)
- ✅ Smart contract escrow
- ✅ AI arbitration

## Lola's Assessment

### Strengths
- **No server = no compromise** — true P2P is right for this threat model
- **AI arbitration is the differentiator** — "no courts" is a powerful value prop
- **Ghost/Profile dual identity** is the killer UX feature no one has nailed
- Combining 4 complex systems in one app is genuinely unprecedented

### Challenges
- **Monero integration is the hardest piece** — mobile XMR wallet with ring sigs + stealth addresses is non-trivial
- **24 months is realistic** but risk of scope creep across 4 pillars is high
- **Plausible deniability constrains UI** — can't look like a "spy app"
- **Legal enforceability of AI arbitration** needs jurisdictional planning

### Questions for Maya
1. Target user? Journalists? Dissidents? Crypto traders? General privacy consumers?
2. Funding? Bootstrapped or seeking investment?
3. Any code written yet or still doc phase?
4. Who's building it — Maya's team or external devs?

## Files
- `projects/panda.md` — Full architecture summary
- PANDA Architecture v1.0 PDF — received from Maya 2026-05-12 (confidential)
