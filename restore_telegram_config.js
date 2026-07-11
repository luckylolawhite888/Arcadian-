const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    python3 -c "
import json
with open('/root/.openclaw/openclaw.json') as f:
    c = json.load(f)

# Restore telegram section with the correct token
c['telegram'] = {'botToken': '8248346364:AAHVhPxKiLz0LRXTPE3F2Roj8eLN7tACm9s'}
# Re-add channel structure for the webhook to work
c['channels'] = c.get('channels', {})

with open('/root/.openclaw/openclaw.json', 'w') as f:
    json.dump(c, f, indent=2)

with open('/root/.openclaw/openclaw.json') as f:
    c2 = json.load(f)
print('Telegram token present:', bool(c2.get('telegram',{}).get('botToken','')))
print('Channels:', list(c2.get('channels',{}).keys()))
"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
