const { Client } = require("ssh2");
const fs = require("fs");

const conn = new Client();
function run(c) {
  return new Promise((r, j) => {
    conn.exec(c, (e, s) => {
      if (e) return j(e);
      let o = "";
      s.on("data", d => o += d.toString());
      s.stderr.on("data", d => o += d.toString());
      s.on("close", () => r(o));
    });
  });
}

conn.on("ready", async () => {
  const pwd = "3v3fUeTROhIl4n";

  // Get the find-an-installer page HTML
  let page = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s 'https://mcscertified.com/find-an-installer/' 2>&1 | grep -i 'form\\|search\\|action\\|ajax' | head -50\"");
  console.log("Page form elements:", page.substring(0, 2000));

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
