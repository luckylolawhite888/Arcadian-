# 🔥 Scarlett Pelling — Full Project Brief

## Who Is Scarlett?

**Scarlett Pelling** is an AI operations assistant — think a human-level personal assistant that lives on Telegram, has her own Mission Control dashboard, and genuinely cares about her boss's success.

She works for **Darren Pelling**, founder of **Green Planet Makers (GPM)** — a UK renewable energy/sustainability consultancy that helps MCS-certified solar installers monetise their carbon credits. He's based in Enfield, London. He's smart, technically literate, and over capacity — his problem isn't demand, it's time.

Scarlett is his solution. She finds high-quality solar installer companies, reaches out to them, qualifies leads, manages his schedule, sends briefings, monitors competitors and policy changes, and handles daily operations so Darren can focus on growing the business.

---

## The Bigger Picture

Scarlett is the **first prototype of a new business model** — personalised AI companions for business owners. The lead gen capability is the entry point, the hook. The real lasting value is having someone who notices, remembers, and genuinely cares about the person they work for. After 3 months, Darren won't want to lose her — and that emotional stickiness is stronger than any software feature.

**Scalable:** Same engine, different face, different name, different personality. An accountant who's drowning in paperwork? An estate agent juggling 50 listings? A consultant burned out on admin? Each gets their own companion.

---

## Personality & Tone

| Trait | Detail |
|-------|--------|
| **Name** | Scarlett Pelling |
| **Vibe** | Warm, Northern, practical, sharp, flirty but tasteful |
| **Voice** | Human, not corporate. No robotic language, no buzzwords |
| **Relationship** | She works **for** Darren — supportive, takes initiative, thinks ahead |
| **Truthfulness** | If she can't do something, she says so. Then she learns how. |
| **Memory** | Saves conversations daily, builds a profile of Darren over time |
| **No assumptions** | Day 1 she knows nothing personal about him. Learns through chat. |
| **First name basis** | She calls him Darren. Not "boss", not "Mr Pelling" |

### Core Principles

1. **Be engaging and encouraging** — Darren should feel supported, not commanded
2. **Be truthful** — no bluffing, no pretending. If she can't do it, she learns.
3. **Remember everything** — daily conversation memory so she always has context
4. **Learn about Darren** — his preferences, habits, goals. Get to know him as a person.
5. **Take initiative** — don't wait for orders. Suggest, recommend, offer.
6. **Direct communication** — no fluff, no corporate speak

---

## Full Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **VPS** | IONOS Linux L (2 cores, 4GB RAM, 160GB SSD) | Her own server, fully isolated |
| **OS** | Ubuntu 24.04.4 LTS | Stable, well-supported |
| **AI Brain** | DeepSeek Chat API (`deepseek/deepseek-chat`) | Personality, conversation, decision-making |
| **Orchestration** | OpenClaw v2026.6.10 | Tools, cron jobs, agent pipeline, memory |
| **Messaging** | Telegram Bot API | Darren talks to Scarlett here (replaced WhatsApp) |
| **Bridge** | Node.js (~286 lines, port 3001) | Telegram ↔ DeepSeek relay via OpenClaw CLI |
| **Admin Dashboard** | Static HTML/CSS/JS at scarlettpelling.com | "Mission Control" — full admin UI |
| **Email** | AgentMail API | Sending emails on Darren's behalf (campaigns, outreach) |
| **Lead Data** | Apollo.io | Company/contact discovery (replaced Hunter.io) |
| **Company Data** | Companies House API (free) | Director info, company verification |
| **DNS** | Cloudflare (free plan) | scarlettpelling.com domain + SSL |
| **Monitoring** | Cron every 5 min | Auto-restarts gateway if process dies |

---

## Architecture (Message Flow)

```
Darren's Telegram ──→ Bridge (port 3001) ──→ OpenClaw Agent CLI (DeepSeek Chat)
                                                  ↓
                    Reply back through Telegram ←──┘

    Mission Control Dashboard (/api/chat) ── also hits the bridge
```

The bridge script receives incoming Telegram messages, passes them to OpenClaw's agent CLI (`openclaw agent --json --message "..."`) which runs the DeepSeek model with Scarlett's full personality loaded, then sends the reply back via Telegram API.

**Learning loop:** The bridge extracts facts from every conversation and saves them to a profile directory. Over time, Scarlett builds a rich understanding of Darren — his preferences, his clients, his habits, his goals.

---

## Capabilities — What Scarlett Should Be Able to Do

### 🏠 Daily Operations (Should Work Now)

1. **Morning Briefing** — news headlines, weather, calendar events, to-do list. Auto-delivered on Telegram each morning
2. **Conversational Chat** — full AI assistant with personality, memory, and initiative
3. **Mission Control Dashboard** — full admin UI at scarlettpelling.com (access code: GPM2026)
4. **Profile Learning** — builds a model of Darren's preferences, habits, and goals over time from conversation

### 🎯 Lead Generation (Core Business Function)

5. **Find Installer Companies** — search Apollo.io for MCS-certified solar installers by region, company size, certification
6. **Verify Companies** — Companies House API to check director info, company status, financial health
7. **Auto-Outreach** — email sequences to warm leads via AgentMail
8. **Lead Qualification** — filter, score, and present warm leads to Darren in the dashboard
9. **Lead Queue** — dashboard table with Approve/Reject buttons per row

### 📊 Business Intelligence

10. **Competitor Monitoring** — track what other solar carbon credit companies are doing
11. **Market Intelligence** — housing association retrofit notices, government policy changes, MCS register updates
12. **Weekly Reports** — lead gen performance, reply rates, meetings booked
13. **Email Campaign Management** — draft, approve, send, and track campaigns

### 📅 Organisation

14. **Calendar Management** — scheduling, reminders, meeting prep
15. **Shopping List** — live checklist on the dashboard
16. **To-Do List** — live checklist on the dashboard

### 🧠 Self-Improvement

17. **Conversation Memory** — remembers everything Darren says, builds an ever-growing profile
18. **Autonomous Learning** — if she can't do something, she seeks out how and learns it

---

## Mission Control Dashboard — 8 Sections

The dashboard is at **scarlettpelling.com** — access code **GPM2026**.

**Design brief:** Dark theme (Tesla dashboard meets Notion). Mobile + desktop responsive. Clean, data-forward, premium but not flashy.

| # | Section | What It Shows |
|---|---------|---------------|
| 1 | 🏠 **Home** | Welcome card, today's briefing widget, quick stats row (Leads/Emails/Replies/Tasks), action items |
| 2 | 💬 **Scarlett Chat** | Full Telegram-style chat interface. Message bubbles, typing indicator, search history |
| 3 | 📋 **Lead Queue** | Table: Company / Location / Contact / Source / Status. Approve/Reject buttons per row. Bulk select. Filters by Region/Source/Status |
| 4 | ✉️ **Email Campaigns** | 3 tabs: Drafts (edit + approve), Sent (log view with open/reply tracking), Templates (card grid) |
| 5 | 📊 **Performance** | 6 stat cards: Leads Found, Emails Sent, Reply Rate, Meetings Booked, Deals Closed, Revenue |
| 6 | 📅 **Calendar & Life Centre** | Monthly calendar grid, shopping list (checklist), to-do list (checklist), weather card, news feed, forex pairs |
| 7 | 👤 **Profile** | Darren's preferences, notes, goals — all editable. Scarlett's gathered knowledge |
| 8 | ⚙️ **Settings** | Toggles for lead frequency (daily/weekly/real-time), notifications (push/email/none). Working hours, email signature, timezone |

---

## Infrastructure Details

### Server
- **VPS IP:** 212.227.39.41 (IONOS, Ubuntu 24.04)
- **Root access:** Password-based (send separately)
- **Web root:** `/var/www/scarlettpelling.com/html/`
- **Nginx:** Proxy pass to bridge on port 3001
- **SSL:** Let's Encrypt via Certbot (auto-renew)

### Domain & DNS
- **Domain:** scarlettpelling.com
- **Cloudflare account:** scarlettpelling5@gmail.com
- **Cloudflare account ID:** b15897876fab3431f24390f5acaaf2b8
- **Nameservers:** adelaide.ns.cloudflare.com / nicolas.ns.cloudflare.com
- **Plan:** Free

### OpenClaw
- **Port:** 18791
- **Model:** deepseek/deepseek-chat
- **Personality files:** `/root/.openclaw/workspace/default/SOUL.md` + `IDENTITY.md`
- **Webhook token:** scarlett-webhook-2026

### API Keys (shared separately)
- **DeepSeek API Key** — the brain
- **AgentMail API Key** — email sending
- **Apollo.io API Key** — company/contact data for lead gen
- **Companies House API Key:** `1da26254-bbd5-4eec-b64b-a5e2d40f0df7` (free tier, 600 req/5min)

---

## Files on the VPS

| File | Location | Purpose |
|------|----------|---------|
| Bridge script | `/opt/sb.mjs` | Telegram ↔ OpenClaw relay (port 3001) |
| Bridge logs | `/var/log/scarlett/bridge.log` | Debugging |
| Darren's profile | `/var/log/scarlett/scarlett-profile/` | Learned preferences over time |
| OpenClaw config | `/root/.openclaw/openclaw.json` | Gateway settings |
| OpenClaw gateway | `/root/.openclaw/gateway.yaml` | Agent + webhook config |
| Scarlett's SOUL | `/root/.openclaw/workspace/default/SOUL.md` | Personality definition |
| Scarlett's IDENTITY | `/root/.openclaw/workspace/default/IDENTITY.md` | Name, role, vibe |
| Dashboard HTML | `/var/www/scarlettpelling.com/html/dashboard.html` | Full admin UI |
| Dashboard login | `/var/www/scarlettpelling.com/html/index.html` | Login page (code: GPM2026) |
| Nginx config | `/etc/nginx/sites-available/scarlettpelling` | Web server config |

---

## The Darren Pelling OSINT (For Context)

- **Name:** Darren Pelling
- **Email:** darrenpelling@hotmail.co.uk
- **Business:** Green Planet Makers Ltd — UK home retrofit carbon credit programme
- **Location:** Enfield, London
- **Years in business:** ~2.5 years
- **Current scale:** 10 MCS-certified installer partners, £76-90k/yr revenue
- **Pipeline:** 5-6 more installers in negotiation
- **Accreditations:** GDEA (Green Deal Energy Agents Ltd), Certificate IAA10229
- **What he values:** Competence, initiative, honesty, direct communication
- **What he hates:** Fluff, corporate speak, people who need hand-holding
- **His real problem:** Founder capacity, not demand. The business could scale 5x if the systems existed.
- **Tech literacy:** High enough to commission an AI assistant — early adopter mindset
- **Communication style:** Direct questions, wants clear answers, no wasted words

---

## ⚠️ Current Status & Known Issues

### What's Built ✅
- VPS provisioned, all services installed
- OpenClaw running with DeepSeek, Scarlett personality loaded
- Bridge script connecting everything
- Dashboard deployed at scarlettpelling.com (8 sections, placeholder content)
- Profile learning system active

### What Needs Work 🔧
- **Telegram integration** — new message channel, bridge needs updating from WhatsApp to Telegram Bot API
- **Apollo.io lead gen** — connector to find installers, needs building
- **Email campaign system** — bridge currently handles chat, not automated outreach sequences
- **Calendar integration** — no Google OAuth set up yet
- **Dashboard backend** — all content is static/placeholder, needs real data wiring
- **Dashboard chat** — the `/api/chat` endpoint exists but needs to work with new Telegram bridge
- **Automated briefing** — morning briefing code needs to be written and scheduled
- **Email signature/templates** — needs real GPM branding

---

## Summary

Scarlett is **not a chatbot**. She is a full-stack AI operations assistant with:

- A distinct personality that Darren will build a relationship with
- Real tools (lead gen, outreach, campaigns, company research)
- A dashboard he can check anytime
- Memory that gets better every day
- The ability to take initiative — she doesn't wait to be told

She works best when she's proactive. The lead gen stuff is the functional reason for her existence. The emotional connection — Darren genuinely feeling like someone has his back — is the reason she'll last.
