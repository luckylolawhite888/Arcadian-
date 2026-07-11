#!/usr/bin/env node
/**
 * Yahoo Email Maker — v2
 * USAGE: node yahoo_maker.mjs [--count=N]
 *
 * Anti-Captcha + SpyderProxy UK residential proxy.
 * Auto-saves credentials to /root/yahoo_accounts.json
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('/root/node_modules/playwright-core');
import https from 'https';
import fs from 'fs';

const ANTICAPTCHA_KEY = 'e2b6089cd24c8f79845823e1baa53eda';
const PROXY = {
  server: 'http://geo.spyderproxy.com:12321',
  username: 'DAz7xCYHAy',
  password: 'YOuOgB3lMb_country-gb_state-england'
};

const ACCOUNTS_FILE = '/root/yahoo_accounts.json';

const FIRST = ['Alpha','Bravo','Cedar','Delta','Echo','Foxtrot','Glow','Haven','Ivory','Jade','Kite','Luna','Mist','Nova','Onyx','Pine','Quest','Rune','Skye','Tide','Unity','Vale','Wisp','Yara','Zion','Aero','Blu','Cruz','Dune','Elm','Frost','Gale','Haze','Iris','Jolt','Keen','Lark','Mars','Nyx','Orca','Peak','Quay','Ritz','Sail','Trek','Urb','Vox','Wink','Yelp','Zest'];
const LAST = ['Ash','Brook','Clay','Dawn','Ember','Fern','Glen','Hill','Isle','Jett','Kelp','Lake','Moss','Nook','Oaks','Peak','Ridge','Shore','Trace','Vale','Wood','Yard','Zone','Bay','Cove','Dell','Edge','Ford','Gulf','Holt','Knoll','Lynn','Mere','Ness','Port','Rise','Scape','Tarn','Vale','Wold','Yard'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(n) { return Math.floor(Math.random() * n); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

function makePerson() {
  const first = pick(FIRST);
  const last = pick(LAST);
  const num = String(rand(900) + 100);
  const username = (first + '_' + last + num).toLowerCase();
  return {
    first, last, num, username,
    email: username + '@yahoo.com',
    password: 'Yh!' + Math.random().toString(36).slice(2, 10) + '1X',
    mm: String(rand(12) + 1),
    dd: String(rand(28) + 1),
    yyyy: String(rand(30) + 1965)
  };
}

// ─── Anti-Captcha ──────────────────────────────────────────────────────────
function acApi(method, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ clientKey: ANTICAPTCHA_KEY, ...payload });
    const opts = {
      hostname: 'api.anti-captcha.com',
      path: '/' + method,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function solveRecaptcha(page) {
  console.log('  ⏳ Solving reCAPTCHA...');
  const siteKey = await page.evaluate(() => {
    const el = document.querySelector('.g-recaptcha, [data-sitekey]');
    return el ? (el.getAttribute('data-sitekey') || el.dataset.sitekey) : null;
  });
  if (!siteKey) {
    // Try frames
    for (const f of page.frames()) {
      const m = f.url().match(/recaptcha.*[?&]k=([^&]+)/);
      if (m) return { siteKey: m[1] };
    }
    return null;
  }

  console.log(`  🔑 reCAPTCHA site key: ${siteKey}`);
  const resp = await acApi('createTask', {
    task: { type: 'RecaptchaV2TaskProxyless', websiteURL: page.url(), websiteKey: siteKey }
  });
  if (resp.errorId !== 0) throw new Error(`Create task error: ${resp.errorCode}`);

  for (let i = 0; i < 60; i++) {
    await sleep(3000);
    const r = await acApi('getTaskResult', { taskId: resp.taskId });
    if (r.status === 'ready') return r.solution;
    if (i % 10 === 9) console.log(`  ⏳ Still waiting... (${(i+1)*3}s)`);
  }
  throw new Error('Captcha timeout');
}

// ─── Account Creation ──────────────────────────────────────────────────────
async function createOne(seed) {
  const P = makePerson();
  console.log(`\n📧 ${P.email}  |  ${P.first} ${P.last}`);

  const br = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  const ctx = await br.newContext({
    locale: 'en-US',
    proxy: { server: PROXY.server, username: PROXY.username, password: PROXY.password + '_session-' + seed.toString(36) + '_lifetime-15m' },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36'
  });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
  const p = await ctx.newPage();
  let success = false;

  try {
    await p.goto('https://login.yahoo.com/account/create', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await sleep(3000);

    // Fill form using actual field names from the page
    await p.locator('#reg-firstName').fill(P.first);
    await p.locator('#reg-lastName').fill(P.last);
    await p.locator('#reg-userId').fill(P.username);
    await p.locator('#reg-password').fill(P.password);
    await p.locator('#undefined-mm').fill(P.mm);
    await p.locator('#undefined-dd').fill(P.dd);
    await p.locator('#undefined-yyyy').fill(P.yyyy);
    // Check terms
    await p.locator('#checkTerms').check();
    console.log('  ✅ Form filled');

    // Check for captcha
    const hasCaptcha = await p.locator('.g-recaptcha, iframe[src*="recaptcha"]').count();
    if (hasCaptcha > 0) {
      console.log(`  🔍 Captcha detected (${hasCaptcha} elements)`);
      const tok = await solveRecaptcha(p);
      if (tok?.gRecaptchaResponse) {
        await p.evaluate((token) => {
          const ta = document.querySelector('textarea[id*="g-recaptcha-response"]');
          if (ta) { ta.innerHTML = token; ta.value = token; }
          if (window.___grecaptcha_cfg?.clients) {
            for (const c of Object.values(window.___grecaptcha_cfg.clients)) {
              if (c?.callback) c.callback(token);
            }
          }
        }, tok.gRecaptchaResponse);
        await sleep(1000);
      }
    } else {
      console.log('  ✅ No captcha detected');
    }

    // Submit
    const btn = p.locator('button[type="submit"]').first();
    if (await btn.count() > 0) {
      await btn.click();
      console.log('  👆 Submitted');
    }

    await sleep(5000);

    // Check result
    const url = p.url();
    const text = await p.evaluate(() => document.body.innerText).catch(() => '');

    if (text.includes('verify') || text.includes('phone') || text.includes('Welcome') || text.includes('account created') || url.includes('setup') || url.includes('my.yahoo') || url.includes('mail.yahoo')) {
      success = true;
      console.log('  ✅ ACCOUNT CREATED!');
    } else if (text.includes('already taken') || text.includes('already used')) {
      console.log('  ⚠ Username taken');
    } else if (text.includes('error') || text.includes('problem')) {
      console.log(`  ❌ Form error: ${text.substring(0, 200)}`);
    } else {
      console.log(`  🔍 URL: ${url}`);
      console.log(`  🔍 Response: ${text.substring(0, 300)}`);
    }
  } catch (err) {
    console.log(`  💥 Error: ${err.message?.substring(0, 200)}`);
  }

  await p.screenshot({ path: `/tmp/yahoo_${seed}.png` }).catch(() => {});
  await br.close();

  // Save to file
  const entry = { email: P.email, password: P.password, first: P.first, last: P.last, username: P.username, success, date: new Date().toISOString() };
  try {
    const existing = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8').toString() || '[]');
    existing.push(entry);
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(existing, null, 2));
    console.log(`  💾 Saved to ${ACCOUNTS_FILE}`);
  } catch(e) {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify([entry], null, 2));
    console.log(`  💾 Created ${ACCOUNTS_FILE}`);
  }

  return entry;
}

// ─── Main ─────────────────────────────────────────────────────────────────
const count = parseInt(process.argv.find(a => a.startsWith('--count='))?.split('=')[1] || '1', 10);

(async () => {
  console.log('📧 Yahoo Email Maker v2');
  const bal = await acApi('getBalance', {});
  console.log(`💰 Anti-Captcha balance: $${bal.balance}`);
  console.log(`🔁 Creating ${count} account(s)...\n`);

  for (let i = 0; i < count; i++) {
    const r = await createOne(Date.now() + i);
    console.log(`  ${r.success ? '✅' : '❌'} ${r.email} — ${r.success ? 'CREATED' : 'FAILED'}`);
    if (i < count - 1) await sleep(5000);
  }

  console.log(`\n📊 Done. Accounts saved to ${ACCOUNTS_FILE}`);
})();
