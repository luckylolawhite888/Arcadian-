const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    sftp.readFile("/var/www/api/server.v2.js", (e2, data) => {
      if (e2) { console.log("Read Error:", e2.message); conn.end(); return; }
      let js = data.toString();
      
      // Replace the webhook handler with locked-down version
      const oldHandler = `app.post("/api/telegram-webhook", (req, res) => {
  const msg = req.body?.message;
  if (!msg || !msg.text || !msg.from) return res.sendStatus(200);
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  if (userId !== 7573383643 && chatId !== 7573383643) {
    console.log("[tg] Ignoring unknown user:", userId);
    return res.sendStatus(200);
  }`;

      const newHandler = `app.post("/api/telegram-webhook", (req, res) => {
  const msg = req.body?.message;
  if (!msg || !msg.text || !msg.from) return res.sendStatus(200);
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  // Only Darren (7573383643) and Maya (1523950034) can message Scarlett
  if (userId !== 7573383643 && userId !== 1523950034 && chatId !== 7573383643 && chatId !== 1523950034) {
    console.log("[tg] BLOCKED unknown user:", userId);
    // Politely reject
    const https = require("https");
    const data = JSON.stringify({ chat_id: chatId, text: "Sorry, I'm a private assistant. I don't take messages from unknown contacts 🤖" });
    const req2 = https.request(TELEGRAM_API + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" } });
    req2.write(data);
    req2.end();
    return res.sendStatus(200);
  }`;

      if (js.includes(oldHandler)) {
        js = js.replace(oldHandler, newHandler);
        sftp.writeFile("/var/www/api/server.v2.js", Buffer.from(js), (e3) => {
          if (e3) console.log("WRITE FAILED:", e3.message);
          else console.log("OK Webhook locked to Darren + Maya only");
          sftp.end(); conn.end();
        });
      } else {
        console.log("Could not find old handler to replace — checking format...");
        // Check what the actual format is
        const idx = js.indexOf("app.post(\"/api/telegram-webhook\"");
        if (idx >= 0) console.log("Found at char", idx, ":", js.substring(idx, idx + 400));
        sftp.end(); conn.end();
      }
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
