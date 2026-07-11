const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    kill -TERM $(pgrep -f "^openclaw\$") 2>&1
    sleep 1
    # Start gateway in background
    nohup openclaw > /dev/null 2>&1 &
    sleep 3
    # Test agent
    timeout 15 openclaw agent --json --agent main --local --session-key scarlett-chat --thinking off --message "test" 2>&1 || echo "NEED_RESTART"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
