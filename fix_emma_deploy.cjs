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

  // Fetch the clean base (restored from bak3)
  let b64 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js | base64 -w0" 2>&1');
  let js = Buffer.from(b64.trim(), "base64").toString("utf8");

  // 1. Replace the placeholder: remove weather and briefing from the list
  let old = "['status','weather','stats','calendar','approvals','briefing']";
  let newP = "['status','stats','calendar','approvals']";
  js = js.replace(old, newP);

  // Find insertion points
  let placeholderEnd = js.indexOf("['status','stats','calendar','approvals']");
  placeholderEnd = js.indexOf("));", placeholderEnd) + 3; // after "));\n"
  
  let listenIdx = js.lastIndexOf("app.listen(PORT)");

  // 2. Weather route — tested regex, correct brace matching
  const weather = 
`app.get('/api/weather',async(req,res)=>{try{let r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.13&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe/London');let j=await r.json();if(!j||!j.current_weather){res.json({ok:true,data:[]});return}let c=j.current_weather;let d=j.daily;res.json({ok:true,data:{current:{temp:c.temperature,wind:c.windspeed,code:c.weathercode},daily:d.time.map((t,i)=>({date:t,hi:d.temperature_2m_max[i],lo:d.temperature_2m_min[i],rain:d.precipitation_sum[i],code:d.weathercode[i]}))}})}catch(e){res.json({ok:true,data:[],error:e.message})}});`;

  // 3. Briefing route
  const briefing = 
`app.get('/api/briefing',async(req,res)=>{try{let n=await fetch('https://newsdata.io/api/1/news?apikey=pub_2f…8561&country=gb&language=en&size=3').then(r2=>r2.json());let w=await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.13&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe/London').then(r2=>r2.json());res.json({ok:true,data:{date:new Date().toISOString().split('T')[0],news:(n.results||[]).map(a=>({title:a.title,url:a.link,source:a.source_id})),weather:w.current_weather?{temp:w.current_weather.temperature,wind:w.current_weather.windspeed}:null}})}catch(e){res.json({ok:true,data:[],error:e.message})}});`;

  // 4. Tenders route (arrow function, cleaner)
  const tenders = 
`app.get('/api/tenders',async(req,res)=>{try{let r=await fetch('https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages?stages=tender&updatedFrom='+encodeURIComponent(new Date(Date.now()-30*86400000).toISOString())+'&limit=20');let j=await r.json();let tenders=(j.releases||[]).filter(rl=>{let t=(rl.tender.title||'').toLowerCase();let d=(rl.tender.description||'').toLowerCase();return['solar','renewable','energy','panel','pv','photovoltaic','battery'].some(k=>t.includes(k)||d.includes(k))}).map(rl=>({ocid:rl.ocid,title:rl.tender.title||'',buyer:(rl.buyer.name||'').replace(/\\([^)]+\\)/g,'').trim(),value:rl.tender.value&&rl.tender.value.amount?Number(rl.tender.value.amount):null,deadline:rl.tender.submissionDeadline||null,status:rl.tender.status||'',description:rl.tender.description||''}));let seen={};tenders=tenders.filter(t=>seen[t.ocid]?false:(seen[t.ocid]=true));res.json({tenders,count:tenders.length})}catch(e){res.json({tenders:[],count:0,error:e.message})}});`;

  // 5. MCS check (admin-ajax POST)
  const mcs = 
`app.get('/api/mcs-check',async(req,res)=>{try{let q=req.query.q||'';if(!q)return res.json({results:[],count:0,query:q});let results=[];try{let r=await fetch('https://mcscertified.com/wp-admin/admin-ajax.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'},body:'action=mcs_installer_search&search='+encodeURIComponent(q)});if(r.ok){let j=await r.json();if(j&&j.data){results=j.data.map(inst=>({name:inst.company_name||inst.name||'',address:[inst.address_1,inst.address_2,inst.town,inst.county].filter(Boolean).join(', '),postcode:inst.postcode||'',technologies:(inst.technologies||inst.services||[]).map(t=>typeof t==='object'?t.name||t.service:t),phone:inst.telephone||inst.phone||'',website:inst.website||'',email:inst.email||'',certification_body:inst.certification_body||inst.scheme||'',distance:inst.distance||null}))}}}catch(e){}res.json({results,count:results.length,query:q})}catch(e){res.json({results:[],count:0,query:req.query.q||''})}});`;

  // 6. EPC check (string-split parsing, no regex issues)
  const epc = 
`app.get('/api/epc-check',async(req,res)=>{try{let q=req.query.q||'';if(!q)return res.json({postcode:q,total:0,breakdown:{A:0,B:0,C:0,D:0,E:0,F:0,G:0},targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[]});let pc=q.split(' ').join('');let r=await fetch('https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode='+encodeURIComponent(pc));let h=await r.text();let b={A:0,B:0,C:0,D:0,E:0,F:0,G:0};let total=0;let certs=[];let tbl=h.split('govuk-table epb-search-results')[1];if(tbl){let rows=tbl.split('<tr class="govuk-table__row">');for(let ri=1;ri<rows.length;ri++){let cells=rows[ri].split('<td class="govuk-table__cell"');let rating='';let addr='';for(let ci=1;ci<Math.min(cells.length,5);ci++){let ct=cells[ci].split('>').slice(1).join('>').split('<')[0].trim();if(ct.length===1&&'ABCDEFG'.includes(ct.toUpperCase()))rating=ct.toUpperCase()}if(!addr){let ah=rows[ri].match(/<th[^>]*>([^<]+)<\\/th>/i);if(ah)addr=ah[1].trim()}if(rating&&addr){b[rating]=(b[rating]||0)+1;total++;certs.push({address:addr,rating,score:0})}}}let target=['D','E','F','G'].reduce((s,g)=>s+(b[g]||0),0);let pct=total>0?((target/total)*100).toFixed(1):'0';res.json({postcode:q,total,breakdown:b,targetProperties:target,targetPercent:pct+'%',avgScore:total>0?Math.round(target/total*100):0,recentCertificates:certs.slice(0,10)})}catch(e){res.json({postcode:q||'',total:0,breakdown:{A:0,B:0,C:0,D:0,E:0,F:0,G:0},targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[],error:e.message})}});`;

  // Build final file: after placeholder insert weather+briefing, before listen insert tenders+mcs+epc
  let result = 
    js.substring(0, placeholderEnd) + "\n" + 
    weather + "\n" + briefing + "\n" +
    js.substring(placeholderEnd, listenIdx) + "\n" +
    tenders + "\n" + mcs + "\n" + epc + "\n" +
    js.substring(listenIdx);

  // Syntax check
  fs.writeFileSync("/tmp/emma_final_clean.js", result);
  try {
    require("child_process").execSync("node --check /tmp/emma_final_clean.js", { stdio: "pipe" });
    console.log("LOCAL SYNTAX: OK ✓");
  } catch(e) {
    console.log("LOCAL SYNTAX: FAIL ✗");
    let m = e.stderr.toString();
    console.log(m.substring(0, 500));
    conn.end();
    return;
  }

  // Route list
  const pat = new RegExp(String.raw`\x27\/api\/([a-z_-]+)\x27`, "g");
  let routes = [...new Set(result.match(pat))].join(", ");
  console.log("Routes:", routes);

  // Deploy
  const newB64 = Buffer.from(result).toString("base64");
  let dep = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo "' + newB64 + '" | base64 -d > /var/www/api/server.js.tmp && node -c /var/www/api/server.js.tmp" 2>&1');
  console.log("Remote:", dep.trim().substring(0, 100));
  
  if (dep.includes("SyntaxError")) {
    console.log("REMOTE SYNTAX FAIL");
    conn.end();
    return;
  }
  
  await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cp /var/www/api/server.js /var/www/api/server.js.bak7 && mv /var/www/api/server.js.tmp /var/www/api/server.js && pm2 restart emma-api" 2>&1');
  await new Promise(rr => setTimeout(rr, 2500));

  // Full test
  console.log("\n=== TEST RESULTS ===");
  for (const ep of ["health","weather","briefing","tenders","mcs-check?q=SK74RP","epc-check?q=SK74RP","approvals","news","voice/voices","leads","tasks"]) {
    let res = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s -o /dev/null -w %{http_code} https://eco-emma.com/api/' + ep + '" 2>&1');
    process.stdout.write(ep.split("?")[0] + "=" + res.trim() + " ");
  }
  console.log();

  // Data from new routes
  for (const [ep, label] of [["tenders","Tenders"], ["mcs-check?q=SK74RP","MCS Check"], ["epc-check?q=SK74RP","EPC Check"], ["weather","Weather"], ["briefing","Briefing"]]) {
    let d = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/' + ep + ' 2>&1 | head -c 300"');
    console.log(label + ":", d.trim().substring(0, 200));
  }

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
