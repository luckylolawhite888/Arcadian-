const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec("cd /var/www/api && git add -A && git commit -m \"cleared all demo data, Scarlett ready for Darren intro\" && git push origin master 2>&1", (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
