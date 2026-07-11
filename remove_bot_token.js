const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    python3 -c "
import json
with open('/root/.openclaw/openclaw.json') as f:
    c = json.load(f)
    
# Remove the telegram bot token so gateway stops intercepting
if 'telegram' in c and 'botToken' in c['telegram']:
    del c['telegram']['botToken']
    print('Removed botToken from telegram config')
    
with open('/root/.openclaw/openclaw.json', 'w') as f:
    json.dump(c, f, indent=2)
    print('Config saved')
"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
