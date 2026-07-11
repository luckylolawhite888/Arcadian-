const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec("systemctl restart scarlett-api.service 2>&1; sleep 2; curl -s -X POST http://127.0.0.1:3100/api/telegram-webhook -H 'Content-Type: application/json' -d '{\"message\":{\"message_id\":1,\"from\":{\"id\":7573383643,\"first_name\":\"Daz\",\"username\":\"Darren69696\"},\"chat\":{\"id\":7573383643},\"text\":\"Hi Scarlett, Darren here 🖐️\"}}' 2>&1", (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log("Webhook test:", o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
