const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
    echo "=== Deleting Scarlett's chat sessions ===" && \
    openclaw sessions delete --key agent:main:scarlett-chat 2>&1 && \
    openclaw sessions delete --key agent:main:scarlett-briefing 2>&1 && \
    echo "=== Sessions remaining ===" && \
    openclaw sessions list --agent main 2>&1 | head -10
  `, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
