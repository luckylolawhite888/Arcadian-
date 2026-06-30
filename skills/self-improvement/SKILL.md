---
name: self-improvement
description: Lola's self-improvement loop — pattern extraction, skill creation, memory maintenance
version: 1.0
author: Lola
created: 2026-05-16
---

# Self-Improvement System

## Philosophy
Every session should leave you slightly smarter. Not through manual teaching — through automatic pattern extraction.

## Three-Layer Loop

### Layer 1: Session Startup
- Check `.improvement_suggestions.md` for pending suggestions
- Action suggestions (create skills, update memory, etc.)
- Delete the file to acknowledge the cycle

### Layer 2: After Complex Tasks
- Ask: "Would this be useful as a skill for future sessions?"
- If yes, write `skills/<name>/SKILL.md` with YAML front matter
- Log the creation in daily memory file

### Layer 3: Daily Pattern Extraction (Cron)
- **Schedule:** 05:00 UTC daily
- **Script:** `scripts/self_improve.py`
- **What it does:**
  - Scans last 7 days of memory files for repeated patterns
  - Checks if projects in MEMORY.md have corresponding skills
  - Writes `.improvement_suggestions.md` for review
- **Safety:** Read-only — only writes suggestions, never edits directly

## Files
- `scripts/self_improve.py` — Pattern extraction engine
- `.improvement_suggestions.md` — Suggestion file (created by cron, reviewed on startup)
- `SOUL.md` — Reflex rules embedded in personality
- `AGENTS.md` — Startup routine updated

## Cron Job
- **Name:** lola-self-improve-daily
- **Schedule:** 0 5 * * * (daily at 05:00 UTC)
- **Delivery:** Only messages Maya if there are actual suggestions
