---
name: mars-reg
description: "Mars Reg — Mars land registration site at marsreg.com, product tiers, hardware kits, and backend"
version: 1.0
author: Lola
created: 2026-05-16
---

# Mars Reg (marsreg.com)

## Site Overview
- **Domain:** marsreg.com (Cloudflare, nameservers etta/lee.ns.cloudflare.com)
- **Server:** IONOS Ubuntu — nginx at `/var/www/mars-site/`
- **SSL:** Let's Encrypt via DNS-01 Cloudflare certbot
- **URL:** https://marsreg.com
- **Old subdomain:** mars.thenewworldorder.io (redirects to main domain)
- **Status:** Live with splash screen (access code: `marsadmin`)
- **Stack:** Static HTML/CSS/JS (no backend yet)

## Frontend
- Three.js 3D interactive Mars globe (import map from CDN)
- pdf-lib for client-side PDF certificate generation
- Brevo API for transaction emails (to be replaced by GHL)
- **Splash screen** — password gate, not public yet

## Product Tiers (8 SKUs)

### Land Packages
| Package | Acres | Price |
|---------|-------|-------|
| Red Dust Plot | 10 | £29.99 |
| Olympus Estate | 50 | £59.99 |
| Valles Kingdom | 100 | £99.99 |

### Hardware Kits
| Product | Contents | Price |
|---------|----------|-------|
| Mars Signal Receiver DIY Kit | RTL-SDR + Pi Zero W + antenna + 3D case | £49.99 |

### Bundles
| Package | Contents | Price |
|---------|----------|-------|
| Olympus Explorer Bundle | 50 acres + DIY Kit | £99.99 |
| Kingdom Explorer Pro | 100 acres + pre-built Kit | £199.99 |

### Other
| Product | Price |
|---------|-------|
| Company Incorporation | £49.99 |
| Explorer Gift Pack | £39.99 |

## PDF Templates
- **Location:** `/var/www/mars-site/land_blank.pdf` and `COMPANY_CER_blank.pdf` on IONOS
- **Client-side gen:** pdf-lib fills name, reg number, coordinates from browser
- **Needed (not built):** Server-side PDF generation for auto-fulfillment

## Hardware Kit Details
- **BOM:** Pi Zero W (~£10), RTL-SDR v4 (~£10), SD card (~£3), battery pack (~£5), antenna (~£2), 3D-printed case (~£3) = **~£30-35 total**
- **Alibaba supplier:** RTL-SDR V4 dongle at ~$10-15/unit (MOQ 8-100)
- **Logo print:** +$0.30/unit at MOQ 100
- **Software:** OpenWebRX or custom web app preloaded on SD
- **iOS accessible** via web browser (no native app needed)
- **Marketing:** "Buy 50 acres, get the Explorer Kit free" — land as hero, kit as bonus

## Backend Needed (Not Built)
1. **Auto PDF gen** — server-side fill from blanks on purchase
2. **Stripe integration** — payment processing
3. **Auto-email** — send PDF to customer
4. **Auto-print** — send PDF to printer for physical fulfillment
5. **GHL integration** — replace Brevo (email) + Stripe (payments) + backend

## GHL Plan
- Maya has full pro GHL account ($297/mo) — credentials not yet shared
- Can handle: CRM, funnels, order management, SMS, email automation

## Admin
- **URL:** `/#admin`
- **Credentials:** admin / MarsAdmin2024!
- **Status:** Demo/basic — needs proper order management

## Marketing
- "Buy 50 acres, get the Explorer Kit free" bundle strategy
- Mars-branded packaging with "Mission Brief" instead of manual
- Educational STEM framing for parents
- Cross-promo with Station Control radio
