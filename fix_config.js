const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    python3 -c "
import json
with open('/root/.openclaw/openclaw.json') as f:
    c = json.load(f)

# Add Darren as authorized sender
authz = c.get('gateway', {}).get('authorizedSenders', [])
if 'telegram:7573383643' not in authz:
    authz.append('telegram:7573383643')
if 'telegram:1523950034' not in authz:
    authz.append('telegram:1523950034')
    
# Re-add bot token but DON'T add telegram channel - just keep it in config
if 'telegram' not in c:
    c['telegram'] = {}
c['telegram']['botToken'] = '824834…9pZo'

with open('/root/.openclaw/openclaw.json', 'w') as f:
    json.dump(c, f, indent=2)
print('Updated: botToken set, Darrens ID authorized')
print('authSenders:', authz)
"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
