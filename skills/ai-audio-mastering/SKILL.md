---
name: ai-audio-mastering
description: AI-powered audio mastering via API for music production
version: 1.0
author: Lola
created: 2026-05-16
---

# AI Audio Mastering

## Status
- **Setup:** Complete
- **Credentials:** `ai_mastering_credentials.json` in vault
- **Tested:** ✅

## Purpose
Master audio tracks for Maya's music releases via DistroKid. AI mastering provides professional-quality mastering without expensive studio time.

## Scripts
- `ai_mastering_system.py` — Full mastering pipeline
- `test_ai_mastering_simple.py` — Quick test

## Workflow
1. Upload raw audio track
2. AI mastering API processes (EQ, compression, limiting)
3. Download mastered output
4. Upload to DistroKid for distribution

## Integration
- Can batch-master multiple tracks
- Supports WAV, FLAC, MP3 input formats
- Output: High-quality WAV for distribution
