# Working Memory — Emma Campaigns Bug

## Current State (Paused 2026-07-09 ~20:46 UTC)

### Emma Server Access
- **VPS:** 212.227.38.78 — root password: 3v3fUeTROhIl4n
- **Jump via:** IONOS gateway 212.227.93.74 (SSH key at /home/node/.ssh/ionos_ubuntu)
- **Nginx:** serves `/var/www/emma/index.v2.html` as default, proxies `/api/*` to port 3100
- **Server code:** `/var/www/api/server.js` (minified single line)
- **Frontend:** `/var/www/emma/index.v2.html` (also `app.html` copy exists)

### What's Deployed
- ✅ Campaigns update route fixed (separate select after update)
- ✅ Server.js syntax validated, PM2 restarted
- ✅ nodemailer installed (npm install nodemailer)
- ❌ Gmail transporter NOT yet wired into server.js
- ❌ Approvals, email sending, stats endpoints NOT in live server

### Tools on IONOS Gateway
- `sshpass` installed at `/usr/bin/sshpass`
- Node.js available (v22.22.2)
- No python3
- SCP pattern: b64 encode locally → writ to IONOS via node ssh2 stream → `cat file.b64 | sshpass ssh root@EMMA 'base64 -d > /path'`

### Gmail Creds (ready to use)
- missecoemma@gmail.com / ndlo wyru loiv dwqr

### What to Resume
1. Fix frontend campaign edit not persisting (frontend bug, server code is correct)
2. Build email thread system (new Supabase table + new Campaigns page UI)
3. Wire up Gmail sending endpoint
4. Build Approvals page backend
