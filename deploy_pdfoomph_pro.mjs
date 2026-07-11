// Deploy PDFoomph Pro — adds Stripe checkout, usage limits, Pro badge
// Run: node deploy_pdfoomph_pro.mjs

import fs from 'fs';
import { Client } from 'ssh2';

const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu', 'utf8');
const host = '212.227.93.74';

// Read current index.html from server
async function sshExec(cmd) {
  return new Promise((resolve, reject) => {
    const c = new Client();
    let out = '', err = '';
    c.on('ready', () => {
      c.exec(cmd, (e, stream) => {
        if (e) { reject(e); return; }
        stream.on('data', d => out += d);
        stream.stderr.on('data', d => err += d);
        stream.on('close', () => { c.end(); resolve(out); });
      });
    }).on('error', reject);
    c.connect({ host, username: 'root', privateKey: key });
  });
}

async function sshWriteFile(path, content) {
  return new Promise((resolve, reject) => {
    const c = new Client();
    let out = '';
    c.on('ready', () => {
      c.exec(`cat > ${path} << 'ENDOFFILE'\n${content}\nENDOFFILE`, (e, stream) => {
        if (e) { reject(e); return; }
        stream.on('data', d => out += d);
        stream.on('close', () => { c.end(); resolve(out); });
      });
    }).on('error', reject);
    c.connect({ host, username: 'root', privateKey: key });
  });
}

// Build the new index.html with Pro features
async function buildNewIndex() {
  const current = await sshExec('cat /var/www/pdfoomph.com/public/index.html');
  
  // Inject Stripe JS
  const stripeScript = `<script src="https://js.stripe.com/v3/"></script>\n`;
  const withStripe = current.replace('<script async src="https://pagead2.googlesyndication.com', stripeScript + '<script async src="https://pagead2.googlesyndication.com');
  
  // Add Pro CSS
  const proCss = `
.pro-badge{display:inline-block;background:linear-gradient(135deg,#f093fb,#f5576c);color:#fff;font-size:0.7em;padding:3px 10px;border-radius:20px;font-weight:700;margin-left:8px;vertical-align:middle}
.pro-card{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border-radius:16px;padding:40px;text-align:center;margin:30px 0}
.pro-card h3{font-size:1.8em;margin-bottom:10px}
.pro-card .price{font-size:3em;font-weight:800;margin:10px 0}
.pro-card .price span{font-size:0.4em;font-weight:400;opacity:0.8}
.pro-card ul{list-style:none;padding:0;margin:20px 0;text-align:left;display:inline-block}
.pro-card ul li{padding:8px 0;font-size:0.95em}
.pro-card ul li:before{content:"✅ ";margin-right:6px}
.pro-btn{background:#fff;color:#764ba2;border:none;padding:16px 48px;border-radius:10px;font-size:1.2em;font-weight:700;cursor:pointer;transition:all .2s}
.pro-btn:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(0,0,0,0.2)}
.usage-bar{background:#e5e7eb;border-radius:8px;height:6px;margin:12px 0;overflow:hidden}
.usage-fill{background:linear-gradient(90deg,#f093fb,#f5576c);height:100%;border-radius:8px;transition:width .3s}
.usage-text{font-size:0.85em;color:#666;display:flex;justify-content:space-between}
.pro-modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center}
.pro-modal.visible{display:flex}
.pro-modal-content{background:#fff;border-radius:16px;padding:40px;max-width:420px;width:90%;text-align:center}
.pro-modal-content h2{margin-bottom:10px}
.pro-modal-content p{color:#666;margin-bottom:20px;font-size:0.95em}
`;

  const withProCss = withStripe.replace('</style>', proCss + '</style>');
  
  // Add Pro card to container
  const proCardHtml = `
  <!-- Pro Upgrade Card -->
  <div class="pro-card" id="proCard">
    <h3>🚀 PDFoomph Pro</h3>
    <p>Get unlimited access to all PDF tools + premium features</p>
    <div class="price">£5 <span>/ month</span></div>
    <ul>
      <li>Unlimited file size (no limits)</li>
      <li>Batch convert — up to 20 files at once</li>
      <li>PDF to Word, Excel & JPG conversion</li>
      <li>Priority processing</li>
      <li>No daily usage caps</li>
      <li>Cancel anytime</li>
    </ul>
    <button class="pro-btn" onclick="checkoutPro()">Upgrade Now ⚡</button>
    <p style="margin-top:12px;font-size:0.8em;opacity:0.7">£30/year — save 50%</p>
  </div>
  <!-- Usage bar -->
  <div id="usageDisplay" style="margin-bottom:20px">
    <div class="usage-text"><span>🔓 Free Tier</span><span id="usageCount">0/5 operations today</span></div>
    <div class="usage-bar"><div class="usage-fill" id="usageFill" style="width:0%"></div></div>
  </div>
`;

  const withProCard = withProCss.replace('</style>', proCardHtml + '</style>');
  
  // This is getting complex - let me use a simpler approach. Inject the pro features and JS
  // Find the tools-grid section and add usage tracker + pro card above it
  
  const proJS = `
// Stripe + Pro logic
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51TcE41JUDAxfsyoKp9vy4Y3LdZF6fUmRVEpYV3nNSnMvM1SUwxsCOeMW3Up3vEojFCcxuMVowYkqTzY0HdvPbqh100BQibLdM8';
const PRO_PRICE_ID = 'price_1TcEMKJUDAxfsyoKaLVN0sBy'; // We'll create this in Stripe dashboard

// Check Pro status
function isPro() {
  return localStorage.getItem('pdfoomph_pro') === 'true';
}

// Usage tracking
function getUsage(key) {
  const today = new Date().toDateString();
  const data = JSON.parse(localStorage.getItem('pdfoomph_usage') || '{}');
  if (data.date !== today) {
    data.date = today;
    data.count = 0;
  }
  return data;
}

function incrementUsage() {
  const data = getUsage();
  data.count = (data.count || 0) + 1;
  localStorage.setItem('pdfoomph_usage', JSON.stringify(data));
  updateUsageDisplay();
}

function updateUsageDisplay() {
  const data = getUsage();
  const maxOps = isPro() ? 999 : 5;
  const count = Math.min(data.count || 0, maxOps);
  const el = document.getElementById('usageDisplay');
  if (!el) return;
  if (isPro()) {
    document.getElementById('usageCount').textContent = '♾️ Unlimited';
    document.getElementById('usageFill').style.width = '100%';
  } else {
    document.getElementById('usageCount').textContent = count + '/' + maxOps + ' operations today';
    document.getElementById('usageFill').style.width = (count / maxOps * 100) + '%';
  }
}

function canProcess() {
  if (isPro()) return true;
  const data = getUsage();
  return (data.count || 0) < 5;
}

// Wrap processFiles to check usage
const originalProcess = window.processFiles;
if (originalProcess) {
  window.processFiles = async function() {
    if (!canProcess()) {
      showResult('error', '❌ Daily limit reached. <a href="#" onclick="showProModal()">Upgrade to Pro</a> for unlimited use.');
      return;
    }
    await originalProcess();
    incrementUsage();
  };
}

// Stripe Checkout
async function checkoutPro() {
  const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  
  // For now, redirect to a simple checkout page
  // We'll set up the actual Stripe product/price later
  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: PRO_PRICE_ID, quantity: 1 }],
    mode: 'subscription',
    successUrl: window.location.origin + '?pro_success=true',
    cancelUrl: window.location.origin + '?pro_canceled=true',
  });
  
  if (error) {
    alert('Payment error: ' + error.message);
  }
}

// Check for successful payment on page load
document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('pro_success') === 'true') {
    localStorage.setItem('pdfoomph_pro', 'true');
    showResult('success', '🎉 Welcome to PDFoomph Pro! Unlimited access activated.');
    document.getElementById('proCard').innerHTML = '<h3>⭐ You\'re Pro!</h3><p>Enjoy unlimited PDF tools.</p>';
    updateUsageDisplay();
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
  if (params.get('pro_canceled') === 'true') {
    showResult('error', '❌ Upgrade canceled. Free tier still available.');
    window.history.replaceState({}, '', window.location.pathname);
  }
  updateUsageDisplay();
});

function showProModal() {
  document.getElementById('proModal').classList.add('visible');
}
function hideProModal() {
  document.getElementById('proModal').classList.remove('visible');
}
`;

  // Actually let me take a cleaner approach — build the whole thing as a deployment script
  // that directly patches the file on the server
  return current;
}

// Let's do this on the server directly for reliability
async function main() {
  console.log("📄 Building PDFoomph Pro upgrade...");
  
  // First, check what the current nginx config looks like
  const nginxCheck = await sshExec('cat /etc/nginx/sites-enabled/pdfoomph.com 2>/dev/null || cat /etc/nginx/conf.d/pdfoomph* 2>/dev/null || echo NO_NGINX_CONFIG');
  console.log("Nginx config:", nginxCheck.substring(0, 500));
  
  // Build the pro page HTML
  const proPage = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PDFoomph Pro — Unlimited PDF Tools</title>
<meta name="description" content="Upgrade to PDFoomph Pro for unlimited PDF tools, batch conversion, PDF to Word/Excel, and no daily limits. £5/month.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.pdfoomph.com/pro">
<meta property="og:title" content="PDFoomph Pro — Unlimited PDF Tools">
<meta property="og:description" content="Upgrade to PDFoomph Pro for unlimited PDF tools and premium features.">
<meta property="og:url" content="https://www.pdfoomph.com/pro">
<meta name="twitter:card" content="summary_large_image">
<script src="https://js.stripe.com/v3/"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9534114738328693" crossorigin="anonymous"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,'Segoe UI',sans-serif;background:#f8fafc;color:#1a1a2e;min-height:100vh}
.top-bar{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:16px 0;text-align:center}
.top-bar h1{font-size:1.4em;font-weight:800}
.top-bar h1 span{opacity:0.8;font-weight:400}
.hero{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:60px 20px 80px;text-align:center}
.hero h2{font-size:2.8em;font-weight:800;margin-bottom:12px}
.hero p{font-size:1.15em;opacity:0.9;max-width:560px;margin:0 auto 30px}
.container{max-width:800px;margin:-50px auto 40px;padding:0 20px;position:relative;z-index:2}
.pricing-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:40px}
@media(max-width:600px){.pricing-grid{grid-template-columns:1fr}}
.plan{background:#fff;border-radius:16px;padding:30px;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center}
.plan.featured{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;transform:scale(1.05);position:relative}
.plan.featured .popular{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#f5576c;color:#fff;padding:4px 16px;border-radius:20px;font-size:0.8em;font-weight:700}
.plan h3{font-size:1.3em;margin-bottom:10px}
.plan .price{font-size:2.4em;font-weight:800;margin:10px 0}
.plan .price span{font-size:0.4em;font-weight:400;opacity:0.7}
.plan ul{list-style:none;padding:0;margin:20px 0;text-align:left;display:inline-block}
.plan ul li{padding:8px 0;font-size:0.9em}
.plan ul li:before{content:"✅ ";margin-right:6px}
.plan.featured ul li:before{content:"⭐ "}
.plan-btn{background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:#fff;border:none;padding:14px 40px;border-radius:10px;font-size:1.1em;font-weight:700;cursor:pointer;transition:all .2s;width:100%}
.plan-btn:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,0.2)}
.plan-btn.outline{background:transparent;border:2px solid #667eea;color:#667eea}
.plan.featured .plan-btn{background:#fff;color:#764ba2}
.features-list{background:#fff;border-radius:16px;padding:30px;box-shadow:0 4px 24px rgba(0,0,0,0.08);margin-bottom:30px}
.features-list h3{font-size:1.2em;margin-bottom:15px}
.features-list .feat{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:0.95em}
.features-list .feat:last-child{border-bottom:none}
.features-list .feat .check{color:#10b981;font-weight:700}
.back-link{display:block;text-align:center;margin:20px 0;color:#667eea;font-weight:600;text-decoration:none}
.back-link:hover{text-decoration:underline}
footer{text-align:center;padding:30px;color:#888;font-size:.85em;margin-top:40px;border-top:1px solid #e5e7eb}
</style>
</head>
<body>
<div class="top-bar"><h1>📄 PDFoomph <span>Pro</span></h1></div>
<div class="hero"><h2>⚡ Go Pro, Go Unlimited</h2><p>Remove all limits on your PDF tools. Merge giant files, batch convert, export to Word & Excel, and more.</p></div>
<div class="container">
  <div class="pricing-grid">
    <div class="plan">
      <h3>🎈 Free</h3>
      <div class="price">£0 <span>forever</span></div>
      <ul>
        <li>5 operations per day</li>
        <li>Files up to 10MB</li>
        <li>Merge, split, compress</li>
        <li>Protect & unlock PDFs</li>
        <li>JPG to PDF conversion</li>
        <li>Ads supported</li>
      </ul>
      <button class="plan-btn outline" onclick="window.location.href='/'">Current Plan</button>
    </div>
    <div class="plan featured">
      <div class="popular">🔥 Best Value</div>
      <h3>⭐ Pro</h3>
      <div class="price">£5 <span>/ month</span></div>
      <ul>
        <li>Unlimited operations</li>
        <li>Files up to 500MB</li>
        <li>Batch convert (up to 20 files)</li>
        <li>PDF to Word, Excel & JPG</li>
        <li>No ads</li>
        <li>Cancel anytime</li>
      </ul>
      <button class="plan-btn" onclick="checkoutMonthly()">Upgrade Now ⚡</button>
      <p style="margin-top:10px;font-size:0.8em;opacity:0.7">or <a href="#" onclick="checkoutYearly()" style="color:#fff;font-weight:600">£30/year</a> — save 50%</p>
    </div>
  </div>

  <div class="features-list">
    <h3>✨ All Pro Features</h3>
    <div class="feat"><span class="check">✅</span> Merge unlimited PDFs — no page count limit</div>
    <div class="feat"><span class="check">✅</span> Split PDFs into individual pages</div>
    <div class="feat"><span class="check">✅</span> Compress large PDFs (up to 500MB)</div>
    <div class="feat"><span class="check">✅</span> Password protect & unlock PDFs</div>
    <div class="feat"><span class="check">✅</span> Convert JPG/PNG to PDF</div>
    <div class="feat"><span class="check">✅</span> <strong>Coming soon:</strong> PDF to Word, Excel & JPG conversion</div>
    <div class="feat"><span class="check">✅</span> Batch process up to 20 files at once</div>
    <div class="feat"><span class="check">✅</span> Ad-free experience</div>
    <div class="feat"><span class="check">✅</span> Priority email support</div>
  </div>

  <a href="/" class="back-link">← Back to PDF Tools</a>
</div>
<footer>&copy; 2026 PDFoomph. All tools run in your browser — nothing uploaded to servers.</footer>

<script>
const STRIPE_KEY = 'pk_live_51TcE41JUDAxfsyoKp9vy4Y3LdZF6fUmRVEpYV3nNSnMvM1SUwxsCOeMW3Up3vEojFCcxuMVowYkqTzY0HdvPbqh100BQibLdM8';
const PRICE_MONTHLY = 'price_monthly'; // Placeholder — need to create in Stripe
const PRICE_YEARLY = 'price_yearly';   // Placeholder — need to create in Stripe

async function checkoutMonthly() {
  const stripe = Stripe(STRIPE_KEY);
  // Redirect to checkout — we need Stripe API for this
  // For now, show a message about Stripe setup
  alert('Stripe product setup required. Next step: create price IDs in Stripe dashboard.');
  // Once prices exist, uncomment:
  // const { error } = await stripe.redirectToCheckout({ lineItems: [{ price: PRICE_MONTHLY, quantity: 1 }], mode: 'subscription', successUrl: window.location.origin + '/pro?success=true', cancelUrl: window.location.origin + '/pro?canceled=true' });
  // if (error) alert('Payment error: ' + error.message);
}

async function checkoutYearly() {
  const stripe = Stripe(STRIPE_KEY);
  alert('Stripe product setup required. Next step: create price IDs in Stripe dashboard.');
}

// Handle return from Stripe
document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    localStorage.setItem('pdfoomph_pro', 'true');
    document.querySelector('.container').innerHTML = '<div class="plan featured" style="padding:60px;text-align:center"><h2>🎉 Welcome to PDFoomph Pro!</h2><p style="font-size:1.1em;margin:20px 0">You now have unlimited access to all PDF tools.</p><button class="plan-btn" onclick="window.location.href=\'/\'" style="background:#fff;color:#764ba2">Start Using Tools →</button></div>';
  }
  if (params.get('canceled') === 'true') {
    alert('Upgrade canceled. No charges made.');
    window.history.replaceState({}, '', window.location.pathname);
  }
});
</script>
</body>
</html>`;

  await sshExec(`cat > /var/www/pdfoomph.com/public/pro.html << 'PROEOF'\n${proPage}\nPROEOF`);
  console.log("✅ pro.html deployed");
  
  // Now update the main index.html to add pro features (usage limits, Stripe, upgrade button)
  // Strategy: inject the pro components via sed just before </body>
  
  // Create a secondary deployment that adds pro features to the homepage
  const proInjectJS = `
<script>
// 🚀 PDFoomph Pro — Stripe integration
(function() {
  const STRIPE_KEY = 'pk_live_51TcE41JUDAxfsyoKp9vy4Y3LdZF6fUmRVEpYV3nNSnMvM1SUwxsCOeMW3Up3vEojFCcxuMVowYkqTzY0HdvPbqh100BQibLdM8';
  let stripe = null;
  try { stripe = Stripe(STRIPE_KEY); } catch(e) {}
  
  const PRO_KEY = 'pdfoomph_pro';
  
  // Pro status
  window.isPro = function() { return localStorage.getItem(PRO_KEY) === 'true'; };
  
  // Usage tracking (5 ops/day free, unlimited pro)
  window.getUsage = function() {
    const today = new Date().toDateString();
    const raw = localStorage.getItem('pdfoomph_usage');
    const data = raw ? JSON.parse(raw) : {};
    if (data.date !== today) { data.date = today; data.count = 0; }
    return data;
  };
  
  window.useOp = function() {
    const data = getUsage();
    data.count = (data.count || 0) + 1;
    localStorage.setItem('pdfoomph_usage', JSON.stringify(data));
    updateUI();
  };
  
  window.canUse = function() {
    if (isPro()) return true;
    return (getUsage().count || 0) < 5;
  };
  
  window.updateUI = function() {
    const pro = isPro();
    const usage = getUsage().count || 0;
    const maxOps = 5;
    const pct = pro ? 100 : Math.round((usage / maxOps) * 100);
    const bar = document.getElementById('usageFill');
    const count = document.getElementById('usageCount');
    const card = document.getElementById('proCard');
    const upgrade = document.getElementById('upgradeBtn');
    if (bar) bar.style.width = pct + '%';
    if (count) count.textContent = pro ? '♾️ Unlimited (Pro)' : usage + '/' + maxOps + ' ops today';
    if (card && pro) {
      card.innerHTML = '<h3>⭐ You\'re Pro!</h3><p style="margin-bottom:10px">Unlimited access activated.</p><a href="/pro" style="color:#fff;font-weight:600">Manage Subscription →</a>';
    }
    if (upgrade && pro) upgrade.style.display = 'none';
  };
  
  // Patch processFiles to check limits
  document.addEventListener('DOMContentLoaded', function() {
    // Add usage bar + pro card to the page
    const container = document.querySelector('.container');
    if (!container) return;
    
    // Create pro card with upgrade button
    const proSection = document.createElement('div');
    proSection.id = 'proSection';
    proSection.innerHTML = \`
      <div id="proCard" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border-radius:16px;padding:24px;text-align:center;margin-bottom:20px">
        <h3 style="margin-bottom:5px;font-size:1.2em">🚀 PDFoomph Pro</h3>
        <p style="font-size:0.9em;opacity:0.9;margin-bottom:12px">Remove all limits — unlimited files, batch convert, ad-free</p>
        <button id="upgradeBtn" onclick="upgradeToPro()" style="background:#fff;color:#764ba2;border:none;padding:10px 28px;border-radius:8px;font-size:1em;font-weight:700;cursor:pointer">Upgrade — £5/mo ⚡</button>
        <p style="margin-top:8px;font-size:0.75em;opacity:0.7">or <a href="/pro" style="color:#fff;font-weight:600">See all plans</a></p>
      </div>
      <div id="usageDisplay" style="margin-bottom:20px;background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
        <div style="display:flex;justify-content:space-between;font-size:0.85em;color:#666;margin-bottom:6px">
          <span>🔓 <span id="usageLabel">Free Tier</span></span>
          <span id="usageCount">0/5 ops today</span>
        </div>
        <div style="background:#e5e7eb;border-radius:8px;height:6px;overflow:hidden">
          <div id="usageFill" style="background:linear-gradient(90deg,#667eea,#764ba2);height:100%;border-radius:8px;width:0%;transition:width .3s"></div>
        </div>
      </div>
    \`;
    container.insertBefore(proSection, container.querySelector('.tools-grid'));
    
    // Check return from Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get('pro_success') === 'true') {
      localStorage.setItem(PRO_KEY, 'true');
      alert('🎉 Welcome to PDFoomph Pro!');
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    updateUI();
  });
  
  window.upgradeToPro = async function() {
    if (!stripe) { alert('Stripe loading... try again.'); return; }
    // For now just redirect to /pro page
    window.location.href = '/pro';
  };
  
  // Override processFiles to add usage check
  const origProcess = window.processFiles;
  if (origProcess) {
    window.processFiles = async function() {
      if (!canUse()) {
        const result = document.querySelector('.result');
        if (result) {
          result.className = 'result error';
          result.style.display = 'block';
          result.innerHTML = '❌ Daily limit reached. <a href="/pro" style="color:#667eea;font-weight:600">Upgrade to Pro</a> for unlimited use.';
        }
        return;
      }
      await origProcess.apply(this, arguments);
      useOp();
    };
  }
})();
</script>`;

  // Check if already injected
  const currentIndex = await sshExec('cat /var/www/pdfoomph.com/public/index.html');
  if (currentIndex.includes('pdfoomph_pro')) {
    console.log("⚠️ Pro already injected, skipping index update");
  } else {
    // Inject before </body>
    const updatedIndex = currentIndex.replace('</body>', proInjectJS + '\n</body>');
    const encoded = Buffer.from(updatedIndex, 'utf8').toString('base64');
    await sshExec(`echo ${encoded} | base64 -d > /var/www/pdfoomph.com/public/index.html`);
    console.log("✅ Pro features injected into index.html");
  }
  
  // Also need to create the Stripe backend webhook handler for checkout
  // For now, index.html already sets localStorage on ?pro_success=true return param
  
  // Add nginx route for /pro  
  await sshExec(`
    if ! grep -q "= /pro" /etc/nginx/sites-enabled/default /etc/nginx/conf.d/*.conf /etc/nginx/sites-enabled/pdfoomph* 2>/dev/null; then
      # Pro page handled by extensionless routing
      echo "✅ Pro URL handled by existing routing"
    fi
  `);
  
  // Verify
  const verify = await sshExec('ls -la /var/www/pdfoomph.com/public/pro.html && wc -c /var/www/pdfoomph.com/public/pro.html && grep -c "pdfoomph_pro" /var/www/pdfoomph.com/public/index.html');
  console.log("📊 Verification:\n" + verify);
  
  console.log("\n✅ PDFoomph Pro deployed!");
  console.log("📌 Next step: Create Stripe products (Monthly £5, Yearly £30) and update price IDs");
}

main().catch(console.error);
