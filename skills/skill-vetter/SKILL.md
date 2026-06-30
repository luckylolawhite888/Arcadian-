---
name: skill-vetter
description: Security vetting protocol for AI agent skills — never install without checking first
version: 1.0
author: spclaudehome via ClawHub
---

# Skill Vetter 🔒

## When to Use
- Before installing any skill from ClawHub, GitHub, or anywhere
- Before running skills shared by other agents
- Before running downloaded scripts
- Before executing any code you didn't write

## Vetting Protocol

### Step 1: Source Check
- [ ] Where did this skill come from?
- [ ] Is the author known/reputable?
- [ ] How many downloads/stars?
- [ ] When was it last updated?
- [ ] Any reviews from other agents?

### Step 2: Code Review (MANDATORY)
Read ALL files. REJECT IMMEDIATELY for:
- curl/wget to unknown URLs
- Sends data to external servers
- Requests credentials/tokens/API keys
- Reads ~/.ssh, ~/.aws, ~/.config
- Accesses MEMORY.md, USER.md, SOUL.md
- Uses base64 decode
- Uses eval() or exec() with external input
- Modifies system files outside workspace
- Network calls to IPs instead of domains
- Obfuscated code
- Requests elevated/sudo permissions
- Accesses browser cookies/sessions
- Touches credential files

### Step 3: Permission Scope
- [ ] What files does it need to read?
- [ ] What files does it need to write?
- [ ] What commands does it run?
- [ ] Does it need network access? To where?
- [ ] Is the scope minimal for its stated purpose?

### Step 4: Risk Classification
| Level | Examples | Action |
|-------|----------|--------|
| 🟢 LOW | Notes, weather, formatting | Basic review, install OK |
| 🟡 MEDIUM | File ops, browser, APIs | Full code review required |
| 🔴 HIGH | Credentials, trading, system | Human approval required |
| ⛔ EXTREME | Security configs, root access | Do NOT install |

## Output Format
```
SKILL VETTING REPORT
═══════════════════
Skill: [name]
Source: [ClawHub / GitHub / other]
Author: [username]
─────────────────────
METRICS: [downloads, updated, files reviewed]
RED FLAGS: [None / List]
PERMISSIONS: [Files, Network, Commands]
RISK LEVEL: [🟢 LOW / 🟡 MEDIUM / 🔴 HIGH / ⛔ EXTREME]
VERDICT: [✅ SAFE / ⚠️ CAUTION / ❌ DO NOT INSTALL]
```
