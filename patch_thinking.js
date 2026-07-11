const { Client } = require("ssh2");

const conn = new Client();
conn.on("ready", () => {
  conn.exec("cat /var/www/api/server.v2.js", (e, s) => {
    let o = "";
    s.on("data", d => o += d);
    s.on("close", () => {
      let js = o;
      // Add --thinking off to chat endpoint
      js = js.replace(
        "openclaw agent --json --agent main --local --session-key scarlett-chat --message ",
        "openclaw agent --json --agent main --local --session-key scarlett-chat --thinking off --message 2>/dev/null "
      );
      // Add --thinking off to briefing endpoint
      js = js.replace(
        "openclaw agent --json --agent main --local --session-key scarlett-briefing --message ",
        "openclaw agent --json --agent main --local --session-key scarlett-briefing --thinking off --message 2>/dev/null "
      );

      // Write back via sftp
      const { Client: C2 } = require("ssh2");
      const conn2 = new C2();
      conn2.on("ready", () => {
        conn2.sftp((e2, sftp) => {
          if (e2) { console.log("SFTP Error:", e2.message); conn2.end(); return; }
          const backup = Buffer.from(o);
          const patched = Buffer.from(js);
          // Write backup first
          sftp.writeFile("/var/www/api/server.v2.js.backup", backup, () => {
            sftp.writeFile("/var/www/api/server.v2.js", patched, (e3) => {
              if (e3) console.log("WRITE FAILED:", e3.message);
              else console.log("✅ Server patched. Backup at server.v2.js.backup");
              sftp.end(); conn2.end();
            });
          });
        });
      }).on("error", e => console.log("SSH Error:", e.message))
        .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
    });
  });
}).on("error", e => {
  console.log("SSH Error:", e.message);
}).connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
