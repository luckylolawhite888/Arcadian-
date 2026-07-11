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

  // Fetch current
  let b64 = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cat /var/www/api/server.js | base64 -w0" 2>&1');
  let current = Buffer.from(b64.trim(), "base64").toString("utf8");

  // Replace the fake weather/briefing placeholder
  // Match: ['status','weather','stats','calendar','approvals','briefing'].forEach...
  // With: ['status','stats','calendar','approvals'].forEach...
  let r1 = current.replace(
    /\[['"]status['"],\s*['"]weather['"],\s*['"]stats['"],\s*['"]calendar['"],\s*['"]approvals['"],\s*['"]briefing['"]\]/,
    "['status','stats','calendar','approvals']"
  );
  
  if (r1 === current) {
    console.log("WARN: Placeholder replacement didn't change anything");
  } else {
    console.log("Placeholder replaced OK");
  }
  
  // Now find the block between graph/explain and app.listen
  let graphIdx = r1.lastIndexOf("app.get('/api/graph/explain'");
  let graphEnd = r1.indexOf("});", graphIdx) + 3;
  
  let listenIdx = r1.lastIndexOf("app.listen(PORT)");
  
  // Extract the last copy of each feature route
  let lastTenders = r1.lastIndexOf("app.get('/api/tenders'");
  let lastMcs = r1.lastIndexOf("app.get('/api/mcs-check'");
  let lastEpc = r1.lastIndexOf("app.get('/api/epc-check'");
  
  // The last copy is the one to keep. The section between graphEnd and listenIdx has all copies.
  // Strategy: Keep everything up to graphEnd, then ONLY the last copy of each, then listen...
  // Actually simpler: Keep everything up to and including graphEnd. Then find second-to-last and
  // strip everything between first and last, keeping only the last copy.
  
  // But wait - the cleaner version of each is the LAST one
  // Let's capture just the last copies of tenders, mcs, and epc
  let lastTendersEnd = r1.indexOf("}});app.get('/api/mcs-check'", lastTenders);
  let lastMcsEnd = r1.indexOf("}});app.get('/api/epc-check'", lastMcs);
  let lastEpcEnd = r1.indexOf("}});app.listen(PORT)", lastEpc) + 3;
  // actually }}); closes the catch block... Let me be more careful
  
  // Simpler approach: find all instances, keep only the LAST one
  // Find the start of the first feature route after graph routes
  let featureStart = r1.indexOf("app.get('/api/tenders'", graphEnd);
  // Find the last feature route end (the start of app.listen)
  let lastListen = r1.lastIndexOf("app.listen(PORT)");
  
  let featureBlock = r1.substring(featureStart, lastListen);
  
  // Count copies in feature block
  let tCount = (featureBlock.match(/app\.get\('\/api\/tenders'/g) || []).length;
  let mCount = (featureBlock.match(/app\.get\('\/api\/mcs-check'/g) || []).length;
  let eCount = (featureBlock.match(/app\.get\('\/api\/epc-check'/g) || []).length;
  console.log("Feature block copies:", tCount, mCount, eCount);
  
  // Keep everything UP TO graphEnd, then only the last features
  // Find the last copy of each feature route
  let lastTenderStart = r1.lastIndexOf("app.get('/api/tenders'");
  let lastMcsStart = r1.lastIndexOf("app.get('/api/mcs-check'");
  let lastEpcStart = r1.lastIndexOf("app.get('/api/epc-check'");
  let listenPos = r1.lastIndexOf("app.listen(PORT)");
  
  // The last copy of each route, up to the next route or listen
  let lastTenderCopy = r1.substring(lastTenderStart, lastMcsStart);
  let lastMcsCopy = r1.substring(lastMcsStart, lastEpcStart);
  let lastEpcCopy = r1.substring(lastEpcStart, listenPos);
  
  console.log("Last tender length:", lastTenderCopy.length);
  console.log("Last mcs length:", lastMcsCopy.length);
  console.log("Last epc length:", lastEpcCopy.length);
  
  // Build clean result
  let result = r1.substring(0, graphEnd) + "\n" + lastTenderCopy + lastMcsCopy + lastEpcCopy + r1.substring(lastListen);
  
  // Write and verify
  fs.writeFileSync("/tmp/emma_clean_v2.js", result);
  
  // Verify route counts
  let rfCount = (result.match(/app\.get\('\/api\/tenders'/g) || []).length;
  let rmCount = (result.match(/app\.get\('\/api\/mcs-check'/g) || []).length;
  let reCount = (result.match(/app\.get\('\/api\/epc-check'/g) || []).length;
  console.log("After dedup:", rfCount, rmCount, reCount);
  
  // Check for broken regex
  if (result.includes('[\\s\\S]')) console.log("Has broken regex: YES"); else console.log("Has broken regex: NO");
  
  // Check syntax locally
  try {
    require("child_process").execSync("node --check /tmp/emma_clean_v2.js 2>&1", { stdio: "pipe" });
    console.log("Local syntax: OK");
  } catch(e) {
    console.log("Local syntax: FAIL");
    console.log(e.stderr.toString().substring(0, 300));
    conn.end();
    return;
  }
  
  // Add weather and briefing routes if they're missing
  // They should be in the placeholder replacement
  let hasWeather = result.includes("/api/weather");
  let hasBriefing = result.includes("/api/briefing");
  console.log("Has weather route:", hasWeather);
  console.log("Has briefing route:", hasBriefing);
  
  // Deploy
  const newB64 = Buffer.from(result).toString("base64");
  
  let dep = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo \\"' + newB64 + '\\" | base64 -d > /var/www/api/server.js.tmp && node -c /var/www/api/server.js.tmp" 2>&1');
  console.log("Remote syntax:", dep.trim().substring(0, 150));
  
  if (dep.trim().includes("SyntaxError")) {
    console.log("Remote syntax FAIL");
    conn.end();
    return;
  }
  
  await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "cp /var/www/api/server.js /var/www/api/server.js.bak4 && mv /var/www/api/server.js.tmp /var/www/api/server.js && pm2 restart emma-api" 2>&1');
  
  await new Promise(rr => setTimeout(rr, 2500));
  
  for (const ep of ["health", "weather", "briefing", "tenders", "mcs-check?q=SK74RP", "epc-check?q=SK74RP", "approvals", "news", "voice/voices", "leads"]) {
    let res = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s -o /dev/null -w %{http_code} https://eco-emma.com/api/' + ep + '" 2>&1');
    process.stdout.write(ep + "=" + res.trim() + " ");
  }
  console.log();
  
  // Data samples
  let wd = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/weather 2>&1 | head -c 200"');
  console.log("Weather:", wd.trim().substring(0, 150));
  
  let md = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/mcs-check?q=SK74RP 2>&1 | head -c 300"');
  console.log("MCS:", md.trim().substring(0, 200));
  
  let ed = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/epc-check?q=SK74RP 2>&1 | head -c 300"');
  console.log("EPC:", ed.trim().substring(0, 200));
  
  let td = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/tenders 2>&1 | head -c 300"');
  console.log("Tenders:", td.trim().substring(0, 200));
  
  let rc = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "grep -c app\\\\.get\\\\(\\\\x27\\\\/api\\\\/ /var/www/api/server.js" 2>&1');
  console.log("Total routes:", rc.trim());
  
  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
