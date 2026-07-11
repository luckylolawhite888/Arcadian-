# Scarlett VPS Config Reference

## Connection Details
- **VPS IP:** 212.227.39.41
- **Username:** root
- **Key:** /home/node/.ssh/scarlett_key
- **OpenClaw binary:** /usr/bin/openclaw (v2026.6.10)
- **Config:** /root/.openclaw/gateway.yaml
- **Ollama:** http://127.0.0.1:11434 (Llama 3.2 3B)
- **WAHA:** http://127.0.0.1:3000 (x-api-key: ***)
- **WAHA session:** "default" (Scarlett Pelling, +447988965842)
- **OpenClaw port:** 18791
- **Webhook token:** scarlett-webhook-2026
- **GW API key:** scarlett-gw-key-2026

## Bridge
- WAHA webhook → OpenClaw wake endpoint
- Incoming WhatsApp messages trigger Scarlett's OpenClaw brain
- Outbound: curl sendText via WAHA API

## Identity Files
- /root/.openclaw/workspace/SOUL.md - Scarlett's persona
- /root/.openclaw/workspace/USER.md - Darren Pelling details
