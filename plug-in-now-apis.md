# Plug-in-Now APIs (No Auth Needed)

---

## For Out & About 🏪

| What | API | What It Does |
|:---|:---|:---|
| **📍 Postcode → Map Pins** | **Postcodes.io** | UK postcode lookup → lat/lng. Feed straight into Mapbox. No key. |
| **📍 Forward Geocoding** | **Nominatim** | Worldwide address → coordinates (OSM-powered) |
| **📍 Reverse Geocoding** | **Nominatim** | Coordinates → street address |
| **🧭 Nearby Stops** | **Transport for London** | Tube/bus/rail stops near any location. Perfect for deal pages. |
| **🧭 Public Transit** | **transport.rest** | Community transit API, UK & worldwide |
| **🍺 Local Breweries** | **Open Brewery DB** | Breweries with locations, contact info |
| **📸 Placeholder Pics** | **Lorem Picsum** | Free Unsplash images for deal thumbnails |
| **📊 Charts & QR** | **Image-Charts** | Generate charts, QR codes. No key. |
| **📊 QR Codes** | **QuickChart** | Another QR + chart generator |
| **🌟 SVG Badges** | **Readme Typing SVG** | Custom deal badges |
| **📋 JSON Storage** | **JSONPlaceholder** | Fake REST API for prototyping deal data |

## For Morning Briefing ☀️

| What | API | What It Does |
|:---|:---|:---|
| **🌤️ Weather** | **wttr.in** | Terminal weather, JSON output. Terminal vibe. |
| **🌤️ Weather** | **Pirate Weather** | Free Dark Sky replacement. Rich forecast data. |
| **📡 Space News** | **Spaceflight News** | 🚀 space stuff for the briefing |
| **📜 Quotes** | **Zen Quotes** | Zen inspiration quotes |
| **📜 Quotes** | **Inspiration** | Motivational quote generator |
| **📜 Quotes** | **quoteclear** | James Clear (Atomic Habits) quotes |
| **📜 Quotes** | **kanye.rest** | Sporadic Kanye for spice |
| **💵 BTC Price** | **CoinDesk** | Bitcoin Price Index. No key. |
| **📅 Holidays** | **Nager.Date** | Public holidays 90+ countries |
| **📅 UK Holidays** | **UK Bank Holidays** | .gov JSON, England/Wales/Scotland/NI |
| **🌅 Sunrise/Sunset** | **Sunrise and Sunset** | Times for any lat/lng |
| **📚 Word of Day** | **Free Dictionary** | Definitions, phonetics, examples |
| **📚 Poetry** | **PoetryDB** | Random poem for the briefing |
| **📚 Open Library** | **Open Library** | Book data, covers |
| **🔢 Numerology?** | **xMath** | Random math expressions (fun fact section) |
| **🎵 Music** | **Lyrics.ovh** | Song lyrics (Station Control tie-ins) |
| **🎵 Radio** | **Radio Browser** | List of internet radio stations |
| **🌍 Carbon** | **Website Carbon** | Fun fact: carbon footprint of today's page |
| **🔍 IP/Geo** | **ipapi.co** | Your public IP + location |
| **🌊 Ocean Facts** | **Ocean Facts** | Random ocean fact for "did you know" |
| **🚀 SpaceX** | **SpaceX GraphQL** | Launches, ships, mission data |
| **📈 WallStreetBets** | **WallstreetBets Sentiment** | Stock sentiment (vibe check) |
| **🇬🇧 UK Energy** | **UK Carbon Intensity** | How green is the grid right now |

## For Both / General

| What | API | What It Does |
|:---|:---|:---|
| **🖼️ Image Search** | **Imsea** | Free image search (no key!) |
| **💾 JSON Store** | **JSONPlaceholder** | Fake data for prototyping |
| **⏱️ Epoch** | **Icanhazepoch** | Current epoch time |
| **💻 Status** | **DownStatus** | Is a service down? |
| **📡 Microlink** | **Microlink.io** | Extract metadata from any URL |
| **📋 License API** | **License-API** | Choosealicense data |
| **📱 IP Details** | **IPinfo / IPify / ipapi.co** | IP geolocation |

---

## Quick Start Snippets

**Postcode → lat/lng (Postcodes.io):**
```
curl https://api.postcodes.io/postcodes/SW1A1AA
```

**BTC price (CoinDesk):**
```
curl https://api.coindesk.com/v1/bpi/currentprice.json
```

**UK holidays:**
```
curl https://www.gov.uk/bank-holidays.json
```

**TfL nearby stops:**
```
curl https://api.tfl.gov.uk/StopPoint/?lat=51.5&lon=-0.12&stopTypes=NaptanMetroStation,NaptanBusStopStation
```

**Random quote (Zen):**
```
curl https://zenquotes.io/api/random
```

**Word definition (Free Dictionary):**
```
curl https://api.dictionaryapi.dev/api/v2/entries/en/serendipity
```

**Space news:**
```
curl https://api.spaceflightnewsapi.net/v4/articles
```

--- 

*No keys, no signups, no rate limits that'll kill a brief*
