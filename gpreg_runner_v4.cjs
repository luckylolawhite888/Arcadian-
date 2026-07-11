#!/usr/bin/env node
/**
 * GPREG v4 — NHS GP Registration Automation
 * Optimized: explicit ~10 pages, then generic handler with special cases.
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROXY = {
  server: 'http://geo.spyderproxy.com:12321', username: 'DAz7xCYHAy', password: 'YOuOgB3lMb_country-gb_state-england'
};
const P = { title: 'Mr', givenName: 'John', surname: 'Smith', dobDay: '15', dobMonth: '06', dobYear: '1990',
  nhsNumber: '', postcode: 'ZZ99 9ZZ', houseNumber: '1', email: 'john@test.com', phone: '07700900000' };

async function run() {
  const logs = []; const log = (...a) => { const m = a.join(' '); console.log(m); logs.push(m); };
  const br = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await br.newContext({ locale: 'en-GB', proxy: PROXY });
  const p = await ctx.newPage();

  async function sub() {
    for (const id of ['#continue-button-id', '#submit-details-button-id']) {
      const b = p.locator(id); if (await b.count() > 0 && await b.isVisible()) return b.click({ timeout: 5000 });
    }
    const btns = p.locator('button[type="submit"]');
    for (let i = 0; i < await btns.count(); i++) {
      const t = await btns.nth(i).textContent();
      if (t && !t.toLowerCase().includes('cookie') && await btns.nth(i).isVisible()) return btns.nth(i).click({ timeout: 5000 });
    }
    const ab = p.locator('button');
    for (let i = 0; i < await ab.count(); i++) {
      const t = await ab.nth(i).textContent();
      if (t && !t.toLowerCase().includes('cookie') && await ab.nth(i).isVisible()) return ab.nth(i).click({ timeout: 5000 });
    }
  }

  try {
    log('🌐 Loading...');
    await p.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await p.locator('button').filter({ hasText: 'Start now' }).first().waitFor({ timeout: 10000 });
    try { await p.locator('#accept-cookies').click({ timeout: 2000 }); } catch(e) {}
    
    let stuck = 0; const seen = new Set();
    
    while (stuck < 3) {
      const url = p.url(); const pn = url.split('/').pop();
      
      if (pn.includes('complete') || pn === 'complete' || pn.includes('confirmation')) { log('✅ COMPLETE!'); break; }
      if (pn.includes('summary') || pn.includes('check-answers')) { log('📋 Summary'); await sub(); await sleep(2000); continue; }
      
      if (!seen.has(pn)) { log('→ ' + pn); seen.add(pn); stuck = 0; }
      
      // === EXPLICIT HANDLERS ===
      if (pn === 'landing') { await p.locator('button').filter({ hasText: 'Start now' }).first().click({ timeout: 5000 }); await sleep(1000); continue; }
      if (pn === 'registering-for-self') { await p.locator('input[name="whoIsRegistering"]').first().click(); await sub(); await sleep(1000); continue; }
      if (pn === 'first-time-registration' || pn === 'gp-registration-history') { await p.locator('input[name="firstTimeRegistration"]').first().click(); await sub(); await sleep(1000); continue; }
      if (pn === 'name') { await p.locator('select[name="prefix"]').selectOption(P.title); await p.locator('input[name="givenName"]').fill(P.givenName); await p.locator('input[name="surname"]').fill(P.surname); await sub(); await sleep(1000); continue; }
      if (pn === 'date-of-birth') { await p.locator('label').filter({ hasText: /^Day$/ }).locator('..').locator('input').first().fill(P.dobDay); await p.locator('label').filter({ hasText: /^Month$/ }).locator('..').locator('input').first().fill(P.dobMonth); await p.locator('label').filter({ hasText: /^Year$/ }).locator('..').locator('input').first().fill(P.dobYear); await sub(); await sleep(1000); continue; }
      if (pn === 'nhs-number-known') { await p.locator('input[name="nhsNumberKnown"]').first().click(); await p.locator('input[name="nhsNumberKnown"]').nth(1).click(); await sub(); await sleep(1500); continue; }
      if (pn === 'review-matching') { await p.locator('#submit-details-button-id').waitFor({ timeout: 10000 }).catch(() => {}); await p.locator('#submit-details-button-id').click({ timeout: 5000 }); await sleep(2000); continue; }
      if (pn === 'current-address') { await p.locator('input[name="hasCurrentUkAddress"]').first().click(); await sub(); await sleep(1500); continue; }
      if (pn === 'find-current-address') { await p.locator('input[name="currentPostcode"]').fill(P.postcode); await p.locator('input[name="currentHouseNumber"]').fill(P.houseNumber); await p.locator('#continue-button-id').click({ timeout: 5000 }); await sleep(2000); continue; }
      if (pn === 'select-current-address') { const r = p.locator('input[name="currentAddress"]'); if (await r.count() > 0) await r.first().click(); await sub(); await sleep(1500); continue; }
      if (pn === 'not-in-catchment') { await p.locator('input[name="notInCatchment"]').first().click(); await sub(); await sleep(1500); continue; }
      
      // CONTACT DETAILS
      if (pn === 'contact-details') {
        await p.locator('input[name="phone"]').fill(P.phone).catch(() => {});
        await p.locator('input[name="mobilePhone"]').fill(P.phone).catch(() => {});
        await p.locator('input[name="email"]').fill(P.email).catch(() => {});
        await sleep(200);
        await sub(); await sleep(1500);
        continue;
      }
      
      // NOMINATED PHARMACY — explicitly click "No" to skip sub-questions
      if (pn === 'nominated-pharmacy') {
        const rads = p.locator('input[name="nominatedPharmacy"]');
        if (await rads.count() >= 2) { await rads.nth(1).click(); await sleep(300); }
        else if (await rads.count() > 0) { await rads.first().click(); await sleep(300); }
        await sub(); await sleep(1500);
        continue;
      }
      
      // POSTCODE LOOKUP PAGES
      if (pn.includes('find-previous-address') || pn.includes('find-pharmacy') || pn.includes('find-nominated')) {
        await p.locator('input[type="text"]').first().fill(P.postcode);
        await sleep(100);
        await p.locator('#continue-button-id').click({ timeout: 8000 }).catch(() => {});
        await sleep(3000);
        if (p.url().includes(pn)) { await sub(); await sleep(2000); }
        continue;
      }
      
      // SELECT ADDRESS / DETAILS pages (radios)
      if (pn.includes('select-') || pn.includes('choose-') || pn.includes('-details')) {
        const rads = p.locator('input[type="radio"]');
        if (await rads.count() > 0) { for (let i = 0; i < await rads.count(); i++) { try { await rads.nth(i).click().catch(() => {}); } catch(e) {} } }
        await sub(); await sleep(1500);
        if (p.url().includes(pn)) { await sleep(500); await sub(); await sleep(1500); }
        continue;
      }
      
      // DATE OF ARRIVAL / EHIC
      if (pn.includes('date-of-arrival') || pn.includes('arrival')) {
        const inputs = p.locator('input[type="text"], input:not([type="radio"]):not([type="hidden"])');
        const fields = [];
        for (let i = 0; i < await inputs.count(); i++) { try { const v = await inputs.nth(i).inputValue(); if (!v) fields.push(inputs.nth(i)); } catch(e) {} }
        if (fields.length >= 3) { await fields[0].fill('15'); await fields[1].fill('06'); await fields[2].fill('2015'); }
        else { for (const f of fields) await f.fill('2015'); }
        await sub(); await sleep(1500); continue;
      }
      
      // === GENERIC HANDLER ===
      // Click all radio buttons
      const rNames = [...new Set(await (async () => {
        const ns = [];
        for (let i = 0; i < await p.locator('input[type="radio"]').count(); i++) {
          try { const n = await p.locator('input[type="radio"]').nth(i).getAttribute('name'); if (n) ns.push(n); } catch(e) {}
        }
        return ns;
      })())];
      for (const n of rNames) { try { await p.locator('input[name="' + n + '"]').first().click({ timeout: 1000 }).catch(() => {}); await sleep(20); } catch(e) {} }
      
      // Select dropdowns
      for (let i = 0; i < await p.locator('select').count(); i++) {
        try { const s = p.locator('select').nth(i); const opts = await s.locator('option').all(); if (opts.length > 1) await s.selectOption({ index: 1 }); } catch(e) {}
      }
      
      // Fill text inputs
      for (let i = 0; i < await p.locator('input:not([type="hidden"])').count(); i++) {
        try {
          const inp = p.locator('input:not([type="hidden"])').nth(i);
          const t = await inp.getAttribute('type'); if (t === 'radio') continue;
          const n = await inp.getAttribute('name'); const v = await inp.inputValue();
          if (!n || v) continue;
          if (n.includes('email') || n.includes('Email')) await inp.fill(P.email);
          else if (n.includes('phone') || n.includes('Phone') || n.includes('tel') || n.includes('mobile')) await inp.fill(P.phone);
          else if (n.includes('name') || n.includes('Name') || n.includes('fullName')) await inp.fill('Emergency Contact');
          else if (n.includes('relation')) await inp.fill('Friend');
          else if (n.includes('postcode') || n.includes('Postcode')) await inp.fill(P.postcode);
          else await inp.fill('Test');
          await sleep(15);
        } catch(e) {}
      }
      
      await sub(); await sleep(1500);
      if (p.url() === url) {
        log('  ⚠ stale (' + (stuck + 1) + '/3)');
        const ab = p.locator('button');
        for (let i = 0; i < await ab.count(); i++) {
          try {
            const t = await ab.nth(i).textContent();
            if (t && !t.toLowerCase().includes('cookie') && await ab.nth(i).isVisible()) {
              await ab.nth(i).click({ timeout: 3000 }); await sleep(1500);
              if (p.url() !== url) break;
            }
          } catch(e) {}
        }
        if (p.url() === url) stuck++;
      }
    }
    
    log('\n🏁 ' + p.url());
    try { await p.screenshot({ path: '/tmp/gpreg_final.png' }); } catch(e) {}
    const ref = await p.evaluate(() => {
      const t = document.body.innerText;
      const m = t.match(/GPREF[:\s]+([A-Z0-9\-]+)/i) || t.match(/reference[:\s]+([A-Z0-9\-]+)/i);
      return m ? m[1] : null;
    }).catch(() => null);
    if (ref) log('\n🎯 Ref: ' + ref);
  } catch (err) {
    log('\n❌ ' + err.message.substring(0, 200));
    try { await p.screenshot({ path: '/tmp/gpreg_error.png' }); } catch(e) {}
  }
  await br.close();
  fs.writeFileSync('/tmp/gpreg_log.txt', logs.join('\n'));
  return logs;
}

run().then(logs => {
  const ok = logs.some(l => l.includes('COMPLETE') || l.includes('Ref:'));
  console.log(ok ? '\n✅ SUCCESS' : '\n❌ FAILED');
  process.exit(ok ? 0 : 1);
}).catch(e => { console.log('❌ ' + e.message); process.exit(1); });
