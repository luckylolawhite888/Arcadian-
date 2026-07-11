const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec("pkill -f 'openclaw$' 2>&1; sleep 2; nohup openclaw > /dev/null 2>&1 & sleep 4; pgrep openclaw && echo GATEWAY_OK || echo GATEWAY_FAIL", (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("Err:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
