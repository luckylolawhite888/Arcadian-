import { Client } from 'ssh2';
import fs from 'fs';

const HOST = '212.227.93.74';
const USER = 'root';
const KEY = '/home/node/.ssh/ionos_ubuntu';

const SEO_CONFIG = {
  'coupn.uk': {
    title: 'Coupn — UK\'s Best Coupon Codes & Discount Vouchers | Save Money Online',
    desc: 'Find the latest UK coupon codes, discount vouchers and promo offers for 2026. Save money on shopping, food, travel and more with verified working promo codes.',
    h1: 'Coupn — Free UK Coupon Codes & Discount Vouchers',
    h2: 'Verified promo codes that actually work',
    keywords: 'UK coupon codes, discount vouchers, promo codes UK, save money UK, online shopping deals, voucher codes',
    type: 'WebSite',
    topics: ['coupon codes', 'discount vouchers', 'UK shopping deals', 'promo codes', 'money saving']
  },
  'toolstack.uk': {
    title: 'ToolStack UK — Free Online Calculators: Tax, Property, Finance & Health',
    desc: 'Free UK online calculators — inheritance tax, redundancy pay, capital gains tax, stamp duty, pension tax relief, BTL property, ovulation & conception. Simple, accurate, free.',
    h1: '🛠️ ToolStack UK — Free Online Calculators',
    h2: 'UK calculators for tax, finance, property & health',
    keywords: 'UK calculator, inheritance tax calculator, redundancy pay calculator, capital gains tax calculator, pension tax relief, stamp duty calculator, BTL property calculator',
    type: 'WebApplication',
    topics: ['UK tax calculators', 'financial calculators', 'property investment tools', 'pension planning']
  },
  'uk-cbdc.co.uk': {
    title: 'UK CBDC & Crypto Tools — Digital Pound Calculators & Cryptocurrency Guides',
    desc: 'UK crypto calculators, CBDC (digital pound) information, and financial tools. Bitcoin profit calculator, inflation calculator, pension planner, staking calculator and more for 2026.',
    h1: 'UK Crypto & CBDC Tools — Digital Pound & Cryptocurrency',
    h2: 'Crypto calculators, UK finance tools & CBDC guides',
    keywords: 'UK CBDC, digital pound, cryptocurrency calculator, bitcoin profit calculator UK, crypto tax calculator, staking calculator, inflation calculator UK',
    type: 'WebSite',
    topics: ['UK CBDC', 'cryptocurrency', 'digital pound', 'crypto calculators', 'blockchain UK']
  },
  'pdfoomph.com': {
    title: 'PDFoomph — Free Online PDF Tools: Merge, Split, Compress, Convert',
    desc: 'Free online PDF tools — merge PDFs, split PDFs, compress PDFs, protect with password, convert JPG to PDF and more. No upload limits, no sign up. 100% free.',
    h1: '📄 PDFoomph — Free PDF Tools Online',
    h2: 'PDF tools that pack a punch — 100% free',
    keywords: 'free PDF tools, merge PDF, split PDF, compress PDF, JPG to PDF, PDF to JPG, protect PDF online, free PDF converter',
    type: 'WebApplication',
    topics: ['PDF tools', 'PDF merge', 'PDF split', 'PDF compression', 'document conversion']
  },
  'isitdownrightnow.co.uk': {
    title: 'Is It Down Right Now? — Free Website Status Checker & Downtime Monitor',
    desc: 'Check if any website is down for everyone or just you. Free real-time website status checker and downtime monitor for popular UK and global services.',
    h1: '🔍 Is It Down Right Now? — Website Status Checker',
    h2: 'Is it down or just you? Check any website instantly',
    keywords: 'website down checker, is it down, website status, downtime monitor, site checker, is this site down, outage checker',
    type: 'WebApplication',
    topics: ['website down checker', 'uptime monitoring', 'outage detection', 'website status']
  },
  'cheapfind.uk': {
    title: 'CheapFind UK — Best Deals, Discounts & Money-Saving Offers 2026',
    desc: 'Find the best UK deals, discounts, promo codes and money-saving offers. Save on electronics, fashion, groceries, travel and more with CheapFind. Updated daily.',
    h1: '🤑 CheapFind — UK\'s Best Deals & Discounts',
    h2: 'Find the best UK deals and start saving today',
    keywords: 'UK deals, discounts UK, money saving, cheap finds UK, bargain deals, offer codes, sale UK, electronics deals UK',
    type: 'WebSite',
    topics: ['UK deals', 'discounts', 'money saving', 'bargain hunting', 'shopping offers']
  }
};

const pythonDeploy = (domain, cfg) => {
  const schemaOrg = JSON.stringify({
    "@context": "https://schema.org",
    "@type": cfg.type,
    "name": cfg.title,
    "description": cfg.desc,
    "url": `https://www.${domain}/`,
    "about": cfg.topics.map(t => ({ "@type": "Thing", "name": t }))
  }, null, 2);

  return `
import re
path = "/var/www/${domain}/public/index.html"
with open(path) as f:
    h = f.read()

# Replace title
h = re.sub(r'<title>[^<]*</title>', '<title>${cfg.title.replace(/'/g, "\\'").replace(/"/g, '\\"')}</title>', h)

# Add/Replace meta description
desc = '${cfg.desc.replace(/'/g, "\\'").replace(/"/g, '\\"')}'
if 'name="description"' in h or 'name=\\'description\\'' in h:
    h = re.sub(r'<meta[^>]*name="description"[^>]*>', '', h)
    h = re.sub(r'<meta[^>]*name=\\'description\\'[^>]*>', '', h)

# Add meta keywords
kw = '${cfg.keywords.replace(/'/g, "\\'")}'

# Build head additions
additions = ''
additions += f'<meta name="description" content="{desc}">\\n'
additions += f'<meta name="keywords" content="{kw}">\\n'
additions += f'<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">\\n'
additions += f'<link rel="canonical" href="https://www.${domain}/">\\n'

# OG tags
og_title = '${cfg.title.replace(/'/g, "\\'").replace(/"/g, '&quot;')}'
additions += '<meta property="og:title" content="' + og_title + '">\\n'
additions += '<meta property="og:description" content="' + desc + '">\\n'
additions += '<meta property="og:url" content="https://www.${domain}/">\\n'
additions += '<meta property="og:type" content="website">\\n'
additions += '<meta property="og:site_name" content="${domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1)}">\\n'
additions += '<meta property="og:locale" content="en_GB">\\n'

# Schema.org
schema_escaped = '''${schemaOrg.replace(/'/g, "\\'")}'''
additions += '<script type="application/ld+json">' + schema_escaped + '</script>\\n'

# Twitter card
additions += '<meta name="twitter:card" content="summary_large_image">\\n'
additions += '<meta name="twitter:title" content="' + og_title + '">\\n'
additions += '<meta name="twitter:description" content="' + desc + '">\\n'

# Insert after <head>
h = h.replace('<head>', '<head>\\n' + additions)

# Improve H1
h = re.sub(r'<h1[^>]*>[^<]*</h1>', '<h1>${cfg.h1.replace(/'/g, "\\'")}</h1>', h)

# Improve H2
h = re.sub(r'<h2[^>]*>[^<]*</h2>', '<h2>${cfg.h2.replace(/'/g, "\\'")}</h2>', h)

# Add language attribute with country
h = re.sub(r'lang="en"', 'lang="en-GB"', h)

with open(path, 'w') as f:
    f.write(h)
print(f"${domain}: SEO updated ✨")
`;
};

const conn = new Client();
conn.on('ready', async () => {
  console.log('Deploying SEO upgrades...');

  // First create sitemap.xml files
  const sitemaps = {};
  for (const [domain, cfg] of Object.entries(SEO_CONFIG)) {
    sitemaps[domain] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.${domain}/</loc>
    <lastmod>2026-05-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }

  // Write sitemaps via base64
  for (const [domain, xml] of Object.entries(sitemaps)) {
    const b64 = Buffer.from(xml, 'utf8').toString('base64');
    await new Promise(resolve => {
      conn.exec(`echo "${b64}" | base64 -d > /var/www/${domain}/public/sitemap.xml`, (err, stream) => {
        let out = '';
        stream.on('data', d => out += d);
        stream.on('close', () => { 
          console.log(`  ${domain}: sitemap.xml ✅`); 
          resolve(); 
        });
      });
    });
  }

  // Now deploy HTML SEO updates
  for (const [domain, cfg] of Object.entries(SEO_CONFIG)) {
    const pyScript = pythonDeploy(domain, cfg);
    const b64 = Buffer.from(pyScript, 'utf8').toString('base64');
    const fname = `seo_${domain.replace(/\./g,'_')}.py`;
    
    await new Promise(resolve => {
      conn.exec(`echo "${b64}" | base64 -d > /tmp/${fname} && python3 /tmp/${fname}`, (err, stream) => {
        let out = '';
        stream.on('data', d => out += d);
        stream.on('close', () => { 
          console.log(out.trim());
          resolve(); 
        });
      });
    });
  }

  conn.end();
  console.log('\\nAll SEO upgrades deployed!');
}).on('error', e => console.log('ERR:', e.message));
conn.connect({ host: HOST, username: USER, privateKey: fs.readFileSync(KEY, 'utf8').trim() });
