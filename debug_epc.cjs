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

  // Debug both EPC and MCS from the SERVER directly
  let epcHtml = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -sL https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=SK74RP 2>&1 | grep -o \\"govuk-table\\" | head -5"');
  console.log("EPC search-by-postcode has govuk-table:", epcHtml.trim());

  let epcSearch = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -sL https://find-energy-certificate.service.gov.uk/find-a-certificate/search?postcode=SK74RP 2>&1 | grep -o \\"govuk-table\\" | head -5"');
  console.log("EPC /search has govuk-table:", epcSearch.trim());

  // Show the key part of the HTML
  let epcSample = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -sL https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=SK74RP 2>&1 | grep -o \\"epb-search\\" | head -5"');
  console.log("EPC epb-search:", epcSample.trim());
  
  let epcEPB = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -sL https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=SK74RP 2>&1 | grep -o \\"EPB\\" | head -5"');
  console.log("EPC EPB:", epcEPB.trim());
  
  // Take a 3K sample of the HTML
  let fullHtml = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -sL https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=SK74RP 2>&1 | head -c 5000"');
  console.log("===== EPC HTML (snippet) =====");
  console.log(fullHtml.substring(0, 3000));

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
