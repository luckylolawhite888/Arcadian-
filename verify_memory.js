const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    echo "=== Files created ===" && \
    ls -la /root/.openclaw/workspace/default/MEMORY.md && \
    ls -lad /root/.openclaw/workspace/default/memory/ && \
    echo "" && \
    echo "=== SOUL.md memory section ===" && \
    grep -A 2 "Memory System" /root/.openclaw/workspace/default/SOUL.md 2>&1
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
