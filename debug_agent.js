const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    echo "=== Gateway process ===" && \
    pgrep -a openclaw 2>&1 && \
    echo "=== Test agent directly ===" && \
    timeout 15 openclaw agent --json --agent main --local --session-key scarlett-chat --thinking off --message "test" 2>&1 || echo "AGENT FAILED"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log("Result:\n", o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
