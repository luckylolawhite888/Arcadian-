const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    kill -TERM $(pgrep -f "^openclaw\$") 2>&1 || true
    sleep 2
    nohup openclaw > /dev/null 2>&1 &
    sleep 4
    pgrep -a openclaw && echo "GATEWAY OK" || echo "GATEWAY FAILED"
    timeout 15 openclaw agent --json --agent main --local --session-key scarlett-chat --thinking off --message "test ping" 2>&1 | head -5 || echo "AGENT FAILED"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log("Result:", o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
