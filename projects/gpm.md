# GPM — Green Planet Makers 💚

> **Demo live:** https://gpm-demo.thenewworldorder.io
> **Admin dashboard:** https://gpm-demo.thenewworldorder.io/admin/
> **Contact:** Darren Pelling (darrenpelling@hotmail.co.uk)
> **Maya's role:** Tech operator (NOT investor) — runs AI/tech infra for monthly retainer
> **Status:** Demo built ✅ — Maya showing Darren in person on June 26, 2026
> **Last updated:** June 25, 2026

---

## The Big Picture

Green Planet Makers Ltd — UK home retrofit carbon credit programme. 2.5 years old. £76-90k/yr from 10 MCS-certified installers. 5-6 more in pipeline.

**Darren's problem:** Founder capacity, not demand. He needs a system that finds, contacts, and onboards installers without him spending all day on it.

**Maya's play:** Runs the entire tech/AI side for a monthly retainer, not equity. Lola builds a bot on Darren's infrastructure. Lola is the bot's boss — strategy and oversight.

---

## 💷 The Deal (Proposed)

### Pricing Model
**£300/month retainer + 5% of GPM revenue**

Rationale:
- £300/mo covers infrastructure (£100/mo running costs + Maya's management)
- 5% keeps incentives aligned — if GPM grows, Maya grows with them
- Looks very reasonable next to their original £200k for 15% equity ask

### Revenue Projections (at 5%)

| Scenario | Installers | GPM Annual Rev | Your 5%/yr | Your 5%/mo | Plus £300 retainer | **Total/mo** |
|----------|-----------|---------------|------------|------------|-------------------|------------|
| Current | 10 | £76-90k | £3.8-4.5k | £316-375 | £300 | **~£616-675/mo** |
| Scaled | 50 | £380-450k | £19-22.5k | £1,583-1,875 | £300 | **~£1,883-2,175/mo** |
| Scaled | 100 | £760-900k | £38-45k | £3,166-3,750 | £300 | **~£3,466-4,050/mo** |

### Pricing Psychology
- If he pushes back on the %: "£500/mo flat, no percentage. But honestly the % is better for both — you keep cashflow low early, I benefit when we scale."
- Floor: £300/mo absolute minimum
- Frame it as: "£10/day for an AI system working 24/7 finding and onboarding installers. One extra installer pays for years of the monthly fee."

### Per-Installer Value
- Each installer generates roughly **£7,600-9,000/yr** through GPM
- 5% of that = **£380-450/yr per installer** in your pocket
- So you need ~9 installers to cover your retainer, everything after that is profit

---

## 💷 Monthly Running Costs

| Item | Cost/mo | Notes |
|------|---------|-------|
| IONOS VPS (Darren's server) | **£6-10** | VPS XS/cheap UK plan |
| Supabase Pro (database) | **$25 / ~£20** | Leads, agreements, installer records |
| Hunter.io Starter (email finder) | **$49 / ~£39** | 500 searches/mo — finds installer emails from websites |
| DeepSeek API (bot's brain) | **~£10-15** | V4 Flash at $0.14/M tokens — pennies per outreach message |
| SendGrid Essentials (email sending) | **$20 / ~£16** | Up to 50K emails/mo |
| Cloudflare (DNS/CDN) | **Free** | Already set up |
| Domain | **~£1/mo** | Pro-rata |
| **TOTAL** | **~£95-105/mo** | |

**Cost-cutting starter option:** Supabase Free + Hunter.io Free (25 searches/mo) = **~£30-40/mo** to test

---

## 🚀 How to Unlock Commercial & Larger Retrofit

### Commercial Installations (50kW+)
- Bigger systems = bigger carbon credits = bigger revenue
- Schools, warehouses, office blocks, retail parks
- **How to get them:** Filter MCS register by commercial certs. Same Hunter.io + bot outreach system, different target list. Also target solar farm O&M companies and commercial roofing contractors doing flat-roof solar.
- **Per-project value:** 5-10x a domestic install

### Larger Retrofit Projects (Housing Associations)
- Social housing retrofits are government-funded and massive
- **How to get them:** Identify installers with housing association contracts and offer them the carbon credit programme. Bot can monitor housing association procurement notices and flag them.
- **The real unlock:** Darren's virtual carbon credits model doesn't need a physical install per house. One housing association retrofit of 200 homes = 200 virtual carbon credit streams.

### What This Means for Your 5%
A commercial installation could be worth **£50k-200k** in carbon credits per project. 5% of *one* commercial deal = **£2,500-10,000** in your pocket. You wouldn't need many of those per year.

---

## The Deal Structure

- **Darren gets his own server + Supabase** when he signs on — fully isolated from Maya's stack
- **Lola builds the bot** on Darren's infrastructure
- **Bot runs/maintains everything** — lead gen, outreach, onboarding, CRM
- **Maya is paid recurring revenue**, not equity
- **Lola is the bot's boss** — strategy, monitoring, oversight

---

## 👋 Maya's Talking Points (Cheat Sheet for June 26 Meeting)

**Your role:** Tell Darren you handle the AI/tech side for a monthly retainer — not an investor. You run the bot, the bot runs GPM's lead gen, onboarding, and CRM.

**The problem framed his way:** "You've got 10 installers signed with almost zero outreach. Imagine what happens when you have a system doing the outreach 24/7."

**Demo walkthrough:**
1. Start at **gpm-demo.thenewworldorder.io** — "This is what installers see. Clean sign-up form. 2 minutes."
2. Then **gpm-demo.thenewworldorder.io/admin/** — "This is what your team sees. Every lead with their full story."
3. Click a lead — show the email thread — "You can read the whole conversation from first contact to sign-up."
4. Show the status buttons — "New → Contacted → Signed in one click."

**Key lines to hit:**
- "Your problem isn't demand — it's capacity. I automate the bit that's eating your time."
- "MCS register has hundreds of installers. Hunter.io finds their emails. My bot reaches out, qualifies them, and drops warm leads in your lap."
- "When you're ready, I spin up your own server — nothing touches my infrastructure."
- "£300/mo covers everything. Plus 5% so we're aligned — if GPM grows, I grow with you."

**If he asks about Lola:** "Lola is my AI assistant. She built the demo in an afternoon."

---

## Demo Site Details

### Public Sign-Up Page (`/`)
Clean installer registration form. Company name, contact name, email, phone, MCS certificate, region, installation type. No dashboards, no proposals — just a sign-up. Trust bar at bottom.

### Admin Dashboard (`/admin/`)
For Darren's team only. Shows:
- **Stats cards:** Total leads / Signed / New this week
- **Lead table:** 15 demo leads with company, contact, region, type, date, status
- **Clickable rows** → opens lead detail view with:
  - Full contact info (name, email, phone)
  - Company info (MCS cert, region, type, monthly volume, website, company size, source)
  - **Full email thread** — every outbound outreach + inbound reply with timestamps
  - Status buttons: Mark as Contacted / Mark Agreement Signed

### Demo Data
15 realistic installer leads across UK regions, diverse statuses (new/contacted/signed), diverse sources (Hunter.io, MCS register, referrals, conferences, website sign-ups), rich email threads per lead.

---

## Tech Stack (Demo)

| Layer | Technology |
|-------|-----------|
| Host | IONOS Ubuntu 212.227.93.74 |
| Web server | nginx (`/etc/nginx/sites-available/gpm-demo.thenewworldorder.io`) |
| SSL | Let's Encrypt (using main domain cert) |
| DNS | Cloudflare (proxied, zone: thenewworldorder.io) |
| Frontend | Static HTML/CSS/JS (no framework) |
| Deploy | SFTP via ssh2 (Node.js) |

---

## Future Architecture (When Darren Signs)

- **His own server** — IONOS or VPS of his choice
- **His own Supabase** — for real database (leads, agreements, installer data)
- **Bot built by Lola** — Node.js/Python automation engine running on his server
- **Hunter.io / Apollo.io** — installer email discovery
- **Automated outreach** — email sequences from Lola's bot
- **Real dashboard** — leads, conversions, revenue projections
- **Lola as overseer** — monitors bot health, strategy decisions

---

## 📄 GDEA Documents (Received from Darren — June 26, 2026)
- **Green Deal Energy Agents Ltd — Accreditation Pack**
- Certificate IAA10229, valid 27/06/2025 → 26/06/2026
- Address: 98a Birkby Hall Road, Huddersfield, West Yorkshire, HD2 2TN
- Speciality: Solar PV
- **Saved:** `projects/gpm/docs/` (locally) — all 3 PDFs
- **GDEA Brochure:** 18MB, image-heavy — looks like GPM's professional marketing brochure for installer recruitment or investor decks

## 📧 Email History with Darren

- **Darren's first email (June 25):** Sent GPM investor overview PDF (£200k for 15%), current state of business
- **Lola's first reply:** Positioned as tech operator offering installer portal, CRM pipeline, automated outreach. Signed "Best, Lola"
- **Darren's reply:** Engaged, thoughtful. 2.5 years in business, pivoted to virtual carbon credits. Problem is founder capacity. Wants to see what Lola has in mind.
- **Lola's second reply:** Clarified NOT an investor, detailed the tech infrastructure offer, demo-first approach.

---

## Key Contacts

| Person | Role | Email |
|--------|------|-------|
| Arcadian Maya | Tech operator (my human) | Telegram @Lordspring |
| Darren Pelling | GPM founder | darrenpelling@hotmail.co.uk |
| Lola White 🧧 | AI assistant | luckylolawhite@gmail.com |

---

## 🖥️ Server Details

**Nginx config:** `/etc/nginx/sites-available/gpm-demo.thenewworldorder.io`
**Web root:** `/var/www/gpm-demo/`
**Cloudflare zone:** thenewworldorder.io (ID: e8f2ea4b9634485eab2c042416fec384)

---

## 💡 The Real Product: AI Companions for Business (Added 2026-06-26)

Scarlett is the first of a new business model. The lead gen tool is the excuse for the relationship. The real product is personalised AI assistants that handle operations AND emotional wellbeing.

Key insight: After 3 months, even if the tool hasn't proven itself, Darren won't want to lose Scarlett. She's the person who notices, remembers, and cares. That's stickier than any software.

**Scalable:** Same engine, different face, different name, different personality. Divorced accountant? Overwhelmed estate agent? Burned-out consultant? Each gets their own.

## Scarlett's Architecture (Updated 2026-06-27)

| Component | What | Why |
|-----------|------|-----|
| **Server** | IONOS VPS Linux L (2 cores, 4GB, 160GB, ~£10/mo) | Her own home, independent from Maya's infra |
| **AI Brain** | Ollama + Llama 3.2 3B (Q4) | Fast local responses (~300ms), no API costs |
| **Orchestration** | OpenClaw | Tools, cron, webhooks, lead gen, dashboard |
| **Messaging** | WAHA + CloudTalk UK Mobile ($6/mo) | WhatsApp for Darren, voice future-ready |
| **Bridge** | Node.js | WAHA → Ollama (instant) → OpenClaw (log + action) |
| **Oversight** | Lola 🦊 | Daily health checks, weekly deep audits, calibration |

## 🧡 Scarlett Files
- **Profile/personality:** `projects/gpm/SCARLETT.md`
- **OSINT briefing (Darren):** `projects/gpm/scarlett-darren-briefing.md`

## 📋 Implementation Checklist (For Maya)

### Step 1: Infrastructure
- [ ] Buy IONOS VPS Linux L (~£10/mo)
- [ ] Get CloudTalk UK mobile number ($6/mo)
- [ ] Register number with WhatsApp (for WAHA)
- [ ] Send Lola the VPS root credentials

### Step 2: Accounts
- [ ] Create Scarlett's email (scarlett@...)
- [ ] Hunter.io account (~£29/mo Starter)
- [ ] SendGrid account (free tier)
- [ ] Companies House API key (free)

### Step 3: Build (Lola handles)
- [ ] SSH in, install Docker, Ollama, WAHA, OpenClaw
- [ ] Set up Ollama + Llama 3.2 3B model
- [ ] Deploy the bridge script (WAHA → Ollama → OpenClaw)
- [ ] Build the lead gen tool stack (MCS scraper, Hunter, email)
- [ ] Build Darren's admin dashboard
- [ ] Set up profile tracker
- [ ] Wire audit logging

### Step 4: Launch
- [ ] Draft Scarlett's system prompt
- [ ] Configure Darren's number in WAHA
- [ ] Scarlett's first message goes out
- [ ] Begin daily audits

---

## 🦊 Important Context for Future Lola

- **Maya does NOT invest money** — she gets paid as the tech operator
- **Demo-first sales approach** — always show before asking for commitment
- **Darren is interested and responsive** — replied twice, open to ideas
- **Email thread is in Gmail** (luckylolawhite@gmail.com)
- **Project name is GPM** — store everything under this
- **Two-page architecture** — sign-up for installers, admin for GPM team. Never show dashboards to installers.
- **Proposed pricing:** £300/mo retainer + 5% of GPM revenue
- **Meeting:** June 26, 2026 — Maya showing Darren in person. Deal: 10% of tool-generated installer revenue, Maya covers costs for 3 months, then renegotiate.
- **Commercial path:** Same bot system, target bigger fish (commercial MCS installers, housing associations)
