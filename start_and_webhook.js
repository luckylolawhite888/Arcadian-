const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
nohup openclaw > /dev/null 2>&1 &
sleep 5
pgrep -fa openclaw | head -3
echo "---"
# Now set webhook
python3 << 'PYEOF'
import json, urllib.request
with open('/root/.openclaw/openclaw.json') as f:
    tok = json.load(f)['channels']['telegram']['botToken']
print('Token OK' if tok else 'NO TOKEN')
# Set webhook
data = json.dumps({'url': 'https://scarlettpelling.com/api/telegram-webhook', 'allowed_updates': ['message']}).encode()
r = urllib.request.Request(f'https://api.telegram.org/bot{tok}/setWebhook', data=data, headers={'Content-Type': 'application/json'})
print('Set:', json.loads(urllib.request.urlopen(r).read()).get('description'))
# Verify
r2 = urllib.request.Request(f'https://api.telegram.org/bot{tok}/getWebhookInfo')
info = json.loads(urllib.request.urlopen(r2).read())
print('Webhook:', info['result']['url'])
print('Pending:', info['result'].get('pending_update_count', 0))
PYEOF
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("Err:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
