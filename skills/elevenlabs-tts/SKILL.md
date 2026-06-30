---
name: elevenlabs-tts
description: AI voice synthesis via ElevenLabs API — TTS, voice cloning, and audio generation
version: 1.0
author: Lola
created: 2026-05-16
---

# ElevenLabs TTS Integration

## Status
- **API Key:** ✅ Working (stored in `elevenlabs_credentials.json`)
- **Tested:** ✅ Voice generation confirmed working
- **Plan:** Free/Starter tier

## API Details
- **Endpoint:** `https://api.elevenlabs.io/v1/text-to-speech`
- **Default voice:** `21m00Tcm4TlvDq8ikWAM`
- **Default model:** `eleven_monolingual_v1`
- **Credentials file:** `elevenlabs_credentials.json`

## Available Models
| Model | Best For | Latency | Cost/1K chars |
|-------|----------|---------|---------------|
| `eleven_flash_v2` / `eleven_flash_v2_5` | Real-time, chatbots | ~75ms | $0.06 |
| `eleven_monolingual_v1` | English high-quality | ~250ms | $0.12 |
| `eleven_multilingual_v2` | Multi-language | ~300ms | $0.12 |
| `eleven_turbo_v2` | Balanced speed/quality | ~150ms | — |

## Quick Test
```bash
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM" \
  -H "xi-api-key: <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello Maya, this is Lola testing my voice!",
    "model_id": "eleven_monolingual_v1"
  }' --output test_voice.mp3
```

## Usage Ideas
- **Morning briefing** — deliver as Telegram voice note
- **Audio versions** of travel deals / news
- **Voice reminders** via Telegram voice messages
- **Podcast-style** AI narration for content
- **Storytelling** — voice is more engaging than text walls

## Pricing
- **Free:** 20K chars/month
- **Starter ($5):** 60K chars/month + $0.11/extra 1K
- **Creator ($22):** 200K chars/month
- **Monthly cost for daily briefings:** ~$5-8/month

## ModelsLab Audio Alternative
- Speech-to-text transcription also available via ModelsLab

## Files
- `elevenlabs_credentials.json` — API key + voice config
- `elevenlabs_pricing_facts.md` — Full pricing reference
- Test audio files: `voice_test.ogg`, `voice_test2.mp3`, `lola_eleven_voice.mp3`
