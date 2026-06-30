# To-Do List

## 🔴 BEFORE TODAY (May 19)
- [ ] **Ali's Kingsley Meeting** — 4:00 PM (corrected from 11:00). Everything's prepped (dashboard, email, WhatsApp, Rightmove, PropertyData)
- [ ] **Morning briefing test** — 10:00 AM London, check dual delivery (Telegram + WhatsApp)

## 📱 Launchpad Mini Apps (Fix Today)
- [ ] **Notes app** — Currently missing/redirects to blog. Create a notes page at `https://thenewworldorder.io/notes.html`
- [ ] **Chat app** — Currently points to OpenClaw. Should point to WAHA web interface at `http://212.227.93.74:3000` (reverse proxy via nginx)
- [ ] **Spreadsheet/GPREG Tracker** — New mini app for logging GP registration entries. Columns: name, DOB, postcode, GPREG reference, submission date, status

## 🤖 GPREG Automation (Rebuild Script)
- [ ] **Full rewrite needed** — NHS form has changed design:
  - "Start now" is now a `<button>` not an `<a>` tag
  - Radio values changed: Myself=`value="1"`, First time=`value="1"`, NHS no=`value="0"`, UK address=`value="1"` etc
  - Cookie banner ("Accept additional cookies") blocks "Start now" button — must accept cookies first
  - Address postcode field mapping may be different
- [ ] Rebuild `gpreg_runner.py` generator with correct selectors
- [ ] **Test end-to-end through SpyderProxy UK proxy** — Must be FIRST run of the day on a fresh proxy IP. Proxy gets burned after ~20 page navigations.
- [ ] **Add `nhs-number` page handler** — Form now has an intermediate page after saying "No" to knowing NHS number. Need radio click + maybe dummy "0" in text field.
- [ ] **Add manual address page field dump** — Need to dump actual form field names on first clean run
- [ ] Auto-log submissions to Spreadsheet tracker

## 🗺️ WorldWideView / Geospatial Mini App (New Idea)
- [ ] **Explore WorldWideView** (https://worldwideview.dev, open-source at github.com/silvertakana/worldwideview) — Palantir-style geospatial intelligence platform
- [ ] **Potential:** Kingsley property dashboard on 3D map with data overlays (schools, transport, crime, flood zones, PropertyData sold prices, Rightmove listings)
- [ ] **Could be:** Kingsley-branded geospatial dashboard that makes £200/mo SaaS look like a £20K enterprise tool
- [ ] **Plugin architecture** could integrate PropertyData, Rightmove scraper for live overlays

## 📋 Business
- [ ] **Register with PRS for Music** — Maya's DistroKid tracks need PRS to earn radio royalties
- [ ] **PropertyData trial cancellation** — Reminder set for May 30 (cron job + calendar)
- [ ] **GHL Private Integration token** — Maya deletes Lola V8, creates Lola V9 with scopes checked in Step 3

## 🛠️ Tech Debt
- [ ] **Gateway protocol mismatch** — CLI v2026.5.18 can't talk to gateway v2026.3.25 on PID 15. Safe upgrade path: build new container image with v5 baked in
- [ ] **Phone pairing** — Blocked by gateway version mismatch. Needs nginx WebSocket proxy + gateway upgrade
- [ ] **Get phone number for WAHA** — WhatsApp automation needs SIM/number

---

_Last updated: 2026-05-19 02:45 UTC — Pre-Kingsley meeting state_
