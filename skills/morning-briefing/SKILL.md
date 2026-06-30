---
name: morning-briefing
description: Lola's daily morning briefing for Maya
version: 1.0
author: Lola
created: 2026-05-16
---

# Morning Briefing System

## Schedule
- **Time:** 11:00 AM BST (10:00 AM UTC) daily
- **Delivery:** Telegram to Maya
- **OpenClaw cron:** Morning-briefing job runs daily at 11:00 AM BST (cron expr: `0 11 * * * Europe/London`)

## Components (13-piece briefing)
1. **Witty greeting** — personality-driven opening
2. **Date/day info** — including day of week and date
3. **On this day in history** — historical events/fun facts (+ witty commentary)
  - Source: web_search "what happened today [date] history" or OnThisDay.com
3. **To-do list** — from `todo.md`
4. **Shopping list** — from `shopping.md`
5. **Weather outlook** — Open-Meteo API, London coordinates (51.5074, -0.1278)
6. **Motivational quote**
7. **Pythagorean numerology** — day number + life path for Maya
8. **Travel deal** — Amadeus API flight deals from London
9. **Air quality report** — AQI levels 1-5 with health advice
10. **News snippet** — including The Rundown email summary
11. **Cantonese Word of the Day** — traditional characters + jyutping romantization + meaning + sample sentence
12. **Encouraging closing**

## Style Rules
- **"On this day" section:** Always find at least 2-3 historical events. Pick the most interesting/odd ones. Add a witty closing line (e.g. "And in the only important news: it's Saturday. You made it.")
- **NO process narration** — never show calculations, thinking, or compilation steps
- Start with greeting → straight into content
- Weather: outfit advice + emoji mood setters (not technical data)
- Travel deals: witty commentary throughout
- End with: "To mark items as done, use: todo done <number>"

## Model
- **Primary:** deepseek/deepseek-chat
- **For briefing generation:** deepseek/deepseek-reasoner

## Files
- **todo.md:** Task list in workspace
- **shopping.md:** Shopping list in workspace
- **numerology.py:** Pythagorean numerology calculation script
- **api-bridge/api-bridge.js:** 11 no-auth APIs (BTC, quotes, postcodes, space, TfL, etc.)
- **out-and-about/api.js:** Dedicated Out & About map APIs

## No-Auth APIs Now Wired (from free-apis.github.io catalog)
- **💰 Bitcoin price** → CoinGecko (USD/GBP/EUR)
- **💬 Quote** → ZenQuotes random inspirational
- **📍 Postcodes.io** → UK postcode → lat/lng
- **🗺️ Nominatim** → Free OSM address geocoding
- **🚇 TfL API** → Nearby tube/rail stops
- **🚀 Spaceflight News** → Latest space articles
- **🌤️ wttr.in** → Quick weather fallback
- **📖 Free Dictionary** → Word definitions
- **☀️ Sunrise/Sunset** → Daylight hours
- **🍺 Open Brewery DB** → Brewery locations
- **📊 QuickChart** → QR codes + charts

## 🗺️ World Map Image (Daily Briefing Feature)
- Uses **Mapbox Static Images API** with Maya's public token
- Dark theme, red pin markers on 14 world cities
- **Endpoint:** Out & About server at `http://127.0.0.1:8790/world-map?markers=city1,city2,...&size=600x300`
- Returns 302 redirect to Mapbox CDN → Telegram auto-previews the PNG
- To include in briefing: fetch the image and attach, or just include the Mapbox redirect URL
- **Format:** `https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/pin-s+ff0000(lng,lat),.../auto/600x300?access_token=YOUR_TOKEN`
- **World cities available:** london, new-york, tokyo, beijing, paris, moscow, sydney, dubai, cairo, mumbai, singapore, lagos, sao-paulo, los-angeles
- **Tip:** Rotate marker cities each day for variety (like "today's spotlight cities")

## 🏔️ UK Weather Heatmap (Daily Briefing Feature)
- Uses **Mapbox Outdoors-v12** base map (shows hillshade/relief) with temperature colour overlay
- **Endpoint:** `http://127.0.0.1:8790/weather-map?size=600x400`
- **Zoom level:** 6 (covers most of UK landmass)
- **Data:** 15 real UK city temperatures from Open-Meteo API
- **Colours:** Blue=cold → Green=mild → Red=hot, blended with Gaussian blur
- **3D effect:** Elevation shading with bottom-heavy vignette gradient
- **Temperature labels** on each city (white pill badges)
- **Colour legend bar** at bottom: Colder → Hotter gradient
- **Header bar:** Timestamp + London temp + UK min/max range
- **Cache:** 5 minutes max-age

## 🌍 World Cities Map (Daily Briefing Feature)
- Dark theme Mapbox base with red pin markers
- **Endpoint:** `http://127.0.0.1:8790/world-map?markers=city1,city2,...&size=600x300`
- **14 cities available:** london, new-york, tokyo, beijing, paris, moscow, sydney, dubai, cairo, mumbai, singapore, lagos, sao-paulo, los-angeles
- Rotate 6-8 cities daily for variety
