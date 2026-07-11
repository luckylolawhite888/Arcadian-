const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    echo "=== Clearing Scarlett's session ===" && \
    rm -f /root/.openclaw/workspace/default/intro_message.txt && \
    rm -f /root/.openclaw/workspace/default/.improvement_suggestions.md 2>/dev/null && \
    rm -rf /root/.openclaw/workspace/default/memory/ 2>/dev/null && \
    echo "Session files cleared" && \
    echo "=== Checking remaining workspace ===" && \
    ls -la /root/.openclaw/workspace/default/ && \
    echo "=== Last 3 lines of SOUL.md ===" && \
    tail -3 /root/.openclaw/workspace/default/SOUL.md && \
    echo "=== Restarting Scarlett's API ===" && \
    systemctl restart scarlett-api.service 2>&1 && \
    echo "OK"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
