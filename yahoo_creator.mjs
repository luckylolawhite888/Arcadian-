#!/usr/bin/env node
/**
 * Yahoo Email Creator — Test script
 * Creates 1 Yahoo email account via UK residential proxy + Anti-Captcha.
 *
 * Usage: node yahoo_creator.mjs
 *
 * Anti-Captcha key: e2b6089cd24c8f79845823e1baa53eda
 * Proxy: SpyderProxy UK residential
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('/root/node_modules/playwright-core');
import https from 'https';
import http from 'http';
import crypto from 'crypto';

const ANTICAPTCHA_KEY = 'e2b6089cd24c8f79845823e1baa53eda';
const PROXY = { server: 'http://geo.spyderproxy.com:12321', username: 'DAz7xCYHAy', password: 'YOuOgB3lMb_country-gb_state-england_session-' + Date.now().toString(36) + '_lifetime-10m' };

// ─── Helpers ────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

function makeName() {
  const firsts = ['Alpha','Bravo','Cedar','Delta','Echo','Foxtrot','Glow','Haven','Ivory','Jade','Kite','Luna','Mist','Nova','Onyx','Pine','Quest','Rune','Skye','Tide','Unity','Vale','Wisp','Yara','Zion'];
  const lasts  = ['Ash','Brook','Clay','Dawn','Ember','Fern','Glen','Hill','Isle','Jett','Kelp','Lake','Moss','Nook','Oaks','Peak','Ridge','Shore','Trace','Vale','Wood','Yard','Zone'];
  return {
    first: firsts[Math.floor(Math.random() * firsts.length)],
    last: lasts[Math.floor(Math.random() * lasts.length)],
    num: Math.floor(100 + Math.random() * 899)
  };
}

// ─── Anti-Captcha API ──────────────────────────────────────────────────

function anticaptcha(method, payload) {
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

async function solveCaptcha(page) {
  console.log('  ⏳ Solving reCAPTCHA via Anti-Captcha...');

  // Get site key from page
  const siteKey = await page.evaluate(() => {
    const el = document.querySelector('.g-recaptcha');
    return el ? el.getAttribute('data-sitekey') : null;
  });
  if (!siteKey) {
    console.log('  ⚠ No reCAPTCHA found on page, trying alternative detection...');
    const frames = await page.frames();
    for (const f of frames) {
      const url = f.url();
      if (url.includes('recaptcha')) {
        const m = url.match(/k=([^&]+)/);
        if (m) return m[1];
      }
    }
    return null;
  }

  console.log(`  🔑 Site key: ${siteKey}`);

  // Create task
  const createResp = await anticaptcha('createTask', {
    task: {
      type: 'RecaptchaV2TaskProxyless',
      websiteURL: page.url(),
      websiteKey: siteKey,
      isInvisible: false
    }
  });

  if (createResp.errorId !== 0) {
    throw new Error(`Anti-Captcha createTask error: ${createResp.errorCode} - ${createResp.errorDescription}`);
  }

  const taskId = createResp.taskId;
  console.log(`  📋 Task ID: ${taskId}`);

  // Wait for result
  let result = null;
  for (let i = 0; i < 60; i++) {
    await sleep(3000);
    const resp = await anticaptcha('getTaskResult', { taskId });
    if (resp.errorId !== 0) throw new Error(`getTaskResult error: ${resp.errorCode}`);
    if (resp.status === 'ready') {
      result = resp.solution;
      break;
    }
    if (i % 5 === 0) console.log(`  ⏳ Waiting... (${(i+1)*3}s)`);
  }

  if (!result) throw new Error('Timeout waiting for captcha solve');

  console.log('  ✅ Captcha solved!');
  return result;
}

// ─── Main ──────────────────────────────────────────────────────────────

async function createYahooAccount() {
  const name = makeName();
  const username = `${name.first.toLowerCase()}_${name.last.toLowerCase()}${name.num}`;
  const email = `${username}@yahoo.com`;
  const password = 'L0l@_' + crypto.randomBytes(4).toString('hex') + '!';

  console.log(`\n📧 Creating: ${email}`);
  console.log(`   Password: ${password}`);

  const br = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
  });

  const ctx = await br.newContext({
    locale: 'en-US',
    proxy: PROXY,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36'
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const page = await ctx.newPage();
  let success = false;

  try {
    // Go to Yahoo signup
    console.log('  📍 Navigating to Yahoo signup...');
    await page.goto('https://login.yahoo.com/account/create?.src=ym&.lang=en-US&.done=https%3A%2F%2Fmail.yahoo.com', {
      timeout: 30000,
      waitUntil: 'domcontentloaded'
    });
    await sleep(2000);

    // Take screenshot for debugging
    await page.screenshot({ path: '/tmp/yahoo_1_landing.png' });
    console.log('  📸 Screenshot: /tmp/yahoo_1_landing.png');

    // Fill in the form
    // Yahoo signup form fields
    const url = page.url();
    console.log(`  📍 URL: ${url}`);

    // Try to fill fields by common selectors
    const fields = [
      { name: 'firstName', val: name.first },
      { name: 'lastName', val: name.last },
      { name: 'yid', val: username },
      { name: 'password', val: password },
      { name: 'phone', val: '' },
      { name: 'month', val: String(1 + Math.floor(Math.random() * 12)) },
      { name: 'day', val: String(1 + Math.floor(Math.random() * 28)) },
      { name: 'year', val: String(1970 + Math.floor(Math.random() * 30)) }
    ];

    for (const f of fields) {
      try {
        const el = page.locator(`input[name="${f.name}"]`);
        if (await el.count() > 0) {
          await el.fill(f.val);
          console.log(`  ✅ Filled ${f.name}: ${f.val}`);
        }
      } catch(e) {
        console.log(`  ⚠ Couldn't fill ${f.name}`);
      }
    }

    // Check for captcha
    const hasCaptcha = await page.locator('.g-recaptcha, iframe[src*="recaptcha"], iframe[src*="anchor"]').count();
    console.log(`  🔍 Captcha elements found: ${hasCaptcha}`);

    if (hasCaptcha > 0) {
      const solution = await solveCaptcha(page);
      if (solution && solution.gRecaptchaResponse) {
        await page.evaluate((token) => {
          try {
            // Set the recaptcha response
            const textareas = document.querySelectorAll('textarea[id*="g-recaptcha-response"]');
            textareas.forEach(ta => {
              ta.innerHTML = token;
              ta.value = token;
              // Dispatch input event
              ta.dispatchEvent(new Event('input', { bubbles: true }));
            });
            // Try calling callback
            if (window.___grecaptcha_cfg) {
              for (const key of Object.keys(window.___grecaptcha_cfg.clients || {})) {
                window.___grecaptcha_cfg.clients[key].callback(token);
              }
            }
          } catch(e) { /* fail silently */ }
        }, solution.gRecaptchaResponse);
        console.log('  ✅ reCAPTCHA token injected');
      }
    }

    await sleep(1000);

    // Click submit
    try {
      const btn = page.locator('button[type="submit"], input[type="submit"], button:has-text("Continue"), button:has-text("Next")');
      if (await btn.count() > 0) {
        await btn.first().click();
        console.log('  👆 Clicked submit');
      }
    } catch(e) {
      console.log('  ⚠ Submit button click failed');
    }

    await sleep(5000);

    // Take post-submit screenshot
    await page.screenshot({ path: '/tmp/yahoo_2_result.png' });
    console.log('  📸 Screenshot: /tmp/yahoo_2_result.png');

    // Check result
    const currentUrl = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    console.log(`  📍 Post-submit URL: ${currentUrl}`);

    if (currentUrl.includes('setup') || currentUrl.includes('mai') || currentUrl.includes('inbox') || bodyText.includes('welcome') || bodyText.includes('account created')) {
      success = true;
      console.log(`  ✅ SUCCESS! Account created: ${email}`);
    } else {
      console.log(`  ❌ Result text: ${bodyText.substring(0, 300)}`);
    }

  } catch (err) {
    console.log(`  💥 Error: ${err.message?.substring(0, 200) || err}`);
  }

  // Store result
  const result = { email, password, username, name: `${name.first} ${name.last}`, success, date: new Date().toISOString() };
  console.log(`\n📋 Result: ${JSON.stringify(result, null, 2)}`);

  await br.close();
  return result;
}

// ─── Run ────────────────────────────────────────────────────────────────

(async () => {
  console.log('📧 Yahoo Email Creator — Test Run');
  console.log(`🔑 Anti-Captcha balance check...`);

  const bal = await anticaptcha('getBalance', {});
  console.log(`💰 Balance: $${bal.balance}`);

  const result = await createYahooAccount();
  console.log(`\n${result.success ? '✅' : '❌'} Test ${result.success ? 'PASSED' : 'FAILED'}`);
})();
