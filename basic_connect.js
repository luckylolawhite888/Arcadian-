const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  console.log("Connected to Scarlett's server!");
  conn.exec("hostname", (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log("Host:", o.trim()); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
