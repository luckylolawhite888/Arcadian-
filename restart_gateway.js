const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    echo "=== Stopping openclaw process ===" && \
    kill -TERM $(pgrep -f "^openclaw\$") 2>&1 || echo "not running as direct process" && \
    systemctl restart openclaw-gateway 2>&1; \
    sleep 2; \
    systemctl is-active openclaw-gateway 2>&1 && \
    echo "=== Verifying scarlett API ===" && \
    systemctl is-active scarlett-api.service 2>&1
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log("Result:", o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
