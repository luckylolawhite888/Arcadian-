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
  const p = "3v3fUeTROhIl4n";

  // Fetch original server.js (bak3 has no feature routes, let's use current live but fix)
  let b64 = await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js | base64 -w0" 2>&1');
  let js = Buffer.from(b64.trim(), "base64").toString("utf8");

  // Find the last EPC route and strip everything from the FIRST tenders to the LAST EPC end
  let t1 = js.indexOf("app.get('\/api/tenders'");
  let t2 = js.indexOf("app.get('\/api/tenders'", t1 + 200);
  let m2 = js.indexOf("app.get('\/api/mcs-check'", t2 + 200);  // actually find the second
  let e2 = js.indexOf("app.get('\/api/epc-check'", m2 + 200);
  let listen = js.lastIndexOf("app.listen(PORT)");
  
  console.log("Positions: t1=" + t1 + " t2=" + t2 + " m2=" + m2 + " e2=" + e2 + " listen=" + listen);
  
  // The block to keep is: up to t1 (everything before first tenders) + second features + listen onwards
  // But the second set starts at t2 (second tenders) and continues through m2, e2 to listen
  // Just keep everything from 0 to t1, then the last copies (t2 to listen)
  let result = js.substring(0, t1) + "\n" + js.substring(t2);
  
  // Check syntax
  fs.writeFileSync("/tmp/emma_good.js", result);
  
  try {
    require("child_process").execSync("node --check /tmp/emma_good.js", { stdio: "pipe" });
    console.log("Syntax OK");
  } catch(e) {
    console.log("SYNTAX FAIL:", e.stderr.toString().substring(0, 300));
    conn.end();
    return;
  }
  
  // Deploy
  const newB64 = Buffer.from(result).toString("base64");
  let dep = await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo "' + newB64 + '" | base64 -d > /var/www/api/server.js.tmp && node -c /var/www/api/server.js.tmp" 2>&1');
  console.log("Remote:", dep.trim().substring(0, 150));
  
  if (dep.includes("SyntaxError")) {
    console.log("Remote fail");
    conn.end();
    return;
  }
  
  await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cp /var/www/api/server.js /var/www/api/server.js.bak6 && mv /var/www/api/server.js.tmp /var/www/api/server.js && pm2 restart emma-api" 2>&1');
  console.log("Deployed!");
  
  await new Promise(rr => setTimeout(rr, 2500));
  
  // Test all
  let results = {};
  for (const ep of ["health","weather","briefing","tenders","mcs-check?q=SK74RP","epc-check?q=SK74RP","approvals","news","voice/voices"]) {
    let res = await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s -o /dev/null -w %{http_code} https://eco-emma.com/api/' + ep + '" 2>&1');
    results[ep] = res.trim();
    process.stdout.write(ep + "=" + res.trim() + " ");
  }
  console.log();
  
  // Data samples
  for (const ep of ["tenders","mcs-check?q=SK74RP","epc-check?q=SK74RP"]) {
    let d = await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/' + ep + ' 2>&1 | head -c 300"');
    console.log(ep.split("?")[0] + ":", d.trim().substring(0, 200));
  }
  
  // Count routes
  let rc = await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "grep -c app\\\\.get\\\\(\\\\x27\\\\/api\\\\/ /var/www/api/server.js" 2>&1');
  console.log("Total route definitions:", rc.trim());
  
  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
