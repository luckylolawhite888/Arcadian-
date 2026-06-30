# 🚀 API Project Game Plans

_Compiled 2026-05-30 — Pop-art theme preferred for all sites_

---

## 1️⃣ WatchFinder 2.0 (Movie DB Alternative + Shazam API)

**API:** TMDB (free for non-commercial, attribution required) + Shazam/Music Recognition via API.market ($10/mo for 1,000 calls) or Apify ($2/1k results)

**Build:**
- Upgrade current watch.thenewworldorder.io from basic search to full movie/TV/music discovery engine
- Integrate **TMDB API** (free) for movie poster, cast, ratings, streaming availability, trailers
- Add music recognition via **Shazam wrapper API** ($10/mo) — upload audio clip → identify song → show where to stream/buy
- Replace any current API (if using OMDb) with TMDB — richer data, better images, free tier supports up to 50 req/sec
- Pop-art redesign: Warhol-style colour blocks, bold sans-serif, neon borders, comic-style "WHERE TO WATCH" badges
- Add affiliate links (Amazon Music, iTunes, physical media via Awin) below every result

**Cost:** $0–$10/mo — TMDB is free (with attribution), Shazam API runs $10/mo for 1k identifications
**Revenue Model:**
- Amazon affiliate commissions on "Buy" links (tag: coupn28-21)
- Awin affiliate commissions from music retailers, Blu-ray, merch
- AdSense (ca-pub-9534114738328693) on search pages
- Premium tier: $2/mo for ad-free + unlimited Shazam-like identifications

**Timeline:** 5–7 days to launch v2.0
- Day 1: TMDB API integration, replace current movie search
- Day 2: Pop-art redesign, deploy
- Day 3: Shazam music recognition integration
- Day 4: Affiliate link injection (Amazon + Awin)
- Day 5: Premium tier with Stripe checkout
- Days 6–7: Polish, testing, launch

**First Action:** Register a TMDB API key at themoviedb.org (free, instant) and replace the current movie search backend

---

## 2️⃣ Solar Panel Checker

**API:** Northern Powergrid OpenDataSoft API (free) + OpenStreetMap Overpass API (free) + Open-Meteo Solar API (free)

**Build:**
- Postcode input → lookup DNO region (Northern Powergrid, UKPN, SP Energy, SSEN, etc.)
- Query DNO's OpenDataSoft API for feeder/substation capacity data at that postcode
- Query Open-Meteo Solar API for estimated annual solar irradiance at the postcode
- Query OSM for roof footprint, aspect, nearby tree cover (optional, v2 feature)
- Generate "Solar Viability Score" (1–100) with estimate: roof area, panels possible, annual kWh, £ savings
- Pop-art theme: bright yellow sunburst gradients, comic "POWER RATING" badges, bold black outlines
- Capture lead: email + phone → forward to partner solar installers (£50–£150 per qualified lead)

**Cost:** $0/mo — all APIs are free
**Revenue Model:**
- Lead generation: sell qualified leads to solar installers (£50–£150 each)
- Premium report: £5–£10 for detailed PDF with installer quotes
- Partner referral fee: £200–£500 commission if lead converts to installation
- White-label version for installers: £50/mo

**Timeline:** 7–10 days to launch
- Day 1: Map all 6 DNO regions to their OpenDataSoft portals + build region detector from postcode
- Day 2: Build DNO API queries for capacity data
- Day 3: Integrate Open-Meteo Solar API for irradiance data
- Day 4: Build scoring algorithm (Solar Viability Score)
- Day 5: Pop-art frontend + postcode form
- Day 6: Lead capture system + email notification to Maya
- Day 7: Testing + launch
- Days 8–10: Recruit 3 solar installer partners

**First Action:** Check the NPG postal sectors dataset at northernpowergrid.opendatasoft.com — register free account, grab an API key with 100k calls/day limit

---

## 3️⃣ Property Report Tool

**API:** HM Land Registry Price Paid Data (free, Open Government Licence) + PropertyData API (£28/mo for 2k credits — trial ends May 30!)

**Build:**
- Postcode/street search → query HM Land Registry SPARQL endpoint (free) for sold prices since 1995
- Enrich with PropertyData API (while credits last): valuation estimates, market demand score, rental yield
- Display: average price (1-bed/2-bed/3-bed/house/flat), price trends over 1/5/10 years, recent sold prices with addresses
- Overlay sold prices on a map using Leaflet/OSM
- Pop-art theme: comic-style "PRICE TAG" badges, Roy Lichtenstein dot patterns on charts, bold primary colours
- Generate downloadable PDF report (£7.99)
- Capture emails for "price alerts" on specific postcodes

**Cost:** $0–$28/mo — Land Registry is free; PropertyData API £28/mo (optional enrichment — burn remaining 495 trial credits first)
**Revenue Model:**
- PDF report sale: £7.99 per postcode (instant digital download)
- Email capture → upsell to PropertyData-powered "Premium Valuation" (£19.99)
- Monthly subscription: £14.99/mo for 10 reports/month + price alerts
- Agent leads: estate agents pay for featured listings next to sold prices

**Timeline:** 5–7 days to launch (use PropertyData trial credits before they expire!)
- Day 1: Build Land Registry Price Paid SPARQL query engine (free endpoint)
- Day 2: Clean + cache results in SQLite/Postgres database
- Day 3: Build frontend — postcode input + results display + price chart
- Day 4: Pop-art styling + Stripe checkout for PDF reports
- Day 5: Use remaining PropertyData trial credits to enrich cached postcodes → seed data
- Days 6–7: Test, refine, launch

**First Action:** Build the Land Registry SPARQL query — test with `SELECT ?item ?itemLabel WHERE { ?item wdt:P31 wd:Q5 }` pattern adapted for Price Paid data at data.gov.uk/sparql — or use the simple CSV download + import approach for fastest time-to-value

---

## 4️⃣ Temp Gmail Account Service

**API:** FreeCustom.Email API (free tier: 100 inboxes/mo, $9/mo for 5k) or similar disposable email provider

**⚠️ RISK ADVISORY:** Google aggressively suspends Cloud projects using Gmail API for disposable/temp account generation (see n8n community reports). **Do NOT use official Gmail API** for this — use third-party disposable email APIs instead.

**Build:**
- Simple landing page: "Need a temp email? Click to generate one instantly"
- Backend calls FreeCustom.Email or similar API to create @tempdomain.com address
- Webhook/long-poll inbox for receiving verification emails — display in-browser
- Extract OTP/verification links via API (built-in OTP extraction available on most services)
- Pop-art theme: comic bubbles with "@TEMPORARY!" branding, bright magenta/yellow, retro computer terminal vibe
- Two tiers: Free (ads, 3 inboxes, 24h expiry) / Pro ($4.99/mo — 50 inboxes, 7-day expiry, ad-free, SMS forwarding)
- Stripe Checkout for Pro tier

**Cost:** $0–$9/mo — FreeCustom.Email free tier handles light usage; $9/mo for 5k inboxes
**Revenue Model:**
- Freemium: free with ads (AdSense) → upsell Pro
- Pro subscription: $4.99/mo
- Bulk API access for developers: $29/mo for 50k inboxes + API key
- Verification-as-a-service: $0.01 per OTP extraction call

**Timeline:** 4–6 days to launch
- Day 1: Sign up for FreeCustom.Email API, test endpoint
- Day 2: Build inbox creation + message polling backend (Node.js)
- Day 3: Build web frontend with inbox viewer
- Day 4: OTP extraction + Stripe for Pro tier
- Day 5: Pop-art theme + AdSense integration
- Day 6: Launch + test

**First Action:** Register at freecustom.email (free tier — 100 inboxes/mo), test the `/inboxes` and `/wait` endpoints with curl

---

## 5️⃣ Carbon Dashboard

**API:** carbonintensity.org.uk (free, NESO/National Grid, no API key needed)

**Build:**
- Live UK CO₂ intensity dashboard — national level + 14 regional breakdowns
- Endpoints: `/intensity` (current), `/intensity/date` (historical), `/intensity/forecast` (96hr ahead), `/regional` (by region)
- Gauge widgets: real-time gCO₂/kWh reading with colour badge (green/amber/red)
- "Best time to use electricity today" widget using forecast endpoint — recommend cheapest/lowest-carbon 2-hour window
- Embeddable widget (iframe): businesses can embed on their site — "Our server room runs when the grid is green"
- Pop-art theme: green-to-red gradient badge system, comic "CARBON POLICE" branding, retro 70s environmental poster style
- Free tier: national view + embed (with Carbon Dashboard branding)
- Pro tier: £19/mo — regional data, historical exports, API access, white-label embed

**Cost:** $0/mo — completely free API
**Revenue Model:**
- Embed Pro: £19/mo for businesses that want white-label carbon widget on their sustainability page
- API resell: 1,000 free calls/mo, then £0.001 per call (using caching to minimise upstream hits)
- B2B monthly reports: £49/mo — automated "Your carbon footprint" PDF for offices/factories
- Donation/Buy Me a Coffee button for individual users

**Timeline:** 4–5 days to launch
- Day 1: Map all Carbon Intensity API endpoints, build data fetcher with caching
- Day 2: Build national dashboard — current intensity, forecast, generation mix
- Day 3: Add regional breakdown + "best time" widget
- Day 4: Build embeddable iframe + Pro subscription via Stripe
- Day 5: Pop-art theme + launch

**First Action:** Hit the Carbon Intensity API in your browser: `curl https://api.carbonintensity.org.uk/intensity` — returns JSON of current UK intensity. Also check `/regional` for the 14-region breakdown

---

## 6️⃣ Travel Deals Affiliate Site

**API:** Amadeus Self-Service API (already set up — flight search working!) + Awin API (£0.03 per click, 21,500+ programmes) + Amazon Associates (tag: coupn28-21)

**Build:**
- Flight search frontend: depart city, destination, dates, budget → Amadeus flight offers API
- Results display: price, airline, duration, stops, departure time — all with "Book via" affiliate links
- "Flight Deal of the Day" widget — pre-query 10 popular European routes daily, cache results, show cheapest
- Hotel deals too (Amadeus hotel API is available)
- Pop-art theme: retro travel poster style, comic "GETAWAY" badges, bold sunset gradients, starburst "DEAL" callouts
- Affiliate links: Amazon (travel gear) / Awin (booking.com, Expedia, Skyscanner, hotels.com — 21,500 programmes available)

**Cost:** $0–$10/mo — Amadeus test API is free for 2,000 calls/mo; production starts at €0.007–€0.014 per API call (roughly $7–$14/1k searches)
**Revenue Model:**
- Affiliate commissions on bookings: Booking.com via Awin (2–5%), travel insurance, car hire, luggage
- Amazon Affiliates: "Travel Gear" recommendations per destination tag: coupn28-21
- Premium: £4.99/mo for "Deal Alerts" — email when a route drops below a threshold
- Featured hotel placement: hotels pay £5/mo to appear first in search results

**Timeline:** 6–8 days to launch
- Day 1: Spin up the existing Amadeus flight search (travel_deal_system.py) as a web endpoint
- Day 2: Build search UI — destination input, date picker, budget slider
- Day 3: Integrate Awin affiliate links (their API lists 21k+ programmes — filter travel/hotel)
- Day 4: Add hotel search + Amazon travel gear sidebar
- Day 5: Pop-art theme + "Deal of the Day" widget
- Day 6: Premium alerts Stripe subscription
- Days 7–8: Test all affiliate link flows, launch

**First Action:** Test the existing Amadeus flight API endpoint and get it returning formatted results through a simple Express/Fastify endpoint on the IONOS server

---

## 7️⃣ "What to Watch" Email Newsletter

**API:** TMDB (free) + WatchFinder's backend + Awin API + Amazon Associates + Mailgun (free: 5k emails/mo) or self-hosted SendPortal

**Build:**
- Weekly email: 5 curated picks — 2 movies, 2 TV shows, 1 hidden gem — each with why-you-should-watch blurb
- Pull from TMDB: release calendar, trending, ratings, genres
- Each pick has affiliate links: Amazon Prime/Apple TV/Netflix via Awin (if available), physical media via Amazon Associates
- Signup form on WatchFinder site (watch.thenewworldorder.io) — pop-up or footer
- Pop-art email templates: comic-style headers, punchy "THIS WEEK'S PICKS" in bold pop-art lettering
- Categories: "New This Week", "Hidden Gems", "Nostalgia Hit", "Foreign Film Friday"
- Automated via cron: scrape TMDB trending, generate email with MJML/React-Email, send via Mailgun/SendGrid

**Cost:** $0–$15/mo — TMDB free, Mailgun free tier 5k emails/mo, or MailerLite free for 1k subscribers
**Revenue Model:**
- Amazon affiliate commissions on physical/streaming purchases (tag: coupn28-21)
- Awin commissions via streaming service signups (Netflix, Disney+, Prime Video, Apple TV+)
- Sponsored slot: £50–£200 per newsletter issue for studios/publishers to feature their show
- Premium tier: £4.99/mo for "Early Access" + ad-free + bonus picks

**Timeline:** 5–7 days to launch first issue
- Day 1: Set up Mailgun (free 5k/mo) + domain for sending (newsletter@thenewworldorder.io)
- Day 2: Build TMDB-powered content scraper — trending this week, new releases, critic picks
- Day 3: Build email template (pop-art MJML) + dynamic content injection
- Day 4: Build signup widget for WatchFinder site
- Day 5: Test send + affiliate link injection
- Day 6: Schedule weekly cron job (Friday/Saturday send)
- Day 7: Send first issue! Promote on Telegram and social

**First Action:** Set up Mailgun with sending domain, test deliverability with a single test email to Maya's address — then build the TMDB content scraper

---

## Quick-Start Priority Matrix

| Project | Cost | Launch | Revenue Potential | Effort |
|---------|------|--------|-------------------|--------|
| 🎬 WatchFinder 2.0 | $0–$10/mo | 5–7 days | Medium (affiliates) | Medium |
| ☀️ Solar Panel Checker | $0 | 7–10 days | **High (lead gen)** | Medium |
| 🏠 Property Report Tool | $0–$28/mo | 5–7 days | Medium (PDF sales) | Low-Medium |
| 📧 Temp Gmail | $0–$9/mo | 4–6 days | Low-Medium | Low |
| 🌍 Carbon Dashboard | $0 | 4–5 days | Low (B2B niche) | **Lowest** |
| ✈️ Travel Deals | $0–$15/mo | 6–8 days | Medium (affiliates) | Medium |
| 📺 Newsletter | $0–$15/mo | 5–7 days | Low-Medium (grows) | Low |

### 🥇 Recommended First 3 to Build

1. **Carbon Dashboard** — $0 cost, 4-day build, nice portfolio piece, easy win ✅
2. **Solar Panel Checker** — $0 cost, highest revenue potential (lead gen £50–£150 per lead) 💰
3. **WatchFinder 2.0** — already live, biggest upgrade impact with TMDB + pop-art redesign 🎬

### Infrastructure Notes
- All sites can share a single Node.js server on IONOS with nginx reverse proxy
- Use subdomains: `solar.thenewworldorder.io`, `property.thenewworldorder.io`, `carbon.thenewworldorder.io`, `temp.thenewworldorder.io`, `deals.thenewworldorder.io`
- Newsletter send via `newsletter.thenewworldorder.io` subdomain
- Single Stripe account for all payment processing
- Single AdSense account across all ad-supported sites
- All share pop-art design language for brand cohesion
