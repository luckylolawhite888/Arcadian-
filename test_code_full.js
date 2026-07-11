const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec("systemctl restart scarlett-api.service 2>&1; sleep 2; curl -s -X POST http://127.0.0.1:3100/api/code -H \"Content-Type: application/json\" -H \"x-access-code: @DARREN2026\" -d '{\"current\":\"@DARREN2026\",\"new\":\"@DARREN2027\"}'", (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => {
      console.log("Result:", o.trim());
      // Revert back to original
      if (o.trim().includes("success")) {
        const c2 = new Client();
        c2.on("ready", () => {
          c2.exec("curl -s -X POST http://127.0.0.1:3100/api/code -H \"Content-Type: application/json\" -H \"x-access-code: @DARREN2027\" -d '{\"current\":\"@DARREN2027\",\"new\":\"@DARREN2026\"}'", (e2, s2) => {
            let o2 = "";
            s2.on("data", d => o2 += d.toString());
            s2.on("close", () => {
              console.log("Reverted:", o2.trim());
              c2.end();
            });
          });
        }).on("error", e2 => console.log("Err:", e2.message))
          .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
      }
      conn.end();
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
