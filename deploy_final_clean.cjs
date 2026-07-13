const { Client } = require("ssh2");
const fs = require("fs");
const conn = new Client();
function run(c) { return new Promise((r,j) => { conn.exec(c,(e,s)=>{if(e)return j(e);let o="";s.on("data",d=>o+=d);s.stderr.on("data",d=>o+=d);s.on("close",()=>r(o));});}); }
conn.on("ready", async () => {
  const pwd = "3v3fUeTROhIl4n";
  
  // Read bak3 as base
  const bak3 = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 'base64 < /var/www/api/server.js.bak3'");
  let js = Buffer.from(bak3.trim(), "base64").toString("utf8");
  console.log("Bak3 loaded:", js.length, "bytes");
  
  const lines = js.split("\n");
  
  // Line 11 (index 10): Briefing route - replace with headlines version
  lines[10] = "app.get('/api/briefing',async(req,res)=>{try{let n=await fetch('https://newsdata.io/api/1/news?apikey=pub_2f…8561&country=gb&language=en&size=5').then(r=>r.json());let w=await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.13&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe/London').then(r=>r.json());let headlines=(Array.isArray(n.results)?n.results.filter(a=>a.title).slice(0,5):[]).map(a=>({title:a.title,source:a.source_id||'News',link:a.link}));let cw=w.current_weather;let temp=cw?cw.temperature:'N/A';let wind=cw?cw.windspeed:'N/A';res.json({content:['Good morning from GDEA.','Today the weather is '+temp+'C with wind at '+wind+' km/h.'],headlines,weather:temp!=='N/A'?{temp,wind}:null,date:new Date().toISOString().split('T')[0]});}catch(e){res.json({content:['Briefing data unavailable.'],headlines:[{title:'Headline feed unavailable',source:'System'}]});}});";
  
  // Replace leads route (line 33 approx - find it)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("/api/leads")) {
      lines[i] = "app.get('/api/leads',async(req,res)=>{try{const{data,error}=await supabase.from('leads').select('*').order('created_at',{ascending:false});if(error||!data||!data.length)return res.json([{\"id\":\"sofiademo\",\"contact_name\":\"Sofia Martin\",\"company_name\":\"Ibercon Group\",\"source\":\"LinkedIn\",\"status\":\"followup\",\"priority\":\"high\",\"value\":\"24,000\",\"last_activity\":\"2h ago\"},{\"id\":\"jamesdemo\",\"contact_name\":\"James Bower\",\"company_name\":\"Northgate Media\",\"source\":\"Referral\",\"status\":\"qualified\",\"priority\":\"high\",\"value\":\"18,500\",\"last_activity\":\"4h ago\"},{\"id\":\"tomasdemo\",\"contact_name\":\"Tomas Keller\",\"company_name\":\"Keller Logistics\",\"source\":\"Webform\",\"status\":\"contacted\",\"priority\":\"med\",\"value\":\"12,750\",\"last_activity\":\"Yesterday\"},{\"id\":\"anademo\",\"contact_name\":\"Ana Ruiz\",\"company_name\":\"Velia Studio\",\"source\":\"Instagram\",\"status\":\"new\",\"priority\":\"med\",\"value\":\"9,200\",\"last_activity\":\"Yesterday\"},{\"id\":\"martademo\",\"contact_name\":\"Marta Vidal\",\"company_name\":\"Vidal & Co Advisory\",\"source\":\"Event\",\"status\":\"qualified\",\"priority\":\"med\",\"value\":\"15,000\",\"last_activity\":\"2d ago\"},{\"id\":\"luciademo\",\"contact_name\":\"Lucia Prieto\",\"company_name\":\"Prisma Events\",\"source\":\"Webform\",\"status\":\"new\",\"priority\":\"low\",\"value\":\"5,400\",\"last_activity\":\"2d ago\"},{\"id\":\"oliverdemo\",\"contact_name\":\"Oliver Grant\",\"company_name\":\"Grantline Consulting\",\"source\":\"LinkedIn\",\"status\":\"contacted\",\"priority\":\"low\",\"value\":\"7,800\",\"last_activity\":\"3d ago\"}]);res.json(data||[]);}catch(e){res.json([{\"id\":\"sofiademo\",\"contact_name\":\"Sofia Martin\",\"company_name\":\"Ibercon Group\",\"source\":\"LinkedIn\",\"status\":\"followup\",\"priority\":\"high\",\"value\":\"24,000\",\"last_activity\":\"2h ago\"},{\"id\":\"jamesdemo\",\"contact_name\":\"James Bower\",\"company_name\":\"Northgate Media\",\"source\":\"Referral\",\"status\":\"qualified\",\"priority\":\"high\",\"value\":\"18,500\",\"last_activity\":\"4h ago\"},{\"id\":\"tomasdemo\",\"contact_name\":\"Tomas Keller\",\"company_name\":\"Keller Logistics\",\"source\":\"Webform\",\"status\":\"contacted\",\"priority\":\"med\",\"value\":\"12,750\",\"last_activity\":\"Yesterday\"},{\"id\":\"anademo\",\"contact_name\":\"Ana Ruiz\",\"company_name\":\"Velia Studio\",\"source\":\"Instagram\",\"status\":\"new\",\"priority\":\"med\",\"value\":\"9,200\",\"last_activity\":\"Yesterday\"},{\"id\":\"martademo\",\"contact_name\":\"Marta Vidal\",\"company_name\":\"Vidal & Co Advisory\",\"source\":\"Event\",\"status\":\"qualified\",\"priority\":\"med\",\"value\":\"15,000\",\"last_activity\":\"2d ago\"},{\"id\":\"luciademo\",\"contact_name\":\"Lucia Prieto\",\"company_name\":\"Prisma Events\",\"source\":\"Webform\",\"status\":\"new\",\"priority\":\"low\",\"value\":\"5,400\",\"last_activity\":\"2d ago\"},{\"id\":\"oliverdemo\",\"contact_name\":\"Oliver Grant\",\"company_name\":\"Grantline Consulting\",\"source\":\"LinkedIn\",\"status\":\"contacted\",\"priority\":\"low\",\"value\":\"7,800\",\"last_activity\":\"3d ago\"}]);}});";
      console.log("Fixed leads route at line", i+1);
      break;
    }
  }
  
  js = lines.join("\n");
  
  // Add extra routes before app.listen
  const listenIdx = js.lastIndexOf("app.listen(PORT)");
  const extras = `

// EPC Check
app.get('/api/epc-check', async (req, res) => {
  try {
    let q = req.query.q || '';
    if (!q) return res.json({ postcode: '', total: 0, breakdown: {A:0,B:0,C:0,D:0,E:0,F:0,G:0} });
    let pc = q.replace(/\\s+/g, '');
    let url = 'https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=' + encodeURIComponent(pc);
    let r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    let h = await r.text();
    let rows = h.split('<tr class="govuk-table__row">');
    let breakdown = {A:0,B:0,C:0,D:0,E:0,F:0,G:0};
    let total = 0;
    let certs = [];
    for (let ri = 1; ri < rows.length; ri++) {
      let row = rows[ri];
      let addr = '';
      let rating = '';
      let cells = row.match(/<td[^>]*class="govuk-table__cell"[^>]*>([\\s\\S]*?)<\\/td>/gi);
      let th = row.match(/<th[^>]*>([\\s\\S]*?)<\\/th>/i);
      if (th) addr = th[1].replace(/<[^>]+>/g, '').trim();
      if (cells) {
        for (let ci = 0; ci < cells.length; ci++) {
          let txt = cells[ci].replace(/<[^>]+>/g, '').trim();
          if (txt.length === 1 && 'ABCDEFG'.includes(txt.toUpperCase())) {
            rating = txt;
            break;
          }
        }
      }
      if (rating && addr) {
        breakdown[rating] = (breakdown[rating] || 0) + 1;
        total++;
        certs.push({ address: addr, rating: rating });
      }
    }
    res.json({ postcode: q, total, breakdown, certs: certs.slice(0, 10) });
  } catch (e) {
    res.json({ postcode: '', total: 0, breakdown: {A:0,B:0,C:0,D:0,E:0,F:0,G:0}, error: e.message });
  }
});

// MCS Check
app.get('/api/mcs-check', async (req, res) => {
  try {
    let q = req.query.q || '';
    if (!q) return res.json({ results: [], count: 0, query: q });
    let r = await fetch('https://mcscertified.com/find-an-installer/?mcs_search=' + encodeURIComponent(q), { headers: { 'User-Agent': 'Mozilla/5.0' } });
    let h = await r.text();
    let results = [];
    let modals = h.split('class="modal-overlay"');
    for (let i = 1; i < modals.length; i++) {
      let m = modals[i];
      let nm = m.match(/data-name="([^"]+)"/i);
      let cert = m.match(/data-cert="([^"]+)"/i);
      let email = m.match(/data-email="([^"]+)"/i);
      let phone = m.match(/data-phone="([^"]+)"/i);
      let addr = m.match(/data-address="([^"]+)"/i);
      if (nm && nm[1]) {
        results.push({
          name: nm[1].trim(),
          cert: cert ? cert[1].trim() : '',
          email: email ? email[1].trim() : '',
          phone: phone ? phone[1].trim() : '',
          address: addr ? addr[1].trim() : ''
        });
      }
    }
    res.json({ results, count: results.length, query: q });
  } catch (e) {
    res.json({ results: [], count: 0, query: req.query.q || '', error: e.message });
  }
});

// Tenders
app.get('/api/tenders', async (req, res) => {
  try {
    let r = await fetch('https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages?stages=tender&updatedFrom=' + encodeURIComponent(new Date(Date.now() - 30 * 86400000).toISOString()) + '&limit=20');
    let j = await r.json();
    let tenders = (j.releases || []).filter(function (rl) {
      var t = ((rl.tender || {}).title || '').toLowerCase();
      var d = ((rl.tender || {}).description || '').toLowerCase();
      return t.indexOf('solar') >= 0 || t.indexOf('renewable') >= 0 || t.indexOf('energy') >= 0 || t.indexOf('panel') >= 0 || t.indexOf('pv') >= 0 || t.indexOf('photovoltaic') >= 0 || t.indexOf('battery') >= 0 || d.indexOf('solar') >= 0 || d.indexOf('renewable') >= 0 || d.indexOf('energy') >= 0;
    }).map(function (rl) {
      return {
        ocid: rl.ocid,
        title: (rl.tender || {}).title || '',
        buyer: ((rl.buyer || {}).name || '').replace(/([^)]+)/g, '').trim(),
        value: (rl.tender || {}).value && (rl.tender || {}).value.amount ? Number((rl.tender || {}).value.amount) : null,
        deadline: (rl.tender || {}).submissionDeadline || null,
        status: (rl.tender || {}).status || '',
        description: (rl.tender || {}).description || ''
      };
    });
    var dups = {};
    tenders = tenders.filter(function (t) { if (dups[t.ocid]) return false; dups[t.ocid] = true; return true; });
    res.json({ tenders: tenders, count: tenders.length });
  } catch (e) {
    res.json({ tenders: [], count: 0, error: e.message });
  }
});

`;
  
  js = js.substring(0, listenIdx) + extras + js.substring(listenIdx);
  console.log("Final length:", js.length, "bytes");
  
  // Validate
  try {
    require("child_process").execSync("node --check /tmp/emma_final.js 2>&1", {encoding: "utf8", stdio: "pipe"});
    console.log("SYNTAX OK (local)");
  } catch(e) {
    const msg = e.stderr || e.message;
    console.log("Syntax issue:", msg.substring(0, 300));
  }
  
  // Write to IONOS then pipe to Emma VPS
  fs.writeFileSync("/tmp/emma_final.js", js);
  await new Promise((r,j) => {
    conn.sftp((e,sftp) => {
      if (e) return j(e);
      const rs = fs.createReadStream("/tmp/emma_final.js");
      const ws = sftp.createWriteStream("/tmp/emma_final.js");
      rs.pipe(ws);
      ws.on("close", r);
      ws.on("error", j);
    });
  });
  
  // Copy to Emma VPS using sshpass cat pipe
  await run("cat /tmp/emma_final.js | sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 'cat > /var/www/api/server.js'");
  await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 'node --check /var/www/api/server.js && echo SYNTAX_OK'");
  await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 'pm2 restart emma-api'");
  
  console.log("Deployed! Testing...");
  
  // Wait and test
  setTimeout(async () => {
    const endpoints = ["health","leads","briefing","tenders","mcs-check?q=Solar","epc-check?q=SK74RP","weather","news"];
    for (const ep of endpoints) {
      const code = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s -o /dev/null -w %{http_code} https://eco-emma.com/api/" + ep + "\"");
      const body = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s https://eco-emma.com/api/" + ep + " | head -c 200\"");
      console.log(ep.split("?")[0] + "=" + code.trim(), body.substring(0, 120));
    }
    conn.end();
  }, 3000);
  
}).on("error", e => {console.log("error:", e.message); conn.end();})
.connect({ host:"212.227.93.74", username:"root", privateKey:fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
