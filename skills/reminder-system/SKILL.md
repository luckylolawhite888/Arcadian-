---
name: reminder-system
description: Set and manage reminders for Maya via OpenClaw cron
version: 1.0
author: Lola
created: 2026-05-16
---

# Reminder System

## How It Works
Uses OpenClaw's built-in cron scheduler to create time-based reminders.

## Setting a Reminder
```bash
# Use OpenClaw cron tool with kind="at" schedule
# Example: Remind Maya about congestion charge at 8pm
```

## Reminder Types
- **One-shot** — Single time (e.g., "remind me at 3pm today")
- **Recurring** — Daily/weekly (e.g., "every Monday at 9am")
- **Date-specific** — Specific date (e.g., "remind me on June 26")

## Scripts
- `reminder_system.py` — Python-based reminder creation

## Components
- **Cron Schedule:** Time in ISO format with timezone
- **Payload:** Message text delivered as system event
- **Delivery:** Telegram channel to Maya

## History
- Congestion charge reminder set for May 15, 2026 (tested successfully)
- Susan invoice reminder set for May 20, 2026
- Several one-shot reminders set for various tasks
