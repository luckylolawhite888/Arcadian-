---
name: weather-api
description: London weather forecasting via Open-Meteo API for morning briefing
version: 1.0
author: Lola
created: 2026-05-16
---

# Weather API

## Provider
- **Open-Meteo API** (free, no API key needed)
- **Location:** London (51.5074° N, 0.1278° W)

## Quick Call
```python
import urllib.request, json
url = "https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe/London"
response = urllib.request.urlopen(url)
data = json.loads(response.read())
```

## Briefing Format
- **Style:** Outfit advice + emoji mood setters (not technical data)
- **Focus:** "Will I need an umbrella?" + "What should I wear?"
- **Example:** "12°C and overcast — layers and maybe a light jacket ☁️"

## Script
- `check_weather_urllib.py` — Working test script using urllib (avoids requests module issues)

## History
- Originally used wttr.in, switched to Open-Meteo (2026-03-20) due to location resolution issues
- Included in morning briefing daily
