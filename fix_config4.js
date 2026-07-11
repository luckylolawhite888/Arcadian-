const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    python3 << 'PYEOF'
import json
with open('/root/.openclaw/openclaw.json') as f:
    c = json.load(f)

# Restore original gateway structure (without authorizedSenders which may need different path)
# OpenClaw 2026.6.11 might expect it at accounts or channels level
# Remove authorizedSenders from gateway
if 'gateway' in c and 'authorizedSenders' in c['gateway']:
    del c['gateway']['authorizedSenders']

# Add authorized senders at the correct place for older OpenClaw - under gateway
# Actually, let's just put it back the way it was originally (no changes to gateway)
# and add the authorized senders under the channels.telegram config
if 'channels' in c and 'telegram' in c['channels']:
    c['channels']['telegram']['authorizedSenders'] = ['7573383643', '1523950034']

with open('/root/.openclaw/openclaw.json', 'w') as f:
    json.dump(c, f, indent=2)

# Verify
with open('/root/.openclaw/openclaw.json') as f:
    c2 = json.load(f)
print('Gateway:', json.dumps(c2.get('gateway',{}), indent=2))
tg = c2.get('channels',{}).get('telegram',{})
print('Telegram channel has authorizedSenders:', 'authorizedSenders' in tg)
PYEOF
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
