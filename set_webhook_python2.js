const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    const script = `import json, urllib.request

with open('/root/.openclaw/openclaw.json') as f:
    c = json.load(f)

tok = c.get('telegram',{}).get('botToken','') or c.get('channels',{}).get('telegram',{}).get('botToken','')
print("Token:", tok[:20] + "...")

data = json.dumps({"url": "https://scarlettpelling.com/api/telegram-webhook", "allowed_updates": ["message"]}).encode()
req = urllib.request.Request(f"https://api.telegram.org/bot{tok}/setWebhook", data=data, headers={"Content-Type": "application/json"})
resp = urllib.request.urlopen(req)
print("Set:", json.loads(resp.read()))

req2 = urllib.request.Request(f"https://api.telegram.org/bot{tok}/getWebhookInfo")
resp2 = urllib.request.urlopen(req2)
info = json.loads(resp2.read())
print("Webhook:", info['result']['url'])
print("Pending:", info['result'].get('pending_update_count', 0))
`;
    sftp.writeFile("/tmp/set_webhook2.py", Buffer.from(script), (e2) => {
      if (e2) { console.log("Write Error:", e2.message); sftp.end(); conn.end(); return; }
      console.log("Script uploaded");
      sftp.end(); conn.end();
      
      const conn2 = new Client();
      conn2.on("ready", () => {
        conn2.exec("python3 /tmp/set_webhook2.py 2>&1", (e3, s3) => {
          let o = "";
          s3.on("data", d => o += d.toString());
          s3.on("close", () => { console.log(o.trim()); conn2.end(); });
        });
      }).on("error", e => console.log("Err:", e.message))
        .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
