const { Client } = require("ssh2");
const fs = require("fs");

const conn = new Client();
function run(c) { return new Promise((r,j) => { conn.exec(c,(e,s)=>{if(e)return j(e);let o="";s.on("data",d=>o+=d);s.stderr.on("data",d=>o+=d);s.on("close",()=>r(o));});}); }

conn.on("ready", async () => {
  const pwd = "3v3fUeTROhIl4n";
  const b64 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js | base64 -w0" 2>&1');
  let js = Buffer.from(b64.trim(), "base64").toString("utf8");

  // Find the EPC route
  const epcStart = js.indexOf("app.get('/api/epc-check'");
  const listenPos = js.lastIndexOf("app.listen(PORT");
  console.log("EPC start:", epcStart, "listen:", listenPos);

  // Show context
  if (epcStart > 0) {
    const route = js.substring(epcStart, listenPos);
    console.log("EPC route found, length:", route.length);
    console.log("First 100:", route.substring(0, 100));
    console.log("Last 100:", route.substring(route.length - 100));
  } else {
    console.log("EPC route MISSING!");
    // Find where app.listen is
    console.log("Around listen:", js.substring(listenPos - 100, listenPos).substring(0, 100));
  }

  // Also check MCS
  const mcsStart = js.indexOf("app.get('/api/mcs-check'");
  console.log("MCS start:", mcsStart);

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({ host:"212.227.93.74", username:"root", privateKey:fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
