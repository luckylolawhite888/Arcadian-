const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    systemctl is-active scarlett-api.service 2>&1 && \
    openclaw --version 2>&1 && \
    curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3100/api/status -H "x-access-code: @DARREN2026" 2>&1 && \
    echo " - API health" && \
    curl -s "https://api.telegram.org/bot824834…9pZo/getWebhookInfo" 2>&1 | python3 -c "import sys,json; d=json.load(sys.stdin)['result']; print('Webhook:',d['url'])" 2>&1
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
