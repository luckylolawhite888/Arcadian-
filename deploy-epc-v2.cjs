#!/usr/bin/env node
/**
 * EPC Area Insights — Deploy Step-by-Step (v2)
 * Handles chunked base64 upload to avoid shell arg limits.
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const IONOS_GATEWAY = '212.227.93.74';
const IONOS_VPS = '212.227.38.78';
const IONOS_KEY = '/home/node/.ssh/ionos_ubuntu';
const SSH_PASSWORD = '3v3fUeTROhIl4n';

function ssh(cmd) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      // Escape single quotes for the ssh command
      const escaped = cmd.replace(/'/g, "'\\''");
      const full = `sshpass -p "${SSH_PASSWORD}" ssh -o StrictHostKeyChecking=no root@${IONOS_VPS} '${escaped}'`;
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

async function writeBase64ToVPS(b64data, remotePath) {
  // Write base64 in chunks to avoid shell arg length limits
  const CHUNK_SIZE = 3000;
  let offset = 0;
  let first = true;
  
  while (offset < b64data.length) {
    const chunk = b64data.slice(offset, offset + CHUNK_SIZE);
    const cmd = first 
      ? `echo '${chunk}' > /tmp/epc_b64.tmp`
      : `echo '${chunk}' >> /tmp/epc_b64.tmp`;
    const res = await ssh(cmd);
    if (res && res.trim()) console.log(`  chunk ${Math.floor(offset/CHUNK_SIZE)}: ${res.trim()}`);
    offset += CHUNK_SIZE;
    first = false;
  }
  
  // Decode
  const res = await ssh(`cat /tmp/epc_b64.tmp | base64 -d > ${remotePath} && rm /tmp/epc_b64.tmp`);
  if (res && res.trim()) console.log('  decode:', res.trim());
}

async function main() {
  console.log('=== EPC Area Insights — Step-by-Step Deploy ===\n');
  
  // ── STEP 1: Read current server.js ──
  console.log('1. Reading current server.js...');
  const serverJs = await ssh('cat /var/www/api/server.js');
  console.log(`   Size: ${serverJs.length} bytes`);
  
  // ── STEP 2: Build updated server.js ──
  console.log('2. Building updated server.js with EPC route...');
  
  // The EPC route handler — minified to match existing style
  const epcRouteCode = `
/* === EPC AREA INSIGHTS === */
app.get('/api/epc-check', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().replace(/\\s+/g, '');
    if (!q) return res.json({ postcode: '', total: 0, breakdown: {}, targetProperties: 0, targetPercent: '0%', avgScore: 0, recentCertificates: [] });
    const ratings = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 };
    const results = [];
    const base = 'https://find-energy-certificate.service.gov.uk';
    const url = base + '/find-a-certificate/search-by-postcode?property_type=domestic&lang=en&postcode=' + encodeURIComponent(q);
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'Accept': 'text/html,application/xhtml+xml' } });
    const html = await r.text();
    if (html.includes('No results for') || html.includes('no results')) return res.json({ postcode: q.toUpperCase(), total: 0, breakdown: ratings, targetProperties: 0, targetPercent: '0%', avgScore: 0, recentCertificates: [] });
    const rowRegex = /<tr class="govuk-table__row">([\\s\\S]*?)<\\/tr>/g;
    let match;
    let totalRows = 0;
    while ((match = rowRegex.exec(html)) !== null) {
      const row = match[1];
      const addrMatch = row.match(/<a[^>]*>([^<]+)<\\/a>/);
      const ratingMatch = row.match(/<td class="govuk-table__cell">([A-G])<\\/td>/);
      const linkMatch = row.match(/href="([^"]+)"/);
      if (ratingMatch) {
        const rt = ratingMatch[1];
        if (ratings[rt] !== undefined) { ratings[rt]++; totalRows++; if (addrMatch) results.push({ address: addrMatch[1].trim(), rating: rt, link: linkMatch ? linkMatch[1] : '' }); }
      }
    }
    let totalScore = 0;
    let certWithScores = 0;
    const certPromises = results.slice(0, 5).map(async (cert) => {
      try {
        const cr = await fetch(base + cert.link, { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'Accept': 'text/html,application/xhtml+xml' } });
        const chtml = await cr.text();
        const sMatch = chtml.match(/score of ([0-9]+)/);
        const dMatch = chtml.match(/Date of certificate:<\\/dt>\\s*<dd[^>]*>([^<]+)<\\/dd>/);
        if (sMatch) { cert.score = parseInt(sMatch[1]); totalScore += cert.score; certWithScores++; }
        if (dMatch) { cert.date = dMatch[1].trim(); }
        return cert;
      } catch (e) { return cert; }
    });
    const certResults = await Promise.all(certPromises);
    const target = (ratings.D || 0) + (ratings.E || 0) + (ratings.F || 0) + (ratings.G || 0);
    const pct = totalRows > 0 ? ((target / totalRows) * 100).toFixed(1) + '%' : '0%';
    const avg = totalRows > 0 ? Math.round(totalScore / Math.max(1, certWithScores)) : 0;
    res.json({ postcode: q.toUpperCase(), total: totalRows, breakdown: ratings, targetProperties: target, targetPercent: pct, avgScore: avg, recentCertificates: certResults.slice(0, 10) });
  } catch (e) {
    res.json({ postcode: req.query.q || '', total: 0, breakdown: {}, targetProperties: 0, targetPercent: '0%', avgScore: 0, recentCertificates: [], error: e.message });
  }
});
`;
  
  const marker = "app.listen(PORT);console.log('Emma API on port '+PORT);";
  const idx = serverJs.lastIndexOf(marker);
  if (idx === -1) throw new Error('Cannot find app.listen marker');
  
  // Minify the epc route (remove extra whitespace, keep as one compact line like existing code)
  const minifiedRoute = epcRouteCode
    .replace(/\/\*.*?\*\//g, '') // remove comments
    .replace(/\n\s*/g, '') // collapse whitespace
    .replace(/;\s*}/g, ';}') // fix semicolons before closing braces
    .replace(/\s{2,}/g, ' ') // collapse multiple spaces
    .trim();
  
  const newServer = serverJs.slice(0, idx) + '\n' + minifiedRoute + '\n' + serverJs.slice(idx);
  
  console.log(`   New server.js size: ${newServer.length} bytes`);
  
  // ── STEP 3: Upload server.js ──
  console.log('3. Uploading server.js...');
  const b64server = Buffer.from(newServer, 'utf8').toString('base64');
  console.log(`   Base64 size: ${b64server.length} chars`);
  await writeBase64ToVPS(b64server, '/var/www/api/server.js');
  
  // Verify
  const refCount = await ssh('grep -c "epc-check" /var/www/api/server.js');
  console.log(`   epc-check references in server.js: ${refCount.trim()}`);
  
  // ── STEP 4: Update index.v2.html ──
  console.log('\n4. Reading index.v2.html...');
  const html = await ssh('cat /var/www/emma/index.v2.html');
  console.log(`   Size: ${html.length} bytes`);
  
  let updatedHtml = html;
  
  // 4a. Add CSS styles after MCS styles
  const epcCSS = `
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
  
  updatedHtml = updatedHtml.replace(
    '.mcs-installer-card:hover{background:var(--ink-2)!important}',
    epcCSS + '.mcs-installer-card:hover{background:var(--ink-2)!important}'
  );
  
  // 4b. Add sidebar nav item after MCS Check
  updatedHtml = updatedHtml.replace(
    `MCS Check\n    </button>`,
    `MCS Check
    </button>
    <button class="nav-item" data-page="epc-check" onclick="nav('epc-check',this)">
      <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      EPC Check
    </button>`
  );
  
  // 4c. Add API entry
  updatedHtml = updatedHtml.replace(
    "mcsCheck:    '/api/mcs-check',",
    `mcsCheck:    '/api/mcs-check',
  epcCheck:    '/api/epc-check',`
  );
  
  // 4d. Add TITLES entry
  updatedHtml = updatedHtml.replace(
    "'mcs-check':  ['OPS / 10','MCS Installer Check'],",
    `'mcs-check':  ['OPS / 10','MCS Installer Check'],
  'epc-check':  ['OPS / 11','EPC Area Insights'],`
  );
  
  // 4e. Add nav routing
  updatedHtml = updatedHtml.replace(
    "if(id==='mcs-check' && typeof loadMCSCheck==='function'){ var si=document.getElementById('mcsSearchInput'); if(si&&si.value.trim()) loadMCSCheck(); }",
    "if(id==='mcs-check' && typeof loadMCSCheck==='function'){ var si=document.getElementById('mcsSearchInput'); if(si&&si.value.trim()) loadMCSCheck(); }\n  if(id==='epc-check' && typeof loadEPCCheck==='function'){ var si=document.getElementById('epcSearchInput'); if(si&&si.value.trim()) loadEPCCheck(); }"
  );
  
  // 4f. Add page section before Daily Briefing section
  const epcPage = `
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
  
  updatedHtml = updatedHtml.replace(
    '<!-- ============ 6. DAILY BRIEFING ============ -->',
    epcPage
  );
  
  // 4g. Add loadEPCCheck function before DOMContentLoaded
  const epcFn = `
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
    // Summary cards
    var summary='<div class="epc-summary-grid">'+
      '<div class="epc-stat-card"><div class="stat-val">'+total+'</div><div class="stat-label">Properties with EPC</div></div>'+
      '<div class="epc-stat-card"><div class="stat-val">'+d.avgScore+'</div><div class="stat-label">Avg Energy Score</div></div>'+
      '<div class="epc-stat-card"><div class="stat-val" style="color:'+(d.avgScore>=69?'#22c55e':d.avgScore>=55?'#f39c12':'#e74c3c')+'">'+(d.avgScore>=69?'C+':d.avgScore>=55?'D':'E-')+'</div><div class="stat-label">Avg Rating Equivalent</div></div>'+
    '</div>';
    // Rating chart bars
    var chart='<div style="font-size:14px;font-weight:600;margin:16px 0 8px">Rating Distribution</div><div class="epc-chart-wrap">';
    var ratings=['A','B','C','D','E','F','G'];
    for(var i=0;i<ratings.length;i++){
      var r2=ratings[i];var cnt=b[r2]||0;var ht=Math.max(4,(cnt/maxBar)*100);
      chart+='<div class="epc-bar epc-bar-'+r2+'" style="height:'+ht+'px"><span class="bar-count">'+cnt+'</span><span class="bar-label">'+r2+'</span></div>';
    }
    chart+='</div>';
    // Solar opportunity card
    var solar='<div class="epc-solar-card">'+
      '<div style="font-size:28px;margin-bottom:4px">\\ud83c\\udfaf</div>'+
      '<div class="big-num">'+d.targetProperties+'</div>'+
      '<div class="big-label">Solar Opportunity Properties</div>'+
      '<div class="sub">'+d.targetPercent+' of properties are rated D\\u2013G \\u2014 best candidates for solar installation</div>'+
    '</div>';
    // Recent certificates list
    var certs='<div style="font-size:14px;font-weight:600;margin:12px 0 8px">Recent Certificates</div>';
    if(d.recentCertificates&&d.recentCertificates.length){
      certs+='<div class="epc-cert-list">';
      for(var i=0;i<d.recentCertificates.length;i++){
        var c=d.recentCertificates[i];
        var scoreStr=c.score?' \\u00b7 Score: '+c.score:'';
        var dateStr=c.date?' \\u00b7 '+c.date:'';
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
  
  updatedHtml = updatedHtml.replace(
    'document.addEventListener("DOMContentLoaded",function(){',
    epcFn + '\ndocument.addEventListener("DOMContentLoaded",function(){'
  );
  
  // 4h. Add enter key listener inside DOMContentLoaded
  updatedHtml = updatedHtml.replace(
    'var inp=document.getElementById("mcsSearchInput");\n  if(inp) inp.addEventListener("keydown",function(e){if(e.key==="Enter")loadMCSCheck();});',
    'var inp=document.getElementById("mcsSearchInput");\n  if(inp) inp.addEventListener("keydown",function(e){if(e.key==="Enter")loadMCSCheck();});\n  var ep=document.getElementById("epcSearchInput");\n  if(ep) ep.addEventListener("keydown",function(e){if(e.key==="Enter")loadEPCCheck();});'
  );
  
  // ── STEP 5: Upload index.v2.html ──
  console.log('5. Uploading index.v2.html...');
  const b64html = Buffer.from(updatedHtml, 'utf8').toString('base64');
  console.log(`   Base64 size: ${b64html.length} chars`);
  await writeBase64ToVPS(b64html, '/var/www/emma/index.v2.html');
  
  // Verify
  const refCount2 = await ssh('grep -c "epc-check\\|epcSearchInput\\|loadEPCCheck" /var/www/emma/index.v2.html');
  console.log(`   EPC references in HTML: ${refCount2.trim()}`);
  
  // ── STEP 6: Restart PM2 ──
  console.log('\n6. Restarting PM2...');
  const pm2res = await ssh('pm2 restart all');
  console.log('   ' + pm2res.trim().split('\n').slice(0, 2).join('\n   '));
  
  // ── STEP 7: Test ──
  console.log('\n7. Testing endpoint...\n');
  const testRes = await ssh(`curl -s -A "Mozilla/5.0" "http://localhost:3100/api/epc-check?q=SK74RP"`);
  try {
    const j = JSON.parse(testRes);
    console.log(`   Postcode: ${j.postcode}`);
    console.log(`   Total: ${j.total}`);
    console.log(`   Breakdown: ${JSON.stringify(j.breakdown)}`);
    console.log(`   Target (D-G): ${j.targetProperties} (${j.targetPercent})`);
    console.log(`   Avg Score: ${j.avgScore}`);
    console.log(`   Recent certs: ${(j.recentCertificates || []).length}`);
    if (j.recentCertificates && j.recentCertificates.length) {
      console.log(`   First cert: ${j.recentCertificates[0].address} - ${j.recentCertificates[0].rating}${j.recentCertificates[0].score ? ' (' + j.recentCertificates[0].score + ')' : ''}`);
    }
    console.log('\n   ✅ EPC endpoint working!');
  } catch (e) {
    console.log(`   ⚠️  Parse error: ${e.message}`);
    console.log(`   Raw: ${testRes.substring(0, 300)}`);
  }
  
  console.log('\n=== Deployment Complete ===');
}

main().catch(e => {
  console.error('\nFATAL:', e);
  process.exit(1);
});
