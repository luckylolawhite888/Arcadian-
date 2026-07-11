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

  // Rewrite the MCS route to use page scraping instead of admin-ajax
  // The page lists installers with name, email, phone, address, technologies
  const newMCS = `app.get('/api/mcs-check',async(req,res)=>{try{let q=req.query.q||'';if(!q)return res.json({results:[],count:0,query:q});let results=[];try{let r=await fetch('https://mcscertified.com/find-an-installer/?page=1&search='+encodeURIComponent(q));let h=await r.text();let cards=h.split('<h3 class=\\"h4\\">');for(let i=1;i<cards.length;i++){let card=cards[i];let name='';let email='';let phone='';let address='';let techs=[];let nm=card.match(/<h3[^>]*class=\\"h4\\"[^>]*>([^<]+)<\\/h3>/i);if(nm)name=nm[1].trim();let em=card.match(/Email<\\/span>[^<]*<a[^>]*href=\\"mailto:([^\\"]+)\\"/i);if(em)email=em[1].trim();let pm=card.match(/Call<\\/span>[^<]*<a[^>]*href=\\"tel:([^\\"]+)\\"/i);if(pm)phone=pm[1].trim();let am=card.match(/Address:<\\/span>\\s*([^<]+)/i);if(am)address=am[1].trim();let tm=card.match(/<ul class=\\"list--tech\\">([\\s\\S]*?)<\\/ul>/i);if(tm){let items=tm[1].match(/<li[^>]*>([\\s\\S]*?)<\\/li>/gi);if(items){items.forEach(function(it){let tm2=it.match(/<img[^>]*alt=\\"([^\\"]+)\\"/i);if(tm2)techs.push(tm2[1].trim());else{let tt=it.replace(/<[^>]+>/g,'').trim();if(tt)techs.push(tt)}})}}if(name)results.push({name,address,technologies:techs,email,phone})}}catch(e){}res.json({results,count:results.length,query:q})}catch(e){res.json({results:[],count:0,query:req.query.q||''})}});`;

  // Find MCS route boundaries
  let mcsStart = js.indexOf("app.get('/api/mcs-check'");
  let mcsEnd = js.indexOf("app.get('/api/epc-check'", mcsStart);
  
  console.log("MCS:", mcsStart, "to", mcsEnd);
  
  let result = js.substring(0, mcsStart) + newMCS + "\n" + js.substring(mcsEnd);

  fs.writeFileSync("/tmp/emma_mcs_fixed.js", result);
  try {
    require("child_process").execSync("node --check /tmp/emma_mcs_fixed.js", { stdio: "pipe" });
    console.log("Syntax OK");
  } catch(e) {
    let msg = e.stderr.toString();
    console.log("FAIL:", msg.substring(0, 500));
    conn.end();
    return;
  }

  const newB64 = Buffer.from(result).toString("base64");
  await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "echo "' + newB64 + '" | base64 -d > /var/www/api/server.js && pm2 restart emma-api"');
  await new Promise(rr => setTimeout(rr, 2500));

  let mcsRes = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s https://eco-emma.com/api/mcs-check?q=solar 2>&1 | head -c 500"');
  console.log("MCS:", mcsRes.substring(0, 350));
  
  // Full test
  for (const ep of ["health","weather","briefing","tenders","mcs-check?q=Solar","epc-check?q=SK74RP"]) {
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
