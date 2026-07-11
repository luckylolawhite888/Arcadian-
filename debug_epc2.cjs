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

  // Get the table section of the EPC page
  let epc = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -sL https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=SK74RP 2>&1 | grep -A 10 \\"epb-search-results\\""');
  console.log("EPB results:", epc.trim().substring(0, 1000));
  
  let epc2 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -sL https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=SK74RP 2>&1 | grep -A 3 \\"class=\\\\\\"govuk-table__cell\\\\\\"\\""');
  console.log("GOV table cells:", epc2.trim().substring(0, 1000));

  // Try the actual EPC endpoint on Emma
  let epcRes = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "node -e \\"const http=require(\\'http\\');http.get(\\'http://localhost:3100/api/epc-check?q=SK74RP\\',r=>{let d=\\\'\\';r.on(\\'data\\',c=>d+=c);r.on(\\'end\\',()=>console.log(d.substring(0,300)))})" 2>&1');
  console.log("Emma EPC result:", epcRes.trim().substring(0, 300));

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
