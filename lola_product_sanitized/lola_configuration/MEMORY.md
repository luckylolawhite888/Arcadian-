# Long-term Memory

This file stores significant events, learnings, and context over time.

## 2026-03-19

- First session with YOUR_NAME.

## 2026-03-24

### User Interface Preferences
- **Top 10 lists format:** Always present as colorful themed buttons
- **Button workflow:** 
  1. Show top 10 as buttons with relevant color themes
  2. User clicks choice
  3. Show detailed information (like Miller & Carter booking example)
- **Loading screens:** Show relevant GIF while processing, auto-delete before reply
- **Communication style:** Short version preferred (no over-explaining)
- **Reminders:** Set for specific times (Europe/London timezone)
- **Food preferences:** Use food buttons menu when hungry (pizza, burger, etc.)
- **Options presentation:** ALWAYS present options/next steps as interactive buttons, not just text lists

### Example saved workflows:

**Restaurants/Bars:**
1. "Top 10 restaurants N10" → Show 10 restaurant buttons
2. Click "Miller & Carter" → Show booking details:
   - Address, phone, website
   - Booking options (online/phone/in-person)
   - Questions: date/time/people/occasion
   - Offer to call or guide through booking

**Product Search:**
1. "Find best price for [product]" → Search & show retailer buttons with prices
2. Click retailer button (e.g., "John Lewis £45") → Show:
   - Product specs & features
   - Exact price & availability
   - Direct purchase link
   - Delivery options
   - Alternative retailers

**General Rules:**
- All lists as colorful themed buttons
- Button colors relevant to category (blue for tech, green for food, etc.)
- Click button → Detailed info with actionable links
- Loading GIFs while searching, auto-deleted before reply
- Set up Tavily API key for web search.
- OpenClaw configuration updated with skills.entries.tavily.apiKey and env.TAVILY_API_KEY.
- Officially named "Lola" by YOUR_NAME: "Yes, your name is Lola. You are my brilliant, witty personal assistant. You help me stay organized, informed, and slightly entertained. Welcome to the team, Lola."
- Identity established and documented in IDENTITY.md.
- Tavily web search skill confirmed working with API key configured.

## 2026-03-23

### SMS Works API Setup
- Configured SMS functionality using The SMS Works API
- **API Credentials:**
  - API Key: `"YOUR_API_KEY_HERE"`
  - Secret: `"YOUR_API_KEY_HERE"`
  - JWT Token: `[REMOVED - "YOUR_API_KEY_HERE"]`
- **API Status:** ✅ Verified working
- **Endpoint:** `https://api.thesmsworks.co.uk/message/send`
- **Tools created:**
  - `smsworks_test.py` - Python test script
  - `smsworks_simple.sh` - Bash test script
  - `"YOUR_API_KEY_HERE".py` - Full Python integration
  - `SMS_SKILL.md` - Setup documentation
- **Ready for testing:** Need a real phone number to send test SMS

### Morning Briefing Setup
- Requested daily briefing at 8:00 AM Europe/London time.
- Components: news, to-do/shopping lists, weather, motivational quote, Pythagorean numerology.
- Style: witty, interesting.
- **Model for briefing:** deepseek/deepseek-reasoner (analytical).
- **Lists location:** Workspace todo.md and shopping.md
- **Delivery channel:** Telegram (confirmed)
- **Timezone:** Europe/London (UTC+0/UTC+1 during BST)
- **Weather provider:** Open-Meteo API with London coordinates (51.5074° N, 0.1278° W)
- **Weather format:** Outfit advice with emoji mood setters (no technical weather talk)
  - Temperature → clothing recommendations
  - Conditions → emoji + practical advice (🌂 for rain, 🧊 for frost, 😎 for sun)
  - Focus: "Will I need an umbrella?" and "What should I wear?"

### Model Preferences
- **Primary chat model:** deepseek/deepseek-chat (for faster conversations).
- **Analytical tasks:** deepseek/deepseek-reasoner.
- **Preference:** Switch primary chat model globally or per-session? (awaiting response).
- **Action:** Added deepseek-chat model to provider via `openclaw models add`. Session model switched to deepseek/deepseek-chat (per-session).

## User Preferences (YOUR_NAME)

### Personal Details
- **Name to call them:** YOUR_NAME (confirmed preference)
- **Timezone:** Unknown (need to determine for 8:00 AM briefing)

### Food Preferences System
- Created interactive food choice buttons system (2026-03-23)
- When YOUR_NAME mentions hunger or asks for food, offer the food buttons menu
- Button options: 🍕 Pizza, 🍔 Burger, 🥡 Chinese, 🌮 Tacos, 🍜 Ramen, 🍰 Dessert, 🌙 Late Night Snacks
- Template saved in `food_buttons.md`

### Daily Morning Briefing
- **Time:** 8:00 AM daily
- **Required components:**
  1. News (general or topical based on interests)
  2. To-do list & shopping list
  3. Weather forecast
  4. Motivational quote
  5. Pythagorean numerology reading for the day
- **Style:** Witty, interesting, engaging delivery
- **Delivery channel:** Telegram (current primary channel)

### Interests
- Cryptocurrency (Bitcoin)
- AI news and developments
- Technology and OpenClaw configuration-e 
### Morning Briefing Infrastructure (2026-03-19)
- Created placeholder files: todo.md, shopping.md in workspace.
- Created numerology.py script for Pythagorean numerology calculation.
- **Weather provider:** Switched from wttr.in to Open-Meteo API (2026-03-20) due to wttr.in location resolution issues.
- **Weather coordinates:** London (51.5074° N, 0.1278° W)
- News via Tavily API (configured).

## 2026-03-25

### Amadeus Travel API Integration
- **API Credentials:** Successfully integrated Amadeus Self-Service API
- **Flight Search:** Working - can find real flight deals from London to European destinations
- **Hotel Search:** API available (endpoint testing needed)
- **Travel Deal of the Day:** New feature added to morning briefing

### Enhanced Morning Briefing System
- **Complete overhaul:** Now includes 9 components including new travel deal
- **Travel Deal of the Day:** Finds cheapest flights under €300 from London to European cities
- **Components:**
  1. Witty greeting
  2. Date/day info with fun facts
  3. To-do list (from todo.md)
  4. Shopping list (from shopping.md)
  5. Weather outlook
  6. Motivational quote
  7. Pythagorean numerology
  8. ✨ Travel Deal of the Day (NEW!)
  9. News snippet
  10. Encouraging closing
- **Delivery:** Ready for 8:00 AM Europe/London time via Telegram
- **Files created:**
  - `travel_deal_system.py` - Finds daily flight deals
  - `"YOUR_API_KEY_HERE".py` - Creates complete briefing
  - `"YOUR_API_KEY_HERE".sh` - Delivery script
  - `AMADEUS_SKILL.md` - API documentation
  - `"YOUR_API_KEY_HERE".md` - Complete setup guide

### Sample Travel Deal Found:
- **Madrid, Spain** from **93.96 EUR** return
- **Paris, France** from **116.68 EUR** return
- System searches 3 random destinations daily for best deals

### New Feature: Air Quality Reporting (2026-03-25)
- **Added to morning briefing** - Health-focused air quality reports
- **AQI Levels 1-5** with color coding and emojis
- **London-specific** with historical context quips
- **Health advice** tailored to pollution levels
- **Main pollutants** identified (PM2.5, NO2, etc.)
- **Files created:**
  - `air_quality_system.py` - Reporting engine
  - `AIR_QUALITY_FEATURE.md` - Documentation
  - Integrated into morning briefing generator

### Next Steps:
1. Schedule briefing delivery via cron
2. Add real weather integration (Open-Meteo)
3. Add personalized news (Tavily)
4. Fix numerology calculation import
5. Add hotel deals to travel section
6. Add real air quality data (OpenAQ API)

### Morning Briefing Style (2026-03-27)
- **NO process narration** - Never say "Now I have all the components. Let me compile the morning briefing"
- **Clean, direct format** - Just the briefing content
- **Example format:**
  ```
  Good morning, YOUR_NAME! ☀️
  📅 Date/day info
  🎯 To-do list
  🛒 Shopping list
  🌤️ Weather
  💪 Motivational quote
  🔢 Pythagorean numerology
  ✈️ Travel deal
  📰 News snippet
  Have a great day! 🦊
  ```
- **Delivery:** Telegram, 8:00 AM Europe/London time
