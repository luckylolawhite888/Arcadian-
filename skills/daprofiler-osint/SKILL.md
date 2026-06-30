---
name: daprofiler-osint
description: DaProfiler OSINT tool — profile people from name/surname, returns emails, socials, addresses, phone numbers, photos
---

# DaProfiler OSINT Skill

## Location
- **Installed at:** `/root/DaProfiler/` on IONOS server (212.227.93.74)
- **Access via:** SSH key at `/home/node/.ssh/ionos_ubuntu`

## Requirements
- Python 3.12 + Firefox (snap installed) + Selenium
- All pip deps installed with `--break-system-packages`

## Usage

### Basic run (SSH from container):
```bash
node -e '
const { Client } = require("ssh2");
const fs = require("fs");
const key = fs.readFileSync("/home/node/.ssh/ionos_ubuntu");
const conn = new Client();
conn.on("ready", () => {
  conn.exec("cd /root/DaProfiler && python3 daprofiler.py --first [FIRSTNAME] --last [LASTNAME] 2>&1", (err, stream) => {
    let out = "";
    stream.on("data", d => out += d);
    stream.on("close", () => { console.log(out); conn.end(); });
  });
});
conn.on("error", e => console.error(e));
conn.connect({ host: "212.227.93.74", port: 22, username: "root", privateKey: key, readyTimeout: 120000 });
'
```

### Options:
- `--first [name]` — First name (required)
- `--last [name]` — Last name (required)
- `--email` — Search for email addresses
- `--social` — Search social media accounts
- `--address` — Search physical addresses
- `--phone` — Search phone numbers
- `--photos` — Search profile photos (checks if face appears)
- `--all` — Run all modules

## Patches Applied
- Fixed `leakcheck_net.py`: changed `from leakcheck import LeakCheckAPI` → `LeakCheckAPI_v2 as LeakCheckAPI`
- Fixed Instagram search `SyntaxWarning` (escape sequence) — cosmetic only

## Notes
- Uses LinkedIn login — creds may need updating in `modules/social_medias/linkedin_search.py`
- Primarily designed for French targets but works UK too
- Run times vary (30s-5min depending on modules)
- Firefox runs headless by default via Selenium
