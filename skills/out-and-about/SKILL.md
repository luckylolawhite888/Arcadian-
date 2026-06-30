---
name: out-and-about
description: "Full project: hyperlocal deal platform, shop sign-up page, competitive positioning, marketing strategy"
version: 2.0
author: Lola
created: 2026-05-16
---

# Out & About Deals Project

## Quick Summary
Two-sided marketplace: consumers get local deals, shops pay £39.99/mo for geo-targeted promotion. Founded by Maya. **Status:** Sign-up page live, app in development.

## Shop Sign-Up Page
- **URL:** https://thenewworldorder.io/outandabout/
- **Access code:** `outabout`
- **Status:** Live, splash-gated, not public yet
- **Nginx:** `location /outandabout/` → `/var/www/thenewworldorder/outandabout/`

## Pricing
- **£39.99/mo flat** — one price, no tiers
- **30-day free trial** — no credit card required
- **5% commission** — on pre-paid voucher sales only
- **No extra fees** — in-store redemption just shows the offer
- **First 50 shops** locked-in at £39.99/mo for 12 months

## What Shops Get
- Unlimited social posts (Instagram, Facebook & app in one click)
- Geo-targeted to 2-mile radius — hyperlocal, not city-wide
- Optional pre-paid vouchers (5% if they sell)
- QR code redemption system
- Cancel anytime, no contract

## Core USP
**"Geo-Targeted, Not Spray & Pray"** — no point advertising in Camden if your store is in Hampstead.

## The 5 Pillars (Why Different)
1. 🎯 **Geo-Targeted** — 2 mile radius, hyperlocal
2. 📱 **One-click posting** — all platforms at once
3. 💷 **Two redemption options** — pre-paid vouchers OR free in-store show
4. 🌐 **Auto-translate** — every offer, every language (key for diverse cities + Europe)
5. 🫧 **Double Bubble** — referral system (shop rewards sharing)

## Features Planned for App
1. ⭐ Shop ratings & reviews
2. ⏰ Offer countdown timer
3. 🔔 Push notifications
4. 🫧 Double Bubble referral rewards
5. 🌐 Auto-translate
6. 📊 Shop dashboard analytics

## Competitive Positioning vs Too Good To Go

| Feature | TGTG | Out & About |
|---------|------|-------------|
| Business types | Food waste only | Any business (cafes, salons, gyms, retail) |
| Offer control | Mystery bags at 1/3 price | Full control (20% off, BOGOF, free item) |
| Social posting | In-app only | Auto-posts to Instagram & Facebook |
| Redemption | Pre-paid only | Pre-paid OR show in-store for free |
| Cost | ~£109/mo at 100 bags | £39.99/mo flat |
| Auto-translate | No | Yes — every offer |
| Targeting | City-wide | 2-mile radius |

## Marketing Strategy

### Seed Strategy (Phase 1)
1. Sign up **5-10 shops for free** (30-day trial)
2. Run FB/Insta ads targeting **consumers within 2 miles**: "Free coffee at [Shop Name]"
3. First **50-100 users get a freebie** (coffee, pastry)
4. Shops see real customers → **proof of concept**
5. Use results to sell next shops

### Free Coffee Mechanics
- Maya: "We'll send 50 customers for a free coffee. You serve, we reimburse at cost (~£0.50-£1)."
- Shop agrees → listed on app with free coffee offer
- Users download → get QR → redeem
- Shop scans QR → Maya reimburses at cost
- ~90% buy something extra when collecting free item
- **Cost to Maya:** ~£25-50 per 50 redemptions

### Budget Split (£1,000 total)
| Item | Amount |
|------|--------|
| FB/Insta ads targeting consumers | £400 |
| FB/Insta ads targeting business owners | £400 |
| Freebie reimbursements | £200 |

### Key Metric
Get **1 user + 1 shop in a working loop** → screenshot/prove it → scale.

## Business Model
- **Fixed cost:** GHL $297/mo (~£235)
- **Break-even:** 6 shops at £39.99/mo
- **Target:** 1,000 shops year one = ~£40k/mo
- **Pace:** ~3 shops/day or ~17/week

## Tech Stack
- **Frontend:** PWA / FlutterFlow
- **Backend:** Supabase
- **Push:** OneSignal
- **CRM:** Go High Level
- **Payments:** Stripe
- **Distribution:** Station Control radio synergy

## GHL Setup
- **Sub-account ID:** CSQUFMD6dwOmHY02QTVj
- **Pipeline stages:** Lead → Onboarding → Active Trial → Paying → Cancelled
- **Needed:** Form submission → GHL webhook (currently saves to localStorage only)

## Agent Team
1. **Sales Support** — handle demos, questions, follow-ups
2. **Nurture/Follow-up** — drip campaigns for prospects
3. **Onboarding** — get shops live within 48h
4. **User Acquisition** — drive consumer downloads
5. **Monitor** — track engagement, performance
6. **Manager** — coordinators everything

## Station Control Synergy
- Free radio ads as sign-up incentive for first 50 shops
- Window stickers: "Find our deals on the Out & About app — as heard on Station Control FM"
- Bundle: £79/mo = app listing + social + radio ad + GHL CRM + window sticker

---

## Backend Infrastructure

### Server Scripts
- `outandabout_server.py` — Python backend server
- `outandabout_server_v2.py` — Updated version

### Webhooks
- `out_and_about_webhook.py` — Connects sign-up form → GHL pipeline

### Database Schema (`oa_schema.sql`)
Tables: shops, deals, users, redemptions

### Architecture Docs
- `oa_architecture.md` — Full system architecture
- `oa_architecture.pdf` — Visual diagram
- `oa_backend_ref.md` — Implementation reference

### Frontend Files
- `oa_merged.html`, `oa_original.html`, `oa_final_deploy.html` — Various builds
- `oa_with_images.html` — With embedded graphics
- `oa_store_app_prompt.md` — App store listing prompt

### Design Assets
- Logos: `oa_logo_full_v2.png/svg`, `oa_logo_maya.svg`, `oa_logo_v2.svg`
- Icons: `oa_app_icon.png`, `oa_favicon.png`
- Screenshots: `oa_maya_final.png`, `oa_maya_logo.png`, `oa_maya_v2.png`

### Current State
- Landing page deployed at `/outandabout/` (splash-gated)
- Form saves to localStorage — needs GHL webhook integration
- Full backend automation still in development
