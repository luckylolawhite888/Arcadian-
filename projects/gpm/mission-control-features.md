# Mission Control — Full Feature Breakdown (Front-End + Back-End)

> **For:** Full-stack dev team
> **Platform:** scarlettpelling.com (access code: GPM2026)
> **Vibe:** Dark theme, Tesla dashboard meets Notion. Mobile-first responsive.

---

## 🔧 General Architecture

### Front-End
- **Single-page app** (SPA) — 8 views, JS router, no page reloads
- **Dark theme only** — deep charcoal (#0f0f11) background, dark grey cards (#252529), warm amber accent (#d4a853)
- **Sidebar** — fixed left, icon-only with tooltips on hover. Darren's name at top
- **API calls** to bridge on port 3001 (same origin, proxied through nginx)
- **No login system** — a single access code screen (GPM2026) unlocks all views
- **Icon pack:** Lucide or similar clean outline set
- **Micro-animations** — smooth page transitions, hover states, card load animations

### Back-End (Bridge)
- **Node.js server** on port 3001 (`/opt/sb.mjs`)
- Receives incoming Telegram messages, passes to Scarlett's AI brain
- Exposes REST API endpoints for the dashboard
- Reads/writes to JSON files for data persistence (no database yet)
- Runs OpenClaw agent CLI for AI responses: `openclaw agent --json --message "..."`

### Data Storage (Current — Filesystem)
- `/var/log/scarlett/` — bridge logs
- `/var/log/scarlett/scarlett-profile/` — Darren's learned profile (JSON)
- `/var/log/scarlett/conversation_memory.json` — full chat history
- `/var/log/scarlett/leads.json` — lead queue
- `/var/log/scarlett/campaigns.json` — email campaigns
- `/var/log/scarlett/settings.json` — Darren's settings

---

## 🏠 1. Home / Dashboard

### What It Does
The landing page. Darren sees his business at a glance in <5 seconds. Should feel like walking into a well-organised office.

### Front-End
- **Welcome card** — "Good afternoon, Darren" with date. Greeting changes based on time of day
- **Today's briefing widget** — small card, 3-4 lines: weather icon + temp, next calendar event, any urgent reminders. Data pulled from `/api/briefing`
- **Quick stats row** — 4 stat cards side by side:
  - 🎯 Leads today (number + small green/red change arrow)
  - ✉️ Emails sent this week
  - 💬 Replies received
  - ☑️ Tasks pending
- **Action items card** — clickable card(s) that link to other views. e.g. "3 leads waiting for approval →" links to Lead Queue. "2 email drafts awaiting review →" links to Email Campaigns
- Each stat card is clickable → navigates to the relevant section

### Back-End
- `GET /api/briefing` — returns:
```json
{
  "greeting": "Good afternoon",
  "date": "2026-07-02",
  "weather": { "temp": 22, "condition": "Partly cloudy", "icon": "⛅" },
  "nextEvent": { "title": "Call with EcoSolar", "time": "15:00" },
  "reminders": ["Check installer agreement"],
  "stats": {
    "leadsToday": 4,
    "emailsSentWeek": 12,
    "repliesReceived": 3,
    "tasksPending": 2
  },
  "actions": [
    { "label": "3 leads waiting for approval", "link": "leads" },
    { "label": "2 email drafts to review", "link": "campaigns" }
  ]
}
```
- Briefing data compiled from: lead queue stats, email campaign stats, conversation memory, settings
- Weather fetched from Open-Meteo API (free, no key needed) for Enfield, London

---

## 💬 2. Scarlett Chat

### What It Does
Darren can talk to Scarlett from the dashboard — same conversation as Telegram, but in-browser with full history, search, and a nicer UI.

### Front-End
- **Full chat interface** — message bubbles with avatars:
  - Darren's messages: right-aligned, dark grey bubble (#3a3a3e)
  - Scarlett's messages: left-aligned, amber-accent bubble (#d4a853)
- **Text input** at bottom with send button (Enter to send)
- **Typing indicator** — "Scarlett is typing..." animation while waiting for her response
- **Search bar** at top — searches through full conversation history (calls `/api/chat/search?q=...`)
- **Message timestamps** on hover — "Today 14:32" or "Yesterday 09:15"
- **Chat persists** — on page reload, last 50 messages loaded instantly
- **Scroll to bottom** on new message automatically

### Back-End
- `POST /api/chat` — send a message to Scarlett:
  - **Request:** `{ "message": "Hey Scarlett, check those leads" }`
  - **Response:** `{ "reply": "Already on it boss 🤘 Found 3 in your area..." }`
  - Under the hood: Bridge calls OpenClaw agent CLI with Scarlett's personality loaded
  - Both message and reply saved to `conversation_memory.json`
- `GET /api/chat?limit=50&before=<timestamp>` — fetch conversation history
- `GET /api/chat/search?q=solar+installer` — search messages
- Profile extraction: after each exchange, check for new facts about Darren → save to `scarlett-profile/`

---

## 📋 3. Lead Queue

### What It Does
The money maker. This is where Scarlett presents potential installer companies she's found. Darren approves or rejects them. Approved = Scarlett fires off an intro email.

### Front-End
- **Table view** with columns:
  | Checkbox | Company | Location | Contact | Source | Status | Notes | Actions |
  |----------|---------|----------|---------|--------|--------|-------|---------|
- **Source column** shows where she found them: Apollo.io, MCS Register, Companies House, Website
- **Status column** — pill badges: New | Contacted | Replied | Meeting Booked | Signed | Rejected
- **Approve button** (green pill) — marks as "Contacted", triggers Scarlett to send intro email
- **Reject button** (red pill) — removes from queue, Scarlett saves why for future searches
- **Bulk select** — checkbox per row + "Approve All" / "Reject All" buttons at top
- **Notes input** — expandable inline text field per row. Darren types why he's interested/not interested
- **Filter bar** above table — dropdowns for Region (South East, London, etc), Source (Apollo, MCS, etc), Status (New, Contacted, etc)
- **Sortable columns** — click column headers to sort
- **Lead count badge** next to the sidebar icon showing unapproved leads

### Back-End
- `GET /api/leads` — returns full lead list:
```json
[
  {
    "id": "lead_001",
    "company": "EcoSolar Solutions Ltd",
    "location": "Brighton, East Sussex",
    "contactName": "James Wilson",
    "contactEmail": "james@ecosolar.co.uk",
    "contactPhone": "01273 555 014",
    "source": "apollo",
    "status": "new",
    "notes": "",
    "foundDate": "2026-07-01",
    "companySize": "5-10 employees",
    "mcsCertified": true,
    "website": "https://ecosolar.co.uk"
  }
]
```
- `PATCH /api/leads/:id` — approve/reject/add notes:
  - **Request:** `{ "status": "approved", "notes": "Looks good, send intro" }`
  - On approve: bridge triggers AgentMail to send intro email, saves to sent campaign log
- `POST /api/leads/bulk` — bulk approve/reject: `{ "ids": ["lead_001","lead_002"], "action": "approve" }`
- `GET /api/leads/stats` — returns counts by status for the stats cards
- Apollo.io integration: bridge polls Apollo for new solar installers matching Darren's criteria (MCS certified, UK regions, active companies)
- Companies House integration: when a lead is found, bridge cross-references CH API to verify company is active + get director details

---

## ✉️ 4. Email Campaigns

### What It Does
Scarlett drafts email sequences. Darren reviews, edits, and approves. She sends. He tracks results.

### Front-End
- **3 tabs:** Drafts | Sent | Templates

**Drafts tab:**
- List of drafted emails, each showing:
  - Preview of first line: "Hi [Company], I noticed your MCS certification..."
  - Recipient company name
  - Date drafted
  - **Edit button** (opens inline editor) + **Approve button** (green, sends it)
- Inline editor: editable subject line + message body. Simple text area with character count

**Sent tab:**
- Log view: columns — Recipient | Subject | Sent Date | Status
- Status column: 📨 Sent | 👁️ Opened | 💬 Replied | ❌ Bounced
- Click a row → expand to show full sent email content

**Templates tab:**
- Card grid showing email templates Scarlett uses:
  - "Intro to GPM — Solar Installers"
  - "Follow-up — No Response" (sent 3 days after intro if no reply)
  - "Carbon Credit Opportunity" (detailed pitch)
  - "Meeting Request" (for engaged leads)
- Each card: template name, short description, preview button (shows full template in modal)
- These are Scarlett's playbook — she uses them automatically, Darren just approves

### Back-End
- `GET /api/campaigns/drafts` — pending drafts
- `PATCH /api/campaigns/:id/approve` — sends the email via AgentMail API
- `PATCH /api/campaigns/:id/edit` — update draft content
- `GET /api/campaigns/sent` — sent log with status tracking
- `GET /api/campaigns/templates` — available templates
- AgentMail integration: bridge calls sendEmail endpoint. Webhook (or polling) checks open/reply status
- Automated draft generation: when a lead is approved, Scarlett auto-generates an intro draft using AI (DeepSeek) + the template + company-specific details

---

## 📊 5. Performance

### What It Does
Shows Darren how well Scarlett is working. Numbers go up = good. If numbers stagnate, something needs tuning.

### Front-End
- **6 stat cards in a 3x2 grid**, each with:
  - Large number (the metric)
  - Small label below
  - Colour-coded left border:
    - 🟢 Green for growing metrics (leads found, emails sent, deals closed)
    - 🔵 Blue for engagement (reply rate, meetings booked)
    - 🟡 Amber for revenue
  - Small trend arrow (▲ green / ▼ red) with percentage vs last period

| Metric | Description | Source |
|--------|-------------|--------|
| Leads Found | Total new leads this month | Apollo.io queries |
| Emails Sent | Total outreach emails sent | AgentMail sent count |
| Reply Rate | % of emails that got a reply | AgentMail status tracking |
| Meetings Booked | Confirmed meetings this month | Lead queue status |
| Deals Closed | Signed agreements | Lead queue status |
| Revenue | Estimated revenue from closed deals | Manual input or calculation |

- Weekly sparkline under each number showing 7-day trend (small graph, very subtle)
- Periodic selector: This Week / This Month / All Time (changes the numbers)

### Back-End
- `GET /api/performance?period=month` — returns all 6 metrics:
```json
{
  "leadsFound": { "value": 24, "trend": 12, "change": "+20%" },
  "emailsSent": { "value": 89, "trend": 5, "change": "+15%" },
  "replyRate": { "value": 23, "unit": "%", "trend": 1, "change": "+2%" },
  "meetingsBooked": { "value": 3, "trend": 12, "change": "0%" },
  "dealsClosed": { "value": 1, "trend": 0, "change": "-" },
  "revenue": { "value": 6000, "prefix": "£", "trend": 0, "change": "-" }
}
```
- Stats compiled from lead queue, email campaign logs, and manual Darren input
- Trend calculated by comparing current period to previous period

---

## 📅 6. Calendar & Life Centre

### What It Does
Darren's personal command centre — calendar, lists, weather, news, forex. Scarlett manages it all.

### Front-End
**Calendar widget:**
- Monthly grid view — small, not full-page
- Dots or small blocks on dates with events
- Click a date → shows that day's events in a popup
- "Next event" highlighted

**Shopping list:**
- Checklist with tick boxes
- Add item input at top (Darren or Scarlett can add)
- Items can be: text + optional quantity ("Milk x2")
- Tick an item → strikethrough, moves to bottom "Completed" section
- Delete button per item (swipe or long press on mobile)

**To-do list:**
- Same as shopping list but work-focused
- Items can have optional due dates
- Overdue items highlighted in red

**Weather card:**
- Current: icon + temp + condition text ("⛅ 22°C — Partly cloudy")
- 3-day forecast below in a mini row
- Location: Enfield, London (hardcoded)

**News feed:**
- Scrollable card list of headlines
- Each card: headline + 1-line snippet + source name
- 3-4 cards visible, scroll through more
- News topics: solar energy, renewable energy policy, UK home retrofit, carbon credits
- Click a card → opens in new tab

**Forex row:**
- Simple horizontal row: GBP/USD | EUR/GBP | BTC/GBP
- Each: currency pair + current rate + small green/red arrow
- Just for Darren's awareness, not trading

### Back-End
- `GET /api/life/calendar` — events from conversation memory + manual adds
- `GET /api/life/shopping` — full shopping list
- `POST /api/life/shopping` — add item: `{ "item": "Milk", "qty": "2" }`
- `PATCH /api/life/shopping/:id/tick` — mark as done
- `DELETE /api/life/shopping/:id` — remove item
- `GET /api/life/todo` + same CRUD endpoints for to-do
- `GET /api/life/weather` — proxy to Open-Meteo API for Enfield
- `GET /api/life/news` — Tavily search or RSS feed for solar/retrofit UK news
- `GET /api/life/forex` — free forex API (exchangerate-api or similar)
- Calendar events extracted from: Scarlett's conversation memory ("I have a call at 3pm on Thursday") or manually added via chat

---

## 👤 7. Profile

### What It Does
Shows Darren what Scarlett knows about him. He can review, correct, and add info. This is Scarlett's brain — the better this is, the better she serves him.

### Front-End
- **Information cards** — 3 cards:

**Preferences:**
- Things Scarlett has learned: "Prefers calls in the morning", "Dislikes jargon", "Prefers email over phone"
- Each preference shows: "Learned from conversation on 2026-06-30"
- Edit button per preference → Darren can correct or delete
- Add new preference button → free text + category selector

**Notes:**
- Free-text notes Darren has saved
- Add note button → text area → save
- Each note has a date

**Goals:**
- Business goals Scarlett knows about: "Sign 5 new installers by September", "Expand to commercial solar by Q1 2027"
- Progress bar per goal (Darren sets %)
- Add/edit/delete goals

### Back-End
- `GET /api/profile` — returns all profile data:
```json
{
  "preferences": [
    { "id": "pref_1", "text": "Prefers calls before 11am", "learnedDate": "2026-06-30", "source": "conversation" },
    { "id": "pref_2", "text": "Doesn't like corporate jargon", "learnedDate": "2026-07-01", "source": "conversation" }
  ],
  "notes": [
    { "id": "note_1", "text": "Darren mentioned his son plays football", "date": "2026-07-01" }
  ],
  "goals": [
    { "id": "goal_1", "text": "Sign 5 new installers by September", "progress": 20, "setDate": "2026-06-27" }
  ]
}
```
- `PATCH /api/profile/preferences/:id` — edit/delete preference
- `POST /api/profile/preferences` — add new preference
- `POST /api/profile/notes` — add note
- `POST /api/profile/goals` — add goal
- `PATCH /api/profile/goals/:id` — update goal progress
- Auto-extraction: bridge's learning loop writes to this profile file when it spots new facts in conversation. Format: `{ "fact": "...", "source": "automated", "confidence": "high/medium/low", "date": "..." }`

---

## ⚙️ 8. Settings

### What It Does
Darren configures how Scarlett works. Set it once and forget it.

### Front-End
- **Toggle switches:**
  - Lead discovery frequency: Daily 🔘 / Weekly 🔘 / Real-time 🔘 (radio buttons)
  - Notifications: Telegram 🔘 / Email 🔘 / None 🔘
  - Auto-approve leads: On 🔘 / Off 🔘 (if on, Scarlett sends intros without asking)

- **Text inputs:**
  - Working hours start: `09:00` (time picker)
  - Working hours end: `17:00` (time picker)
  - Email signature: text area (what goes at the bottom of her emails)
  - Target region(s): multi-select (South East, London, Midlands, North West, etc)
  - Minimum company size: dropdown (1-5, 5-10, 10-20, 20+ employees)

- **Save button** at bottom — saves to server
- Changes take effect immediately (no restart needed)

### Back-End
- `GET /api/settings` — returns current settings
- `PUT /api/settings` — save all settings:
```json
{
  "leadFrequency": "daily",
  "notifications": "telegram",
  "autoApprove": false,
  "workingHours": { "start": "09:00", "end": "17:00" },
  "emailSignature": "Best regards,\nScarlett Pelling\nOperations Assistant - GPM",
  "targetRegions": ["south_east", "london", "midlands"],
  "minCompanySize": "5-10"
}
```
- Settings file stored at `/var/log/scarlett/settings.json`
- Bridge reads settings to control behaviour: if `leadFrequency` is "daily", Apollo scraping runs once per day. If "real-time", runs every 6 hours
- Email signature appended to all auto-generated emails

---

## 📡 API Structure Summary

All endpoints served by the bridge on port 3001 (proxied through nginx).

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/briefing` | GET | Home page data |
| `/api/chat` | GET | Fetch chat history |
| `/api/chat` | POST | Send message to Scarlett |
| `/api/chat/search` | GET | Search conversations |
| `/api/leads` | GET | Full lead queue |
| `/api/leads/:id` | PATCH | Approve/reject/note |
| `/api/leads/bulk` | POST | Bulk approve/reject |
| `/api/leads/stats` | GET | Lead counts by status |
| `/api/campaigns/drafts` | GET | Pending drafts |
| `/api/campaigns/:id/approve` | PATCH | Approve + send |
| `/api/campaigns/:id/edit` | PATCH | Edit draft |
| `/api/campaigns/sent` | GET | Sent log |
| `/api/campaigns/templates` | GET | Email templates |
| `/api/performance` | GET | Stats + trends |
| `/api/life/calendar` | GET | Calendar events |
| `/api/life/shopping` | GET/POST | Shopping list |
| `/api/life/shopping/:id` | PATCH/DELETE | Tick/remove item |
| `/api/life/todo` | GET/POST | To-do list |
| `/api/life/todo/:id` | PATCH/DELETE | Tick/remove |
| `/api/life/weather` | GET | Weather proxy |
| `/api/life/news` | GET | News feed |
| `/api/life/forex` | GET | Forex rates |
| `/api/profile` | GET | Full profile |
| `/api/profile/preferences` | POST | Add preference |
| `/api/profile/preferences/:id` | PATCH | Edit preference |
| `/api/profile/notes` | POST | Add note |
| `/api/profile/goals` | POST | Add goal |
| `/api/profile/goals/:id` | PATCH | Update goal progress |
| `/api/auth` | POST | Verify access code: `{ "code": "GPM2026" }` |
| `/api/settings` | GET/PUT | All settings |

---

## 🔄 Data Flow Examples

### Lead Discovery Flow
```
1. Cron trigger (daily/real-time based on settings)
2. Bridge calls Apollo.io API → search solar installers, MCS certified, UK
3. Bridge cross-references Companies House → verify active, get directors
4. Bridge generates lead record → saves to leads.json
5. Bridge drafts intro email using AI + template → saves to campaigns/drafts
6. Dashboard GET /api/briefing → shows "3 new leads waiting"
7. Darren opens Lead Queue, sees them
8. Darren approves → PATCH /api/leads/lead_001 { status: "approved" }
9. Bridge reads draft, calls AgentMail → sends email
10. Lead status changes to "contacted"
11. Dashboard updates in real-time
```

### Chat Flow (Dashboard)
```
1. Darren types in dashboard chat → POST /api/chat { message: "..." }
2. Bridge saves message to conversation_memory.json
3. Bridge runs: openclaw agent --json --message "..."
4. Scarlett's OpenClaw agent responds with full personality
5. Bridge saves reply to conversation_memory.json
6. Bridge checks reply for new facts → saves to scarlett-profile/
7. Dashboard receives reply → shows in chat UI
8. Also sent to Darren's Telegram if Telegram integration is active
```

### Profile Learning Flow
```
1. Darren in chat: "I hate phone calls, just email me"
2. Scarlett replies, but bridge also checks for extractable facts
3. Bridge spots: subject = "Darren", object = "phone calls", preference = "dislike"
4. Bridge writes to profile/preferences.json:
   { "text": "Prefers email over phone calls", "source": "automated", "date": "2026-07-02" }
5. Dashboard Profile page picks it up on next load
6. Scarlett's future behaviour adjusts — she emails instead of suggesting calls
```

---

## 🚀 Implementation Priority

| Priority | Feature | Why |
|----------|---------|-----|
| **P0** | Lead Queue (front-end + back-end) | The entire business model depends on this |
| **P0** | Chat (front-end + Telegram bridge) | Darren's primary interface |
| **P1** | Email Campaigns (approve workflow) | Leads are useless without follow-through |
| **P1** | Home/Briefing dashboard | First impression, daily use |
| **P2** | Performance stats | Darren needs to see ROI |
| **P2** | Settings | Configure how Scarlett works |
| **P3** | Calendar & Life Centre | Nice-to-have, but adds stickiness |
| **P3** | Profile | Makes Scarlett smarter over time |

---

## Technical Notes for Devs

- **No database yet** — all data is JSON files. Easy to swap to Supabase/SQLite later
- **Bridge runs on port 3001**, nginx proxies `/api/*` to it
- **OpenClaw agent CLI** is synchronous — be mindful of response times (2-5s per AI call)
- **Dark theme only** — no light mode needed
- **Mobile-first** — Darren will check this on his phone
- **No auth system** — single access code (GPM2026). If needed later, add basic token auth
- **All API responses are JSON** — standard REST
- **Webhook for Telegram** — bridge needs to expose `/hooks/wake` for Telegram bot updates
