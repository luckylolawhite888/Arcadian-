# Out & About — Architecture Plan

## Overview
Two mobile apps + one admin dashboard. Built with React Native (Expo) + Supabase backend. WhatsApp integration via WAHA. Deal publishing via GHL + social APIs.

---

## 📱 App 1: O&A User App (For Consumers)
*"Find deals near you. Walk in. Save."*

### Screens

| Screen | What It Does |
|--------|-------------|
| **Splash → Onboarding** | T&C, location permission, "Add to Home Screen" prompt |
| **Home Feed** | Map + list view of deals near user's location, sorted by distance |
| **Deal Detail** | Full deal info, image, countdown timer, "Open in Maps" button, "Tell a Friend" share button |
| **Favourite Stores** | List of followed stores, toggle notifications per store |
| **Settings** | Notification preferences, about, delete account |

### Key Features
- 🔴 **Countdown timers** on every deal (real-time, updates live)
- 📍 **Automatic location** — shows deals within walking distance
- ⭐ **Follow stores** — get notified when they post new deals
- 💬 **Tell a Friend** — share deal to WhatsApp with a link
- 🌙 **Dark mode / light mode**
- 🚫 **No login required** to browse deals (login only if they want to follow stores)

### Tech
- React Native (Expo) — one codebase for iOS + Android
- Supabase Realtime — for live countdown timers
- OneSignal — push notifications
- Google Maps / Apple Maps — for directions

---

## 📱 App 2: O&A Store App (For Business Owners)
*"Post a deal. It's everywhere."*

### Screens

| Screen | What It Does |
|--------|-------------|
| **Login** | Membership number + password (emailed on onboarding) |
| **Dashboard** | Overview: active deals, total views, total redemptions |
| **Create Deal** | The main event (see below) |
| **My Deals** | List of all deals (active, expired, draft) |
| **Deal Stats** | Views, clicks, redemptions per deal |
| **Settings** | Store profile, notification prefs, logout |

### Create Deal Flow

```
Step 1: [Deal Name] ← text input
Step 2: [Upload Images] ← camera / gallery
Step 3: [Description] ← text OR 🤖 "AI Write For Me" button
Step 4: [Start Date] [End Date] ← date pickers
Step 5: [Deal Type] ← End of Day / Flash Sale / Ongoing
Step 6: [Where to Post?] ← toggle buttons:
         ☑ Out & About
         ☑ Instagram
         ☑ Facebook
         ☑ WhatsApp Broadcast
         ⚡ Smart Post Now (auto-caption, post everywhere, set timer)
Step 7: [Review & Publish] ← see preview, tap "Go Live"
```

### Key Features
- 🤖 **AI Write For Me** — writes the deal description in the store's brand voice
- ⚡ **Smart Post Now** — one tap → caption generated → posted everywhere → auto-removed when timer ends
- 🔁 **Repeat Deal** — re-run any past deal with one tap
- 📊 **Simple analytics** — "12 people viewed your deal, 3 walked in"
- 🧾 **No design skills needed** — just upload a photo, AI handles the rest

---

## 🌐 Web Dashboard (For Us — House of Mouse)
*"Where we manage everything."*

### Sections
- **Clients** — list of all onboarded stores, their status, their plan
- **Onboarding** — create new client, generate membership number, trigger welcome flow
- **Analytics** — aggregate stats across all stores
- **Deal Templates** — pre-built deal types stores can use (End of Day, Flash Sale, Happy Hour, etc.)
- **Billing** — Stripe integration, plan management

---

## 🧠 Backend Architecture

```
┌─────────────────────────────────────────────────────┐
│                   O&A SYSTEMS                        │
├─────────────┬───────────────┬───────────────────────┤
│  Supabase   │    WAHA       │     GHL API           │
│  (DB + Auth │  (WhatsApp)   │  (CRM + Social)       │
│   + Storage)│               │                       │
├─────────────┼───────────────┼───────────────────────┤
│  OneSignal  │   Cloudflare  │   Stripe              │
│  (Push)     │   (DNS/CDN)   │   (Payments)          │
└─────────────┴───────────────┴───────────────────────┘
```

### Data Flow: Store Creates a Deal

```
Store App → Supabase (save deal)
  → Push notification to nearby users (OneSignal)
  → Post to Out & About feed
  → If Instagram selected → GHL Social Planner API
  → If Facebook selected → GHL Social Planner API
  → If WhatsApp broadcast → WAHA API → customers' WhatsApps
  → If Smart Post Now → AI generates caption → posts everywhere
  → Start countdown timer
  → When timer ends → auto-remove deal → send "Deal ended" alert
```

### Data Flow: User Opens the App

```
User App → Get location → Supabase query: 
  "Find deals within 2 miles of [user location] 
   where end_time > now() 
   AND status = 'active'"
  → Sort by distance
  → Show deals with countdowns
  → Push notification if followed store posts new deal
```

---

## 🗓️ Build Order

| Phase | What | Time | Tools |
|-------|------|------|-------|
| **1** | Supabase setup (DB schema, auth, storage) | 2 days | Bolt + Claude |
| **2** | User App PWA (browse deals, countdowns, share) | 5 days | Expo + Claude |
| **3** | Store Dashboard (web-based, create deals) | 5 days | Claude + Gemini |
| **4** | WhatsApp integration (WAHA → deal notifications) | 2 days | Lola |
| **5** | Social posting (GHL → Instagram/Facebook) | 2 days | Lola + GHL API |
| **6** | Push notifications (OneSignal) | 1 day | Claude |
| **7** | AI caption writer (for "AI Write For Me") | 2 days | Lola + Claude |
| **8** | User login + Follow Stores | 2 days | Claude |
| **9** | Smart Post Now (one-tap everywhere) | 3 days | Claude + Lola |
| **10** | Native iOS/Android build (Expo) | 3 days | Expo EAS |
| **11** | App Store + Play Store submission | 1 week | You |

**Total active dev: ~4 weeks**

---

## 💰 Costs (Monthly)

| Service | Cost | What For |
|---------|------|----------|
| Supabase Free | £0 | DB + Auth + Storage (500MB free) |
| OneSignal Free | £0 | Push notifications (10K users free) |
| WAHA (self-hosted) | £0 | WhatsApp integration |
| GHL Agency | $297/mo | CRM + Social posting |
| IONOS (existing) | £8/mo | Server for WAHA + backend |
| Expo EAS (build) | £0 first month | App builds |
| **Total** | **~£310/mo** | |
| VS revenue at 1 client (£200/mo) | Already profitable | |

---

## First Screens (Wireframes)

### User App Home Screen
```
┌──────────────────────────────┐
│  📍 Near NW10    🔔 [bell]  │
│                              │
│  🔴 ENDS TODAY              │
│  ┌────────────────────────┐ │
│  │ 🥐 Free Pastry w/      │ │
│  │ ☕ any coffee           │ │
│  │ The Coffee Spot · 0.2mi │ │
│  │ ⏱ 3h 24m left          │ │
│  │ [💬 Share] [📍 Map]    │ │
│  └────────────────────────┘ │
│                              │
│  🟡 FLASH SALE              │
│  ┌────────────────────────┐ │
│  │ ✂️ 50% Off All Cuts    │ │
│  │ Blades Barbers · 0.4mi │ │
│  │ ⏱ 1h 12m left          │ │
│  │ [💬 Share] [📍 Map]    │ │
│  └────────────────────────┘ │
│                              │
│  [⬆️ Show more deals]       │
└──────────────────────────────┘
```

### Store App — Create Deal
```
┌──────────────────────────────┐
│  ← Create New Deal          │
│                              │
│  Deal Name                   │
│  ┌────────────────────────┐ │
│  │ End of Day Cake Sale   │ │
│  └────────────────────────┘ │
│                              │
│  Photos                     │
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │📸 add│ │📸 add│ │📸 add││
│  └──────┘ └──────┘ └──────┘│
│                              │
│  Description                 │
│  ┌────────────────────────┐ │
│  │ Half price on all      │ │
│  │ cakes after 4pm!       │ │
│  └────────────────────────┘ │
│  [🤖 AI Write For Me]      │
│                              │
│  Duration                    │
│  [Today 4:00 PM]→[8:00 PM]  │
│                              │
│  Post To:  ☑ O&A  ☑ Insta  │
│           ☑ FB   ☑ WhatsApp │
│                              │
│  [⚡ Smart Post Now]         │
│  [    Save Draft     ]       │
└──────────────────────────────┘
```

---

Ready to build. Say the word and I start Phase 1.
