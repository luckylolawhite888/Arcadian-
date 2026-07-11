const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3099;
const HTML_PATH = '/var/www/proposal/index.html';
const NDAS_DIR = '/var/www/ndas/signed';
const TOKENS_DIR = '/var/www/ndas/tokens';

let PROPOSAL_HTML = '';
try { PROPOSAL_HTML = fs.readFileSync(HTML_PATH, 'utf-8'); } catch(e) {
  console.error('Cannot read proposal HTML:', e.message);
  process.exit(1);
}

try { fs.mkdirSync(NDAS_DIR, { recursive: true }); } catch(e) {}
try { fs.mkdirSync(TOKENS_DIR, { recursive: true }); } catch(e) {}

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
.err{color:#e53935;font-size:.78rem;margin-top:8px;padding:8px 10px;background:rgba(229,57,53,0.1);border:1px solid rgba(229,57,53,0.3);border-radius:6px;display:none}
.sec{font-size:.6rem;color:var(--dim);text-align:center;margin-top:16px}
.ndt{display:none;text-align:center;padding:40px 0}
.ndt .ck{font-size:2rem;margin-bottom:8px}
.ndt p{color:#4caf50;font-weight:600;font-size:.9rem}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
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
<button class="btn" id="sb" onclick="s()">✍️ Sign & View Proposal</button>
</div>
<div class="ndt" id="ndt">
<div class="ck">✅</div>
<p>NDA Signed — Loading proposal...</p>
</div>
<p class="sec">Your information is stored securely. A signed copy will be saved on our server.</p>
</div>
<script>
function s(){
  var fn=document.getElementById('fn').value.trim();
  var em=document.getElementById('em').value.trim();
  var co=document.getElementById('co').value.trim();
  var sg=document.getElementById('sg').value.trim();
  var er=document.getElementById('er');
  var erText='';
  if(!fn||!em||!co||!sg){erText='Please fill in all fields including your signature.';}
  else if(!em.includes('@')||!em.includes('.')){erText='Please enter a valid email address.';}
  else if(sg.toLowerCase()!==fn.toLowerCase()){erText='✋ Your typed signature must match your full name exactly.';}
  if(erText){er.textContent=erText;er.style.display='block';er.style.animation='shake 0.3s ease';setTimeout(function(){er.style.animation='';},300);return;}
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
      var d=JSON.parse(x.responseText);
      setTimeout(function(){window.location.href='/proposal?t='+encodeURIComponent(d.token);},1200);
    }else{
      document.getElementById('sb').disabled=false;
      document.getElementById('sb').textContent='✍️ Sign & View Proposal';
      try{
        var r=JSON.parse(x.responseText);
        er.textContent=r.error||'Something went wrong. Please try again.';
      }catch(e){er.textContent='Something went wrong. Please try again.';}
      er.style.display='block';
      er.style.animation='shake 0.3s ease';
      setTimeout(function(){er.style.animation='';},300);
    }
  };
  x.onerror=function(){
    er.textContent='Could not connect to server. Please check your internet.';
    er.style.display='block';
    document.getElementById('sb').disabled=false;
    document.getElementById('sb').textContent='✍️ Sign & View Proposal';
  };
  x.send(JSON.stringify({name:fn,email:em,company:co,signature:sg}));
}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const pn = url.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // NDA sign endpoint
  if (pn === '/nda-sign' && req.method === 'POST') {
    let b = '';
    req.on('data', c => b += c);
    req.on('end', () => {
      try {
        const d = JSON.parse(b);
        if (!d.name || !d.email || !d.company || !d.signature) throw new Error('All fields are required');
        if (d.signature.toLowerCase() !== d.name.toLowerCase()) throw new Error('Signature must match your full name');

        const token = crypto.createHash('sha256').update(d.email + d.name + Date.now()).digest('hex').slice(0, 32);
        const ts = new Date().toISOString();
        const rec = { ...d, signedAt: ts, token, ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress };
        const fn = d.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now() + '.json';

        fs.writeFileSync(path.join(NDAS_DIR, fn), JSON.stringify(rec, null, 2));
        fs.writeFileSync(path.join(TOKENS_DIR, token + '.json'), JSON.stringify({ name: d.name, email: d.email, company: d.company, signedAt: ts }));

        // Write alert file for heartbeat
        try {
          fs.writeFileSync('/tmp/nda_alert.json', JSON.stringify({
            type: 'nda_signed',
            name: d.name,
            email: d.email,
            company: d.company,
            time: ts
          }));
        } catch(e) {}

        // Send Telegram alert via curl (non-blocking)
        const alertMsg = '📝 NDA Signed!%0A%0AName: ' + encodeURIComponent(d.name) + '%0ACompany: ' + encodeURIComponent(d.company) + '%0AEmail: ' + encodeURIComponent(d.email);
        require('child_process').exec('curl -s -X POST "https://api.telegram.org/bot$(cat /root/.telegram_bot_token 2>/dev/null)/sendMessage" -d "chat_id=1523950034&text=' + alertMsg + '&parse_mode=Markdown" -o /dev/null 2>&1');

        console.log('✅ NDA signed: ' + d.name + ' (' + d.company + ')');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token, name: d.name }));
      } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message || 'Invalid request' }));
      }
    });
    return;
  }

  // Serve proposal with token
  if (pn === '/proposal') {
    const token = url.searchParams.get('t');
    if (!token) { res.writeHead(302, { Location: '/' }); return res.end(); }
    try {
      JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, token + '.json'), 'utf-8'));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(PROPOSAL_HTML);
    } catch(e) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }
  }

  // Root: NDA gate
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(NDA_GATE);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('NDA proposal server running on port ' + PORT);
  console.log('Saved NDAs: ' + NDAS_DIR);
});
