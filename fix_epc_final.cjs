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

  // Find EPC route boundaries
  let epcStart = js.indexOf("app.get('/api/epc-check'");
  let listen = js.lastIndexOf("app.listen(PORT)");
  console.log("EPC: start=" + epcStart + " listen=" + listen);

  // The new EPC route
  const newEPC = `app.get('/api/epc-check',async(req,res)=>{try{let q=req.query.q||'';if(!q)return res.json({postcode:q,total:0,breakdown:{A:0,B:0,C:0,D:0,E:0,F:0,G:0},targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[]});let pc=q.split(' ').join('');let r=await fetch('https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode='+encodeURIComponent(pc));let h=await r.text();let b={A:0,B:0,C:0,D:0,E:0,F:0,G:0};let total=0;let certs=[];let tbl=h.split('epb-search-results')[1];if(tbl){let rows=tbl.split('<tr class=\\"govuk-table__row\\">');for(let ri=1;ri<rows.length;ri++){let row=rows[ri];if(!row.trim()||row.includes('</tbody>'))break;let addr='';let rating='';let am=row.match(/<a[^>]*href=\\"[^\\"]*\\"[^>]*>([^<]+)<\\/a>/i);if(am)addr=am[1].trim();let rm=row.match(/<td[^>]*class=\\"[^\\"]*govuk-table__cell[^\\"]*\\"[^>]*>\\s*([A-G])\\s*<\\/td>/i);if(rm)rating=rm[1].toUpperCase();if(rating&&addr){b[rating]=(b[rating]||0)+1;total++;certs.push({address:addr,rating,score:0})}}}let target=['D','E','F','G'].reduce((sg,g)=>sg+(b[g]||0),0);let pct=total>0?((target/total)*100).toFixed(1):'0';res.json({postcode:q,total,breakdown:b,targetProperties:target,targetPercent:pct+'%',avgScore:total>0?Math.round(target/total*100):0,recentCertificates:certs.slice(0,10)})}catch(e){res.json({postcode:q||'',total:0,breakdown:{A:0,B:0,C:0,D:0,E:0,F:0,G:0},targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[],error:e.message})}});`;

  // Replace from epcStart to listen, then append the new EPC before listen
  let result = js.substring(0, epcStart) + newEPC + "\n" + js.substring(listen);

  // Verify syntax
  fs.writeFileSync("/tmp/emma_epc_fixed2.js", result);
  try {
    require("child_process").execSync("node --check /tmp/emma_epc_fixed2.js", { stdio: "pipe" });
    console.log("Syntax OK");
  } catch(e) {
    let msg = e.stderr.toString();
    console.log("Syntax FAIL:", msg.substring(0, 500));
    conn.end();
    return;
  }

  const newB64 = Buffer.from(result).toString("base64");
  await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo "' + newB64 + '" | base64 -d > /var/www/api/server.js && pm2 restart emma-api"');
  await new Promise(rr => setTimeout(rr, 2500));

  let epcRes = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/epc-check?q=SK74RP 2>&1 | head -c 400"');
  console.log("EPC Result:", epcRes.trim());
  
  // Test all core endpoints
  for (const ep of ["health","weather","briefing","tenders","mcs-check?q=SK74RP","epc-check?q=SK74RP"]) {
    let res = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s -o /dev/null -w %{http_code} https://eco-emma.com/api/' + ep + '" 2>&1');
    process.stdout.write(ep.split("?")[0] + "=" + res.trim() + " ");
  }
  console.log();

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
