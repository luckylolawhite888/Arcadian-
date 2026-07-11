const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    echo "=== Delete session via session key ===" && \
    openclaw sessions get agent:main:scarlett-chat 2>&1 | head -3
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { 
      console.log(o.trim()); 
      // Try another approach - delete the sessions file directly
      const c2 = new Client();
      c2.on("ready", () => {
        c2.exec(`
          echo "=== Clearing session store ===" && \
          rm -f /root/.openclaw/agents/main/sessions/sessions.json && \
          echo "Session store deleted" && \
          echo "=== State DB ===" && \
          sqlite3 /root/.openclaw/state/openclaw.sqlite "DELETE FROM sessions WHERE key LIKE '%scarlett%';" 2>&1 && \
          echo "DB sessions cleared"
        `, (e2, s2) => {
          let o2 = "";
          s2.on("data", d => o2 += d.toString());
          s2.on("close", () => { console.log(o2.trim()); c2.end(); });
        });
      }).on("error", e => console.log("Err:", e.message))
        .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
      conn.end();
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
