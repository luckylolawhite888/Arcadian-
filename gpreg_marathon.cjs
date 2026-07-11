#!/usr/bin/env node
/**
 * GPREG v5 — NHS GP Registration Automation
 * Marathon mode: keeps retrying with fresh identities until successful.
 * Uses Playwright with specific page handlers + human-like delays.
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const { generateIdentity } = require('./gpreg_identity_gen.js');

const PROXY_CREDS = { server: 'http://geo.spyderproxy.com:12321', username: 'DAz7xCYHAy', password: 'YOuOgB3lMb_country-gb_state-england' };

function humanDelay(min, max) { return sleep(min + Math.random() * (max - min)); }

async function clickSubmit(p) {
  for (const id of ['#continue-button-id', '#submit-details-button-id']) {
    if (await p.locator(id).count() > 0 && await p.locator(id).isVisible().catch(() => false))
      return p.locator(id).click({ timeout: 5000 });
  }
  const btns = p.locator('button[type="submit"]');
  for (let i = 0; i < await btns.count(); i++) {
    const t = await btns.nth(i).textContent();
    if (t && !t.toLowerCase().includes('cookie') && await btns.nth(i).isVisible().catch(() => false))
      return btns.nth(i).click({ timeout: 5000 });
  }
  const all = p.locator('button');
  for (let i = 0; i < await all.count(); i++) {
    const t = await all.nth(i).textContent();
    if (t && !t.toLowerCase().includes('cookie') && await all.nth(i).isVisible().catch(() => false))
      return all.nth(i).click({ timeout: 5000 });
  }
}

async function runOnce() {
  const logs = [];
  const log = (...a) => { const m = a.join(' '); console.log(m); logs.push(m); };

  const id = generateIdentity(Date.now());
  const P = {
    title: id.title, givenName: id.givenName, surname: id.surname,
    dobDay: id.dobDay, dobMonth: id.dobMonth, dobYear: id.dobYear,
    postcode: id.postcode, houseNumber: id.houseNumber,
    email: id.email, phone: id.phone
  };
  log(`🤖 ${P.title} ${P.givenName} ${P.surname} | ${P.dobDay}/${P.dobMonth}/${P.dobYear} | ${P.houseNumber} ${P.postcode}`);

  const br = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  const ctx = await br.newContext({
    locale: 'en-GB', proxy: PROXY_CREDS,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-GB', 'en'] });
    window.chrome = { runtime: {} };
    window.close = () => false;
    const origQ = navigator.permissions.query;
    navigator.permissions.query = p => p.name === 'notifications' ? Promise.resolve({ state: 'denied' }) : origQ(p);
  });

  const p = await ctx.newPage();
  let died = false;
  p.on('crash', () => { log('⚠ CRASH'); died = true; });
  p.on('close', () => { if (!died) log('⚠ CLOSE'); died = true; });

  try {
    log('🌐 Loading...');
    await p.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await p.locator('button').filter({ hasText: 'Start now' }).first().waitFor({ timeout: 10000 });
    try { await p.locator('#accept-cookies').click({ timeout: 2000 }).catch(() => {}); } catch (e) {}
    
    if (died) { log('⛔ died at landing'); await br.close(); return { logs, success: false, url: '', pages: 0 }; }

    let staleCount = 0;
    const seen = new Set();
    const MAX_STALE = 5;

    while (staleCount < MAX_STALE) {
      // Alive check
      let alive = false;
      try { await p.evaluate(() => document.title).catch(() => { throw 'dead'; }); alive = true; } catch (e) { log('⚠ page died'); break; }
      if (died) break;

      const url = p.url();
      const pn = url.split('/').pop().split('?')[0];
      
      // Check completion
      const bodyText = await p.evaluate(() => document.body.innerText.slice(0, 2000)).catch(() => '');
      const refMatch = bodyText.match(/GPREF[:\s]+([A-Z0-9\-]+)/i) || bodyText.match(/reference[:\s]+([A-Z0-9\-]+)/i);
      if (refMatch) { log(`✅ REF: ${refMatch[1]}`); return { logs, success: true, url, pages: seen.size, gpref: refMatch[1] }; }
      if (url.includes('complete') || url.includes('confirmation') || bodyText.includes('submitted')) {
        log('✅ COMPLETE!'); return { logs, success: true, url, pages: seen.size, gpref: null };
      }

      if (!seen.has(pn)) { log(`→ ${pn}`); seen.add(pn); staleCount = 0; }
      else { staleCount++; }

      // === SPECIFIC PAGE HANDLERS ===
      if (pn === 'landing') {
        await p.locator('button').filter({ hasText: 'Start now' }).first().click();
        await humanDelay(800, 1500); continue;
      }
      if (pn === 'registering-for-self') { await p.locator('input[name="whoIsRegistering"]').first().click(); await humanDelay(400, 700); await clickSubmit(p); await humanDelay(800, 1500); continue; }
      if (pn === 'first-time-registration' || pn === 'gp-registration-history') { await p.locator('input[name="firstTimeRegistration"]').first().click(); await humanDelay(300, 600); await clickSubmit(p); await humanDelay(800, 1500); continue; }
      
      if (pn === 'name') {
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
        await p.locator('#date-of-birth-day').fill(P.dobDay);
        await p.locator('#date-of-birth-month').fill(P.dobMonth);
        await p.locator('#date-of-birth-year').fill(P.dobYear);
        await humanDelay(400, 700);
        await clickSubmit(p); await humanDelay(1000, 2000);
        // NHS number page might be combined
        if (await p.locator('input[name="nhsNumberKnown"]').count() > 0) {
          await p.locator('input[name="nhsNumberKnown"]').nth(1).click();
          await humanDelay(400, 800);
          await clickSubmit(p); await humanDelay(1000, 2000);
        }
        continue;
      }
      
      // NHS number page (rare standalone)
      if (pn.includes('nhs-number')) {
        await humanDelay(400, 800);
        const nhsRadios = p.locator('input[type="radio"]');
        (await nhsRadios.count() >= 2) ? await nhsRadios.nth(1).click() : await nhsRadios.first().click();
        await humanDelay(400, 700); await clickSubmit(p); await humanDelay(1000, 2000); continue;
      }
      
      if (pn === 'review-matching') { await p.locator('#submit-details-button-id').waitFor({ timeout: 10000 }).catch(() => {}); await p.locator('#submit-details-button-id').click(); await humanDelay(1500, 2500); continue; }
      if (pn === 'current-address') { await p.locator('input[name="hasCurrentUkAddress"]').first().click(); await clickSubmit(p); await humanDelay(800, 1500); continue; }
      
      if (pn === 'find-current-address') {
        await p.locator('input[name="currentPostcode"]').fill(P.postcode);
        await p.locator('input[name="currentHouseNumber"]').fill(P.houseNumber);
        await p.locator('#continue-button-id').click(); await humanDelay(1500, 2500); continue;
      }
      
      if (pn === 'select-current-address') {
        if (await p.locator('input[name="currentAddress"]').count() > 0) {
          await p.locator('input[name="currentAddress"]').first().click();
          await clickSubmit(p); await humanDelay(1000, 1500); continue;
        }
        const manualLink = p.locator('a').filter({ hasText: /enter|can't find|manually|different/i }).first();
        if (await manualLink.count() > 0) { await manualLink.click(); await humanDelay(1500, 2500); continue; }
        await clickSubmit(p); await humanDelay(1000, 1500); continue;
      }
      
      if (pn === 'manual-current-address' || pn === 'enter-address-manually') {
        await p.locator('input[name="addressLine1"]').fill('1 High Street');
        await p.locator('input[name="townCity"]').fill('London');
        await p.locator('select[name="county"]').selectOption({ index: 1 }).catch(() => {});
        await p.locator('input[name="postcode"]').fill(P.postcode);
        await clickSubmit(p); await humanDelay(1500, 2500); continue;
      }
      
      if (pn === 'contact-details') {
        if (await p.locator('input[name="phone"]').count() > 0) await p.locator('input[name="phone"]').fill(P.phone);
        if (await p.locator('input[name="mobilePhone"]').count() > 0) await p.locator('input[name="mobilePhone"]').fill(P.phone);
        if (await p.locator('input[name="email"]').count() > 0) await p.locator('input[name="email"]').fill(P.email);
        await humanDelay(200, 500); await clickSubmit(p); await humanDelay(1000, 2000); continue;
      }
      
      if (pn === 'sex') { await p.locator('input[name="sex"]').first().click(); await clickSubmit(p); await humanDelay(1000, 1500); continue; }
      
      if (pn === 'ethnicity') { 
        // Click first visible radio
        const rads = p.locator('input[type="radio"]');
        for (let i = 0; i < await rads.count(); i++) {
          if (await rads.nth(i).isVisible()) { await rads.nth(i).click(); break; }
        }
        await clickSubmit(p); await humanDelay(1500, 2500); continue;
      }
      
      if (pn === 'ethnicity-asian' || pn === 'ethnicity-white' || pn === 'ethnicity-black' || pn === 'ethnicity-mixed' || pn === 'ethnicity-other') {
        const rads = p.locator('input[type="radio"]');
        if (await rads.count() > 0) await rads.first().click();
        await clickSubmit(p); await humanDelay(1000, 2000); continue;
      }
      
      if (pn === 'interpreter-required') {
        const rads = p.locator('input[type="radio"]');
        if (await rads.count() >= 2) await rads.nth(1).click(); else await rads.first().click();
        await clickSubmit(p); await humanDelay(1000, 1500); continue;
      }
      
      if (pn === 'interpreter-language') {
        const sel = p.locator('select');
        if (await sel.count() > 0) await sel.nth(0).selectOption({ index: 1 });
        await clickSubmit(p); await humanDelay(1000, 1500); continue;
      }
      
      if (pn === 'nominated-pharmacy') {
        const rads = p.locator('input[name="nominatedPharmacy"]');
        (await rads.count() >= 2) ? await rads.nth(1).click() : await rads.first().click();
        await humanDelay(500, 1000); await clickSubmit(p); await humanDelay(1500, 2500);
        continue;
      }
      
      if (pn === 'armed-forces') {
        const rads = p.locator('input[type="radio"]');
        if (await rads.count() >= 2) await rads.nth(1).click(); else await rads.first().click();
        await clickSubmit(p); await humanDelay(1500, 2500);
        if (p.url() === url) { await rads.first().click(); await clickSubmit(p); await humanDelay(1500, 2500); }
        continue;
      }
      
      if (pn === 'family-active-military' || pn === 'armed-forces-currently-active') {
        const rads = p.locator('input[type="radio"]');
        if (await rads.count() >= 2) await rads.nth(1).click(); else await rads.first().click();
        await clickSubmit(p); await humanDelay(1000, 2000); continue;
      }
      
      if (pn === 'emergency-contact') {
        const rads = p.locator('input[type="radio"]');
        if (await rads.count() >= 2) await rads.nth(1).click(); else await rads.first().click();
        await clickSubmit(p); await humanDelay(1000, 2000);
        if (p.url().includes('emergency-contact')) {
          // No radio was found — text fields
          const fields = p.locator('input:not([type="hidden"])');
          for (let i = 0; i < await fields.count(); i++) {
            try {
              const n = await fields.nth(i).getAttribute('name');
              const v = await fields.nth(i).inputValue().catch(() => '');
              if (v) continue;
              if (n?.includes('name') || n?.includes('Name')) await fields.nth(i).fill('Mary Jones');
              else if (n?.includes('phone') || n?.includes('tel')) await fields.nth(i).fill(P.phone);
              else if (n?.includes('relation')) await fields.nth(i).fill('Friend');
              else await fields.nth(i).fill('Test');
            } catch (e) {}
          }
          await clickSubmit(p); await humanDelay(1500, 2500);
        }
        continue;
      }
      
      if (pn === 'emergency-contact-details') {
        const fields = p.locator('input:not([type="hidden"])');
        for (let i = 0; i < await fields.count(); i++) {
          try {
            const n = await fields.nth(i).getAttribute('name');
            const v = await fields.nth(i).inputValue().catch(() => '');
            if (v) continue;
            if (n?.includes('name') || n?.includes('Name')) await fields.nth(i).fill('Mary Jones');
            else if (n?.includes('phone') || n?.includes('tel')) await fields.nth(i).fill(P.phone);
            else if (n?.includes('relation')) await fields.nth(i).fill('Friend');
            else await fields.nth(i).fill('Test');
          } catch (e) {}
        }
        await humanDelay(300, 700); await clickSubmit(p); await humanDelay(1500, 2500); continue;
      }
      
      if (pn === 'recently-arrived' || pn === 'outside-uk-born') {
        const rads = p.locator('input[type="radio"]');
        const count = await rads.count();
        log(`  ${count} radios`);
        // These pages ask "have you recently arrived" / "were you born outside UK"
        // Answer "No" (nth(1)) for realistic
        if (count >= 2) await rads.nth(1).click();
        else if (count > 0) await rads.first().click();
        await humanDelay(600, 1200);
        await clickSubmit(p);
        await humanDelay(2000, 3000);
        if (p.url() === url) {
          log(`  ⚠ retry`);
          await rads.first().click();
          await humanDelay(400, 800);
          await clickSubmit(p);
          await humanDelay(2000, 3000);
          if (p.url() === url) staleCount++;
        }
        continue;
      }
      
      if (pn === 'date-of-arrival') {
        const inputs = p.locator('input[type="text"]');
        const c = await inputs.count();
        for (let i = 0; i < Math.min(c, 3); i++) {
          try {
            const vals = ['01', '06', '2015'];
            await inputs.nth(i).fill(vals[i]);
          } catch (e) {}
        }
        await humanDelay(300, 700); await clickSubmit(p); await humanDelay(2000, 3000);
        if (p.url() === url) {
          for (let i = 0; i < c; i++) {
            try { if (!await inputs.nth(i).inputValue()) await inputs.nth(i).fill('2015'); } catch (e) {}
          }
          await clickSubmit(p); await humanDelay(2000, 3000);
          if (p.url() === url) staleCount++;
        }
        continue;
      }

      // === GENERIC HANDLER (let-through for unknown pages) ===
      {
        // Click first radio per group
        const radioNames = [...new Set(await (async () => {
          const ns = [];
          for (let i = 0; i < await p.locator('input[type="radio"]').count(); i++) {
            try { const n = await p.locator('input[type="radio"]').nth(i).getAttribute('name'); if (n) ns.push(n); } catch (e) {}
          }
          return ns;
        })())];
        for (const n of radioNames) {
          try { await p.locator(`input[name="${n.replace(/"/g, '\\"')}"]`).first().click({ timeout: 1000 }); } catch (e) {}
        }
        // Fill selects
        for (let i = 0; i < await p.locator('select').count(); i++) {
          try { const opts = await p.locator('select').nth(i).locator('option').all(); if (opts.length > 1) await p.locator('select').nth(i).selectOption({ index: 1 }); } catch (e) {}
        }
        // Fill text inputs
        for (let i = 0; i < await p.locator('input:not([type="hidden"]):not([type="radio"])').count(); i++) {
          try {
            const inp = p.locator('input:not([type="hidden"]):not([type="radio"])').nth(i);
            const v = await inp.inputValue().catch(() => '');
            if (v) continue;
            const n = await inp.getAttribute('name').catch(() => '');
            if (n.includes('email')) await inp.fill(P.email);
            else if (n.includes('phone') || n.includes('tel')) await inp.fill(P.phone);
            else if (n.includes('name') || n.includes('Name')) await inp.fill('Test Name');
            else if (n.includes('relation')) await inp.fill('Friend');
            else await inp.fill('Test');
          } catch (e) {}
        }
        await clickSubmit(p); await humanDelay(1500, 2500);
        if (p.url() === url) staleCount++;
      }
    }

    log(`\n🏁 ${p.url()}`);
    log(`📄 Pages: ${seen.size}`);
    try { await p.screenshot({ path: '/tmp/gpreg_final.png' }); } catch(e) {}

    const ref = await p.evaluate(() => {
      const t = document.body.innerText;
      const m = t.match(/GPREF[:\s]+([A-Z0-9\-]+)/i) || t.match(/reference[:\s]+([A-Z0-9\-]+)/i);
      return m ? m[1] : null;
    }).catch(() => null);
    if (ref) log(`\n🎯 GPREF: ${ref}`);

    await br.close();
    return { logs, success: !!ref, url: p.url(), pages: seen.size, gpref: ref };

  } catch (err) {
    log(`\n❌ ${err.message.substring(0, 200)}`);
    try { await p.screenshot({ path: '/tmp/gpreg_error.png' }); } catch (e) {}
    await br.close();
    return { logs, success: false, url: p.url(), pages: seen.size };
  }
}

async function marathon() {
  console.log('🏃 GPREG Marathon Mode');
  console.log('='.repeat(50));
  
  let attempt = 0;
  const MAX_ATTEMPTS = 10;
  
  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    console.log(`\n📋 Attempt ${attempt}/${MAX_ATTEMPTS}`);
    console.log('-'.repeat(30));
    
    const result = await runOnce();
    const allLogs = result.logs.join('\n');
    
    // Save result
    fs.appendFileSync('/tmp/gpreg_results.json', JSON.stringify({
      attempt, identity: allLogs.split('\n')[0] || '?',
      timestamp: new Date().toISOString(), resultUrl: result.url,
      pageCount: result.pages, success: result.success
    }) + '\n');
    
    if (result.success) {
      console.log('\n' + '='.repeat(50));
      console.log('✅✅✅ SUCCESS on attempt ' + attempt + '!');
      console.log('Reference: ' + (result.gpref || 'check screenshot'));
      console.log('='.repeat(50));
      fs.writeFileSync('/tmp/gpreg_result.txt', allLogs);
      return;
    }
    
    console.log(`❌ Attempt ${attempt} failed (${result.pages} pages)`);
    
    // Save logs for debugging
    fs.writeFileSync(`/tmp/gpreg_attempt_${attempt}.log`, allLogs);
    
    // Wait between attempts (proxy cooldown)
    const wait = 30 + Math.floor(Math.random() * 30);
    console.log(`⏳ Waiting ${wait}s before retry...`);
    await sleep(wait * 1000);
  }
  
  console.log(`\n❌ Exhausted ${MAX_ATTEMPTS} attempts.`);
}

marathon().then(() => process.exit(0)).catch(e => { console.log('FATAL:', e.message); process.exit(1); });
