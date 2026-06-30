---
name: cloudflare-dns
description: Full Cloudflare management — DNS, SSL, cache, deployment, CDN
version: 2.0
author: Lola
created: 2026-05-16
merged: cloudflare-tunnel
---

# Cloudflare — DNS, SSL, Cache & Deployment

## Account
- **Email:** Luckylolawhite@gmail.com
- **Zone:** thenewworldorder.io (e8f2ea4b9634485eab2c042416fec384)
- **API credentials:** `.vault/cloudflare.json`
- **SSL setting:** Full (not strict) — for flexibility with self-signed certs

## DNS Records
- **A records:** IONOS server IP (212.227.93.74)
- **MX records:** iRedMail mail server
- **SPF:** Configured for iRedMail
- **DKIM:** `mail._domainkey` TXT record
- **DMARC:** `_dmarc` TXT record

## Common Tasks

### Purge Cache
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/e8f2ea4b9634485eab2c042416fec384/purge_cache" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything": true}'
```

### Toggle Development Mode
```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/e8f2ea4b9634485eab2c042416fec384/settings/development_mode" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"value": "on"}'
```

## Deployment to Server
```bash
# Copy files to IONOS
scp -i /home/node/.ssh/ionos_ubuntu <files> root@212.227.93.74:/var/www/<site>/
```

## Sites Deployed
- **thenewworldorder.io** (main — `/var/www/thenewworldorder/`)
- **marsreg.com** (Mars Reg — `/var/www/mars-site/`)
- **/blog/** — Ghost proxy
- **/outandabout/** — Out & About sign-up page

## Deployment Scripts
- `deploy_tnwo.sh` — Main deployment
- `deploy_now.sh` — Quick deploy
- `DEPLOY_LUXURY_TNWO.sh` — Luxury theme
- `DEPLOY_NWO.sh` — NWO brand
- `copy_tnwo_luxury.sh` — Copy luxury assets

## Architecture Docs
- `TNWO_ARCHITECTURE.md` — Full architecture
- `TNWO_DEPLOYMENT_PACKAGE.md` — Deployment guide
- `TNWO_LUXURY_DEPLOYMENT_PACKAGE.md` — Luxury variant

## Theme Files
- `TNWO_LUXURY_HOMEPAGE.html` — Luxury landing page
- `TNWO_LUXURY_STYLE.css` — Luxury stylesheet

## Lessons Learned
1. Host nginx MUST serve HTTP/HTTPS — Docker containers shouldn't bind ports 80/443
2. After DNS changes, **purge cache** immediately
3. SSL = "Full" (not "Full (strict)") for self-signed cert compatibility
4. After proxy changes, verify with `check_page_access.sh`
