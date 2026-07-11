# Darren Pelling's Mission Control — Visual Design Brief

**For:** Front-End Dev Team (UI only, front-end code)
**Platform Name:** Darren Pelling's Mission Control
**Vibe:** Clean, dark professional theme — think Tesla dashboard meets Notion. Premium but not flashy. Mobile + desktop responsive.

---

## Colour Palette

| Element | Value |
|---|---|
| **Background** | Deep charcoal / near-black (#0f0f11 or similar) |
| **Sidebar** | Slightly lighter dark panel (#1a1a1e) |
| **Cards / Panels** | Dark grey (#252529) |
| **Primary accent** | Warm amber / gold (#d4a853 or similar) |
| **Secondary accent** | Cool blue (#3b82f6) |
| **Text primary** | White / near-white (#f0f0f0) |
| **Text secondary** | Muted grey (#888) |
| **Success** | Green (#22c55e) |
| **Danger / Reject** | Red (#ef4444) |

---

## Layout

**Sidebar** — fixed left, slim, icon-only with tooltips on hover. Darren's name/avatar at the top.

**Main content area** — scrollable, responsive grid of widget panels/cards. Keep the design simple; no overwhelming layouts.

---

## 8 Sections (Pages)

### 1. 🏠 Home / Dashboard
- **Welcome card** — "Good morning, Darren" with current date
- **Today's briefing widget** — small card showing a summary (weather, calendar, reminder — just placeholder data)
- **Quick stats row** — 4 small stat cards side by side (Leads, Emails, Replies, Tasks)
- **Action items** — "3 leads waiting for approval" as a clickable card

### 2. 💬 Scarlett Chat
- Full WhatsApp-style chat interface
- Message bubbles — his messages one colour (dark grey), Scarlett's another (accent colour)
- Text input at the bottom with send button
- Typing indicator animation ("Scarlett is typing...")
- Search bar at the top for chat history
- Chat list on the left if needed, showing the active conversation with Scarlett

### 3. 📋 Lead Queue
- Table with columns: Company | Location | Contact | Source | Status
- **Approve** (green pill button) and **Reject** (red pill button) per row
- Bulk select checkbox + bulk approve button at the top
- Notes input field — expands inline per row
- Filter bar above the table: dropdowns for Region, Source, Status

### 4. ✉️ Email Campaigns
- **Drafts** tab — list of email drafts, each with an Edit button and Approve button
- **Sent** tab — log view: recipient, subject, date sent, status (opened/replied icons)
- **Templates** tab — card grid showing available email templates

### 5. 📊 Performance
- 6 stat cards in a 3x2 grid: Leads Found | Emails Sent | Reply Rate | Meetings Booked | Deals Closed | Revenue
- Large numbers, small labels, colour-coded accent borders

### 6. 📅 Calendar & Life Centre
- Simple calendar widget (monthly grid view, dots or blocks for events)
- **Shopping list** — checklist with add/remove/tick
- **To-do list** — checklist with add/remove/tick
- **Weather** — small card with icon, temp, condition text
- **News** — scrollable card list (headline + short snippet), 3-4 cards visible
- **Forex** — simple row of currency pairs with small green/red arrows

### 7. 👤 Profile
- Information cards: Preferences | Notes | Goals
- Each card has an Edit icon to make fields editable

### 8. ⚙️ Settings
- Toggle switches for: Lead frequency (Daily/Weekly/Real-time) | Notifications (Push/Email/None)
- Text inputs: Working hours | Email signature | Timezone
- Clean form layout, save button at the bottom

---

## Design Notes for Devs

1. **Dark theme only** — no light mode needed
2. **Mobile-first responsive** — everything stacks vertically on phone
3. **No login/signup** — just the dashboard views
4. **No backend** — static UI with placeholder/dummy data in every section
5. **Scarlett's chat is the heart** — make it feel real: scrollable history, message timestamps, typing dots
6. **Keep it personal** — "Darren Pelling's Mission Control" in the header, not a company name
7. **Subtle micro-animations** — smooth transitions between pages, hover states on cards/buttons
8. **Icon pack** — use a clean outline icon set (Lucide or similar) for sidebar + UI elements

---

## Reference Vibe

Not a copy, but the energy:
- **Tesla dashboard** — dark, clean, data-forward
- **Notion** — card-based, flexible, personal
- **Your mission control at mission.thenewworldorder.io** — simplified version without server stats or DeepSeek balance

---

**Deliverable:** Static HTML/CSS/JS — no backend wiring needed. Placeholder data throughout. Dark theme, responsive, clean.
