const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`curl -s -X POST "https://api.telegram.org/bot8248346364:AAHVhPxKi4nE5SZYYM_JUn1SkWsAh4g9pZo/setWebhook" -H "Content-Type: application/json" -d '{"url":"https://scarlettpelling.com/api/telegram-webhook","allowed_updates":["message"]}' 2>&1`, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log("Webhook response:", o.trim()); conn.end(); });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
