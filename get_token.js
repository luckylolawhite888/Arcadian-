const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec("cat /root/.openclaw/openclaw.json | python3 -c \"import sys,json; c=json.load(sys.stdin); print(json.dumps(c.get('telegram',{}),indent=2))\"", (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
