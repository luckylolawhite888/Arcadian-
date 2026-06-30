---
name: transcription
description: Audio/video transcription via AssemblyAI and other services
version: 1.0
author: Lola
created: 2026-05-16
---

# Transcription System

## Providers
- **AssemblyAI** — Primary (API key in vault)
- ElevenLabs Scribe — Alternative (STT)

## Scripts
- `transcribe_assemblyai.py` — AssemblyAI API wrapper
- `transcribe_simple.py` — Simplified interface
- `transcribe_video.py` — Video file transcription

## Capabilities
- Audio file transcription (MP3, WAV, M4A, etc.)
- Video audio transcription (MP4, MOV, etc.)
- Speaker diarization (identify who said what)
- Timestamp generation
- Punctuation and formatting

## Use Cases
- Transcribe Maya's voice notes
- Convert podcast episodes to text
- Extract quotes from interviews
- Meeting recordings

## Status
- Tested and working
- AssemblyAI has free tier for development
