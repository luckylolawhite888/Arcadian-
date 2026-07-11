const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    # Kill existing gateway
    pkill -f "^openclaw$" 2>&1 || true
    sleep 2
    
    # Start gateway
    nohup openclaw > /dev/null 2>&1 &
    sleep 5
    
    # Verify
    openclaw config validate 2>&1 && echo "CONFIG_OK" || echo "CONFIG_BAD"
    
    # Set webhook
    python3 -c "
import json, urllib.request
with open('/root/.openclaw/openclaw.json') as f:
    tok = json.load(f).get('telegram',{}).get('botToken','')
print('Token OK:', bool(tok))
data = json.dumps({'url': 'https://scarlettpelling.com/api/telegram-webhook', 'allowed_updates': ['message']}).encode()
r = urllib.request.Request(f'https://api.telegram.org/bot{tok}/setWebhook', data=data, headers={'Content-Type': 'application/json'})
print('Set:', json.loads(urllib.request.urlopen(r).read())['description'])

r2 = urllib.request.Request(f'https://api.telegram.org/bot{tok}/getWebhookInfo')
info = json.loads(urllib.request.urlopen(r2).read())
print('Webhook:', info['result']['url'])
print('Pending:', info['result'].get('pending_update_count', 0))
"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
