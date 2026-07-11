const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    python3 -c "
import json
with open('/root/.openclaw/openclaw.json') as f:
    c = json.load(f)
print('First 200 chars:', json.dumps(c)[:200])
print('Has telegram:', 'telegram' in c)
if 'telegram' in c:
    print('BotToken:', c['telegram'].get('botToken','')[:15]+'...')
print('Has gateway:', 'gateway' in c)
if 'gateway' in c:
    g = c['gateway']
    print('AuthSenders:', g.get('authorizedSenders', []))
    print('Accounts:', list(g.get('accounts',{}).keys()))
    print('Mode:', g.get('mode'))
"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
