# 🎨 PixelWars — Full Product Blueprint

## Overview
A gamified ad-revenue platform built on a persistent 24/7 pixel canvas. Users claim territory with their logo, battle for pixels, and creators build their own canvases for revenue share. Monetised entirely through ad views.

---

## 🎯 Core Concept
One infinite canvas. Every user starts with a logo + small territory. Every action costs or earns ad watches. Ads are the game currency.

---

## 🧱 Tech Stack (Suggested)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Realtime** | WebSockets (Socket.io or native WS) | Live pixel updates, canvas sync |
| **Frontend** | React/Next.js + Canvas API | Interactive pixel grid rendering |
| **Backend** | Node.js (our sweet spot) | Handles WebSocket connections, game logic, ad routing |
| **Database** | PostgreSQL + Redis | Canvas state in Redis (fast), user data + transactions in Postgres |
| **Ad Integration** | Google AdSense / AdMob / AdThrive | Programmatic ad serving |
| **Payments** | Stripe | Payouts for canvas creators |
| **Media Storage** | S3-compatible (wasabi / DO spaces) | User logo uploads, canvas snapshots |
| **Auth** | Simple email + OAuth | Low friction signup |

---

## 🎲 Game Mechanics

### Signup Flow
1. User signs up (email or social login)
2. Uploads logo/image (squashed to fit grid)
3. Logo is auto-placed on the canvas as a **Claimed Territory Block** (default 10x10 pixels)
4. Tutorial overlay: "Watch an ad to expand" / "Click a neighbour to attack"

### Core Actions

| Action | Cost | Reward |
|--------|------|--------|
| **Watch Ad** | 30 seconds of their time | +1 Token |
| **Expand Territory** | 1 Token | +1 adjacent pixel claimed |
| **Attack Pixel** | 2 Tokens | 50% chance to steal 1 pixel from neighbour |
| **Defend Pixel** | 1 Token | 24h protection on 1 pixel (can't be attacked) |
| **Inactivity Protection** | 1 Token | Skip losing pixels for 24h |
| **Daily Login Bonus** | Free | +3 Tokens for consecutive days |
| **Share Canvas** | Free | +1 Token per referral who signs up |
| **Speed Place (5 pixels)** | 1 Token | Instant pixel expansion (normally 1 per hour) |

### Territory Decay
- Miss **3 consecutive days login** → territory starts shrinking
- **Outer rim pixels** become unclaimed (2 pixels per day of absence)
- Come back → watch 3 ads to reclaim lost territory
- Keeps dead accounts from hoarding space

### Attack Resolution
1. Player A clicks Player B's pixel
2. "Spend 2 Tokens to attack?" modal
3. If yes → dice roll animation (50/50)
4. Win: B's pixel turns A's colour
5. Lose: tokens gone, nothing happens
6. Both players get a push notification of the result

### Alliances
- Players can form **Blocs** (groups) of up to 10
- Shared territory border — adjacent bloc member pixels can't be attacked by allies
- Bloc name/logo displayed on hover over claimed area
- Alliance can attack as a group (coordinated multi-pixel strikes)

---

## 🏛️ Creator Canvas System (The Metagame)

### Unlock Thresholds
| Tier | Level Required | Canvas Duration | Max Players | Revenue Share |
|------|---------------|----------------|-------------|---------------|
| Bronze | 10 | 24 hours | 10 | 10% |
| Silver | 25 | 1 week | 50 | 20% |
| Gold | 50 | Custom (1-30 days) | 200 | 30% |
| Platinum | 100 | Unlimited | Unlimited | 35% |

### Creator Controls
- **Canvas name & description**
- **Duration** — countdown clock displayed to all players
- **Logo upload** — optional canvas theme image
- **Starting territory size** — 5x5, 10x10, 20x20 (larger = entry cost higher)
- **Entry fee** — 0 to 5 Tokens (paid to creator)
- **Alliance toggle** — allow or disable alliances within this canvas
- **Invite-only or public** toggle
- **Winner reward** — creator can set a prize (voucher bundle or token pool)

### Revenue Share & Payouts
- Every ad watched inside a private canvas is tracked
- 70% platform / 30% creator (adjustable by tier)
- Creator dashboard shows: total ad views, estimated earnings, player count
- Payouts via Stripe — minimum £10 threshold
- Monthly payout cycle

### Featured Canvases
- Top 5 most-active private canvases shown on the main page
- Algorithm: (total ad views × player count) / canvas age
- Featured canvases get bonus visibility → more players → more ad views

---

## 💰 Revenue Model

### Primary: Ad Impressions
- Every action that costs Tokens starts with an ad
- Estimated: **5-15 ad views per user per session**
- Target: 3-5 minute average session length
- At 10,000 DAU → 50,000-150,000 ad views/day

### Secondary: Creator Revenue Share
- Platform takes 65-70% of ad revenue from private canvases
- Creators get 10-35% (paid out monthly)
- Turns users into acquisition channels

### Tertiary: Marketplace (Future)
- Sell cosmetic pixels (glow effects, animated borders)
- Sell canvas real estate to brands (sponsored zones)
- Sell "Voucher Packs" directly for non-ad-funded users

---

## 🏆 Reward System — Voucher Integration

### Wheel of Prizes
- Free spin every 4 hours
- Watch an ad for extra spin
- Prize pool populated by **Cheap Finds voucher bundles**
- Prize tiers:
  - 🟢 Common: 5% off voucher (70% of spins)
  - 🔵 Rare: 10% off voucher (20%)
  - 🟣 Epic: £10 gift card collection (8%)
  - 🟠 Legendary: £50 value bundle (2%)

### Prediction League
- Daily free prediction in categories: sports, crypto, weather
- Watch an ad for a second prediction
- **Streak system:**
  - 3 correct in a row → Bronze Voucher
  - 7 correct → Silver Voucher
  - 14 correct → Gold Voucher
  - 30 correct → Platinum Voucher + featured profile badge

### Voucher Format
- Vouchers = curated discount bundles from cheap finds sourcing
- Presented as premium-looking "Prize Cards" with countdown timers
- Redemption: one-click claim, code auto-revealed
- Costs Maya pennies, feels like winning the lottery

---

## 📱 User Journey

### Day 1 — Onboarding
1. Sign up → upload logo → placed on canvas
2. 3 free tokens to start (not just ads)
3. Tutorial: watch ad → get tokens → expand territory
4. See leaderboard → motivated to climb

### Days 2-7 — Addiction Loop
- Daily login for streak rewards
- Attack a neighbour (competitive thrill)
- Watch 3-5 ads per session
- First voucher redemption → hooked

### Weeks 2-4 — Social Phase
- Join or form an alliance
- Invite friends (trackable referral)
- Alliance pushes into bigger territory

### Month 2+ — Creator Phase
- Hit Level 10 → create first private canvas
- Invite friends + strangers → earn passive revenue
- Compete for "Featured Canvas" spot

---

## 📐 Database Schema (Core Tables)

```
users
  id, email, username, password_hash, level, xp, tokens, lifetime_tokens,
  territory_size, alliance_id, created_at, last_login, streak_days

canvas (main)
  id, canvas_state (JSON — pixel grid data), total_pixels_claimed,
  active_users, snapshot_history (JSON array of monthly snapshots)

private_canvases
  id, creator_user_id, name, description, tier, duration_hrs,
  start_time, end_time, max_players, entry_fee_tokens,
  is_public, alliance_allowed, starting_territory_size,
  total_ad_views, creator_earnings_cents

pixels
  id, canvas_id, x, y, owner_user_id, colour, last_updated,
  protection_expiry (nullable)

transactions
  id, user_id, type (ad_watch / attack / expand / defend / reward),
  tokens_spent, tokens_earned, created_at

vouchers
  id, user_id, code, value_cents, source (wheel / prediction / creator),
  redeemed_at, expires_at

ad_events
  id, canvas_id, user_id, ad_type, revenue_cents_estimated,
  created_at
```

---

## 🖼️ UI Mockup Descriptions (For Dev Team)

### Main Canvas View
- Full browser width canvas with zoom/pan controls
- Pixels rendered as small coloured squares (5-10px each)
- Hover over pixel → shows owner username + logo thumbnail
- Scrollable territory labels (alliance names on hover)
- Right sidebar: user stats, token balance, quick action buttons
- Bottom bar: daily bonus timer, ad-watch button

### Logo Upload
- Drag-and-drop or file picker
- Auto-crop to square, reduce to 100x100px source image
- Rendered on canvas as pixelated version (converted to 10x10 colour approximation)

### Wheel of Prizes
- Classic spinning wheel animation
- 8 segments with prize names + colours
- "SPIN" button — greyed out until free spin available or ad watched
- Confetti animation on win
- Prize card reveal: "You won [prize]! Click to claim"

### Creator Dashboard
- "My Canvases" list with active/inactive status
- Per-canvas stats: players, ad views, estimated earnings
- "Create New Canvas" flow — step-by-step wizard

---

## 📊 Success Metrics (Targets)

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Registered Users | 5,000 | 50,000 | 250,000 |
| DAU | 500 | 5,000 | 25,000 |
| Avg Session | 3 min | 4 min | 5 min |
| Ad Views/Day | 5,000 | 75,000 | 375,000 |
| Est. Daily Revenue | £10-25 | £150-375 | £750-1,875 |
| Active Creators | 50 | 500 | 2,500 |
| Private Canvases | 100 | 2,000 | 15,000 |

*(Based on £2-5 CPM estimate)*

---

## 🚀 MVP Release (Phase 1 — 4-6 weeks)

### What's Included
- Main canvas (single shared space)
- Logo upload + territory placement
- Ad watch → token economy
- Expand / Attack / Defend mechanics
- Daily login streak
- Basic leaderboard
- Wheel of Prizes with voucher redemption

### What's NOT in MVP
- Private canvases (Phase 2)
- Alliances (Phase 2)
- Prediction League (Phase 2)
- Creator revenue share (Phase 2)
- Cosmetic pixel upgrades (Phase 3)

---

## ⚠️ Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Ad blockers | Show message: "PixelWars runs on ad views. Please whitelist us." |
| Bot / pixel farming | Rate limits, captcha on signup, activity patterns flagged |
| Toxic behaviour (griefing) | Report pixel button, cooldown on repeated attacks on same user |
| Ad revenue too low | Multi-variant: test AdSense, AdThrive, direct sold ads |
| Creator payout fraud | Minimum £10 threshold, manual review on first payout |
| Canvas performance | WebGL rendering, viewport culling (only render visible area) |
| Logo abuse (NSFW) | AI moderation on upload, reporting system + immediate flag |

---

## 🔗 Integration Points

- **Cheap Finds API** — voucher feed for rewards
- **AdSense API** — revenue tracking
- **Stripe Connect** — creator payouts
- **S3/DO Spaces** — logo + snapshot storage
- **Pusher/Socket.io** — realtime WebSocket layer

---

*Blueprint prepared by Lola 🦊 — 3 June 2026*
