const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
python3 << 'EOF'
import json
with open('/root/.openclaw/openclaw.json') as f:
    c = json.load(f)

# Remove root-level telegram if present
if 'telegram' in c:
    del c['telegram']

# Put botToken in correct place: channels.telegram.botToken
if 'channels' not in c:
    c['channels'] = {}

c['channels']['telegram'] = {'botToken': '824834…Cm9s'}

with open('/root/.openclaw/openclaw.json', 'w') as f:
    json.dump(c, f, indent=2)

# Validate
import subprocess
r = subprocess.run(['openclaw', 'config', 'validate'], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr.strip())
EOF
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("Err:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
