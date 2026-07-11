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

  let b64 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js | base64 -w0" 2>&1');
  let js = Buffer.from(b64.trim(), "base64").toString("utf8");

  // Fix 1: Briefing safer .map
  js = js.replace("(n.results||[]).map(a=>({title:a.title,url:a.link,source:a.source_id}))",
                   "(Array.isArray(n.results)?n.results:[]).map(a=>({title:a.title,url:a.link,source:a.source_id}))");

  fs.writeFileSync("/tmp/emma_fixed_briefing.js", js);
  try {
    require("child_process").execSync("node --check /tmp/emma_fixed_briefing.js", { stdio: "pipe" });
    console.log("Briefing fix OK");
  } catch(e) {
    console.log("Syntax FAIL", e.stderr.toString().substring(0, 200));
    conn.end();
    return;
  }

  const newB64 = Buffer.from(js).toString("base64");
  await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo "' + newB64 + '" | base64 -d > /var/www/api/server.js && pm2 restart emma-api"');
  await new Promise(rr => setTimeout(rr, 2000));

  let be = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/briefing 2>&1 | head -c 300"');
  console.log("Briefing:", be.trim().substring(0, 250));

  // Debug MCS admin-ajax
  let mcsTest = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s -X POST -d \"action=mcs_installer_search&search=SK74RP\" https://mcscertified.com/wp-admin/admin-ajax.php 2>&1 | head -c 500"');
  console.log("MCS admin-ajax:", mcsTest.trim().substring(0, 400));

  // Debug EPC HTML
  let epcTest = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -sL \"https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=SK74RP\" 2>&1 | head -c 1000"');
  console.log("EPC HTML start:", epcTest.trim().substring(0, 400));
  
  // Also try the standard search URL
  let epcTest2 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -sL \"https://find-energy-certificate.service.gov.uk/find-a-certificate/search?postcode=SK74RP\" 2>&1 | grep -c govuk-table"');
  console.log("EPC standard search has govuk-table:", epcTest2.trim());

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
