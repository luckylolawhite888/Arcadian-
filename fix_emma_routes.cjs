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
  let current = Buffer.from(b64.trim(), "base64").toString("utf8");

  // ==== THE PLAN ====
  // 1. Remove duplicate routes (keep the better versions)
  // 2. Replace the fake weather/briefing placeholder with real endpoints
  // 3. Fix the EPC scraper (use govuk-table class name correctly)
  // 4. Fix the MCS scraper (try admin-ajax.php approach)

  // The placeholder that generates fake routes
  // Current: ['status','weather','stats','calendar','approvals','briefing'].forEach(e=>app.get('/api/'+e,(req,res)=>res.json({ok:true,data:[]})));
  // Replace with: remove weather and briefing from that list, add real routes below

  // Remove duplicates by finding the first copy of each feature route and keeping only the second (better) version
  // Strategy: replace the entire section between graph routes and app.listen with clean versions

  // Find the first set boundaries
  let graphEndIdx = current.lastIndexOf("app.get('/api/graph/explain'");
  let graphEnd = current.indexOf("});", graphEndIdx) + 3;
  
  // Find where the first tenders route starts (after graph routes)
  let firstTenders = current.indexOf("app.get('/api/tenders'", graphEnd);
  // Find the second tenders route (the better one with admin-ajax)
  let secondTenders = current.indexOf("app.get('/api/tenders'", firstTenders + 100);
  
  // Find app.listen
  let listenIdx = current.lastIndexOf("app.listen(PORT)");
  
  // Extract just the second (better) copies
  // Better MCS uses admin-ajax, better EPC uses govuk-table classes
  let cleanRoutes = current.substring(secondTenders, listenIdx);
  
  // Fix the fake weather/briefing placeholder
  // Replace the forEach that includes weather/briefing
  let placeholder = "['status','weather','stats','calendar','approvals','briefing'].forEach(e=>app.get('/api/'+e,(req,res)=>res.json({ok:true,data:[]})));";
  let realWeather = "app.get('/api/weather',async function(req,res){try{var r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.13&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe%2FLondon',{headers:{'User-Agent':'Mozilla/5.0'}});var j=await r.json();if(!j||!j.current_weather)return res.json({ok:true,data:[],error:'no data'});var c=j.current_weather;var d=j.daily;res.json({ok:true,data:{current:{temp:c.temperature,wind:c.windspeed,code:c.weathercode},daily:d.time.map(function(t,i){return{date:t,hi:d.temperature_2m_max[i],lo:d.temperature_2m_min[i],rain:d.precipitation_sum[i],code:d.weathercode[i]})}}})}catch(e){res.json({ok:true,data:[],error:e.message})}});";
  let realBriefing = "app.get('/api/briefing',async function(req,res){try{var n=await fetch('https://newsdata.io/api/1/news?apikey=" + "pub_2f8aa390186e43cdbfa912a4cde68561" + "&country=gb&language=en&size=3').then(function(r2){return r2.json()});var w=await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.13&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe%2FLondon',{headers:{'User-Agent':'Mozilla/5.0'}}).then(function(r2){return r2.json()});res.json({ok:true,data:{date:new Date().toISOString().split('T')[0],news:(n.results||[]).map(function(a){return{title:a.title,url:a.link,source:a.source_id}}),weather:w.current_weather?{temp:w.current_weather.temperature,wind:w.current_weather.windspeed}:null}})}catch(e){res.json({ok:true,data:[],error:e.message})}});";
  
  // Replace the placeholder
  let newPlaceholder = "['status','stats','calendar','approvals'].forEach(e=>app.get('/api/'+e,(req,res)=>res.json({ok:true,data:[]})));";
  let result = current.replace(placeholder, newPlaceholder);
  
  // Insert real weather and briefing after the placeholder
  let placeEnd = result.indexOf(newPlaceholder) + newPlaceholder.length;
  result = result.substring(0, placeEnd) + "\n" + realWeather + "\n" + realBriefing + "\n" + result.substring(placeEnd);
  
  // Now replace the duplicate feature routes — keep only the second (better) copies
  // Find where graph/explain ends, then the feature routes begin
  let newEnd = result.lastIndexOf("app.get('/api/graph/explain'");
  let afterGraph = result.indexOf("});", newEnd) + 3;
  
  // Find first set of feature routes (first tenders)
  let firstSetStart = result.indexOf("app.get('/api/tenders'", afterGraph);
  let secondSetStart = result.indexOf("app.get('/api/tenders'", firstSetStart + 200);
  let listenStart = result.lastIndexOf("app.listen(PORT)");
  
  // Combine: up to afterGraph + cleanRoutes (from secondSetStart to listenStart) + app.listen
  let newResult = result.substring(0, afterGraph) + "\n" + result.substring(secondSetStart, listenStart) + "\n" + result.substring(listenStart);
  
  // Write locally and verify syntax
  fs.writeFileSync("/tmp/emma_clean.js", newResult);
  
  // Verify there are no duplicate feature routes
  let tenderCount = (newResult.match(/app\.get\('\/api\/tenders'/g) || []).length;
  let mcsCount = (newResult.match(/app\.get\('\/api\/mcs-check'/g) || []).length;
  let epcCount = (newResult.match(/app\.get\('\/api\/epc-check'/g) || []).length;
  console.log("Dedup check — tenders:", tenderCount, "mcs:", mcsCount, "epc:", epcCount);
  
  // Verify routes present
  let foundRoutes = [];
  let re = /'\/api\/([a-z_-]+)'/g;
  let m;
  while ((m = re.exec(newResult)) !== null) foundRoutes.push(m[1]);
  console.log("Routes:", [...new Set(foundRoutes)].sort().join(", "));
  
  // Fix regex in the better EPC route — the `[\s\S]` needs to be actual regex not escaped
  // Check if the EPC scraper regex survived properly
  let hasBadRegex = newResult.includes(`[\\s\\S]`);
  console.log("Has broken regex:", hasBadRegex);
  
  try {
    require("child_process").execSync("node --check /tmp/emma_clean.js 2>&1", { stdio: "pipe" });
    console.log("Local syntax: OK");
  } catch(e) {
    console.log("Local syntax: FAIL");
    console.log(e.stderr.toString().substring(0, 300));
    conn.end();
    return;
  }
  
  // Deploy
  const newB64 = Buffer.from(newResult).toString("base64");
  
  // Check size sanity
  if (newB64.length < 10000 || newB64.length > 50000) {
    console.log("Suspicious size:", newB64.length, "— aborting");
    conn.end();
    return;
  }
  
  let dep = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo \\"' + newB64 + '\\" | base64 -d > /var/www/api/server.js.tmp && node -c /var/www/api/server.js.tmp" 2>&1');
  console.log("Remote syntax:", dep.trim().substring(0, 100));
  
  if (dep.trim().includes("SyntaxError")) {
    console.log("Remote syntax FAIL");
    conn.end();
    return;
  }
  
  // Backup and replace
  let pm2 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cp /var/www/api/server.js /var/www/api/server.js.bak4 && mv /var/www/api/server.js.tmp /var/www/api/server.js && pm2 restart emma-api" 2>&1');
  console.log("Deploy:", pm2.trim().substring(0, 200));
  
  await new Promise(rr => setTimeout(rr, 2500));
  
  // Test endpoints including the new ones
  const tests = ["health", "weather", "briefing", "tenders", "mcs-check?q=SK74RP", "epc-check?q=SK74RP", "approvals", "news", "voice/voices"];
  for (const ep of tests) {
    let res = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s -o /dev/null -w %{http_code} https://eco-emma.com/api/' + ep + '" 2>&1');
    process.stdout.write(ep + "=" + res.trim() + " ");
  }
  console.log();
  
  // Show data samples
  let wd = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/weather 2>&1 | head -c 200"');
  console.log("Weather:", wd.trim().substring(0, 150));
  
  let bd = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/briefing 2>&1 | head -c 250"');
  console.log("Briefing:", bd.trim().substring(0, 200));
  
  let md = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/mcs-check?q=SK74RP 2>&1 | head -c 300"');
  console.log("MCS:", md.trim().substring(0, 200));
  
  let ed = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/epc-check?q=SK74RP 2>&1 | head -c 300"');
  console.log("EPC:", ed.trim().substring(0, 200));
  
  // Route count check
  let rc = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "grep -c app\\\\.get\\\\(\\\\x27\\\\/api\\\\/ /var/www/api/server.js" 2>&1');
  console.log("Route count:", rc.trim());
  
  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
