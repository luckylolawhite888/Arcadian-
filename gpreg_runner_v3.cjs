#!/usr/bin/env node
/**
 * GPREG v3 — NHS GP Registration Automation
 * Explicit-step approach + specialized handlers.
 */

const { chromium } = require('playwright-core');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROXY = {
  server: 'http://geo.spyderproxy.com:12321',
  username: 'DAz7xCYHAy',
  password: 'YOuOgB3lMb_country-gb_state-england'
};

const P = {
  title: 'Mr', givenName: 'John', surname: 'Smith',
  dobDay: '15', dobMonth: '06', dobYear: '1990',
  nhsNumber: '',
  postcode: 'N14 6JT', houseNumber: '315',
  email: 'john@test.com', phone: '07700900000'
};

async function clk(pg) {
  for (const id of ['#continue-button-id', '#submit-details-button-id']) {
    const b = pg.locator(id);
    if (await b.count() > 0 && await b.isVisible()) { await b.click({ timeout: 5000 }).catch(() => {}); return true; }
  }
  const btns = pg.locator('button[type="submit"]');
  for (let i = 0; i < await btns.count(); i++) {
    try {
      const t = await btns.nth(i).textContent();
      if (t && !t.toLowerCase().includes('cookie') && await btns.nth(i).isVisible()) { await btns.nth(i).click({ timeout: 5000 }); return true; }
    } catch(e) {}
  }
  return false;
}

async function radioClick(pg, name, idx) {
  const r = pg.locator('input[name="' + name + '"]');
  if (await r.count() > idx) { await r.nth(idx).click(); return true; }
  return false;
}

async function fillInp(pg, name, val) {
  const i = pg.locator('input[name="' + name + '"]');
  if (await i.count() > 0) { await i.fill(val); return true; }
  return false;
}

async function run() {
  const logs = [];
  const log = (...a) => { const m = a.join(' '); console.log(m); logs.push(m); };
  const br = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await br.newContext({ locale: 'en-GB', proxy: PROXY });
  const p = await ctx.newPage();

  try {
    log('🌐 Loading...');
    await p.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await p.locator('button').filter({ hasText: 'Start now' }).first().waitFor({ timeout: 10000 });
    await sleep(500);
    try { await p.locator('#accept-cookies').click({ timeout: 2000 }); } catch(e) {}
    
    // === PAGE-BY-PAGE ===
    let step = 0;
    let stuck = 0;
    
    while (step < 60 && stuck < 3) {
      const url = p.url();
      const pn = url.split('/').pop();
      
      if (pn.includes('complete') || pn.includes('confirmation') || pn === 'complete') { log('✅ COMPLETE!'); break; }
      if (pn.includes('summary') || pn.includes('check-answers')) { log('📋 Summary'); await clk(p); await sleep(2000); continue; }
      
      if (step === 0) { log('→ ' + pn); step++; }
      
      // === EXPLICIT STEP HANDLERS ===
      
      if (pn === 'landing') {
        log('Start now');
        await p.locator('button').filter({ hasText: 'Start now' }).first().click({ timeout: 5000 });
        await sleep(800); step++; continue;
      }
      
      if (pn === 'registering-for-self') {
        await radioClick(p, 'whoIsRegistering', 0);
        await sleep(50); await clk(p); await sleep(800); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'first-time-registration' || pn === 'gp-registration-history') {
        await radioClick(p, 'firstTimeRegistration', 0);
        await sleep(50); await clk(p); await sleep(800); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'name') {
        await p.locator('select[name="prefix"]').selectOption(P.title);
        await fillInp(p, 'givenName', P.givenName);
        await fillInp(p, 'surname', P.surname);
        await sleep(50); await clk(p); await sleep(800); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'date-of-birth') {
        await p.locator('label').filter({ hasText: /^Day$/ }).locator('..').locator('input').first().fill(P.dobDay);
        await p.locator('label').filter({ hasText: /^Month$/ }).locator('..').locator('input').first().fill(P.dobMonth);
        await p.locator('label').filter({ hasText: /^Year$/ }).locator('..').locator('input').first().fill(P.dobYear);
        await sleep(50); await clk(p); await sleep(800); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'nhs-number-known') {
        await radioClick(p, 'nhsNumberKnown', 1);
        await sleep(50); await clk(p); await sleep(1500); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'review-matching') {
        await p.locator('#submit-details-button-id').waitFor({ timeout: 10000 }).catch(() => {});
        await sleep(200);
        await p.locator('#submit-details-button-id').click({ timeout: 5000 });
        await sleep(2000); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'current-address') {
        await radioClick(p, 'hasCurrentUkAddress', 0);
        await sleep(50); await clk(p); await sleep(1500); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'find-current-address') {
        await fillInp(p, 'currentPostcode', P.postcode);
        await fillInp(p, 'currentHouseNumber', P.houseNumber);
        await p.locator('#continue-button-id').click({ timeout: 5000 });
        await sleep(2000); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'select-current-address') {
        const r = p.locator('input[name="currentAddress"]');
        if (await r.count() > 0) { await r.first().click(); await sleep(50); }
        await clk(p); await sleep(1500); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'not-in-catchment') {
        // Radio values: 1=Continue, 2=Cancel (NOT standard 1/0)
        await radioClick(p, 'notInCatchment', 0);
        await sleep(50); await clk(p); await sleep(1500);
        if (p.url() === url) { // Try other buttons
          for (const t of ['I understand', 'Continue anyway', 'Continue']) {
            const b = p.locator('button').filter({ hasText: t }).first();
            if (await b.count() > 0) { await b.click({ timeout: 3000 }).catch(() => {}); await sleep(1500); break; }
          }
        }
        log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'contact-details') {
        const e = p.locator('input[type="email"]');
        if (await e.count() > 0) { await e.first().fill(P.email); await sleep(50); }
        const ph = p.locator('input[type="tel"]');
        if (await ph.count() > 0) { await ph.first().fill(P.phone); await sleep(50); }
        await fillInp(p, 'phoneNumber', P.phone).catch(() => {});
        await clk(p); await sleep(1500); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'sex') {
        // Male=1, Female=0
        await radioClick(p, 'sex', 0);
        await sleep(50); await clk(p); await sleep(1000); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      if (pn === 'interpreter-required') {
        await radioClick(p, 'interpreterRequired', 1); // No interpreter
        await sleep(50); await clk(p); await sleep(1000); log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      // == EMERGENCY CONTACT ==
      if (pn.includes('emergency-contact')) {
        // May be TWO pages: emergency-contact (radio: do you have one?) 
        // and emergency-contact-details (name, phone, relationship)
        
        // Check if there's a radio (yes/no if I have an EC)
        const rNames = [...new Set(await (async () => {
          const ns = [];
          for (let i = 0; i < await p.locator('input[type="radio"]').count(); i++) {
            const n = await p.locator('input[type="radio"]').nth(i).getAttribute('name').catch(() => null);
            if (n) ns.push(n);
          }
          return ns;
        })())];
        
        if (rNames.length > 0) {
          // Radio page: select first option (Yes / I have one)
          for (const n of rNames) {
            try { await p.locator('input[name="' + n + '"]').first().click({ timeout: 1000 }); await sleep(50); } catch(e) {}
          }
          await clk(p); await sleep(1500);
          if (p.url() !== url) { log('→ ' + p.url().split('/').pop()); step++; continue; }
        }
        
        // Details page: fill text inputs + possibly more radios
        // Get all visible inputs
        const inps = p.locator('input:not([type="hidden"])');
        for (let i = 0; i < await inps.count(); i++) {
          try {
            const inp = inps.nth(i);
            const type = await inp.getAttribute('type');
            const n = await inp.getAttribute('name');
            const v = await inp.inputValue();
            if (!n || v) continue;
            
            if (type === 'radio') {
              await inp.click(); await sleep(30);
            } else if (type === 'text' || type === 'tel') {
              if (n.includes('phone') || n.includes('mobile')) await inp.fill(P.phone);
              else if (n.includes('name') || n.includes('Name') || n.includes('fullName') || n.includes('full-name')) await inp.fill('Emergency Contact');
              else if (n.includes('relationship') || n.includes('Relation')) await inp.fill('Friend');
              else if (n.includes('email')) await inp.fill(P.email);
              else await inp.fill('Test');
              await sleep(30);
            }
          } catch(e) {}
        }
        
        await clk(p); await sleep(1500);
        if (p.url() === url) {
          log('  ⚠ stale');
          // Try all buttons
          try {
            const allBtns = p.locator('button');
            for (let i = 0; i < await allBtns.count(); i++) {
              const t = await allBtns.nth(i).textContent().catch(() => '');
              if (t && !t.toLowerCase().includes('cookie') && await allBtns.nth(i).isVisible()) {
                await allBtns.nth(i).click({ timeout: 3000 }).catch(() => {});
                await sleep(1500);
                if (p.url() !== url) break;
              }
            }
          } catch(e) {}
          if (p.url() === url) stuck++;
          else { log('→ ' + p.url().split('/').pop()); step++; }
        } else { log('→ ' + p.url().split('/').pop()); step++; }
        continue;
      }
      
      // == ARMED FORCES ==
      if (pn.includes('armed-forces')) {
        // Generic handler will deal with this
      }
      
      // == FIND PHARMACY ==
      if (pn.includes('find-nominated-pharmacy') || pn.includes('find-pharmacy')) {
        await fillInp(p, 'currentPostcode', P.postcode).catch(() => {});
        await fillInp(p, 'postcode', P.postcode).catch(() => {});
        const inp = p.locator('input[type="text"]').first();
        const v = await inp.inputValue().catch(() => '');
        if (!v) { await inp.fill(P.postcode); await sleep(100); }
        await clk(p); await sleep(2000);
        if (p.url() === url) { log('  ⚠ stale'); stuck++; }
        log('→ ' + p.url().split('/').pop()); step++; continue;
      }
      
      // ====== GENERIC HANDLER ======
      const inps = p.locator('input');
      const rNames = [...new Set(await (async () => {
        const ns = [];
        for (let i = 0; i < await inps.count(); i++) {
          try {
            if ((await inps.nth(i).getAttribute('type')) === 'radio') {
              const n = await inps.nth(i).getAttribute('name');
              if (n) ns.push(n);
            }
          } catch(e) {}
        }
        return ns;
      })())];
      for (const n of rNames) {
        try { await p.locator('input[name="' + n + '"]').first().click({ timeout: 1000 }); await sleep(30); } catch(e) {}
      }
      
      for (let i = 0; i < await p.locator('select').count(); i++) {
        try {
          const s = p.locator('select').nth(i);
          const opts = await s.locator('option').all();
          if (opts.length > 1) await s.selectOption({ index: 1 });
        } catch(e) {}
      }
      
      for (let i = 0; i < await p.locator('input[type="text"], input[type="tel"], input[type="email"]').count(); i++) {
        try {
          const inp = p.locator('input[type="text"], input[type="tel"], input[type="email"]').nth(i);
          const n = await inp.getAttribute('name');
          const v = await inp.inputValue();
          if (!n || v) continue;
          if (n.includes('email')) await inp.fill(P.email);
          else if (n.includes('phone')) await inp.fill(P.phone);
          else await inp.fill('Test');
          await sleep(20);
        } catch(e) {}
      }
      
      await sleep(100);
      const b4 = p.url();
      const clicked = await clk(p);
      await sleep(1500);
      if (p.url() === b4) {
        log('  ⚠ stale → ' + pn);
        // Aggressive re-try: try every non-cookie button on the page
        try {
          const allBtns = p.locator('button');
          for (let i = 0; i < await allBtns.count(); i++) {
            const t = await allBtns.nth(i).textContent().catch(() => '');
            if (t && !t.toLowerCase().includes('cookie') && await allBtns.nth(i).isVisible()) {
              await allBtns.nth(i).click({ timeout: 3000 }).catch(() => {});
              await sleep(1500);
              if (p.url() !== b4) break;
            }
          }
        } catch(e) {}
        if (p.url() === b4) stuck++; else { log('→ ' + p.url().split('/').pop()); step++; }
      } else {
        log('→ ' + p.url().split('/').pop()); step++;
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
});
