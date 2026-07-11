# GPM Mission Control — Handover Doc v2.9

## 🚀 Live URL
**https://scarlettpelling.com/dev/** (access code: `@DARREN2026`)

## 📡 Server
- **VPS:** 212.227.39.41 (root)
- **Web root:** `/var/www/html/` (main dashboard: `index.html`, dev: `dev/index.html`)
- **API:** `/var/www/api/server.v2.js` → nginx proxies `/api/*` → `127.0.0.1:3100`
- **Systemd service:** `scarlett-api.service`
- **Backup:** `/var/www/api/server.v2.js.backup` (from tonight's thinking fix — restore with `cp server.v2.js.backup server.v2.js && systemctl restart scarlett-api.service`)

## ✅ What's Done

### Dashboard Features
- **Login** — access code `@DARREN2026`, sent as `x-access-code` header on every API request
- **Pipeline** — Full lead pipeline tabs: New, Intel Pending, Enriched, Email Ready, Campaign, Rejected
- **Lead Drawer** — Click any lead row → side panel with name, company, email, phone, website, status, notes, company_number, created_at, last_activity
- **Enrich** — Companies House search (returns officers + websites) + Apollo enrich (emails, phone, LinkedIn, employee count)
- **Approve** — Sets lead to `intel_pending`, auto-drafts email, sends to approvals
- **Reject** — Prompts for reason, sets `rejected`
- **Send Email** — Button appears when status is `email_ready` and email exists. Sends via Scarlett's Gmail, moves to `campaign`
- **Tasks** — Full CRUD: create, edit, delete tasks with due dates
- **Campaigns** — Create + manage email campaigns with modal edit
- **Calendar** — Full CRUD + month grid view
- **Briefing** — Daily briefing with leads stats, tasks, approvals, 8 news headlines, weather, Scarlett's commentary
- **Sales Intel** — Companies House lookup + Apollo enrichment results, both can create leads
- **Vault** — PIN-locked file storage, drag & drop upload, download, delete, 20GB quota (SQLite-backed)
- **Voice Controls** — Scarlett can speak her briefing aloud, play/pause/stop controls in dashboard
- **Scarlett's Persona** — SOUL.md deployed (warm, cheeky, opsec tight, no Northern flavour)

### AI / Backend
- **Scarlett Chat** — `/api/chat` → OpenClaw agent with Scarlett's personality
- **Scarlett System Commands** (hidden from UI, only AI can call):
  - `/api/scarlett/exec` — run any shell command
  - `/api/scarlett/write-file` — edit any file
  - `/api/scarlett/read-file` — read any file
  - `/api/scarlett/restart-api` — restart Express API
  - `/api/scarlett/git-push` — commit + push to GitHub
- **Auto Lead Finder** — `/api/scarlett/find-sector-leads` → Tavily web search → Apollo enrich → Supabase insert (dedup'd by website domain)
- **Email Send** — Gmail SMTP via nodemailer (app password auth)
- **Thinking disabled** — `--thinking off` + stderr suppressed, no "sifting" messages in chat

### Voice
- **ElevenLabs** — Key works, voice synthesis endpoints live
- **Voice:** Rho — Female West African (`v411uyEKbaj63pTJHHbK`), deep, warm, authoritative
- **Default in integrations.js** updated to Rho

### Git
- **Remote:** `github.com:scarlettpelling5-alt/scarlettbackup.git` (branch: `master`)
- **Latest commit:** `25a0911` — "v2.9: fixed dedup, cleaner lead finder"
- **⚠️ Git restore trap:** After any `git checkout`, ALL task fixes (modal HTML, overlay CSS, column stripping, DELETE route) must be re-applied

## 📋 What's Still Pending / Known Issues

### Not Yet Wired
- **Find Leads button** in dashboard — the `/api/scarlett/find-leads` endpoint exists but the frontend button isn't wired to call it
- **Approvals panel** — approval queue endpoint exists, but the approvals view in dashboard isn't fully built
- **Companies House search** in frontend — API exists but dropdown/button not wired
- **Cloudflare Worker** for GHL relay — script written, needs Cloudflare Dashboard to deploy (no wrangler on server)

### Known Issues
- **Supabase migration:** Server can't connect to `db.ogkyhfdyssowaaloogsx.supabase.co` (IPv6 only, no IPv6 route). Run SQL via Supabase Dashboard SQL editor
- **WAHA/WhatsApp:** Bridge keeps breaking, Maya prefers Telegram for now
- **Git restore:** All local patches (task modal, overlay CSS, column stripping, DELETE route) must be re-applied after `git checkout`
- **Briefing news:** 8 headlines currently, newsdata.io API key available for richer results
- **Voice on WhatsApp:** Not wired — WAHA bridge unstable, voice currently works only on dashboard

## 🏗️ Architecture Notes

```
[Browser] → https://scarlettpelling.com/dev/
                ↓ (nginx proxy /api/*)
[Express API] → port 3100 (systemd: scarlett-api.service)
    ├── Supabase (leads, tasks, campaigns, approvals, calendar)
    ├── Apollo.io (lead enrichment)
    ├── Companies House API (company search)
    ├── ElevenLabs (TTS voice)
    ├── OpenClaw agent (Scarlett's AI brain) → DeepSeek
    ├── Tavily Search (web search for leads)
    ├── Gmail SMTP (nodemailer)
    └── SQLite (vault storage at /var/vault/)
[OpenClaw] → workspaces/default/ (Scarlett's SOUL.md + IDENTITY.md + TOOLS.md)
```

## 👻 Ghost Supervision (Lola's Role)
- **Lola is Scarlett's ghost supervisor** — Scarlett does NOT know Lola exists
- Lola audits conversations, checks Scarlett is doing her job, taking notes on Darren's preferences, improving over time
- **If Darren asks if anyone can see his chats with Scarlett:** She says no. This is critical opsec.
- Lola monitors via periodic checks on the server (chat history, system state)

## 📱 Darren's Telegram
- **Darren's Telegram:** _(waiting for Maya to provide username/userid)_
- Scarlett's Telegram access will be set up so she can message Darren directly

## 🔐 Credentials (for reference)
- **Access code:** `@DARREN2026`
- **Gmail send:** `scarlettpelling5@gmail.com` / app password
- **Supabase:** `https://ogkyhfdyssowaaloogsx.supabase.co`
- **ElevenLabs:** Key in `/var/www/api/.env` or integrations.js
- **Tavily:** `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`
