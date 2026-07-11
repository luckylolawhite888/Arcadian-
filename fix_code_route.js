const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    sftp.readFile("/var/www/api/server.v2.js", (e2, data) => {
      if (e2) { console.log("Read Error:", e2.message); conn.end(); return; }
      let js = data.toString();

      // The broken section from line 68-81:
      const broken = `app.get("/api/status", (req, res) => {
  res.json({ status: "online", version: "2.0.0", timestamp: new Date().toISOString(), memory: "sqlite", features: ["leads","tasks","email","calendar","chat","intel","briefing","backup","learning"] });
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

});

app.get("/api/auth", (req, res) => {`;

      const fixed = `app.get("/api/status", (req, res) => {
  res.json({ status: "online", version: "2.0.0", timestamp: new Date().toISOString(), memory: "sqlite", features: ["leads","tasks","email","calendar","chat","intel","briefing","backup","learning"] });
});

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

app.get("/api/auth", (req, res) => {`;

      js = js.replace(broken, fixed);

      sftp.writeFile("/var/www/api/server.v2.js", Buffer.from(js), (e3) => {
        if (e3) console.log("WRITE FAILED:", e3.message);
        else console.log("OK Fixed broken nesting");
        sftp.end(); conn.end();
      });
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
