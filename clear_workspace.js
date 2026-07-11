const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    echo "=== Clearing OpenClaw chat sessions ===" && \
    rm -f /root/.openclaw/workspace/default/IDENTITY.md 2>/dev/null && \
    rm -f /root/.openclaw/workspace/default/TOOLS.md 2>/dev/null && \
    rm -f /root/.openclaw/workspace/default/MEMORY.md 2>/dev/null && \
    rm -f /root/.openclaw/workspace/default/AGENTS.md 2>/dev/null && \
    rm -f /root/.openclaw/workspace/default/HEARTBEAT.md 2>/dev/null && \
    rm -f /root/.openclaw/workspace/default/USER.md 2>/dev/null && \
    echo "Workspace clean" && \
    ls -la /root/.openclaw/workspace/default/
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
