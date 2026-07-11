const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    sftp.readFile("/root/.openclaw/workspace/default/SOUL.md", (e2, data) => {
      if (e2) { console.log("Read Error:", e2.message); conn.end(); return; }
      let soul = data.toString();
      
      // Add reference to DARREN.md at the end (before any trailing updates)
      if (soul.includes("## 📊 Communication Style")) {
        // Add Darren info reference after the privacy section
        const marker = "### 🔗 Integration Notes";
        if (soul.includes(marker)) {
          const add = `\n\n## 👤 Darren Pelling — Your Boss\n- Read /root/.openclaw/workspace/default/DARREN.md for his details and your first message\n- When he messages you for the first time, respond with the EXACT first message written in DARREN.md\n- After that, be yourself — warm, professional, competent\n- Learn his preferences over time and store them`;
          soul = soul.replace(marker, add + "\n\n" + marker);
        }
      }
      
      sftp.writeFile("/root/.openclaw/workspace/default/SOUL.md", Buffer.from(soul), (e3) => {
        if (e3) console.log("WRITE FAILED:", e3.message);
        else {
          console.log("OK SOUL.md updated with Darren reference");
          console.log("Size:", soul.length, "bytes");
        }
        sftp.end(); conn.end();
      });
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
