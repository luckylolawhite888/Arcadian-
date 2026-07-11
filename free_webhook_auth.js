const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    sftp.readFile("/var/www/api/server.v2.js", (e2, data) => {
      if (e2) { console.log("Read Error:", e2.message); conn.end(); return; }
      let js = data.toString();
      
      // Add "/telegram-webhook" to the freePaths array
      js = js.replace(
        'const freePaths = ["/auth", "/status", "/settings/code", "/briefing", "/news", "/weather", "/chat"];',
        'const freePaths = ["/auth", "/status", "/settings/code", "/briefing", "/news", "/weather", "/chat", "/telegram-webhook"];'
      );
      
      sftp.writeFile("/var/www/api/server.v2.js", Buffer.from(js), (e3) => {
        if (e3) console.log("WRITE FAILED:", e3.message);
        else console.log("OK freed /telegram-webhook from auth");
        sftp.end(); conn.end();
      });
    });
  });
}).on("error", e => console.log("SSH Error:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
