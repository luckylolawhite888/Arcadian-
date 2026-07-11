const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    python3 -c "
import json
with open('/root/.openclaw/openclaw.json') as f:
    c = json.load(f)

# Remove the broken root-level 'telegram' section I accidentally added
if 'telegram' in c:
    del c['telegram']
    print('Removed broken root telegram section')

# The correct one is in channels.telegram - verify
tok = c.get('channels',{}).get('telegram',{}).get('botToken','')
print('Correct token in channels:', tok[:20]+'...' if tok else 'MISSING')

with open('/root/.openclaw/openclaw.json', 'w') as f:
    json.dump(c, f, indent=2)
print('Config fixed')
"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
