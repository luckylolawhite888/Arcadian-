---
name: security-audit
description: "31-point security audit checklist for apps and projects — preventing common vibecoder vulnerabilities"
version: 1.0
author: Lola
created: 2026-05-16
source: "Vibecoder security gaps post — turned into systematic skill"
---

# Security Audit — 31-Point Checklist

## Why This Exists
Vibecoders (AI-assisted developers) often ship fast and forget security. This checklist exists so every project we build gets a security review before going live. One evening of review can prevent exploitation.

---

## 🔐 Authentication & Access Control

### a) No authentication on private routes
- Every route that handles user data must check auth
- Don't assume frontend routing is sufficient
- **Fix:** Middleware on every protected endpoint

### b) Admin routes protected only in frontend
- Hiding an admin button is not security
- Admin APIs must check user role server-side
- **Fix:** Server-enforced role-based access on every admin endpoint

### c) Missing server-side authorisation checks
- User A shouldn't access User B's data even if authenticated
- **Fix:** Every resource query checks `WHERE user_id = current_user.id`

### d) JWT stored in localStorage
- localStorage is accessible by any JS on the domain (XSS vulnerable)
- **Fix:** Use httpOnly cookies for JWTs where possible
- If localStorage is unavoidable, ensure strong CSP headers

### e) JWT secret copied from a tutorial
- `"secret123"` or `"mysecretkey"` is a vulnerability, not a secret
- **Fix:** Use a cryptographically random string (OpenSSL rand, `openssl rand -hex 64`)

### f) Tokens with no expiry
- A stolen never-expiring token = permanent access
- **Fix:** Short expiry (15-60 min) + refresh tokens

### g) Logout that only clears browser state
- If the server doesn't invalidate the token, "logout" is theatre
- **Fix:** Token blacklist or short expiry + refresh token rotation

---

## 🚦 Rate Limiting & Abuse Prevention

### h) No rate limiting on login/signup
- Brute force attack vector
- **Fix:** Rate limit by IP (5 attempts/min), exponential backoff

### i) No throttling on expensive APIs
- Search, export, report generation — expensive operations
- **Fix:** Queue or throttle heavy operations per user

### j) No abuse limits on AI/API usage
- If we expose an AI or external API, users can drain credits
- **Fix:** Per-user daily/monthly quotas for API calls

---

## 🔑 Secret Management

### k) API keys exposed in frontend code
- Everything in client-side JS is public
- **Fix:** Proxy API calls through backend, never expose keys

### l) API keys committed to GitHub
- `.env` in commits, hardcoded keys in source
- **Fix:** `.gitignore`, pre-commit hooks scanning for secrets, GitHub secret scanning

### m) Secrets shared in prompts or screenshots
- Posting screenshots with API keys, DB URLs, or tokens visible
- **Fix:** Blur/sanitise before sharing; use `.env` templates not real values

---

## 🗄️ Database Security

### n) Database exposed to the public internet
- Direct DB connection from app code without firewall
- **Fix:** Bind to localhost/private network only; no public ports

### o) Weak database password
- `"password"`, `"admin"`, `"root"` — guessed in seconds
- **Fix:** 32+ char random password, stored only in server config

### p) App using root DB credentials
- App doesn't need DROP TABLE or CREATE USER permissions
- **Fix:** Dedicated DB user with minimum required grants (SELECT, INSERT, UPDATE, DELETE)

### q) Missing row-level security policies
- One user could theoretically delete all records
- **Fix:** Row-level security (RLS) on Supabase/PostgreSQL, or WHERE clauses scoped to user

### r) Users can change IDs and access other data
- `/api/user/123` — what if user changes to `/api/user/456`?
- **Fix:** Server checks `WHERE id = ? AND user_id = current_user.id`

### s) Inputs passed directly into SQL queries
- SQL injection — oldest exploit, still everywhere
- **Fix:** Parameterised queries ALWAYS. No string interpolation in SQL.

---

## 📦 Input & File Validation

### t) No validation on request body fields
- Users can send unexpected types, sizes, or malicious payloads
- **Fix:** Schema validation (Zod, Joi, Yup) on every endpoint

### u) File uploads without type and size checks
- Someone uploads a 2GB `.exe` instead of a profile picture
- **Fix:** Check MIME type **server-side**, enforce file size limits, scan for malware

### v) Public buckets storing private user files
- S3/Supabase bucket with public read = anyone can enumerate user files
- **Fix:** Private buckets with signed URLs, or server-side auth checks

---

## 🌐 Network & Edge Security

### w) Wildcard CORS on authenticated APIs
- `Access-Control-Allow-Origin: *` on endpoints with auth cookies
- **Fix:** Explicit origin whitelist, `credentials: true` only for known origins

### x) No HTTPS enforcement
- Traffic in plaintext = MITM attacks, credential theft
- **Fix:** HTTPS redirect, HSTS headers, secure cookies

### y) No DDoS or bot protection at the edge
- A single bad script can take down an unprotected API
- **Fix:** Cloudflare rate limiting, WAF rules, bot fight mode

---

## 🔍 Debugging & Observability

### z) Open admin panels and debug endpoints
- `/admin`, `/debug`, `/api-docs`, `/graphql?introspection` left open
- **Fix:** Auth on all admin routes, disable introspection in production, remove debug endpoints

### aa) Error messages leaking stack traces
- Full stack traces, DB queries, file paths in error responses
- **Fix:** Generic error messages to client, detailed logs server-side only

---

## 🔄 Maintenance

### ab) Dependencies never scanned after install
- `npm install` pulls in 1,000+ packages with known CVEs
- **Fix:** `npm audit`, `yarn audit`, Dependabot, Snyk, or `pip-audit` for Python

### ac) No logs for auth, deletes, and payments
- When something goes wrong, no trail to investigate
- **Fix:** Structured logging (JSON) for: logins, registrations, deletes, payments, admin actions

### ad) No backup and restore test
- Backups mean nothing if you've never tested restoration
- **Fix:** Automated daily backups + monthly restore drill

### ae) No rollback plan when production breaks
- Broken deploy + no rollback = extended downtime while debugging
- **Fix:** Keep last known-good deployment, practice rollback, use blue/green or canary deploys

---

## Our Projects — Audit Priority

| Project | Risk Level | Needs Audit? |
|---------|-----------|--------------|
| **Out & About** | 🔴 High (payment processing, user data) | Yes — before public launch |
| **Mars Reg** | 🟡 Medium (payment processing) | Yes — before payments go live |
| **TNWO App** | 🟡 Medium (user accounts) | Yes — before app store release |
| **Ghost Blog** | 🟢 Low (read-only content) | No urgent need |
| **Station Control** | 🟡 Medium (streaming infra) | Before public launch |
| **GPREG Automation** | 🔴 High (NHS data) | Already has proxy security — review data handling |

## Quick Wins (Do These First)
1. DB credentials: dedicated user, strong password, localhost-only
2. JWT: httpOnly cookies, short expiry, never in localStorage
3. Rate limiting on login/signup endpoints
4. Error messages: no stack traces in production
5. GitHub: check for committed secrets
6. File uploads: type + size checks server-side
7. Dependency scan: run `npm audit` / `pip-audit`
8. Backup: verify backup + restore works

---

_This skill is generated from industry-wide security patterns. Update it as new vulnerabilities emerge._
