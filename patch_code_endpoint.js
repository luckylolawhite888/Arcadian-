const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    sftp.readFile("/var/www/api/server.v2.js", (e2, data) => {
      if (e2) { console.log("Read Error:", e2.message); conn.end(); return; }
      let js = data.toString();

      // Check if already exists
      if (js.includes('app.post("/api/code"')) {
        console.log("Endpoint already exists — skipping");
        sftp.end(); conn.end();
        return;
      }

      // Find the status route ending
      const marker = `features: ["leads","tasks","email","calendar","chat","intel","briefing","backup","learning"] });`;

      const newRoute = `
// --- Change access code ---
app.post("/api/code", (req, res) => {
  const { current, new: newCode } = req.body || {};
  if (!current || !newCode) return res.json({ success: false, error: "Current and new code required" });
  if (current !== ACCESS_CODE) return res.json({ success: false, error: "Current code is incorrect" });
  if (newCode.length < 4) return res.json({ success: false, error: "New code must be at least 4 characters" });
  ACCESS_CODE = newCode;
  console.log("[code] Access code updated to", newCode);
  res.json({ success: true });
});
`;

      js = js.replace(marker, marker + newRoute);

      sftp.writeFile("/var/www/api/server.v2.js", Buffer.from(js), (e3) => {
        if (e3) console.log("WRITE FAILED:", e3.message);
        else console.log("OK /api/code endpoint added");
        sftp.end(); conn.end();
      });
    });
  });
}).on("error", e => {
  console.log("SSH Error:", e.message);
}).connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
