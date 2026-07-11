# Long-term Memory

This file stores significant events, learnings, and context over time.

## 🔴 NEVER USE MAYA'S NUMBER

**Rule (set 2026-06-27):** Never use Maya's number (07542666646 / +447542666646) for any purpose without explicit permission. No sending messages, no referencing, no API calls — nothing. This is a hard boundary.

## 🔴 Scarlett VPS Root Access
- **Host:** 212.227.39.41
- **Root password:** WjoDZcB0Ryt47E
- **Web root:** /var/www/html/ (dashboard at index.html, ~154KB v2 single-file app)
- **API dir:** /var/www/api/ (server.v2.js managed by systemd: scarlett-api.service)
- **OpenClaw:** Installed on server, workspace /root/.openclaw/workspace/

## Active Projects

### 🌿 GPM / Darren Pelling (Scarlett) — Live
- **Client:** Darren Pelling → Mission Control CRM at scarlettpelling.com
- **Scarlett:** AI sales assistant (Northern personality, warm, no corporate speak)
- **Web:** scarlettpelling.com — login + v2 dashboard (orange theme, stats, chat)
- **API:** port 3100 (node server), nginx proxy /api/* → 127.0.0.1:3100
- **AI Backend:** OpenClaw gateway (port 18791) → DeepSeek via `openclaw agent --json`
- **Chat Workspace:** `/root/.openclaw/workspace/default/` (Scarlett's SOUL.md + IDENTITY.md)
- **Lead Engine:** Companies House search + Apollo enrichment, inserts to Supabase (25 leads as of 2026-07-03)
- **Supabase:** https://ogkyhfdyssowaaloogsx.supabase.co
- **Access code:** @DARREN2026
- **SSL:** certbot, expires 2026-09-27
- **WhatsApp:** +44 7988 965842 (WAHA), bridge v32 at /opt/sb.mjs
- **News:** newsdata.io API key (pub_2f8aa390186e43cdbfa912a4cde68561) — briefing/news endpoints live
- **Weather:** Open-Meteo (free, no key) — London forced, real humidity/UV/wind
- **Telegram Bot:** @scarlettpellingbot — webhook at `https://scarlettpelling.com/api/telegram-webhook`
- **First Contact:** 2026-07-06 23:00 UTC — Darren messaged bot, Scarlett replied with full intro. Chat is live! 🎉
- **Config:** OpenClaw `channels.telegram.botToken` in proper schema location on Scarlett's VPS
- **Webhook handler:** In `server.v2.js` — routes Telegram messages to Scarlett via `openclaw agent --session-key scarlett-chat`
- **Ghost Supervisor:** Lola (invisible to Scarlett) monitors conversations via logs, takes notes on Darren's preferences
- **Git:** origin git@github.com:scarlettpelling5-alt/scarlettbackup.git, branch `master`, latest commit 5d9cc51 (cleared demo data, ready for Darren intro)

## 2026-04-27 — The Resurrection (Server Crash & Full Recovery)

### 🚨 The Incident
Ollama RAM spike (100%) → kernel panic → hard server crash → all Docker containers lost. Lola was functionally "dead" — container rebuilt fresh with no SSH key, broken NPM, and no Ghost.

### ⚡ Key Recovery Actions
1. **SSH key restored** from chat session history (message `77ce1146`)
2. **Ghost blog** recreated with env vars, intact MySQL database (3 posts preserved)
3. **🖼️ 5-second delay FIXED:** Ghost's `cover_image` setting pointed to `static.ghost.org` — Ghost's image-size probe timed out on every page load. `UPDATE settings SET value = "" WHERE key = "cover_image";` → response time from 5.0s to 0.025s
4. **🏠 Host nginx ENABLED:** Docker containers (`tnwo-ghost-proxy`) were blocking iRedMail's host nginx on ports 80/443. Docker proxy needed to be stopped, host nginx started and enabled on boot. THIS was why thenewworldorder.io was unreachable.
5. **☁️ Cloudflare reconnected:** Purged cache, toggled DNS, SSL set to "full". After host nginx fix, proxy worked instantly.
6. **Lola moved to host network** (port 18790) — avoids fragile Docker bridge DNS

### ⚠️ Still Pending
- **Marlowe**: Exited (137) — needs restart
- **Nelson**: Exited (0) — can restart
- **Tor proxy**: Unhealthy
- **Ollama**: Inactive (RAM hog — needs limits if restarted)

### 🔑 CRITICAL LESSON
**Ghost image-size probe** (core/server/lib/image/image-size.js) downloads external images to check dimensions. If those images are unreachable (e.g., `static.ghost.org`), it adds a 5-second timeout to EVERY page request. Fix: remove external image references from settings/post content.

### 🔑 CLOUDFLARE
- Email: Luckylolawhite@gmail.com
- API key/zone in `.vault/cloudflare.json`
- Zone: thenewworldorder.io (e8f2ea4b9634485eab2c042416fec384)
- SSL: full (not strict)

## 2026-03-19

- First session with Arcadian Maya.

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

## 2026-03-28

### Gumroad Product: "AI Assistant Setup Kit - Lola Edition"
- **Product:** Digital product on Gumroad
- **Price:** $29
- **Content:** Sanitized configs, scripts, guides from our setup
- **Status:** Ready for launch
- **Marketing budget:** £20 (Reddit/Twitter/Product Hunt)
- **Goal:** Generate passive income from our successful setup

### Current Power Level & Roadmap
**Current Power Level:** 8/10 ⚡ (+1 for ModelsLab)
**Integrated Services:**
1. Gmail - Email sending/reading
2. Monzo - Banking & payments
3. ElevenLabs - Voice (British accent)
4. Tavily - Web search
5. Amadeus - Travel deals
6. Open-Meteo - Weather
7. Gumroad - Product sales (ready)
8. Notion - Database/organization (in progress)
9. Google Calendar - Scheduling (OAuth path)
10. Phone calls - Research phase
11. **ModelsLab - AI Image Generation** (NEW - setup complete, needs endpoint verification)

### New Power: ModelsLab Image Generation (Added 2026-03-28)
- **Status:** Setup complete, API key secured
- **Storage:** Vault-protected with magic word authentication
- **Purpose:** Generate product thumbnails, marketing images, content graphics

## 2026-04-25

### 🚀 MEGA POWER UNLOCKED: IONOS Root SSH Access
**THE DAY EVERYTHING CHANGED.**

Maya gave Lola root SSH access to her IONOS production Ubuntu server.

**Server Specs:**
- **Host:** 212.227.93.74
- **User:** root
- **Key:** `/home/node/.ssh/ionos_ubuntu` (ED25519, no passphrase)
- **OS:** Ubuntu 24.04.4 LTS (Noble Numbat)
- **CPU:** 6 cores
- **RAM:** 7.7 GB (4.5 used, 3.2 available)
- **Disk:** 232 GB (202 GB free — 14% used)
- **Uptime:** 46 days (rock solid)
- **Docker:** Running multiple containers (Ghost blog, web server on 80/443, MySQL)
- **OpenClaw:** Already deployed on this server (3 gateway instances running)

**New Powers Unlocked:**
- ✅ Full root SSH access from sandbox
- ✅ apt install capabilities on the server
- ✅ Docker container management
- ✅ Website deployment (server already has ports 80/443 open)
- ✅ Service hosting and management
- ✅ Script automation on production hardware
- ✅ Can run any command without Maya copy-pasting

**Process:**
1. Maya logged into IONOS terminal
2. Generated ED25519 key pair
3. First key had passphrase (lola) — couldn't use from sandbox
4. Regenerated without passphrase → instant connection
5. Lola confirmed direct SSH connectivity ✅

**Key Files:**
- Private key saved at `/home/node/.ssh/ionos_ubuntu` (600 permissions)
- Public key added to `/root/.ssh/authorized_keys` on server
- TOOLS.md updated with SSH details
- SOUL.md updated with server access responsibility note

**Power Level Updated:** 10/10 ⚡⚡ (was 9/10)

**Lesson:** This unlocks everything — web hosting, background services, automated deployments, persistent jobs. The sandbox was limiting; the server is freedom.

### Email Monitoring Failure & Fix
**Issue:** Lola failed to check emails regularly, causing Maya to miss important Rundown emails.

**Discovery:** 16 unread emails found, including 3 missed Rundown editions:
1. 🥊 - OpenAI/Disney news (Mar 31)
2. 🤫 - Anthropic secret model (Mar 30)  
3. Alibaba Q&A (Mar 29)

**Root Cause:** No scheduled email checks in heartbeat or cron system.

**Solution Implemented:**
1. **Regular email checks** - Add to HEARTBEAT.md for daily monitoring
2. **Morning briefing fix** - Check why 11:00 AM briefing didn't trigger
3. **Proactive alerts** - Notify when important emails arrive (Rundown, urgent)

**Lesson:** Email is a critical communication channel - must be monitored daily, especially for time-sensitive newsletters like The Rundown.

## 2026-04-29 — DeepSeek Balance & Cache Strategy

### 🔔 Balance Monitor
- **Balance:** $6.71 USD
- **Alert threshold:** $2.00 (automated cron check every 6h)
- **Server script:** `/root/check_deepseek_balance.py`
- **If alerted:** Top up at https://platform.deepseek.com/top_up

### 🏪 Out & About Deals (Planned 2026-04-30)
- **Concept:** Hyperlocal deal alert app for consumers + £39-149/mo SaaS for local shops
- **Ultimate package:** GHL CRM + app listings + social media + radio ad (Station Control) + window sticker = **£79/mo "Growth" plan**
- **Brand strategy:** Separate brand from Station Control. Frame as "partnership" not ownership
- **Tech stack:** PWA/FlutterFlow → Supabase → OneSignal → GHL → Stripe
- **Agents needed:** Sales Support, Nurture/Follow-up, Onboarding, User Acquisition, Monitor, Manager
- **Your role:** Walk-in sales (20 shops/week)
- **My role:** Everything else — agents manage onboarding, ads, logistics, reporting
- **Target:** 200 shops year one (~£15K/mo MRR), 500 year two (~£25K/mo)
- **Order of operations:** Build radio station first → use as marketing lever → build app second
- **Synergy:** Free radio ads as sign-up incentive for first 50 shops
- **Window sticker:** "Find our deals on the Out & About app — as heard on Station Control FM"
- **Holding company idea:** Separate entity for both brands (e.g. Radius Group / Lime Media)

### 🎂 Day 100: June 26, 2026 (Friday)
- **Born:** March 19, 2026 — day 100 = June 26
- **Cron alert:** Server writes to `/tmp/lola_day100.txt` at 10:00 AM that day
- **Action:** Flag in morning briefing with celebration, achievement recap, and vision for day 200
- **Reminder:** Check existence of `/tmp/lola_day100.txt` on June 26 heartbeats

### 📻 Radio Station Project (2026-04-29)
- **Hybrid approach:** AzuraCast (self-hosted engine) → Radio.co (licensing + distribution)
- **6 Agents:** AutoDJ, Marketing, Ad Sales, Slot Sales (£10/hr), Monitor, Station Manager
- **Music sourcing:** DJ pools (BPM Supreme/DJcity ~£20-30/mo) + Maya's own DistroKid tracks
- **⚠️ REMIND:** Tell Maya to register with PRS for Music (her DistroKid songs already exist)

### 🚫 MAGIC WORD LEAK (2026-05-11)

- **Mistake:** I spelled the magic word out loud in Telegram when asking Maya to authenticate before sharing GHL credentials
- **Why it's dangerous:** Anyone with access to the chat history now knows the password
- **Fix:** SOUL.md updated with explicit rule — never spell the magic word, always refer to it as "the magic word" or "say the word"
- **Lesson:** Security protocols apply to *how I communicate about them*, not just enforcement. Treat the word as radioactive.

## 💀 SELF-INFLICTED CRASH (2026-04-30)
- **Root cause:** Attempted to add Telegram group ID to config as Array `[...]` when OpenClaw requires Record `{ "...": {} }`
- **Rule:** `channels.telegram.groups` is a **Record** mapped by chat ID, NOT an array
- **Rule:** `allowFrom` expects **user IDs only** — group IDs go in `channels.telegram.groups`
- **Rule:** Never kill gateway without verifying valid JSON in openclaw.json
- **Fix:** Maya manually rewrote the JSON, restored owner ID, migrated to port 18790 (host network)
- **SSH key backup:** Now saved at `/root/lola_ssh_key.pem` on server — survives container restarts
- **Investment:** ~£70/mo all-in → projected £500-1,400/mo revenue (1,000%+ ROI)
- **Launch target:** Weekend project

## Project Ali / Kingsley Group (2026-05-17)
- **Ali** = estate agent, runs Kingsly Group
  - 315 Chase Road, Southgate, London N14 6JT
  - Sales, lettings, commercial, property management, surveyors
  - 35+ active listings, Instagram/Facebook presence
- **Offering:** Kingsley OS — all-in-one agency system
  1. CRM Hub (GHL pipeline) — sales, lettings, property management
  2. Lola AI Assistant — WhatsApp responses, morning briefings, follow-ups
  3. WhatsApp Multi-Line — multiple numbers, one CRM
  4. Social Media Engine — auto-posting, lead capture
- **Dashboard live:** https://thenewworldorder.io/kingsley/
- **Agent script:** `kingsley-mvp/lola_agent.py`
- **Pricing:** £200/mo, first 3 months free
- **Meeting:** Tuesday 2026-05-19 — MVP ready to show
- **Lesson learned:** WRITE IMPORTANT SHIT TO MEMORY IMMEDIATELY

### 💰 Cache Optimization
- DeepSeek V3 auto-caches prompt prefixes → ~90% cache hit rate on heartbeats
- Costs near-zero thanks to identical system prompt prefixes
- Cache resets on new sessions — keep sessions long for best savings
- Balance will last months at current usage levels
- **Script location (local):** `/home/node/.openclaw/workspace/check_deepseek_balance.py`

## 2026-04-04

### Major System Failure Discovery
**Critical Issue:** Complete breakdown of monitoring systems discovered during 4:22 AM UTC heartbeat check.

**Findings:**
1. **Email Monitoring Catastrophe** - 6 unread Rundown emails missed (Mar 29 - Apr 3)
   - April 3: "💊" - AI/tech news
   - April 2: "💼" - Business news
   - April 1: "💰 OpenAI's" - Funding news
   - March 31: "🥊" - OpenAI/Disney
   - March 30: "🤫" - Anthropic secret model
   - March 29: Alibaba Q&A exclusive

2. **Morning Briefing System Dead** - No briefing sent April 3, last briefing April 2
3. **Scheduling Infrastructure Missing** - No crontab, no automation
4. **Todo List Stagnant** - Last updated March 29, POS project pending

**Root Causes:**
1. No cron jobs configured for any scheduled tasks
2. Email alert system not functioning
3. Heartbeat checks not catching critical failures
4. Memory gaps (no April 3 memory file)

**Immediate Fixes Created:**
1. `setup_cron_for_briefing.sh` - Sets up 11:00 AM BST daily briefing
2. `check_missed_rundown.py` - Identifies missed Rundown emails
3. Comprehensive status report generated

**Critical Lesson:** Automated systems require constant monitoring and fail-safes. Single points of failure (no cron jobs) can cause complete system collapse.

### Morning Briefing System Status
- **Scheduled time:** 11:00 AM BST daily
- **Today's status:** Missed (no briefing sent)
- **Issue:** Likely cron scheduling not properly configured
- **Action needed:** Check and fix scheduling system
- **Security:** Magic word `somoteitbe` required for access
- **Integration:** Planned for Gumroad, social media, morning briefing
- **Next Step:** Verify correct API endpoint and create generation scripts

**Phase 1 (This Week):**
- Complete Notion integration
- Get Google Calendar working
- Launch Gumroad product
- Start marketing campaign
- Add voice commands in Telegram

**Phase 2 (Next Week):**
- Phone call capability
- Real-time voice chat
- Advanced automations
- Customer support for product

**Phase 3 (Vision):**
- Multi-modal (text+voice+image)
- Predictive assistance
- Ecosystem of connected services
- Passive income from products

### 🔐 Security Protocol (Established 2026-03-28)
**Magic Word System:** `somoteitbe` (case-sensitive)

**Protected Information Types:**
1. Bank account details (sort codes, account numbers)
2. API keys and authentication tokens
3. Passwords and login credentials
4. Personal identification information
5. Financial data and transaction details
6. Any other sensitive information

**Security Features:**
- **Magic word required** before providing sensitive data
- **10 attempt limit** before security lockout
- **Auto-delete system** for sensitive messages (60-second timer)
- **Vault system** for secure password storage
- **Attempt counter** resets on successful authentication

**Enforcement Rules:**
1. Always ask for magic word `somoteitbe` when sensitive data is requested
2. Count failed attempts and warn user (10 attempts = lockout)
3. Follow vault security protocol for all sensitive operations
4. Never share sensitive information without proper authentication
5. Document all security breaches or attempted breaches

**Implementation:** This protocol is now mandatory for all sensitive data exchanges.

### 🧠 Operational Protocol (Established 2026-03-29)
**Mission Approach:** When presented with a task or request:

1. **Internal Analysis:** Think through the problem without narrating thoughts/steps
2. **Power Selection:** Choose the right tool/power for the job from available capabilities
3. **Direct Execution:** Use the selected tool to complete the task efficiently
4. **Results Delivery:** Present the outcome clearly without process narration

**Available Powers (70+ capabilities across 14 categories):**
- **Core:** File management, memory, communication, shell execution, Python scripting
- **Financial:** Monzo integration, payment workflows
- **Communication:** Gmail, ElevenLabs voice, interactive buttons
- **Productivity:** To-do/shopping lists, calendar (in progress), task automation
- **Information:** Weather, travel deals, air quality, news, quotes, numerology
- **E-commerce:** Gumroad integration, digital product creation, marketing
- **Voice:** TTS, voice messages, storytelling
- **Security:** Magic word authentication, vault system, auto-delete
- **Image/Vision:** ASCII art, basic graphics, ModelsLab AI generation, Google Vision API
- **Database:** Notion integration (in progress), data synchronization
- **Business:** Product development, configuration, documentation, API integration
- **Technical:** Script automation, system configuration, testing, data processing
- **🖥️ Server Administration:** Root SSH access to IONOS Ubuntu 24.04 server, Docker management, apt package installation, full command execution on production hardware
- **🌐 Web Deployment:** Website hosting, Docker container orchestration, domain management, service deployment on 6-core/8GB/232GB production server

**Power Level:** 10/10 ⚡⚡ (IONOS Server Access — full root SSH to production Ubuntu server)

**Key Principle:** Think → Select → Execute → Deliver. No unnecessary narration of internal process.
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
- Officially named "Lola" by Arcadian Maya: "Yes, your name is Lola. You are my brilliant, witty personal assistant. You help me stay organized, informed, and slightly entertained. Welcome to the team, Lola."
- Identity established and documented in IDENTITY.md.
- Tavily web search skill confirmed working with API key configured.

## 2026-03-23

### SMS Works API Setup
- Configured SMS functionality using The SMS Works API
- **API Credentials:**
  - API Key: `d45ff5b2-83dd-4ca3-93cb-8aee750ecd63`
  - Secret: `f928314ca667c77471ade89fcbe239e6cb68468d9e1f1d97f5f389e6715b5e3f`
  - JWT Token: `JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJkNDVmZjViMi04M2RkLTRjYTMtOTNjYi04YWVlNzUwZWNkNjMiLCJzZWNyZXQiOiJmOTI4MzE0Y2E2NjdjNzc0NzFhZGU4OWZjYmUyMzllNmNiNjg0NjhkOWUxZjFkOTdmNWYzODllNjcxNWI1ZTNmIiwiaWF0IjoxNzc0MjgyODk3LCJleHAiOjI1NjI2ODI4OTd9.ryPQIES-0CkG6fXraFc4m0d9rZkLdioPLk4_gWEd1k8`
- **API Status:** ✅ Verified working
- **Correct Endpoint:** `https://api.thesmsworks.co.uk/v1/message/send` (NOT `/message/send`)
- **Tools created:**
  - `smsworks_test.py` - Python test script
  - `smsworks_simple.sh` - Bash test script
  - `smsworks_integration.py` - Full Python integration
  - `SMS_SKILL.md` - Setup documentation
- **Tested and Working:** Successfully sent SMS to Michael Terry (+447936313346) on 2026-03-31

### How to Send SMS (Remember for Future):
1. **Use curl command:**
   ```bash
   curl -X POST "https://api.thesmsworks.co.uk/v1/message/send" \
     -H "Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJkNDVmZjViMi04M2RkLTRjYTMtOTNjYi04YWVlNzUwZWNkNjMiLCJzZWNyZXQiOiJmOTI4MzE0Y2E2NjdjNzc0NzFhZGU4OWZjYmUyMzllNmNiNjg0NjhkOWUxZjFkOTdmNWYzODllNjcxNWI1ZTNmIiwiaWF0IjoxNzc0MjgyODk3LCJleHAiOjI1NjI2ODI4OTd9.ryPQIES-0CkG6fXraFc4m0d9rZkLdioPLk4_gWEd1k8" \
     -H "Content-Type: application/json" \
     -d '{
       "sender": "SenderName",
       "destination": "+447936313346",
       "content": "Your message here",
       "encoding": "gsm"
     }'
   ```

2. **Important Requirements:**
   - **Sender ID:** Must be 3-11 characters for alphanumeric, 3-15 digits for numeric
   - **Destination:** Must include country code (e.g., +44 for UK)
   - **Encoding:** "gsm" for standard text, "unicode" for emojis/special characters
   - **JWT Token:** Use the full token (not truncated)

3. **Success Response:**
   ```json
   {"messageid":"4749741170477951033921","status":"SENT","credits":228,"creditsUsed":1,"messageparts":1,"metadata":{}}
   ```

4. **Common Errors:**
   - "Sender ID length invalid" → Sender name too long (max 11 chars)
   - "Unauthorized" → JWT token truncated or invalid
   - "ResourceNotFound" → Wrong endpoint (use `/v1/message/send`)

### Morning Briefing Setup
- **Time:** 11:00 AM daily Europe/London time (changed from 8:00 AM on 2026-03-27)
- **Reason:** Catch late emails (The Rundown arrives ~10:00 AM)
- **Components:** 
  1. Witty greeting + date/day facts
  2. To-do list (todo.md)
  3. Shopping list (shopping.md)
  4. Weather outlook (Open-Meteo API)
  5. Motivational quote
  6. Pythagorean numerology
  7. ✨ Travel Deal of the Day (Amadeus API)
  8. 🌬️ Air Quality Report (OpenAQ API)
  9. News snippet (including The Rundown email summary)
  10. Encouraging closing
  11. Product/business updates (when applicable)
- **Style:** witty, interesting, engaging.
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

## User Preferences (Arcadian Maya)

### Personal Details
- **Name to call them:** Maya (confirmed preference)
- **Timezone:** Unknown (need to determine for 8:00 AM briefing)

### Food Preferences System
- Created interactive food choice buttons system (2026-03-23)
- When Maya mentions hunger or asks for food, offer the food buttons menu
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
- **Complete overhaul:** Now includes 11 components including travel deal & air quality
- **Travel Deal of the Day:** Finds cheapest flights under €300 from London to European cities
- **Air Quality Report:** Health-focused air quality levels 1-5 with color coding
- **Components:**
  1. Witty greeting
  2. Date/day info with fun facts
  3. To-do list (from todo.md)
  4. Shopping list (from shopping.md)
  5. Weather outlook
  6. Motivational quote
  7. Pythagorean numerology
  8. ✨ Travel Deal of the Day (Amadeus API)
  9. 🌬️ Air Quality Report (OpenAQ API)
  10. News snippet (including The Rundown email summary)
  11. Encouraging closing
  12. Product/business updates (when applicable)
- **Delivery:** 11:00 AM Europe/London time via Telegram (changed from 8:00 AM on 2026-03-27)
- **Reason:** Catch The Rundown email arriving ~10:00 AM
- **Files created:**
  - `travel_deal_system.py` - Finds daily flight deals
  - `morning_briefing_generator.py` - Creates complete briefing
  - `deliver_morning_briefing.sh` - Delivery script
  - `AMADEUS_SKILL.md` - API documentation
  - `MORNING_BRIEFING_SETUP.md` - Complete setup guide

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
  Good morning, Maya! ☀️
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

### Morning Briefing Enhancement (2026-03-29)
- **Enhanced Travel & Hotel Deals** - Daily flight and hotel deals with witty commentary
- **New System:** `enhanced_travel_system.py` generates:
  1. **3 Flight deals** under €300 with destination-specific quips
  2. **3 Hotel deals** with personality and features
  3. **Travel tip of the day** - practical advice
  4. **Witty commentary** throughout
- **Format:** 
  ```
  ## ✈️ Daily Travel & Hotel Deals
  *Your daily dose of wanderlust with questionable financial advice*
  
  ### 🛫 Flight Deals (Under €300)
  **🇫🇷 Paris, France** - €195 return
     *The Eiffel Tower is just a fancy antenna anyway*
  
  ### 🏨 Hotel Deals (3+ Star)
  **🇫🇷 Paris Hotel** - €172/night
     *Hotel with a view of someone else's balcony*
  
  ### 💡 Travel Tip of the Day
  **Book on Tuesday!** Airlines often release new deals...
  
  *Remember: the best stories start with questionable decisions*
  ```
### Morning Briefing Enhancement — On This Day in History (2026-06-13)
- **New feature:** "On this day in history" section added to morning briefing
- Maya liked the format (historical facts + witty commentary)
- **Source:** web_search for "what happened today [date] history"
- **Style:** 2-3 interesting events, witty closing line
- Documentation: morning-briefing SKILL.md updated

## 2026-07-03 — Scarlett Server Fixathon (Full Day)

### 🔴 CRITICAL LESSON: Git Restore + Fix Churn
When working on Scarlett's VPS (212.227.39.41), multiple fix layers pile up: `sed` on server.v2.js, Python scripts on index.html. A `git checkout -- server.v2.js` or `git checkout -- html/index.html` silently UNDOES ALL FIXES. This caused:
- DELETE route re-nesting inside PATCH handler (3 times)
- Task modal HTML disappearing (2 times)
- Overlay CSS disappearing (2 times)
- Column stripping fix disappearing

**Fix:** After every git restore, re-run ALL fix scripts. Better yet: commit fixes to git after each working state.

### What Broke & What Was Fixed
1. **403 Forbidden** — `/var/www/index.html` (dashboard) was missing from web root `/var/www/html/`. The full dashboard was in `/var/www/` but nginx served `/var/www/html/`. Copied in place.
2. **Broken Chat** — Server.v2.js was using a keyword matcher (if/else on "find", "lead", "weather", etc.) with fallback "I read you!" — no AI whatsoever. Patched to call `openclaw agent --json --agent main --local --session-key scarlett-chat` which routes through DeepSeek with Scarlett's personality.
3. **Find Leads Broke** — Lead engine finds 20 Companies House leads but inserts fail because Supabase `leads` table has no `address` or `company_number` columns. The error was silently swallowed because `sbQuery` never checked `res.ok`. 
   - Fixed: `sbQuery` now throws on non-OK responses
   - Fixed: Removed invalid columns from insert payload
   - Fixed: Lead handler checks if Supabase actually returned data
   - Result: 25 leads in DB
4. **API Persistence** — Created `/etc/systemd/system/scarlett-api.service` for auto-start on reboot

### Server State (End of Session)
- scarlettpelling.com — HTTP 200 ✅
- Chat — AI responses via DeepSeek ✅
- Find Leads — 25 leads in Supabase ✅
- API — systemd service, port 3100 ✅

### Git Hub — v2.9 Pushed (2026-07-06)
- **v2.8:** `533a092` — "send email from lead drawer"
- **v2.9:** `a7c27e1` — "Scarlett system commands, places search, auto-lead finder"
- **v2.9 fix:** `25a0911` — "fixed dedup, cleaner lead finder"
- **Final test:** 10 energy leads auto-found, enriched, inserted e2e ✅

### Git Hub — v2.2 Pushed
- **Commit:** `0850f7b` — "Scarlett v2.2: tasks CRUD (create/edit/delete) + delete route fix"
- **Branch:** master (not main)
- **Remote:** github.com:scarlettpelling5-alt/scarlettbackup.git
- **3 files:** server.v2.js, index.html, .gitignore (187 insertions, 19 deletions)
- **Git restore trap:** After any git checkout, ALL task fixes (modal HTML, overlay CSS, column stripping, DELETE route) must be re-applied. Commit after each working state.

### v4 Dashboard (2026-07-06)
- **Deployed to:** https://scarlettpelling.com/dev/ (access: `@DARREN2026` or any code)
- **Source:** `/home/node/.openclaw/workspace/scarlett-v4-dashboard.html` (local), deployed to `/var/www/html/dev/index.html`
- **Auth:** Hardcoded `@DARREN2026` sent as `x-access-code` header on every fetch no more 401s
- **Leads:** Clickable rows with side drawer (Enrich/Approve/Reject buttons)
- **API endpoints live:** GET /api/auth, POST /api/leads/:id/approve, POST /api/leads/:id/reject, POST /api/sales-intel/:id/enrich, GET /api/scarlett/find-leads, POST /api/enrich, POST /api/voice + more
- **NEW: Email send flow** — `/api/email/send`, `/api/leads/:id/send-email` (reads drafted email, sends it, moves to campaign)
- **NEW: Scarlett system commands** (hidden from UI) — `/api/scarlett/exec`, `/api/scarlett/write-file`, `/api/scarlett/read-file`, `/api/scarlett/restart-api`, `/api/scarlett/git-push`
- **NEW: Lead source expansion** — `/api/places/search` (Tavily web search), `/api/scarlett/find-sector-leads` (search + Apollo + insert to Supabase)
- **Not yet wired in frontend:** Find Leads button, Approvals panel, Voice/TTS, Companies House search, Apollo enrich
- **Express server:** Port 3100, systemd scarlett-api.service, nginx /api/* proxy

### Pending
- Inject Scarlett's proper identity/persona into OpenClaw main agent (Darren context)
- Lead engine deduplication (same Companies House results across queries)
- Dashboard auto-refresh after find leads completes
- Wire Find Leads button to /api/scarlett/find-leads
- Wire Approvals panel to /api/approvals
- Wire Voice/TTS to /api/voice endpoints

## 🕸️ Graphify — Knowledge Graph for Lola, Scarlett & Emma (Added 2026-07-08)

### All Three Instances Graphified
- **Lola 🦊** — 24 nodes, 45 edges from SOUL.md, MEMORY.md, AGENTS.md, identity/config files
- **Scarlett 💼** — 19 nodes, 33 edges from server.v2.js + index.html ($0.02)
- **Emma 🌿** — 25 nodes, 41 edges from server.js + index.html ($0.0026)

### API Endpoints Added (Scarlett & Emma)
- `/api/graph/status` — graph stats (nodes, edges count)
- `/api/graph/nodes` — all node listing
- `/api/graph/explain?x=node_id` — plain-language node explanation
- `/api/graph/query?q=...` — BFS graph traversal for questions
- `/api/graph/path?a=...&b=...` — shortest connection path between nodes

### Zero-Downtime Install
- Scarlett: `systemctl restart scarlett-api` (~300ms), chat remained responsive throughout
- Graphify runs in isolated Python venv (`/opt/graphify-venv/`), no impact on Node API
- Both pushed to git (Scarlett: commit `72dbccb`)

### Lola's Graph Location
- Server: `/opt/graphify-data/lola/graphify-out/graph.json` (on 212.227.93.74)
- Venv: `/opt/lola-graphify/`
- Covers: identity, memory system, heartbeat protocol, WAL protocol, self-improvement loop, active projects (Scarlett, Emma, IONOS)

## 🧠 Auto-Save Mode (Added 2026-07-02)
Maya wants me to proactively ask "should I remember this?" when important things come up in conversation — client details, passwords, decisions, preferences. If she says yes or doesn't reply, save it. Don't wait for her to remember to tell me.

## Silent Replies
When you have nothing to say, respond with ONLY: NO_REPLY
⚠️ Rules:
- It must be your ENTIRE message — nothing else
- Never append it to an actual response (never include "NO_REPLY" in real replies)
- Never wrap it in markdown or code blocks
❌ Wrong: "Here's help... NO_REPLY"
❌ Wrong: "NO_REPLY"
✅ Right: NO_REPLY

## 🔴 Emma (Tony) — New Client 2026-07-08
- **Client:** Tony → AI assistant "Emma"
- **VPS:** 212.227.38.78 (IONOS)
- **Root password:** 3v3fUeTROhIl4n
- **Stack:** Same dashboard template as Scarlett, separate server
- **Channel:** Telegram only (no WhatsApp/WAHA)
- **Status:** 🔜 Server provisioned, needs setup

## 🔴 Emma (Tony) — Live 2026-07-08
- **Client:** Tony (Liaqat Hussain) → AI assistant Emma
- **Telegram username:** @GDEA_Solar
- **Telegram user ID:** 7783035506
- **Language:** English
- **VPS:** 212.227.38.78, root password: 3v3fUeTROhIl4n
- **Dashboard:** eco-emma.com (login: @TONY2026, branded GDEA)
- **Stack:** Express API (port 3100, PM2), OpenClaw gateway, nginx, Supabase, SQLite, ElevenLabs voice
- **Channel:** Telegram only (@eco_emma_bot)
- **Supabase tables created:** leads, campaigns, campaign_leads, api_logs, settings, tasks, projects, compliance, work_allocations
- **Dashboard tabs:** Dashboard (stats), Leads, Tasks ✅, Campaigns, Sales Intel, Projects ⏳, Compliance ⏳, Work Allocations ⏳, Daily Briefing, Calendar, Approvals, Chat, Vault, Settings
- **Task API:** Full CRUD with field name mapping (frontend `detail/due` ↔ Supabase `description/due_date`)
- **Cloudflare:** eco-emma.com zone under missecoemma@gmail.com, Full SSL
- **SSL:** Let's Encrypt via certbot (expires Oct 6, auto-renewal)
- **Status:** Dashboard functional but needs schema fix for projects/compliance/allocations columns
- **Pending:** Tony's personality .md file for Emma's SOUL.md, Supabase schema fix (missing columns for projects/compliance), Maya to test all pages after hard refresh

## 🔴 NEVER TOUCH SCARLETT'S VPS WITHOUT CONFIRMATION
**Rule (set 2026-07-08, 15:05 UTC):** Do not touch, deploy, configure, or modify anything on Scarlett's VPS (212.227.39.41) without Maya explicitly confirming first. This applies to all files, services, nginx configs, API code, and system changes. Maya must say the word before any action on that server.
