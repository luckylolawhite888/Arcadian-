# Project PANDA 🐼

**PANDA = Private & National Defence Association**

**Received:** 2026-05-12 from Maya
**Classification:** Confidential
**Status:** Pre-development — Approved for Build (per document)

## Architecture Plan v1.0 Summary

### The Four Pillars (all P2P, no central server)
1. **Encrypted Messaging** — AES-256, X25519, Double Ratchet, PFS, key rotation. P2P encrypted chat. Kill switch (200ms both ends). Burn messages. Dead man switch. Duress PIN (silent wipe).
2. **Dual Identity System** — Ghost Mode (anonymous) or Profile Mode (visible). Instant switching, no re-auth. Both modes have full feature parity.
3. **Anonymous Payments** — Monero XMR integration. Ring signatures, stealth addresses. No KYC under £850. P2P smart contract escrow.
4. **AI Legal Arbitration** — AI arbiter (Claude API via encrypted tunnel). Evidence pipeline. Binding dispute resolution. No courts.

### Key Technical Details
- **Architecture:** No backend. Pure P2P via WebRTC DataChannels. Only a minimal ephemeral signalling service (stateless, blind to content).
- **Stack:** React Native (iOS/Android/macOS/Windows), libsodium, Monero wallet SDK, EVM for escrow
- **Local storage:** SQLite + SQLCipher (AES-256)
- **Optional Tor/I2P overlay**
- **Plausible deniability** — app is indistinguishable from standard messenger

### Security Model
- **Zero-knowledge** — system never sees messages, keys, payments, or disputes
- **Mutual assured destruction** — kill switches wipe both ends simultaneously
- **Threat model** — includes matrix with severity ratings and mitigations

### Roadmap
- **4 phases, 24 months**
- **Platforms:** iOS, Android, macOS, Windows
- **Team requirements & budget** detailed in document

## Architecture Diagram (from doc)
```
CLIENT DEVICE (iOS / Android / macOS / Windows)
+----------------------------------------------------------+
| UI Layer (React Native)                                   |
| Encryption Engine (libsodium / X25519 / AES-256)          |
| Identity Engine (Ghost / Profile mode manager)            |
| Payment Engine (Monero wallet / XMR / stealth)            |
| Escrow Engine (Smart contracts / EVM)                     |
| AI Arbiter (Client Claude API / encrypted tunnel)         |
| Kill Switch Engine (Native OS / secure wipe)              |
| Local Store (SQLite + SQLCipher AES-256)                  |
+---------------------+------------------------------------+
| WebRTC DataChannels (TLS 1.3) / Monero P2P Network       |
| Optional: Tor / I2P overlay                               |
+---------------------+------------------------------------+
                      v
                 Peer Device (no server)
```

## Competitive Position
- Outranks WhatsApp, Telegram, Signal on: anonymous mode, pure P2P, dead man switch, duress PIN, kill switch, private payments, smart contract escrow, AI arbitration

## Lola's Initial Thoughts
*(to be expanded)*
- **Ambitious** — combining 4 complex systems (messaging + payments + escrow + AI arbitration) under one roof is genuinely unprecedented
- **No server = no compromise** — true P2P is the right call for this threat model
- **Monero integration is the hardest piece** — mobile XMR wallet with ring signatures and stealth addresses is non-trivial
- **AI arbitration is the differentiator** — "no courts" is a powerful value prop, but legal enforceability needs careful jurisdictional planning
- **24 months is realistic** for a v1 if focused; risk is scope creep across 4 pillars
- **Ghost/Profile dual identity** is the killer UX feature — that fluid switching is what no one else has nailed
- **Plausible deniability requirement** constrains UI heavily — can't look like a "spy app"

## Questions for Maya
- Who's the target user? Journalists? Political dissidents? Crypto traders? General privacy-conscious consumers?
- Funding? Bootstrapped/funded?
- Any code written yet or still in doc phase?
