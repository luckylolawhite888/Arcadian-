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

  // Fetch the clean base (already restored from bak3)
  let b64 = await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js | base64 -w0" 2>&1');
  let js = Buffer.from(b64.trim(), "base64").toString("utf8");

  // Find insertion point: right before app.listen(PORT)
  let idx = js.lastIndexOf("app.listen(PORT)");
  if (idx < 0) { console.log("ERROR: no insertion point"); conn.end(); return; }
  console.log("Insertion at", idx, "of", js.length);
  
  // The features to add
  // Replace the placeholder for weather/stats/briefing with a version that excludes weather and briefing
  let oldPlaceholder = "['status','weather','stats','calendar','approvals','briefing']";
  let newPlaceholder = "['status','stats','calendar','approvals']";
  js = js.replace(oldPlaceholder, newPlaceholder);
  
  // Real weather route
  const weatherRoute = `
app.get('/api/weather',async function(req,res){try{var r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.13&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe%2FLondon',{headers:{'User-Agent':'Mozilla/5.0'}});var j=await r.json();if(!j||!j.current_weather)return res.json({ok:true,data:[],error:'no data'});var c=j.current_weather;var d=j.daily;res.json({ok:true,data:{current:{temp:c.temperature,wind:c.windspeed,code:c.weathercode},daily:d.time.map(function(t,i){return{date:t,hi:d.temperature_2m_max[i],lo:d.temperature_2m_min[i],rain:d.precipitation_sum[i],code:d.weathercode[i]})})}}catch(e){res.json({ok:true,data:[],error:e.message})}});`;

  // Real briefing route
  const briefingRoute = `
app.get('/api/briefing',async function(req,res){try{var n=await fetch('https://newsdata.io/api/1/news?apikey=pub_2f8aa390186e43cdbfa912a4cde68561&country=gb&language=en&size=3').then(function(r2){return r2.json()});var w=await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.13&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe%2FLondon',{headers:{'User-Agent':'Mozilla/5.0'}}).then(function(r2){return r2.json()});res.json({ok:true,data:{date:new Date().toISOString().split('T')[0],news:(n.results||[]).map(function(a){return{title:a.title,url:a.link,source:a.source_id}}),weather:w.current_weather?{temp:w.current_weather.temperature,wind:w.current_weather.windspeed}:null}})}catch(e){res.json({ok:true,data:[],error:e.message})}});`;

  // Tenders route
  const tendersRoute = `
app.get('/api/tenders',async function(req,res){try{var r=await fetch('https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages?stages=tender&updatedFrom='+encodeURIComponent(new Date(Date.now()-30*86400000).toISOString())+'&limit=20');var j=await r.json();var tenders=(j.releases||[]).filter(function(rl){var t=((rl.tender||{}).title||'').toLowerCase();var d=((rl.tender||{}).description||'').toLowerCase();return t.indexOf('solar')>=0||t.indexOf('renewable')>=0||t.indexOf('energy')>=0||t.indexOf('panel')>=0||t.indexOf('pv')>=0||t.indexOf('photovoltaic')>=0||t.indexOf('battery')>=0||d.indexOf('solar')>=0||d.indexOf('renewable')>=0||d.indexOf('energy')>=0}).map(function(rl){return{ocid:rl.ocid,title:(rl.tender||{}).title||'',buyer:((rl.buyer||{}).name||'').replace(/\\([^)]+\\)/g,'').trim(),value:(rl.tender||{}).value&&(rl.tender||{}).value.amount?Number((rl.tender||{}).value.amount):null,deadline:(rl.tender||{}).submissionDeadline||null,status:(rl.tender||{}).status||'',description:(rl.tender||{}).description||''}});var dups={};tenders=tenders.filter(function(t){if(dups[t.ocid])return false;dups[t.ocid]=true;return true});res.json({tenders:tenders,count:tenders.length})}catch(e){res.json({tenders:[],count:0,error:e.message})}});`;

  // EPC check route (clean: uses split-based parsing, no regex issues)
  const epcRoute = `
app.get('/api/epc-check',async function(req,res){try{var q=req.query.q||'';if(!q)return res.json({postcode:q,total:0,breakdown:{A:0,B:0,C:0,D:0,E:0,F:0,G:0},targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[]});var pc=q.split(' ').join('');var url='https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode='+encodeURIComponent(pc);var r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});var h=await r.text();var breakdown={A:0,B:0,C:0,D:0,E:0,F:0,G:0};var total=0;var certs=[];var tbl=h.split('govuk-table epb-search-results')[1];if(tbl){var rows=tbl.split('<tr class="govuk-table__row">');for(var ri=1;ri<rows.length;ri++){var row=rows[ri];var addr='';var rating='';var cells=row.split('<td class="govuk-table__cell"');if(cells&&cells.length>=2){for(var ci=1;ci<cells.length;ci++){var cellText=cells[ci].split('>').slice(1).join('>').split('<')[0].trim();if(cellText.length===1&&'ABCDEFG'.indexOf(cellText.toUpperCase())>=0){rating=cellText.toUpperCase()}}}var thMatch=row.match(/<th[^>]*>([\\s\\S]*?)<\\/th>/i);if(thMatch){addr=thMatch[1].replace(/<[^>]+>/g,'').trim()}if(rating&&addr){breakdown[rating]=(breakdown[rating]||0)+1;total++;certs.push({address:addr,rating:rating,score:0})}}}var target=0;var grades=['D','E','F','G'];for(var gi=0;gi<grades.length;gi++){target+=breakdown[grades[gi]]||0}var pct=total>0?((target/total)*100).toFixed(1):'0';res.json({postcode:q,total:total,breakdown:breakdown,targetProperties:target,targetPercent:pct+'%',avgScore:target>0?Math.round(target/total*100):0,recentCertificates:certs.slice(0,10)})}catch(e){res.json({postcode:q||'',total:0,breakdown:{A:0,B:0,C:0,D:0,E:0,F:0,G:0},targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[],error:e.message})}});`;

  // MCS check route (admin-ajax approach)
  const mcsRoute = `
app.get('/api/mcs-check',async function(req,res){try{var q=req.query.q||'';if(!q)return res.json({results:[],count:0,query:q});var results=[];try{var r=await fetch('https://mcscertified.com/wp-admin/admin-ajax.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'},body:'action=mcs_installer_search&search='+encodeURIComponent(q)});if(r.ok){var j=await r.json();if(j&&j.data){results=j.data.map(function(inst){return{name:inst.company_name||inst.name||'',address:[inst.address_1,inst.address_2,inst.town,inst.county].filter(Boolean).join(', '),postcode:inst.postcode||'',technologies:(inst.technologies||inst.services||[]).map(function(t){return typeof t==='object'?t.name||t.service:t}),phone:inst.telephone||inst.phone||'',website:inst.website||'',email:inst.email||'',certification_body:inst.certification_body||inst.scheme||'',distance:inst.distance||null}})}}}catch(e){}res.json({results:results,count:results.length,query:q})}catch(e){res.json({results:[],count:0,query:req.query.q||''})}});`;

  // Assemble: add weather + briefing after the placeholder (which is near the top)
  // Then add tenders/mcs/epc before app.listen
  let weatherIdx = js.indexOf("['status','stats','calendar','approvals']");
  if (weatherIdx < 0) { console.log("ERROR: placeholder not found"); conn.end(); return; }
  
  let placeholderEnd = js.indexOf("));", weatherIdx) + 2;
  
  // Insert weather + briefing after the placeholder line
  let result = js.substring(0, placeholderEnd) + "\n" + weatherRoute + "\n" + briefingRoute + js.substring(placeholderEnd);
  
  // Now find the new listen point and insert tenders/mcs/epc
  let newListen = result.lastIndexOf("app.listen(PORT)");
  result = result.substring(0, newListen) + tendersRoute + "\n" + mcsRoute + "\n" + epcRoute + "\n" + result.substring(newListen);
  
  // Write and check syntax locally
  fs.writeFileSync("/tmp/emma_clean_v3.js", result);
  
  try {
    require("child_process").execSync("node --check /tmp/emma_clean_v3.js", { stdio: "pipe" });
    console.log("Local syntax: OK");
  } catch(e) {
    console.log("Local syntax: FAIL");
    console.log(e.stderr.toString().substring(0, 500));
    conn.end();
    return;
  }
  
  // Check for features
  const pat = new RegExp(String.raw`\x27\/api\/([a-z_-]+)\x27`, "g");
  let routelist = [...new Set(result.match(pat))].join(", ");
  console.log("All routes:", routelist);
  
  // Deploy
  const newB64 = Buffer.from(result).toString("base64");
  let dep = await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo "' + newB64 + '" | base64 -d > /var/www/api/server.js.tmp && node -c /var/www/api/server.js.tmp" 2>&1');
  console.log("Remote:", dep.trim().substring(0, 150));
  
  if (dep.includes("SyntaxError")) {
    console.log("Remote syntax FAIL — not deploying");
    conn.end();
    return;
  }
  
  await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cp /var/www/api/server.js /var/www/api/server.js.bak7 && mv /var/www/api/server.js.tmp /var/www/api/server.js && pm2 restart emma-api" 2>&1');
  await new Promise(rr => setTimeout(rr, 2500));
  
  // Full test
  console.log("=== ENDPOINT TESTS ===");
  for (const ep of ["health","weather","briefing","tenders","mcs-check?q=SK74RP","epc-check?q=SK74RP","approvals","news","voice/voices","leads","tasks"]) {
    let res = await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s -o /dev/null -w %{http_code} https://eco-emma.com/api/' + ep + '" 2>&1');
    process.stdout.write(ep.split("?")[0] + "=" + res.trim() + " ");
  }
  console.log();
  
  // Data samples
  for (const ep of ["tenders","mcs-check?q=SK74RP","epc-check?q=SK74RP"]) {
    let d = await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/' + ep + ' 2>&1 | head -c 350"');
    console.log(ep.split("?")[0] + ":", d.trim().substring(0, 250));
  }
  
  // Route count
  let rc = await run('sshpass -p ' + p + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "grep -c app\\\\x5c\\\\x2eget\\\\x5c\\\\x28\\\\x5c\\\\x27\\\\x2fapi\\\\x2f /var/www/api/server.js" 2>&1');
  console.log("Route defs:", rc.trim());
  
  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
