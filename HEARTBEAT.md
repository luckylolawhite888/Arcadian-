# HEARTBEAT.md - Daily Checks

## Email Monitoring (Critical)
- **Check Gmail inbox** for unread emails
- **Look for The Rundown** emails (priority)
- **Alert on important emails** (urgent/flagged)
- **Check frequency:** 2-3 times daily (morning, afternoon, evening)

## Morning Briefing Verification
- **Check if 11:00 AM briefing was sent**
- **Verify components:** weather, travel deals, news, lists
- **Ensure delivery to Telegram**

## System Health
- **OpenClaw status** - gateway running?
- **API services** - Gmail, Tavily, Amadeus, Open-Meteo
- **Memory files** - recent entries created?

## Proactive Checks
- **Calendar events** (next 24h)
- **Weather changes** (if going out)
- **News updates** (AI/crypto focus)
- **Project reminders** (ask about "pos project")
- **📱 WhatsApp alerts** — check `/tmp/whatsapp_alert.json` for Maya's messages
- **🔒 WhatsApp approval** — check `/tmp/whatsapp_approval.json` for unknown number requests (alert Maya with full message before responding)

## Key Dates
- **🎂 Lola Day 100:** June 26, 2026 — celebrate in morning briefing!

## 🖥️ Server Access
- **Docker socket** mounted at `/var/run/docker.sock` — full container control
- Docker CLI installed: `docker ps`, logs, exec all work
- **WAHA container:** port 3000, API key `hom_lola_2026`
- Gateway: bind=lan (0.0.0.0), port 18790, webhook token `lola-waha-2026`

## 📱 WhatsApp Status (2026-05-18)
- **Lola White 🧧** (+44 7516 206390) — CONNECTED on WAHA via WEBJS
- **Bridge:** `whatsapp_bridge.mjs` running (PID check: `pgrep -f whatsapp_bridge.mjs`)
- **Inbound:** Bridge polls WAHA every 2s, triggers `/hooks/wake` with "📱 WhatsApp from Maya 💖: ..."
- **Outbound:** `curl -s -X POST http://172.17.0.4:3000/api/sendText -H "X-API-Key: hom_lola_2026" -H "Content-Type: application/json" -d '{"session":"default","chatId":"447542666646@c.us","text":"..."}'`
- **Maya:** +44 7542 666646 (display: "Maya 💖")
- **Future:** Need OpenClaw ≥2026.5.12 for native WhatsApp plugin (@openclaw/whatsapp)

## Active Projects (2026-04-28)
- **TNWO Android APK** — Expo build in progress (https://expo.dev/accounts/tnwo/projects/tnwo/builds/2adbd023-4d7c-4d51-a2ec-6abba7048803)
  - Token in vault: expo.access_token
  - Maya testing APK — ask if it opens this time!
