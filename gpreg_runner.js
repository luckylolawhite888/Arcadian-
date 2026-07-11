#!/usr/bin/env node
/**
 * GPREG v5 — NHS GP Registration Automation
 * Identity generator + Playwright form fill with stealth + specific page handlers
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const { generateIdentity } = require('./gpreg_identity_gen.js');

const PROXY = {
  server: 'http://geo.spyderproxy.com:12321',
  username: 'DAz7xCYHAy',
  password: 'YOuOgB3lMb_country-gb_state-england'
};

// Random human-like delay
function humanDelay(min, max) {
  return sleep(min + Math.random() * (max - min));
}

async function clickSubmit(p) {
  for (const id of ['#continue-button-id', '#submit-details-button-id']) {
    const b = p.locator(id);
    if (await b.count() > 0 && await b.isVisible().catch(() => false)) return b.click({ timeout: 5000 });
  }
  const btns = p.locator('button[type="submit"]');
  for (let i = 0; i < await btns.count(); i++) {
    const t = await btns.nth(i).textContent();
    if (t && !t.toLowerCase().includes('cookie') && await btns.nth(i).isVisible().catch(() => false))
      return btns.nth(i).click({ timeout: 5000 });
  }
  const ab = p.locator('button');
  for (let i = 0; i < await ab.count(); i++) {
    const t = await ab.nth(i).textContent();
    if (t && !t.toLowerCase().includes('cookie') && await ab.nth(i).isVisible().catch(() => false))
      return ab.nth(i).click({ timeout: 5000 });
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function fillTextFields(p, P) {
  const fields = p.locator('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"])');
  const count = await fields.count().catch(() => 0);
  for (let i = 0; i < count; i++) {
    try {
      const inp = fields.nth(i);
      const n = await inp.getAttribute('name').catch(() => '');
      const v = await inp.inputValue().catch(() => '');
      if (v) continue;
      if (n.includes('email') || n.includes('Email')) await inp.fill(P.email);
      else if (n.includes('phone') || n.includes('Phone') || n.includes('tel') || n.includes('mobile')) await inp.fill(P.phone);
      else if (n.includes('name') || n.includes('Name') || n.includes('fullName')) await inp.fill('Emergency Contact');
      else if (n.includes('relation')) await inp.fill('Friend');
      else if (n.includes('postcode') || n.includes('Postcode')) await inp.fill(P.postcode);
      else await inp.fill('Test');
      await sleep(50 + Math.random() * 100);
    } catch(e) {}
  }
}

async function run() {
  const logs = [];
  const log = (...a) => { const m = a.join(' '); console.log(m); logs.push(m); };

  const id = generateIdentity(Date.now());
  const P = {
    title: id.title, givenName: id.givenName, surname: id.surname,
    dobDay: id.dobDay, dobMonth: id.dobMonth, dobYear: id.dobYear,
    nhsNumber: id.nhsNumber, postcode: id.postcode, houseNumber: id.houseNumber,
    email: id.email, phone: id.phone
  };
  log(`🤖 ${P.title} ${P.givenName} ${P.surname} | ${P.dobDay}/${P.dobMonth}/${P.dobYear} | ${P.houseNumber} ${P.postcode}`);

  const br = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
  });
  const ctx = await br.newContext({
    locale: 'en-GB', proxy: PROXY,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });

  await ctx.addInitScript(() => {
    // Stealth: remove automation traces
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-GB', 'en'] });
    window.chrome = { runtime: {} };
    window.close = () => false;
    // Override permissions query
    const origQ = navigator.permissions.query;
    navigator.permissions.query = p => p.name === 'notifications' ? Promise.resolve({ state: 'denied' }) : origQ(p);
    // Fake screen dimensions for non-headless
    Object.defineProperty(screen, 'width', { get: () => 1280 });
    Object.defineProperty(screen, 'height', { get: () => 720 });
  });

  const p = await ctx.newPage();
  p.on('crash', () => log('⚠ PAGE CRASH'));
  p.on('close', () => log('⚠ PAGE CLOSE'));

  try {
    log('🌐 Loading...');
    await p.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await p.locator('button').filter({ hasText: 'Start now' }).first().waitFor({ timeout: 10000 });
    try { await p.locator('#accept-cookies').click({ timeout: 2000 }); } catch (e) {}

    let stuck = 0;
    const seen = new Set();

    while (stuck < 3) {
      // Alive check
      try { await p.evaluate(() => document.title).catch(() => { throw new Error('dead'); }); } catch (e) { log('⚠ page died'); break; }

      const url = p.url();
      const pn = url.split('/').pop().split('?')[0];

      if (pn.includes('complete') || pn === 'complete' || pn.includes('confirmation')) { log('✅ COMPLETE!'); break; }
      if (pn.includes('summary') || pn.includes('check-answers')) { log('📋 Summary'); await clickSubmit(p); await humanDelay(1500, 2500); continue; }
      if (!seen.has(pn)) { log('→ ' + pn); seen.add(pn); stuck = 0; }

      // === PAGE HANDLERS ===
      if (pn === 'landing') { await p.locator('button').filter({ hasText: 'Start now' }).first().click(); await humanDelay(800, 1500); continue; }
      if (pn === 'registering-for-self') { await humanDelay(300, 800); await p.locator('input[name="whoIsRegistering"]').first().click(); await humanDelay(400, 700); await clickSubmit(p); await humanDelay(800, 1500); continue; }
      if (pn === 'first-time-registration' || pn === 'gp-registration-history') { await humanDelay(400, 800); await p.locator('input[name="firstTimeRegistration"]').first().click(); await humanDelay(300, 600); await clickSubmit(p); await humanDelay(800, 1500); continue; }

      if (pn === 'name') {
        await humanDelay(500, 1200);
        await p.locator('select[name="prefix"]').selectOption(P.title);
        await humanDelay(200, 500);
        await p.locator('input[name="givenName"]').fill(P.givenName);
        await humanDelay(200, 400);
        await p.locator('input[name="surname"]').fill(P.surname);
        await humanDelay(400, 800);
        await clickSubmit(p); await humanDelay(1000, 2000); continue;
      }

      if (pn === 'date-of-birth') {
        await humanDelay(600, 1400);
        await p.locator('#date-of-birth-day').fill(P.dobDay); await humanDelay(200, 400);
        await p.locator('#date-of-birth-month').fill(P.dobMonth); await humanDelay(200, 400);
        await p.locator('#date-of-birth-year').fill(P.dobYear); await humanDelay(400, 700);
        await clickSubmit(p); await humanDelay(1000, 2000);
        // Also handle if nhs-number page is now part of DOB
        const nhsRadios = p.locator('input[name="nhsNumberKnown"]');
        if (await nhsRadios.count() > 0) {
          await nhsRadios.nth(1).click();
          await humanDelay(400, 800);
          await clickSubmit(p); await humanDelay(1000, 2000);
        }
        continue;
      }

      // NHS number page — may not appear if DOB resolves the match
      if (pn === 'nhs-number-known' || pn === 'nhs-number') {
        await humanDelay(400, 800);
        const nhsRadios = p.locator('input[type="radio"]');
        if (await nhsRadios.count() >= 2) await nhsRadios.nth(1).click();
        else if (await nhsRadios.count() > 0) await nhsRadios.first().click();
        await humanDelay(400, 700);
        await clickSubmit(p); await humanDelay(1000, 2000);
        continue;
      }
      if (pn === 'review-matching') { await p.locator('#submit-details-button-id').waitFor({ timeout: 10000 }).catch(() => {}); await p.locator('#submit-details-button-id').click(); await humanDelay(1500, 2500); continue; }
      if (pn === 'current-address') { await p.locator('input[name="hasCurrentUkAddress"]').first().click(); await clickSubmit(p); await humanDelay(1000, 2000); continue; }

      if (pn === 'find-current-address') {
        await p.locator('input[name="currentPostcode"]').fill(P.postcode);
        await p.locator('input[name="currentHouseNumber"]').fill(P.houseNumber);
        await p.locator('#continue-button-id').click(); await humanDelay(1500, 2500); continue;
      }

      if (pn === 'select-current-address') {
        const r = p.locator('input[name="currentAddress"]');
        if (await r.count() > 0) { await r.first().click(); await clickSubmit(p); await humanDelay(1000, 2000); continue; }
        // No addresses found — manual entry
        const manualLink = p.locator('a').filter({ hasText: /enter|can't find|manually|different/i }).first();
        if (await manualLink.count() > 0) { await manualLink.click(); await humanDelay(1500, 2500); continue; }
        const skipBtn = p.locator('button').filter({ hasText: /skip|back|try again|enter manually/i }).first();
        if (await skipBtn.count() > 0) { await skipBtn.click(); await humanDelay(1000, 2000); continue; }
        await clickSubmit(p); await humanDelay(1000, 2000); continue;
      }

      if (pn === 'not-in-catchment') { await p.locator('input[name="notInCatchment"]').first().click(); await clickSubmit(p); await humanDelay(1000, 2000); continue; }

      if (pn === 'contact-details') {
        const phoneInp = p.locator('input[name="phone"]'); 
        if (await phoneInp.count() > 0) await phoneInp.fill(P.phone);
        const mobileInp = p.locator('input[name="mobilePhone"]');
        if (await mobileInp.count() > 0) await mobileInp.fill(P.phone);
        const emailInp = p.locator('input[name="email"]');
        if (await emailInp.count() > 0) await emailInp.fill(P.email);
        await sleep(200); await clickSubmit(p); await humanDelay(1000, 2000); continue;
      }

      if (pn === 'nominated-pharmacy') {
        const rads = p.locator('input[name="nominatedPharmacy"]');
        if (await rads.count() >= 2) await rads.nth(1).click();
        else if (await rads.count() > 0) await rads.first().click();
        await humanDelay(500, 1000); await clickSubmit(p); await humanDelay(1500, 2500);
        if (p.url().includes('nominated-pharmacy')) {
          const all = p.locator('input');
          for (let i = 0; i < await all.count(); i++) try { await all.nth(i).click({ timeout: 500 }).catch(() => {}); } catch (e) {}
          await clickSubmit(p); await humanDelay(1500, 2500);
        }
        continue;
      }

      if (pn === 'emergency-contact') {
        // Usually a "Do you have an emergency contact?" radio question
        const rads = p.locator('input[type="radio"]');
        if (await rads.count() > 0) await rads.first().click();
        await clickSubmit(p); await humanDelay(1000, 2000);
        // If no radio, try filling name/phone
        if (p.url().includes('emergency-contact')) {
          await fillTextFields(p, P);
          await clickSubmit(p); await humanDelay(1500, 2500);
        }
        continue;
      }

      if (pn === 'emergency-contact-details') {
        // Fill emergency contact name, phone, relationship
        await fillTextFields(p, P);
        await humanDelay(300, 700); await clickSubmit(p); await humanDelay(1500, 2500);
        continue;
      }

      // Armed forces pages
      if (pn === 'armed-forces') {
        // "Have you ever served in UK armed forces?"
        const rads = p.locator('input[type="radio"]');
        if (await rads.count() > 0) await rads.nth(1).click(); // "No"
        await clickSubmit(p); await humanDelay(1000, 2000);
        if (p.url().includes('armed-forces')) {
          if (await rads.count() > 0) await rads.first().click();
          await clickSubmit(p); await humanDelay(1500, 2500);
        }
        continue;
      }

      if (pn === 'recently-arrived' || pn === 'outside-uk-born') {
        // "Have you recently arrived in the UK?" — likely Yes
        const rads = p.locator('input[type="radio"]');
        if (await rads.count() > 0) await rads.first().click();
        await clickSubmit(p); await humanDelay(1000, 2000);
        continue;
      }

      if (pn === 'date-of-arrival') {
        // Fill Day/Month/Year fields
        const inputs = p.locator('input[type="text"]:not([type="radio"])');
        const c = await inputs.count().catch(() => 0);
        const vals = ['01', '06', '2015'];
        for (let i = 0; i < Math.min(c, vals.length); i++) {
          try { await inputs.nth(i).fill(vals[i]); await humanDelay(40, 120); } catch (e) {}
        }
        await humanDelay(200, 500); await clickSubmit(p); await humanDelay(1500, 2500);
        // If still on same page, try any remaining inputs
        if (p.url().includes('date-of-arrival')) {
          for (let i = 0; i < c; i++) {
            try {
              const v = await inputs.nth(i).inputValue();
              if (!v) await inputs.nth(i).fill('2015');
            } catch (e) {}
          }
          await clickSubmit(p); await humanDelay(1500, 2500);
        }
        continue;
      }

      // Generic handler for everything else
      {
        // Click first radio per group
        const radioNames = [...new Set(await (async () => {
          const ns = [];
          const c = await p.locator('input[type="radio"]').count().catch(() => 0);
          for (let i = 0; i < c; i++) {
            try { const n = await p.locator('input[type="radio"]').nth(i).getAttribute('name'); if (n) ns.push(n); } catch (e) {}
          }
          return ns;
        })())];
        for (const n of radioNames) {
          try {
            await p.locator(`input[name="${n.replace(/"/g, '\\"')}"]`).first().click({ timeout: 1000 }).catch(() => {});
            await humanDelay(30 + Math.random() * 50);
          } catch (e) {}
        }

        // Select first non-empty option from selects
        const sc = await p.locator('select').count().catch(() => 0);
        for (let i = 0; i < sc; i++) {
          try {
            const opts = await p.locator('select').nth(i).locator('option').all();
            if (opts.length > 1) await p.locator('select').nth(i).selectOption({ index: 1 });
          } catch (e) {}
        }

        // Fill any remaining text inputs
        await fillTextFields(p, P);

        // Submit
        await clickSubmit(p); await humanDelay(1000, 2000);

        // If still on same page (stuck counter will handle)
        if (p.url() === url) {
          log(`  ⚠ stale (${stuck + 1}/3)`);
          // Try every button
          const allBtns = p.locator('button');
          for (let i = 0; i < await allBtns.count(); i++) {
            try {
              const t = await allBtns.nth(i).textContent();
              if (t && !t.toLowerCase().includes('cookie') && await allBtns.nth(i).isVisible()) {
                await allBtns.nth(i).click({ timeout: 3000 });
                await humanDelay(1000, 2000);
                if (p.url() !== url) break;
              }
            } catch (e) {}
          }
          if (p.url() === url) stuck++;
        }
      }
    }

    log(`\n🏁 ${p.url()}`);
    log(`📄 Pages: ${seen.size}`);
    try { await p.screenshot({ path: '/tmp/gpreg_final.png' }); } catch (e) {}

    const ref = await p.evaluate(() => {
      const t = document.body.innerText;
      const m = t.match(/GPREF[:\s]+([A-Z0-9\-]+)/i) || t.match(/reference[:\s]+([A-Z0-9\-]+)/i);
      return m ? m[1] : null;
    }).catch(() => null);
    if (ref) log(`\n🎯 GPREF: ${ref}`);

    fs.appendFileSync('/tmp/gpreg_results.json', JSON.stringify({
      identity: P, timestamp: new Date().toISOString(), resultUrl: p.url(), gpref: ref,
      pageCount: seen.size, success: !!ref
    }) + '\n');
    // 🔵 Auto-save to Lola Sheets (GPREG Tracker API)
    if (ref) {
      const http = require("http");
      const body = JSON.stringify({
        name: P.title + " " + P.givenName + " " + P.surname,
        dob: P.dobDay + "/" + P.dobMonth + "/" + P.dobYear,
        postcode: P.postcode,
        phone: P.phone,
        gpreg: ref,
        status: "done",
        date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString()
      });
      try {
        const req = http.request("http://127.0.0.1:8023/entries", { method: "POST", headers: { "Content-Type": "application/json" } }, res => {
          let d = ""; res.on("data", c => d += c); res.on("end", () => log("📊 Saved to Lola Sheets"));
        });
        req.write(body); req.end();
      } catch(e) { log("⚠ Sheets save failed: " + e.message); }
    }

  } catch (err) {
    log(`\n❌ ${err.message.substring(0, 200)}`);
    try { await p.screenshot({ path: '/tmp/gpreg_error.png' }); } catch (e) {}
  }

  await br.close();
  fs.writeFileSync('/tmp/gpreg_log.txt', logs.join('\n'));
  return logs;
}

run().then(logs => {
  const ok = logs.some(l => l.includes('COMPLETE') || l.includes('GPREF'));
  console.log(ok ? '\n✅ SUCCESS' : '\n❌ FAILED');
  process.exit(ok ? 0 : 1);
}).catch(e => { console.log('❌ ' + e.message); process.exit(1); });
