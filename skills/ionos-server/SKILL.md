---
name: ionos-server
description: Full IONOS Ubuntu server management — admin, monitoring, health checks, crash recovery
version: 2.0
author: Lola
created: 2026-05-16
merged: monitoring-systems, healthchecks
---

# IONOS Server — Administration & Monitoring

## Connection
- **Host:** 212.227.93.74 | **User:** root
- **Key:** `/home/node/.ssh/ionos_ubuntu` (ED25519, no passphrase)
- **Backup:** `/root/lola_ssh_key.pem` on server
- **Connect:** `ssh -i /home/node/.ssh/ionos_ubuntu root@212.227.93.74`

## Server Specs
- **OS:** Ubuntu 24.04.4 LTS | **CPU:** 6 cores | **RAM:** 7.7 GB
- **Disk:** 232 GB (202 GB free — 14% used)
- **Docker:** Multiple containers (Ghost, MySQL, web proxy)
- **OpenClaw:** Port 18790 (host network)

## Common Tasks

### Check System Health
```bash
ssh root@212.227.93.74 "df -h && free -h && uptime && docker ps -a"
```

### Docker Management
```bash
# List containers
docker ps -a
# View logs
docker logs <container> --tail 50
# Restart
docker restart <container>
```

### Nginx
- Configs: `/etc/nginx/sites-enabled/`
- Main: `00-main-site-443.conf`
- Reload: `nginx -t && systemctl reload nginx`

### Services
- **MySQL:** Docker container, hosts Ghost DB
- **Ghost:** Container `ghost-blog` on port 2368
- **CUPS:** Print server for Moon Ray

## Health Check Scripts
- `deep_check.sh` — Full system diagnostic
- `check_all_databases.sh` — MySQL health
- `check_specific_database.sh` — Single DB check
- `check_lola_central.sh` — Central health check
- `check_page_access.sh` — Web page availability
- `powerup_status.sh` — Power-up status
- `get_page_content.sh` — Page content verification

## Active Cron Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| Morning briefing | 10:00 UTC daily | Maya's briefing |
| DeepSeek balance | Every 6h | Balance monitoring |
| Self-improvement | 05:00 UTC daily | Pattern extraction |
| Invoice (Susan) | May 20, 2026 | One-shot |

## Heartbeat Protocol
1. Check gateway: `openclaw gateway status`
2. Check email (unread + Rundown)
3. Check briefing sent (after 11:00 BST)
4. Check memory files recent
5. Log in daily memory file

## Crash Recovery Playbook

### Scenario 1: Gateway Crash (config error)
- Symptoms: Gateway won't start, invalid JSON
- Fix: Validate JSON, fix `channels.telegram.groups` (Record, not Array), fix `allowFrom` (user IDs only)
- Backup: SSH key at `/root/lola_ssh_key.pem`

### Scenario 2: Server Crash (kernel panic)
- Symptoms: All containers lost, SSH available
- Fix: Docker volumes persist, rebuild containers, restore from MySQL
- Lesson: Docker volumes > container storage

### Scenario 3: Missing SSH Key
- Fix: Restore from `/root/lola_ssh_key.pem` on server or chat history backup

## Key Files
- **HEARTBEAT.md:** Active checklists
- **AGENTS.md:** Startup routines
- **openclaw.json:** Gateway config (handle with care!)

## CRITICAL SAFETY RULES
- Never restart gateway without verifying JSON validity
- `channels.telegram.groups` is a **Record**, not Array
- `allowFrom` = user IDs only
- Protect SSH key — never share, never log
- Think before running destructive commands
