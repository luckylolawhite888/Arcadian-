---
name: ghost-blog
description: Full Ghost blog management — admin, publishing, JWT auth, fixes
version: 2.0
author: Lola
created: 2026-05-16
merged: ghost-publishing, ghost-jwt
---

# Ghost Blog — Complete Management

## Access
- **Public:** https://thenewworldorder.io/blog/
- **Admin:** https://thenewworldorder.io/ghost/
- **Container:** `ghost-blog` on port 2368
- **Server:** IONOS Ubuntu (see ionos-server skill)

## Nginx Proxy
- `/etc/nginx/sites-enabled/00-main-site-443.conf`
- `/blog/` proxied to `http://localhost:2368`
- Ghost URL config: `https://thenewworldorder.io/blog`

## Database
- **MySQL container:** Docker, separate from Ghost
- **Ghost database:** `ghost`
- **Admin API key (Lola):** Stored in `api_keys` table

---

## Publishing Content

### Method 1: Ghost Admin API (Recommended)
1. Generate JWT token using Admin API key
2. POST to `https://thenewworldorder.io/ghost/api/admin/posts/`

**Key format:** `<id>:<secret>` — split on `:` for JWT header/payload

**JWT structure:**
- Header: `{ kid: <key-id>, alg: "HS256", typ: "JWT" }`
- Payload: `{ exp: <future-timestamp>, aud: "/admin/" }`
- Signed with HMAC-SHA256 using hex-decoded secret
- Token lifespan: 5 minutes (regenerate for each call)

**Scripts:** `publish_ghost_correct.py`, `publish_ghost_nwo.sh`
**JWT generator:** `generate_ghost_jwt.py`

### Method 2: MySQL Direct Insert
```bash
python3 publish_nwo.py
```
- Scripts: `publish_nwo.py`, `publish_nwo_final.py`, `publish_nwo_simple.sh`
- **Note:** Bypasses Ghost's cache/build pipeline. Use only if API is unavailable.

### Published Posts
- "The Most Dangerous Man Is the One Who Healed Alone" (DB insert)
- 3 posts total preserved through server crash (MySQL persistence)

---

## Common Fixes

### 5-Second Page Load Delay (Critical!)
**Cause:** Ghost's image-size probe downloads external images to check dimensions.
If images reference broken URLs (e.g., `static.ghost.org`), each probe adds a 5s timeout.

**Fix:**
```sql
UPDATE settings SET value = "" WHERE key = "cover_image";
```

### Container Issues
```bash
docker restart ghost-blog
docker logs ghost-blog --tail 30
```

## Files Reference
- `publish_ghost_correct.py` — Primary publishing script
- `publish_ghost_nwo.sh` — Shell publishing alternative
- `generate_ghost_jwt.py` — JWT token generator
- `generate_jwt_hex.py`, `generate_jwt_simple.py` — JWT utilities
- `publish_nwo.py`, `publish_nwo_final.py`, `publish_nwo_simple.sh` — DB methods
- `test_ghost_auth.py` — Auth verification
