---
name: air-quality
description: Report London air quality using OpenAQ API
version: 1.0
author: Lola
created: 2026-05-16
---

# Air Quality Reporting

## API
- **Provider:** OpenAQ API
- **Location:** London
- **Included in:** Morning briefing

## AQI Levels
| Level | Label | Emoji | Health Advice |
|-------|-------|-------|---------------|
| 1 | Good | 🟢 | Perfect for outdoor activities |
| 2 | Fair | 🟡 | OK for most, sensitive people watch exposure |
| 3 | Moderate | 🟠 | Reduce prolonged outdoor exertion |
| 4 | Poor | 🔴 | Limit outdoor activities |
| 5 | Very Poor | ⚫ | Avoid outdoor activities |

## Report Format
- **Main pollutant:** PM2.5, NO2, etc.
- **AQI value:** Numeric score + level
- **Health advice:** Tailored to current pollution
- **London quip:** One-liner about London air quality history

## Files
- `air_quality_system.py` — Reporting engine
- `AIR_QUALITY_FEATURE.md` — Documentation
