const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`curl -s "https://api.telegram.org/bot8248346364:AAHVhPxKi4nE5SZYYM_JUn1SkWsAh4g9pZo/getWebhookInfo" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d['result']; print('Webhook:', r['url']); print('Pending:', r['pending_update_count'])" 2>&1`, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
