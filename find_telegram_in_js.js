const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec("grep -n \"telegram\" /var/www/api/server.v2.js 2>&1", (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim() || "none"); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
