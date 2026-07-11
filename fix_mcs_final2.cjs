const { Client } = require("ssh2");
const fs = require("fs");

const conn = new Client();
function run(c) { return new Promise((r,j) => { conn.exec(c,(e,s)=>{if(e)return j(e);let o="";s.on("data",d=>o+=d);s.stderr.on("data",d=>o+=d);s.on("close",()=>r(o));});}); }

conn.on("ready", async () => {
  const pwd = "3v3fUeTROhIl4n";

  const b64 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js | base64 -w0" 2>&1');
  let js = Buffer.from(b64.trim(), "base64").toString("utf8");

  // Write the route as a template literal in a deploy script  
  const routeHandler = `
  // MCS Installer Check
  app.get('/api/mcs-check', async (req, res) => {
    try {
      let q = req.query.q || '';
      if (!q) return res.json({ results: [], count: 0, query: q });
      let r = await fetch('https://mcscertified.com/find-an-installer/?page=1&search=' + encodeURIComponent(q));
      let h = await r.text();
      let modals = h.split('>\\n<div class="modal-overlay');
      let results = [];
      for (let i = 1; i < modals.length; i++) {
        let c = modals[i];
        let nm = c.match(/<h2[^>]*>([^<]+)<\\/h2>/);
        let cert = c.match(/Certification Number:<\\/strong>\\s*<span[^>]*>([^<]+)<\\/span>/i);
        let email = c.match(/<a[^>]*href="mailto:([^"]+)"/);
        let phone = c.match(/<a[^>]*href="tel:([^"]+)"/);
        let addr = c.match(/Address:<\\/strong>[^<]*<\\/div>[^<]*<div[^>]*>[^<]*<p>([^<]+)<\\/p>/i);
        let region = c.match(/Regions covered:<\\/strong>[^<]*<\\/div>[^<]*<div[^>]*>[^<]*<p>([^<]+)<\\/p>/i);
        let bus = c.match(/Boiler Upgrade Scheme Registered:<\\/strong>[^<]*<\\/div>[^<]*<div[^>]*>[^<]*<p>([^<]+)<\\/p>/i);
        let techs = [];
        let imgRe = /<img[^>]*alt="([^"]+)"/gi;
        let m;
        let n = nm ? nm[1].trim().toLowerCase() : '';
        while ((m = imgRe.exec(c)) !== null) {
          let a = m[1].trim().toLowerCase();
          if (a !== 'mcs logo icon' && a !== 'site logo' && a !== n) {
            techs.push(m[1].trim());
          }
        }
        results.push({
          name: nm ? nm[1].trim() : '?',
          cert: cert ? cert[1].trim() : '?',
          email: email ? email[1].trim() : '?',
          phone: phone ? phone[1].trim() : '?',
          address: addr ? addr[1].trim() : '?',
          technologies: techs,
          regions: region ? region[1].trim() : '?',
          busRegistered: bus ? bus[1].trim() : '?'
        });
      }
      res.json({ results, count: results.length, query: q });
    } catch (e) {
      res.json({ results: [], count: 0, query: req.query.q || '' });
    }
  });`;

  // Find positions
  const mcsStart = js.indexOf("app.get('/api/mcs-check'");
  const mcsEnd = js.indexOf("}});", mcsStart) + 4;

  const result = js.substring(0, mcsStart) + routeHandler.trim() + "\n\n" + js.substring(mcsEnd);

  fs.writeFileSync("/tmp/emma_mcs_v3.js", result);
  try {
    require("child_process").execSync("node --check /tmp/emma_mcs_v3.js", { stdio: "pipe" });
    console.log("Syntax OK");
  } catch(e) {
    console.log("FAIL:", e.stderr.toString().substring(0, 500));
    conn.end();
    return;
  }

  const newB64 = Buffer.from(result).toString("base64");
  await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo ' + newB64 + ' | base64 -d > /var/www/api/server.js && pm2 restart emma-api"');
  await new Promise(rr => setTimeout(rr, 2500));

  const mcsRes = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/mcs-check?q=Solar 2>&1 | head -c 600"');
  console.log("MCS:", mcsRes.substring(0, 500));

  for (const ep of ["health","weather","briefing","tenders","mcs-check?q=Solar","epc-check?q=SK74RP"]) {
    const res = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s -o /dev/null -w %{http_code} https://eco-emma.com/api/' + ep + '" 2>&1');
    process.stdout.write(ep.split("?")[0] + "=" + res.trim() + " ");
  }
  console.log();

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({ host:"212.227.93.74", username:"root", privateKey:fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
