---
name: agent-browser
description: Fast CLI browser automation using accessibility tree snapshots with ref-based element selection
version: 1.0
author: matrixy via ClawHub
---

# Agent Browser Skill

CLI browser automation for multi-step workflows. Uses accessibility tree snapshots with deterministic ref-based element selection.

**Install required:** `npm install -g agent-browser` (run if not available)

## When to Use
- Multi-step form filling (GPREG automation)
- Deterministic element selection (not flaky selectors)
- Session isolation (different browser sessions for different tasks)
- Complex SPA workflows

## Core Workflow

```bash
# 1. Navigate and snapshot
agent-browser open https://example.com
agent-browser snapshot -i --json

# 2. Parse refs, then interact
agent-browser click @e2
agent-browser fill @e3 "text"

# 3. Re-snapshot after page changes
agent-browser snapshot -i --json
```

## Key Commands

### Navigation
```
agent-browser open <url>
agent-browser back | forward | reload | close
```

### Snapshot (always use -i --json)
```
agent-browser snapshot -i --json
agent-browser snapshot -i -c -d 5 --json   # compact, depth limit
agent-browser snapshot -s "#main" -i       # scope to selector
```

### Interactions (Ref-based)
```
agent-browser click @e2
agent-browser fill @e3 "text"
agent-browser type @e3 "text"
agent-browser hover @e4
agent-browser check @e5 | uncheck @e5
agent-browser select @e6 "value"
agent-browser press "Enter"
agent-browser scroll down 500
agent-browser drag @e7 @e8
```

### Sessions (Isolated Browsers)
```
agent-browser --session admin open site.com
agent-browser --session user open site.com
agent-browser session list
agent-browser state save auth.json     # Save cookies/storage
agent-browser state load auth.json     # Load (skip login)
```

### Screenshots & PDFs
```
agent-browser screenshot page.png
agent-browser screenshot --full page.png
agent-browser pdf page.pdf
```

### Network Control
```
agent-browser network route "**/ads/*" --abort
agent-browser network requests --filter api
```

### Get Information
```
agent-browser get text @e1 --json
agent-browser get html @e2 --json
agent-browser get value @e3 --json
agent-browser get title --json
agent-browser get url --json
```

### Wait
```
agent-browser wait @e2
agent-browser wait 1000
agent-browser wait --text "Welcome"
agent-browser wait --load networkidle
```
