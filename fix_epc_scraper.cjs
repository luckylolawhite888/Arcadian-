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

  // Fetch current server.js
  let b64 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js | base64 -w0" 2>&1');
  let js = Buffer.from(b64.trim(), "base64").toString("utf8");

  // Rewrite the EPC route with correct HTML parsing based on actual gov.uk HTML
  // The table class is: class="govuk-table epb-search-results"
  // Address: <th scope="row" class="govuk-table__header"> <a href="...">Address</a> </th>
  // Rating: <td class="govuk-table__cell">RATING</td>
  
  const newEPC = `
app.get('/api/epc-check',async(req,res)=>{try{let q=req.query.q||'';if(!q)return res.json({postcode:q,total:0,breakdown:{A:0,B:0,C:0,D:0,E:0,F:0,G:0},targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[]});let pc=q.split(' ').join('');let r=await fetch('https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode='+encodeURIComponent(pc));let h=await r.text();let b={A:0,B:0,C:0,D:0,E:0,F:0,G:0};let total=0;let certs=[];let tbl=h.split('epb-search-results')[1];if(tbl){let rows=tbl.split('<tr class="govuk-table__row">');for(let ri=1;ri<rows.length;ri++){let row=rows[ri];if(!row.trim()||row.includes('</tbody>'))break;let addr='';let rating='';let am=row.match(/<a[^>]*href="[^"]*"[^>]*>([^<]+)<\\/a>/i);if(am)addr=am[1].trim();let rm=row.match(/<td[^>]*class="[^"]*govuk-table__cell[^"]*"[^>]*>\\s*([A-G])\\s*<\\/td>/i);if(rm)rating=rm[1].toUpperCase();if(rating&&addr){b[rating]=(b[rating]||0)+1;total++;certs.push({address:addr,rating:rating,score:0})}}}let target=['D','E','F','G'].reduce((s,g)=>s+(b[g]||0),0);let pct=total>0?((target/total)*100).toFixed(1):'0';res.json({postcode:q,total,breakdown:b,targetProperties:target,targetPercent:pct+'%',avgScore:total>0?Math.round(target/total*100):0,recentCertificates:certs.slice(0,10)})}catch(e){res.json({postcode:q||'',total:0,breakdown:{A:0,B:0,C:0,D:0,E:0,F:0,G:0},targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[],error:e.message})}});`;

  // Find and replace the old EPC route
  let oldEpcStart = js.indexOf("app.get('/api/epc-check'");
  let oldEpcEnd = js.indexOf("}});app.listen(PORT)", oldEpcStart) + 3;
  
  console.log("EPC at", oldEpcStart, "to", oldEpcEnd);
  
  let result = js.substring(0, oldEpcStart) + newEPC.trim() + js.substring(oldEpcEnd);

  // Check syntax
  fs.writeFileSync("/tmp/emma_epc_fixed.js", result);
  try {
    require("child_process").execSync("node --check /tmp/emma_epc_fixed.js", { stdio: "pipe" });
    console.log("Syntax OK");
  } catch(e) {
    console.log("Syntax FAIL:", e.stderr.toString().substring(0, 300));
    conn.end();
    return;
  }

  const newB64 = Buffer.from(result).toString("base64");
  await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo "' + newB64 + '" | base64 -d > /var/www/api/server.js && pm2 restart emma-api"');
  await new Promise(rr => setTimeout(rr, 2500));

  let epcRes = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/epc-check?q=SK74RP 2>&1 | head -c 400"');
  console.log("EPC Result:", epcRes.trim().substring(0, 350));

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
