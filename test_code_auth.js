const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`curl -s -X POST http://127.0.0.1:3100/api/code -H "Content-Type: application/json" -H "x-access-code: @DARREN2026" -d '{"current":"@DARREN2026","new":"@DARREN2026"}'`, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log("Test with auth:", o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
