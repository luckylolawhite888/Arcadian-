const { Client } = require("ssh2");
const fs = require("fs");

const conn = new Client();
function run(c) { return new Promise((r,j) => { conn.exec(c,(e,s)=>{if(e)return j(e);let o="";s.on("data",d=>o+=d);s.stderr.on("data",d=>o+=d);s.on("close",()=>r(o));});}); }

conn.on("ready", async () => {
  const pwd = "3v3fUeTROhIl4n";
  const b64 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js | base64 -w0" 2>&1');
  let js = Buffer.from(b64.trim(), "base64").toString("utf8");

  const mcs = js.indexOf("app.get('/api/mcs-check'");
  const listen = js.lastIndexOf("app.listen(PORT");
  console.log("File length:", js.length);
  console.log("MCS at:", mcs, "listen at:", listen);
  console.log("Between MCS and listen:", js.substring(mcs, listen).substring(0, 50));
  console.log("Last 200 before listen:", js.substring(listen - 200, listen));

  // The old EPC route was between MCS route end and listen
  // Let's find what comes after {{handleMCS}} based on old bak3
  // We need to restore the EPC route by reading bak3
  const bak3 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js.bak3 | base64 -w0" 2>&1');
  let bak3js = Buffer.from(bak3.trim(), "base64").toString("utf8");
  const oldEpc = bak3js.indexOf("app.get('/api/epc-check'");
  const oldListen = bak3js.lastIndexOf("app.listen(PORT");
  if (oldEpc > 0) {
    const epcRoute = bak3js.substring(oldEpc, oldListen);
    console.log("\nEPC route from bak3:", epcRoute.substring(0, 200));
    console.log("len:", epcRoute.length);
    
    // Insert EPC route after MCS route and before listen
    const result = js.substring(0, listen) + "\n\n" + epcRoute + "\n" + js.substring(listen);
    fs.writeFileSync("/tmp/emma_restored.js", result);
    try {
      require("child_process").execSync("node --check /tmp/emma_restored.js", { stdio: "pipe" });
      console.log("Syntax OK");
      
      const newB64 = Buffer.from(result).toString("base64");
      await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo ' + newB64 + ' | base64 -d > /var/www/api/server.js && pm2 restart emma-api"');
      await new Promise(rr => setTimeout(rr, 2500));
      
      for (const ep of ["mcs-check?q=Solar","epc-check?q=SK74RP","health","weather","briefing","tenders"]) {
        const res = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s -o /dev/null -w %{http_code} https://eco-emma.com/api/" + ep + "\" 2>&1");
        process.stdout.write(ep.split("?")[0] + "=" + res.trim() + " ");
      }
      console.log();
    } catch(e) {
      console.log("FAIL:", e.stderr.toString().substring(0,500));
    }
  }

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({ host:"212.227.93.74", username:"root", privateKey:fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
