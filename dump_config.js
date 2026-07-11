const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec("python3 -c \"import json; f=open('/root/.openclaw/openclaw.json'); print(f.read())\" 2>&1", (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close")}}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
