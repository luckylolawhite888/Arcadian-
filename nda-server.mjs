const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HTML_PATH = '/var/www/proposal/index.html';
const NDAS_DIR = '/var/www/ndas/signed';
const PORT = 3099;

// Ensure NDA directory exists
try { fs.mkdirSync(NDAS_DIR, { recursive: true }); } catch(e) {}

// Read the original proposal HTML
let PROPOSAL_HTML = '';
try { PROPOSAL_HTML = fs.readFileSync(HTML_PATH, 'utf-8'); } catch(e) {
  console.error('Could not read proposal HTML:', e.message);
  process.exit(1);
}

// NDA gate HTML (served before signing)
const NDA_GATE = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>Confidential Proposal — NDA Required</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#050505;--fg:#f0f0f0;--accent:#f57c00;--card:#0a0a0a;--border:#1a1a1a;--dim:#555}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;background:var(--bg);color:var(--fg);min-height:100dvh;display:flex;flex-direction:column;padding:40px 20px}
.wrap{max-width:520px;margin:0 auto;width:100%;display:flex;flex-direction:column;justify-content:center;flex:1}
h1{font-size:1.6rem;font-weight:900;margin-bottom:4px}
h1 span{color:var(--accent)}
.sub{color:var(--dim);font-size:.82rem;margin-bottom:24px;line-height:1.6}
.box{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:18px;margin-bottom:16px}
.box h3{font-size:.85rem;font-weight:700;margin-bottom:8px;color:var(--accent)}
.box p{font-size:.72rem;color:#999;line-height:1.7;margin-bottom:8px}
.box p:last-child{margin-bottom:0}
.box p strong{color:var(--fg)}
label{display:block;font-size:.72rem;color:var(--dim);margin-bottom:4px;margin-top:12px}
label:first-of-type{margin-top:0}
input{width:100%;padding:8px 10px;background:#0d0d0d;border:1px solid var(--border);border-radius:6px;color:var(--fg);font-size:.85rem;outline:none}
input:focus{border-color:var(--accent)}
.sig-row{display:flex;align-items:center;gap:10px;margin-top:12px}
.sig-row input{flex:1}
.sig-row span{font-size:.65rem;color:var(--dim);font-family:serif;font-style:italic}
.btn{display:block;width:100%;padding:12px;background:var(--accent);color:#000;border:none;border-radius:8px;font-weight:700;font-size:.9rem;cursor:pointer;margin-top:8px;text-align:center}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn:hover:not(:disabled){opacity:.9}
.err{color:#e53935;font-size:.72rem;margin-top:6px;display:none}
.sec{font-size:.6rem;color:var(--dim);text-align:center;margin-top:16px}
.ndt{display:none;text-align:center;padding:40px 0}
.ndt .ck{font-size:2rem;margin-bottom:8px}
.ndt p{color:#4caf50;font-weight:600;font-size:.9rem}
@media(max-width:480px){body{padding:20px 14px}}
</style>
</head>
<body>
<div class="wrap">
<h1>Confidential <span>Proposal</span></h1>
<p class="sub">This proposal contains proprietary business information including platform architecture, pricing methodology, and operational systems. Please review and sign the non-disclosure agreement below to continue.</p>
<div class="box" id="nda-box">
<h3>📄 Non-Disclosure Agreement</h3>
<p><strong>Between:</strong> Arcadian Maya (trading as The New World Order) and the undersigned recipient.</p>
<p><strong>Purpose:</strong> Evaluation of a commercial solar + carbon credit intelligence platform.</p>
<p>The recipient agrees to hold in strict confidence all proprietary information shared in this proposal, including but not limited to: platform architecture, pricing models, lead generation methodology, carbon credit sourcing strategies, and associated business processes. This information shall not be shared with any third party without prior written consent.</p>
<p>This agreement is governed by the laws of England and Wales. Breach may result in legal action and financial damages.</p>
<label>Full Name *</label>
<input type="text" id="fn" placeholder="e.g. John Smith" autocomplete="off">
<label>Email Address *</label>
<input type="email" id="em" placeholder="e.g. john@company.com" autocomplete="off">
<label>Company *</label>
<input type="text" id="co" placeholder="e.g. Green Planet Makers" autocomplete="off">
<div class="sig-row">
<input type="text" id="sg" placeholder="Type your full name to sign" autocomplete="off">
<span>— (signed)</span>
</div>
<p id="er" class="err"></p>
<button class="btn" id="sb" onclick="s()">✍️ Sign &amp; View Proposal</button>
</div>
<div class="ndt" id="ndt">
<div class="ck">✅</div>
<p>NDA Signed — Loading proposal...</p>
</div>
<p class="sec">Your information is stored securely. A signed copy will be sent to your email.</p>
</div>
<script>
function s(){
  var fn=document.getElementById('fn').value.trim();
  var em=document.getElementById('em').value.trim();
  var co=document.getElementById('co').value.trim();
  var sg=document.getElementById('sg').value.trim();
  var er=document.getElementById('er');
  if(!fn||!em||!co||!sg){er.textContent='Please fill in all fields including your signature.';er.style.display='block';return;}
  if(!em.includes('@')||!em.includes('.')){er.textContent='Please enter a valid email address.';er.style.display='block';return;}
  if(sg.toLowerCase()!==fn.toLowerCase()){er.textContent='Your signature must match your full name.';er.style.display='block';return;}
  er.style.display='none';
  document.getElementById('sb').disabled=true;
  document.getElementById('sb').textContent='Submitting...';
  var x=new XMLHttpRequest();
  x.open('POST','/nda-sign',true);
  x.setRequestHeader('Content-Type','application/json');
  x.onload=function(){
    if(x.status===200){
      document.getElementById('nda-box').style.display='none';
      document.getElementById('ndt').style.display='block';
      setTimeout(function(){window.location.href='/proposal?t='+encodeURIComponent(JSON.parse(x.responseText).token);},1200);
    }else{
      document.getElementById('sb').disabled=false;
      document.getElementById('sb').textContent='✍️ Sign & View Proposal';
      try{er.textContent=JSON.parse(x.responseText).error;}catch(e){er.textContent='Something went wrong. Please try again.';}
      er.style.display='block';
    }
  };
  x.onerror=function(){er.textContent='Network error. Please try again.';er.style.display='block';document.getElementById('sb').disabled=false;document.getElementById('sb').textContent='✍️ Sign & View Proposal';};
  x.send(JSON.stringify({name:fn,email:em,company:co,signature:sg}));
}
</script>
</body>
</html>`;

// --- Server ---
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // --- NDA sign endpoint ---
  if (pathname === '/nda-sign' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const d = JSON.parse(body);
        if (!d.name || !d.email || !d.company || !d.signature) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'All fields required' }));
        }
        if (d.signature.toLowerCase() !== d.name.toLowerCase()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Signature must match your name' }));
        }

        // Generate token
        const token = crypto.createHash('sha256').update(d.email + d.name + Date.now()).digest('hex').slice(0, 32);
        const timestamp = new Date().toISOString();

        // Save signed NDA
        const record = { ...d, signedAt: timestamp, token, ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress };
        const filename = d.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now() + '.json';
        fs.writeFileSync(path.join(NDAS_DIR, filename), JSON.stringify(record, null, 2));

        // Generate HTML receipt
        const receipt = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>NDA Signed</title><style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:0 20px;background:#f9f9f9;color:#222}pre{background:#eee;padding:12px;border-radius:6px;overflow:auto;font-size:.8rem}.d{text-align:center;margin-bottom:30px}h1{color:#222}</style></head><body><div class="d"><h1>📄 NDA Signed</h1><p style="color:#555">${new Date(timestamp).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p></div><p><strong>Signed by:</strong> ${d.name}</p><p><strong>Company:</strong> ${d.company}</p><p><strong>Email:</strong> ${d.email}</p><p><strong>Reference:</strong> ${token.slice(0,8)}</p><pre>NON-DISCLOSURE AGREEMENT\n\nBetween: Arcadian Maya (trading as The New World Order)\nand: ${d.name} (${d.company})\n\nDate: ${timestamp}\n\nThe recipient agrees to hold in strict confidence all proprietary information shared in the proposal provided by the disclosing party. This includes but is not limited to: platform architecture, pricing models, lead generation methodology, carbon credit sourcing strategies, and associated business processes.\n\nThis agreement is governed by the laws of England and Wales.</pre></body></html>`;
        fs.writeFileSync(path.join(NDAS_DIR, filename.replace('.json', '_receipt.html')), receipt);

        // Save a simple session-like token file for verification
        fs.writeFileSync(`/var/www/ndas/tokens/${token}.json`, JSON.stringify({ name: d.name, email: d.email, company: d.company, signedAt: timestamp }));

        console.log(`✅ NDA signed: ${d.name} (${d.company})`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token, name: d.name }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // --- Token verification ---
  if (pathname === '/verify-token') {
    const token = url.searchParams.get('t');
    if (!token) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ valid: false }));
    }
    try {
      const data = JSON.parse(fs.readFileSync(`/var/www/ndas/tokens/${token}.json`, 'utf-8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: true, name: data.name, company: data.company }));
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: false }));
    }
    return;
  }

  // --- Serve proposal (with token check) ---
  if (pathname === '/proposal') {
    const token = url.searchParams.get('t');
    if (!token) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }
    // Verify token
    try {
      const data = JSON.parse(fs.readFileSync(`/var/www/ndas/tokens/${token}.json`, 'utf-8'));
      // Inject signed-by info into the proposal
      let html = PROPOSAL_HTML;
      // Add a subtle signed-in indicator
      html = html.replace('</head>', `<meta name="signed-by" content="${data.name} (${data.company})">\n</head>`);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(html);
    } catch (e) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }
  }

  // --- Root: serve NDA gate ---
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(NDA_GATE);
});

// Create tokens directory
try { fs.mkdirSync('/var/www/ndas/tokens', { recursive: true }); } catch(e) {}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`NDA proposal server running on port ${PORT}`);
});
