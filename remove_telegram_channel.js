const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    python3 << 'PYEOF'
import json
with open('/root/.openclaw/openclaw.json') as f:
    c = json.load(f)

# Remove telegram from channels completely
if 'channels' in c and 'telegram' in c['channels']:
    del c['channels']['telegram']
    print("Removed telegram channel from channels")

with open('/root/.openclaw/openclaw.json', 'w') as f:
    json.dump(c, f, indent=2)

# Verify
with open('/root/.openclaw/openclaw.json') as f:
    c2 = json.load(f)
print("Channels:", list(c2.get('channels',{}).keys()))
PYEOF
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
