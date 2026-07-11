const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    kill -TERM $(pgrep -f "openclaw$") 2>&1 || true
    sleep 2
    nohup openclaw > /dev/null 2>&1 &
    sleep 5
    pgrep -a openclaw 2>&1 && echo "---" || echo "GATEWAY FAILED"
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log("Result:", o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
