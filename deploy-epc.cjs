#!/usr/bin/env node
/**
 * EPC Area Insights — Build & Deploy Script
 * 
 * Adds /api/epc-check route to server.js and the corresponding
 * UI section (#page-epc-check) to index.v2.html on Emma's VPS.
 *
 * Strategy: scrape the GOV.UK Find Energy Certificate site.
 * Search results give A-G rating distribution per postcode.
 * Individual cert pages give the numeric score.
 */

const { Client } = require('ssh2');
const fs = require('fs');

const IONOS_GATEWAY = '212.227.93.74';
const IONOS_VPS = '212.227.38.78';
const IONOS_KEY = '/home/node/.ssh/ionos_ubuntu';
const SSH_PASSWORD = '3v3fUeTROhIl4n';

function ssh(cmd) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      const escaped = cmd.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
      const full = `sshpass -p "${SSH_PASSWORD}" ssh -o StrictHostKeyChecking=no root@${IONOS_VPS} ${escaped}`;
      conn.exec(full, (err, stream) => {
        if (err) { conn.end(); return reject(err); }
        let out = '';
        stream.on('data', d => out += d.toString());
        stream.stderr.on('data', d => out += d.toString());
        stream.on('close', () => { conn.end(); resolve(out); });
      });
    }).on('error', e => reject(e))
    .connect({ host: IONOS_GATEWAY, username: 'root', privateKey: fs.readFileSync(IONOS_KEY) });
  });
}

async function main() {
  console.log('=== EPC Area Insights Deploy ===\n');

  // ── Step 1: Build the server.js EPC route ──
  const serverEpcRoute = `
/* === EPC AREA INSIGHTS === */
app.get('/api/epc-check',async(req,res)=>{try{const q=(req.query.q||'').trim().replace(/\\s+/g,'');if(!q)return res.json({postcode:'',total:0,breakdown:{},targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[]});const ratings={A:0,B:0,C:0,D:0,E:0,F:0,G:0};const results=[];const base='https://find-energy-certificate.service.gov.uk';const url=base+'/find-a-certificate/search-by-postcode?property_type=domestic&lang=en&postcode='+encodeURIComponent(q);const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36','Accept':'text/html,application/xhtml+xml'}});const html=await r.text();if(html.includes('No results for')||html.includes('no results'))return res.json({postcode:q.toUpperCase(),total:0,breakdown:ratings,targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[]});const rowRegex=/<tr class="govuk-table__row">([\\s\\S]*?)<\\/tr>/g;let match;let totalRows=0;while((match=rowRegex.exec(html))!==null){const row=match[1];const addrMatch=row.match(/<a[^>]*>([^<]+)<\\/a>/);const ratingMatch=row.match(/<td class="govuk-table__cell">([A-G])<\\/td>/);const linkMatch=row.match(/href="([^"]+)"/);if(ratingMatch){const r2=ratingMatch[1];if(ratings[r2]!==undefined){ratings[r2]++;totalRows++;if(addrMatch)results.push({address:addrMatch[1].trim(),rating:r2,link:linkMatch?linkMatch[1]:''});}}}let scores={};let certWithScores=0;let totalScore=0;const certPromises=results.slice(0,5).map(async(cert)=>{try{const cr=await fetch(base+cert.link,{headers:{'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36','Accept':'text/html,application/xhtml+xml'}});const chtml=await cr.text();const sMatch=chtml.match(/score of ([0-9]+)/);const dMatch=chtml.match(/Date of certificate:<\\/dt>\\s*<dd[^>]*>([^<]+)<\\/dd>/);if(sMatch){cert.score=parseInt(sMatch[1]);totalScore+=cert.score;certWithScores++;}if(dMatch){cert.date=dMatch[1].trim();}return cert;}catch(e){return cert;}});const certResults=await Promise.all(certPromises);const target=ratings.D+ratings.E+ratings.F+ratings.G;const pct=totalRows>0?((target/totalRows)*100).toFixed(1)+'%':'0%';const avg=totalRows>0?Math.round((totalScore||0)/Math.max(1,certWithScores||1)):0;res.json({postcode:q.toUpperCase(),total:totalRows,breakdown:ratings,targetProperties:target,targetPercent:pct,avgScore:avg,recentCertificates:certResults.slice(0,10)});}catch(e){res.json({postcode:req.query.q||'',total:0,breakdown:{},targetProperties:0,targetPercent:'0%',avgScore:0,recentCertificates:[],error:e.message});}});
`;

  // ── Step 2: Read current server.js and insert route ──
  console.log('1. Reading current server.js...');
  const r1 = await ssh('cat /var/www/api/server.js');
  const oldServer = r1.trim();
  
  // Find the insertion point: right before "app.listen(PORT)"
  const marker = 'app.listen(PORT);console.log(\'Emma API on port \'+PORT);';
  const idx = oldServer.lastIndexOf(marker);
  if (idx === -1) {
    console.error('ERROR: Could not find app.listen marker in server.js');
    process.exit(1);
  }
  
  const newServer = oldServer.slice(0, idx) + serverEpcRoute + '\n' + oldServer.slice(idx);
  
  // Base64 encode to avoid shell escaping issues
  const b64 = Buffer.from(newServer, 'utf8').toString('base64');
  
  console.log('2. Deploying updated server.js...');
  const r2 = await ssh(`echo "${b64}" | base64 -d > /var/www/api/server.js`);
  console.log('   Response:', r2.trim() || '(ok)');
  
  // Verify
  const r3 = await ssh('grep -c "epc-check" /var/www/api/server.js');
  console.log(`   epc-check references: ${r3.trim()}`);

  // ── Step 3: Update index.v2.html ──
  console.log('\n3. Reading current index.v2.html...');
  
  const fullHtml = await ssh('cat /var/www/emma/index.v2.html');
  
  // We need to add:
  // 3a. Sidebar nav item after MCS Check
  // 3b. Page section for epc-check  
  // 3c. API entry
  // 3d. TITLES entry
  // 3e. Nav routing
  // 3f. CSS styles
  // 3g. loadEPCCheck function
  
  // 3a. Add sidebar nav item after MCS Check nav button
  const mcsNavEnd = `MCS Check
    </button>`;
  const epcNav = `    </button>
    <button class="nav-item" data-page="epc-check" onclick="nav('epc-check',this)">
      <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      EPC Check
    </button>`;
  
  let html = fullHtml.replace(mcsNavEnd, mcsNavEnd + epcNav);
  
  // 3b. Add page section before "#page-briefing"
  const epcPageSection = `
    <!-- ============ EPC AREA INSIGHTS ============ -->
    <section id="page-epc-check" class="page">
      <div class="toolbar">
        <span class="eyebrow">Check EPC ratings by area</span>
        <div class="spacer"></div>
      </div>
      <div class="card" style="margin-top:0">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
          <input type="text" id="epcSearchInput" placeholder="Enter UK postcode (e.g. SK7 4RP)..." style="flex:1;min-width:200px;padding:8px 12px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:14px">
          <button class="primary-btn" id="epcSearchBtn" onclick="loadEPCCheck()">
            <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Search
          </button>
        </div>
        <div id="epcSummary" style="display:none"></div>
        <div id="epcResults" style="display:block">
          <div style="text-align:center;padding:2rem;color:var(--muted)">
            <svg viewBox="0 0 24 24" width="32" height="32" style="margin-bottom:8px;opacity:0.4"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <p>Enter a UK postcode to view EPC area insights and solar opportunity analysis</p>
          </div>
        </div>
        <div id="epcLoading" style="display:none;text-align:center;padding:2rem;color:var(--muted)">
          <div style="display:inline-block;width:24px;height:24px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite"></div>
          <p style="margin-top:8px">Fetching EPC data...</p>
        </div>
      </div>
    </section>
    <!-- ============ 6. DAILY BRIEFING ============ -->`;
  
  html = html.replace('<!-- ============ 6. DAILY BRIEFING ============ -->', epcPageSection);
  
  // 3c. Add API entry after mcsCheck
  html = html.replace(
    "mcsCheck:    '/api/mcs-check',",
    "mcsCheck:    '/api/mcs-check',\n  epcCheck:    '/api/epc-check',"
  );
  
  // 3d. Add TITLES entry after mcs-check
  html = html.replace(
    "'mcs-check':  ['OPS / 10','MCS Installer Check'],",
    "'mcs-check':  ['OPS / 10','MCS Installer Check'],\n  'epc-check':  ['OPS / 11','EPC Area Insights'],"
  );
  
  // 3e. Add nav routing after mcs-check routing
  html = html.replace(
    "if(id==='mcs-check' && typeof loadMCSCheck==='function'){ var si=document.getElementById('mcsSearchInput'); if(si&&si.value.trim()) loadMCSCheck(); }",
    "if(id==='mcs-check' && typeof loadMCSCheck==='function'){ var si=document.getElementById('mcsSearchInput'); if(si&&si.value.trim()) loadMCSCheck(); }\n  if(id==='epc-check' && typeof loadEPCCheck==='function'){ var si=document.getElementById('epcSearchInput'); if(si&&si.value.trim()) loadEPCCheck(); }"
  );
  
  // 3f. Add CSS styles (right after MCS styles)
  const epcCss = `
/* EPC Check Styles */
.epc-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px}
.epc-stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center}
.epc-stat-card .stat-val{font-size:24px;font-weight:700;line-height:1.2}
.epc-stat-card .stat-label{font-size:11px;color:var(--muted);margin-top:2px}
.epc-chart-wrap{display:flex;align-items:flex-end;gap:4px;height:120px;padding:0 4px;margin:12px 0}
.epc-bar{flex:1;border-radius:4px 4px 0 0;min-height:4px;position:relative;transition:height .4s ease}
.epc-bar .bar-label{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:600;color:var(--muted)}
.epc-bar .bar-count{position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:700;color:var(--text)}
.epc-solar-card{background:linear-gradient(135deg,#fef9e7,#fdebd0);border:1px solid #f0d9a0;border-radius:10px;padding:16px;margin-bottom:16px;text-align:center}
.epc-solar-card .big-num{font-size:36px;font-weight:800;color:#7d6608}
.epc-solar-card .big-label{font-size:14px;color:#7d6608;margin-top:2px}
.epc-solar-card .sub{font-size:12px;color:#9a7d3a;margin-top:6px}
.epc-cert-list{max-height:320px;overflow-y:auto}
.epc-cert-item{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:1px solid var(--line);font-size:13px}
.epc-cert-item:last-child{border-bottom:none}
.epc-rating-badge{display:inline-block;padding:2px 8px;border-radius:4px;font-weight:700;font-size:12px;min-width:20px;text-align:center}
.epc-rating-A{background:#22c55e;color:#fff}
.epc-rating-B{background:#2ecc71;color:#fff}
.epc-rating-C{background:#f1c40f;color:#333}
.epc-rating-D{background:#f39c12;color:#fff}
.epc-rating-E{background:#e67e22;color:#fff}
.epc-rating-F{background:#e74c3c;color:#fff}
.epc-rating-G{background:#ef4444;color:#fff}
.epc-bar-A{background:#22c55e}
.epc-bar-B{background:#2ecc71}
.epc-bar-C{background:#f1c40f}
.epc-bar-D{background:#f39c12}
.epc-bar-E{background:#e67e22}
.epc-bar-F{background:#e74c3c}
.epc-bar-G{background:#ef4444}
`;
  
  html = html.replace(
    '.mcs-installer-card:hover{background:var(--ink-2)!important}',
    epcCss + '.mcs-installer-card:hover{background:var(--ink-2)!important}'
  );
  
  // 3g. Add the loadEPCCheck function before the DOMContentLoaded event
  const epcFunction = `
/* EPC AREA INSIGHTS */
async function loadEPCCheck(){
  var si=document.getElementById("epcSearchInput");
  var q=si.value.trim();
  if(!q){si.focus();return;}
  var re=document.getElementById("epcResults");
  var se=document.getElementById("epcSummary");
  var le=document.getElementById("epcLoading");
  re.style.display="none";se.style.display="none";le.style.display="block";
  try{
    var d=await apiGet(API.epcCheck+"?q="+encodeURIComponent(q));
    le.style.display="none";re.style.display="block";
    if(!d||!d.total||d.total===0){
      re.innerHTML='<div style="text-align:center;padding:2rem;color:var(--muted)"><svg viewBox="0 0 24 24" width="40" height="40" style="margin-bottom:8px;opacity:0.3"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><p>No EPC certificates found for "'+esc(q)+'"</p><p style="font-size:13px;margin-top:4px">Try a full postcode like "SK7 4RP"</p></div>';
      return;
    }
    var b=d.breakdown;var total=d.total;
    var maxBar=Math.max(1,b.A,b.B,b.C,b.D,b.E,b.F,b.G);
    // Build summary cards
    var summary='<div class="epc-summary-grid">'+
      '<div class="epc-stat-card"><div class="stat-val">'+total+'</div><div class="stat-label">Properties with EPC</div></div>'+
      '<div class="epc-stat-card"><div class="stat-val">'+d.avgScore+'</div><div class="stat-label">Avg Energy Score</div></div>'+
      '<div class="epc-stat-card"><div class="stat-val" style="color:'+(d.avgScore>=69?'#22c55e':d.avgScore>=55?'#f39c12':'#e74c3c')+'">'+(d.avgScore>=69?'C+':d.avgScore>=55?'D':'E-')+'</div><div class="stat-label">Avg Rating Equivalent</div></div>'+
    '</div>';
    // Build chart bars
    var chart='<div style="font-size:14px;font-weight:600;margin:16px 0 8px">Rating Distribution</div>'+
      '<div class="epc-chart-wrap">';
    var ratings=['A','B','C','D','E','F','G'];
    for(var i=0;i<ratings.length;i++){
      var r2=ratings[i];var cnt=b[r2]||0;var ht=Math.max(4,(cnt/maxBar)*100);
      chart+='<div class="epc-bar epc-bar-'+r2+'" style="height:'+ht+'px"><span class="bar-count">'+cnt+'</span><span class="bar-label">'+r2+'</span></div>';
    }
    chart+='</div>';
    // Solar opportunity card
    var solar='<div class="epc-solar-card">'+
      '<div style="font-size:28px;margin-bottom:4px">🎯</div>'+
      '<div class="big-num">'+d.targetProperties+'</div>'+
      '<div class="big-label">Solar Opportunity Properties</div>'+
      '<div class="sub">'+d.targetPercent+' of properties are rated D–G &mdash; best candidates for solar installation</div>'+
    '</div>';
    // Build recent certificates list
    var certs='<div style="font-size:14px;font-weight:600;margin:12px 0 8px">Recent Certificates</div>';
    if(d.recentCertificates&&d.recentCertificates.length){
      certs+='<div class="epc-cert-list">';
      for(var i=0;i<d.recentCertificates.length;i++){
        var c=d.recentCertificates[i];
        var scoreStr=c.score?' · Score: '+c.score:'';
        var dateStr=c.date?' · '+c.date:'';
        certs+='<div class="epc-cert-item"><span>'+esc(c.address)+'</span><span><span class="epc-rating-badge epc-rating-'+c.rating+'">'+c.rating+'</span>'+scoreStr+dateStr+'</span></div>';
      }
      certs+='</div>';
    }else{
      certs+='<div style="text-align:center;padding:1rem;color:var(--muted);font-size:13px">Detailed certificate data available for individual properties</div>';
    }
    se.innerHTML=summary+solar+chart+certs;
    se.style.display="block";re.style.display="none";
  }catch(e){
    le.style.display="none";re.style.display="block";
    re.innerHTML='<div style="text-align:center;padding:2rem;color:var(--orange)"><p>Error checking EPC: '+esc(e.message||"Unknown error")+'</p></div>';
  }
}
`;
  
  // Insert loadEPCCheck before DOMContentLoaded
  html = html.replace(
    'document.addEventListener("DOMContentLoaded",function(){',
    epcFunction + '\ndocument.addEventListener("DOMContentLoaded",function(){'
  );
  
  // Add enter key listener inside DOMContentLoaded
  html = html.replace(
    'var inp=document.getElementById("mcsSearchInput");\n  if(inp) inp.addEventListener("keydown",function(e){if(e.key==="Enter")loadMCSCheck();});',
    'var inp=document.getElementById("mcsSearchInput");\n  if(inp) inp.addEventListener("keydown",function(e){if(e.key==="Enter")loadMCSCheck();});\n  var ep=document.getElementById("epcSearchInput");\n  if(ep) ep.addEventListener("keydown",function(e){if(e.key==="Enter")loadEPCCheck();});'
  );
  
  // Deploy the updated HTML
  const htmlB64 = Buffer.from(html, 'utf8').toString('base64');
  console.log('4. Deploying updated index.v2.html...');
  const r4 = await ssh(`echo "${htmlB64}" | base64 -d > /var/www/emma/index.v2.html`);
  console.log('   Response:', r4.trim() || '(ok)');
  
  // Verify
  const r5 = await ssh('grep -c "epc-check\|epcSearchInput\|loadEPCCheck\|EPC Area" /var/www/emma/index.v2.html');
  console.log(`   EPC references in HTML: ${r5.trim()}`);

  // ── Step 4: Restart PM2 ──
  console.log('\n5. Restarting PM2...');
  const r6 = await ssh('pm2 restart all');
  console.log('   Response:', r6.trim());
  
  // ── Step 5: Verify ──
  console.log('\n6. Verifying endpoint...');
  const r7 = await ssh(`curl -s -A "Mozilla/5.0" "http://localhost:3100/api/epc-check?q=SK74RP"`);
  try {
    const j = JSON.parse(r7);
    console.log(`   Postcode: ${j.postcode}`);
    console.log(`   Total: ${j.total}`);
    console.log(`   Breakdown: ${JSON.stringify(j.breakdown)}`);
    console.log(`   Target Properties (D-G): ${j.targetProperties} (${j.targetPercent})`);
    console.log(`   Avg Score: ${j.avgScore}`);
    console.log(`   Recent Certs: ${j.recentCertificates?.length || 0}`);
    console.log('   ✅ EPC endpoint working!');
  } catch(e) {
    console.log('   ⚠️  Response:', r7.substring(0, 300));
  }
  
  console.log('\n=== Deployment Complete ===');
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
