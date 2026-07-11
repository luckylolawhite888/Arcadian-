const { Client } = require("ssh2");
const fs = require("fs");

const conn = new Client();
function run(c) { return new Promise((r,j) => { conn.exec(c,(e,s)=>{if(e)return j(e);let o="";s.on("data",d=>o+=d);s.stderr.on("data",d=>o+=d);s.on("close",()=>r(o));});}); }

conn.on("ready", async () => {
  const pwd = "3v3fUeTROhIl4n";

  // Get the EPC route from bak5
  let bak5b64 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js.bak5 | base64 -w0" 2>&1');
  let bak5 = Buffer.from(bak5b64.trim(), "base64").toString("utf8");
  
  const epcStart = bak5.indexOf("app.get('/api/epc-check'");
  const listenPos = bak5.lastIndexOf("app.listen(PORT");
  
  if (epcStart > 0) {
    let epcRoute = bak5.substring(epcStart, listenPos);
    console.log("EPC route found in bak5, length:", epcRoute.length);
    console.log("EPC:", epcRoute.substring(0, 100));
    
    // Now get current server and insert EPC before listen
    let cur64 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js | base64 -w0" 2>&1');
    let cur = Buffer.from(cur64.trim(), "base64").toString("utf8");
    
    const curListen = cur.lastIndexOf("app.listen(PORT");
    let result = cur.substring(0, curListen) + "\n\n" + epcRoute + "\n" + cur.substring(curListen);
    
    fs.writeFileSync("/tmp/emma_all_fixed.js", result);
    try {
      require("child_process").execSync("node --check /tmp/emma_all_fixed.js", { stdio: "pipe" });
      console.log("Syntax OK");
      
      const newB64 = Buffer.from(result).toString("base64");
      await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo ' + newB64 + ' | base64 -d > /var/www/api/server.js && pm2 restart emma-api"');
      await new Promise(rr => setTimeout(rr, 2500));
      
      const eps = ["health","weather","briefing","tenders","mcs-check?q=Solar","epc-check?q=SK74RP","leads","tasks","voice/voices","auth","approvals","news"];
      for (const ep of eps) {
        const res = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s -o /dev/null -w %{http_code} https://eco-emma.com/api/" + ep + "\" 2>&1");
        process.stdout.write(ep.split("?")[0] + "=" + res.trim() + " ");
      }
      console.log();
      
      // Also check MCS returns data
      const mcsRes = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s https://eco-emma.com/api/mcs-check?q=Solar 2>&1 | head -c 300\"");
      console.log("MCS data:", mcsRes.substring(0, 200));
      
    } catch(e) { console.log("FAIL:", e.stderr.toString().substring(0,500)); }
  } else {
    console.log("EPC not found in bak5");
  }

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({ host:"212.227.93.74", username:"root", privateKey:fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
