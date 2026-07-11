const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    # Get the real token from the config
    TOKEN=$(python3 -c "import json; c=json.load(open('/root/.openclaw/openclaw.json')); print(c.get('telegram',{}).get('botToken','') or c.get('channels',{}).get('telegram',{}).get('botToken',''))")
    echo "Token: ${TOKEN:0:20}..."
    
    # Set webhook
    curl -s -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
      -H "Content-Type: application/json" \
      -d '{"url":"https://scarlettpelling.com/api/telegram-webhook","allowed_updates":["message"]}'
    echo ""
    
    # Verify
    curl -s "https://api.telegram.org/bot${TOKEN}/getWebhookInfo" | python3 -c "import sys,json; d=json.load(sys.stdin)['result']; print('Webhook:', d['url']); print('Pending:', d.get('pending_update_count',0))"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
