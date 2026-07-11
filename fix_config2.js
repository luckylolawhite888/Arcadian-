const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    python3 -c "
import json
with open('/root/.openclaw/openclaw.json') as f:
    c = json.load(f)
authz = c.get('gateway', {}).get('authorizedSenders', [])
authz.append('telegram:7573383643')
authz.append('telegram:1523950034')
c['gateway']['authorizedSenders'] = authz

# Ensure the telegram section ONLY has botToken (no channels)
c['telegram'] = {'botToken': '824834…9pZo'}

with open('/root/.openclaw/openclaw.json', 'w') as f:
    json.dump(c, f, indent=2)

# Validate it parses back
with open('/root/.openclaw/openclaw.json') as f:
    c2 = json.load(f)
print('Config valid ✅')
print('AuthSenders:', c2['gateway']['authorizedSenders'])
print('Telegram:', list(c2['telegram'].keys()))
"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
