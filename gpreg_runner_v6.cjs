#!/usr/bin/env node
/**
 * GPREG v6 — NHS GP Registration with Puppeteer-Extra + Stealth
 * Uses puppeteer-extra (Chromium-based) with stealth plugin 
 * Bypasses WAF/anti-bot by hiding automation signatures.
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const { generateIdentity } = require('./gpreg_identity_gen.js');

function humanDelay(min, max) { return sleep(min + Math.random() * (max - min)); }

async function run() {
  const logs = [];
  const log = msg => { console.log(msg); logs.push(msg); };

  const id = generateIdentity(Date.now());
  const P = {
    title: id.title, givenName: id.givenName, surname: id.surname,
    dobDay: id.dobDay, dobMonth: id.dobMonth, dobYear: id.dobYear,
    postcode: id.postcode, houseNumber: id.houseNumber,
    email: id.email, phone: id.phone
  };
  log(`🤖 ${P.title} ${P.givenName} ${P.surname} | ${P.dobDay}/${P.dobMonth}/${P.dobYear}`);

  let prevUrl = '';
  let sameCount = 0;
  const seen = new Set();
  const MAX_SAME = 5;

  const br = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--proxy-server=http://geo.spyderproxy.com:12321',
      '--window-size=1280,720',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-notifications',
    ]
  });

  // Set proxy auth before any page loads
  await br.defaultBrowserContext().overridePermissions('https://gp-registration.nhs.uk', ['geolocation']);
  
  const p = await br.newPage();
  await p.authenticate({ username: 'DAz7xCYHAy', password: 'YOuOgB3lMb_country-gb_state-england' });
  await p.setViewport({ width: 1280, height: 720 });
  await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  await p.setExtraHTTPHeaders({ 'Accept-Language': 'en-GB,en;q=0.9' });

  // Monitor page events
  p.on('close', () => log('⚠ PAGE CLOSED'));
  p.on('pageerror', err => log(`⚠ ERROR: ${err.message.slice(0, 80)}`));

  try {
    log('🌐 Loading...');
    await p.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', {
      timeout: 30000, waitUntil: 'networkidle2'
    });

    // Accept cookies
    try { await p.click('#accept-cookies', { timeout: 3000 }); } catch(e) {}
    await humanDelay(500, 1000);

    // Click "Start now"
    await p.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const btn = btns.find(b => b.textContent.includes('Start now'));
      if (btn) btn.click();
    });
    await humanDelay(1500, 2500);

    while (sameCount < MAX_SAME) {
      // Alive check
      let alive = true;
      try { await p.evaluate(() => document.title); } catch(e) { alive = false; break; }

      const url = p.url();
      const pn = url.split('/').pop().split('?')[0];
      
      if (!seen.has(pn)) { log(`→ ${pn}`); seen.add(pn); sameCount = 0; }
      else sameCount++;
      
      // Check for success
      const text = await p.evaluate(() => document.body.innerText.slice(0, 1000)).catch(() => '');
      const ref = text.match(/GPREF[:\s]+([A-Z0-9\-]+)/i) || text.match(/reference[:\s]+([A-Z0-9\-]+)/i);
      if (ref) { log(`✅ REF: ${ref[1]}`); return { success: true, ref: ref[1], pages: seen.size, logs }; }
      if (url.includes('complete') || text.includes('submitted')) { log('✅ COMPLETE'); return { success: true, pages: seen.size, logs }; }

      // === SPECIFIC HANDLERS ===  
      try {
        // Landing — should advance automatically now
        if (pn === 'landing') {
          await humanDelay(500, 1000);
          continue;
        }

        if (pn === 'registering-for-self') {
          await p.click('input[name="whoIsRegistering"]');
          await humanDelay(500, 1000);
          await p.click('#continue-button-id');
          await humanDelay(1000, 2000);
          continue;
        }

        if (pn === 'first-time-registration' || pn === 'gp-registration-history') {
          await p.click('input[name="firstTimeRegistration"]');
          await humanDelay(400, 800);
          await p.click('#continue-button-id');
          await humanDelay(1000, 2000);
          continue;
        }

        if (pn === 'name') {
          await p.select('select[name="prefix"]', P.title);
          await humanDelay(200, 500);
          await p.type('input[name="givenName"]', P.givenName, { delay: 30 + Math.random() * 40 });
          await humanDelay(200, 400);
          await p.type('input[name="surname"]', P.surname, { delay: 30 + Math.random() * 40 });
          await humanDelay(500, 1000);
          await p.click('#continue-button-id');
          await humanDelay(1000, 2000);
          continue;
        }

        if (pn === 'date-of-birth') {
          await humanDelay(500, 1200);
          await p.type('#date-of-birth-day', P.dobDay, { delay: 30 + Math.random() * 40 });
          await p.type('#date-of-birth-month', P.dobMonth, { delay: 30 + Math.random() * 40 });
          await p.type('#date-of-birth-year', P.dobYear, { delay: 30 + Math.random() * 40 });
          await humanDelay(400, 800);
          await p.click('#continue-button-id');
          await humanDelay(1000, 2000);
          continue;
        }

        if (pn === 'nhs-number-known') {
          await humanDelay(500, 1000);
          const radios = await p.$$('input[type="radio"]');
          if (radios.length >= 2) await radios[1].click();
          else if (radios.length > 0) await radios[0].click();
          await humanDelay(400, 800);
          await p.click('#continue-button-id');
          await humanDelay(1000, 2000);
          continue;
        }

        if (pn === 'nhs-number') {
          // Press "I don't know" radio or just enter something tiny
          await humanDelay(300, 600);
          const r = await p.$$('input[type="radio"]');
          // If there's a radio for "I don't know"/"No", pick last one
          if (r.length >= 2) await r[r.length - 1].click();
          else if (r.length > 0) await r[0].click();
          // Try filling the text input as fallback
          const numberInput = await p.$('input[type="text"]') || await p.$('input[type="tel"]') || await p.$('input[type="number"]');
          if (numberInput) {
            const val = await numberInput.evaluate(el => el.value);
            if (!val) await numberInput.type('0', { delay: 10 });
          }
          await humanDelay(400, 800);
          await p.click('#continue-button-id').catch(() => p.click('button[type="submit"]'));
          await humanDelay(1000, 2000);
          continue;
        }

        if (pn === 'review-matching') {
          await humanDelay(500, 1000);
          const btn = await p.$('#submit-details-button-id');
          if (btn) await btn.click();
          await humanDelay(1500, 3000);
          continue;
        }

        if (pn === 'current-address') {
          await humanDelay(300, 700);
          await p.click('input[name="hasCurrentUkAddress"]');
          await humanDelay(300, 600);
          await p.click('#continue-button-id');
          await humanDelay(800, 1500);
          continue;
        }

        if (pn === 'find-current-address') {
          await humanDelay(500, 1000);
          await p.type('input[name="currentPostcode"]', P.postcode, { delay: 20 + Math.random() * 30 });
          await humanDelay(200, 500);
          await p.type('input[name="currentHouseNumber"]', P.houseNumber, { delay: 20 + Math.random() * 30 });
          await humanDelay(300, 700);
          await p.click('#continue-button-id');
          await humanDelay(1500, 3000);
          continue;
        }

        if (pn === 'select-current-address') {
          const radios = await p.$$('input[type="radio"]');
          if (radios.length > 0) {
            await radios[0].click();
            await humanDelay(300, 700);
            await p.click('#continue-button-id').catch(() => p.click('button[type="submit"]'));
            await humanDelay(1000, 1500);
            continue;
          }
          // No addresses — try manual entry
          const links = await p.$$('a');
          let clicked = false;
          for (const link of links) {
            const text = await link.evaluate(el => el.innerText.toLowerCase());
            if (text.includes('manually') || text.includes("can't find") || text.includes('enter')) {
              await link.click(); clicked = true; break;
            }
          }
          if (clicked) { await humanDelay(1500, 2500); continue; }
          // Fallback: just submit
          await p.click('#continue-button-id').catch(() => p.click('button[type="submit"]'));
          await humanDelay(1000, 2000);
          continue;
        }

        if (pn === 'manual-current-address' || pn === 'enter-address-manually') {
          // Fill ALL visible text inputs aggressively
          const inputs = await p.$$('input:not([type="hidden"])');
          let filledAddress = false, filledTown = false, filledPostcode = false;
          for (const inp of inputs) {
            try {
              const inpType = await inp.evaluate(el => el.type);
              if (inpType === 'radio' || inpType === 'checkbox') continue;
              if (await inp.evaluate(el => el.value)) continue;
              const name = await inp.evaluate(el => (el.name || el.id || '').toLowerCase());
              const placeholder = await inp.evaluate(el => (el.placeholder || '').toLowerCase());
              
              if (name.includes('addressline1') || name.includes('address1') || name.includes('street') || name === 'address' || 
                  placeholder.includes('address') || placeholder.includes('street')) {
                await inp.type('1 Main Road', { delay: 15 + Math.random() * 20 });
                filledAddress = true;
              } else if (name.includes('town') || name.includes('city') || placeholder.includes('town') || placeholder.includes('city')) {
                await inp.type('London', { delay: 15 + Math.random() * 20 });
                filledTown = true;
              } else if (name.includes('postcode') || placeholder.includes('postcode')) {
                await inp.type(P.postcode, { delay: 15 + Math.random() * 20 });
                filledPostcode = true;
              } else if (name.includes('county') || placeholder.includes('county')) {
                await inp.type('Greater London', { delay: 15 + Math.random() * 20 });
              } else {
                // Last resort: fill by index
                if (!filledAddress) { await inp.type('1 Main Road', { delay: 15 + Math.random() * 20 }); filledAddress = true; }
                else if (!filledTown) { await inp.type('London', { delay: 15 + Math.random() * 20 }); filledTown = true; }
                else if (!filledPostcode) { await inp.type(P.postcode, { delay: 15 + Math.random() * 20 }); filledPostcode = true; }
                else await inp.type('Test', { delay: 15 + Math.random() * 20 });
              }
            } catch(e) {}
          }
          // Fill selects
          const selects = await p.$$('select');
          for (const sel of selects) {
            try {
              const opts = await sel.$$('option');
              if (opts.length > 1) await sel.select(opts[1].value || '').catch(() => {});
            } catch(e) {}
          }
          await humanDelay(500, 1000);
          const btn = await p.$('#continue-button-id') || await p.$('button[type="submit"]');
          if (btn) await btn.click();
          await humanDelay(2000, 3000);
          if (p.url() === url) {
            // Didn't advance — try alternate approach
            sameCount++;
            log('  ⚠ manual addr stuck');
          }
          continue;
        }

        if (pn === 'contact-details') {
          const inputs = await p.$$('input[type="text"]');
          for (const inp of inputs) {
            const name = await inp.evaluate(el => el.name);
            if (await inp.evaluate(el => el.value)) continue;
            if (name.includes('phone') || name.includes('tel') || name.includes('mobile')) {
              await inp.type(P.phone, { delay: 15 + Math.random() * 25 });
            } else if (name.includes('email')) {
              await inp.type(P.email, { delay: 15 + Math.random() * 25 });
            }
          }
          await humanDelay(500, 1000);
          await p.click('#continue-button-id').catch(() => p.click('button[type="submit"]'));
          await humanDelay(1000, 2000);
          continue;
        }

        // Generic handler for radio/select/text pages
        {
          // Click first radio in each group
          const allRadios = await p.$$('input[type="radio"]');
          const seenRadios = new Set();
          for (const r of allRadios) {
            const name = await r.evaluate(el => el.name);
            if (!name || seenRadios.has(name)) continue;
            seenRadios.add(name);
            const visible = await r.evaluate(el => el.offsetParent !== null);
            if (visible) { await r.click(); await sleep(30 + Math.random() * 80); }
          }
          
          // Fill selects
          const allSelects = await p.$$('select');
          for (const s of allSelects) {
            const vu = await s.evaluate(el => el.offsetParent !== null);
            if (vu) {
              const opts = await s.$$('option');
              if (opts.length > 1) await s.select((await s.$$("option"))[1]?.value || "").catch(() => {});
            }
          }
          
          // Fill text inputs
          const textInputs = await p.$$('input[type="text"]');
          for (const inp of textInputs) {
            if (await inp.evaluate(el => el.value)) continue;
            const name = await inp.evaluate(el => el.name);
            if (name.includes('name') || name.includes('Name')) await inp.type('Test Name', { delay: 10 + Math.random() * 20 });
            else if (name.includes('relation')) await inp.type('Friend', { delay: 10 + Math.random() * 20 });
            else if (name.includes('phone') || name.includes('tel')) await inp.type(P.phone, { delay: 10 + Math.random() * 20 });
            else await inp.type('Test', { delay: 10 + Math.random() * 20 });
          }

          await humanDelay(500, 1000);
          
          // Click submit via button[type="submit"] or #continue-button-id
          const btn = await p.$('#continue-button-id') || await p.$('#submit-details-button-id') || await p.$('button[type="submit"]');
          if (btn) await btn.click();
          
          await humanDelay(1500, 3000);
          
          // Check if we advanced
          if (p.url() === url) {
            sameCount++;
            log(`  ⚠ stale (${sameCount}/${MAX_SAME})`);
            // Try clicking any visible button
            const allBtns = await p.$$('button');
            for (const b of allBtns) {
              const text = await b.evaluate(el => el.innerText.toLowerCase());
              if (text.includes('cookie') || text.includes('back')) continue;
              if (await b.evaluate(el => el.offsetParent !== null)) {
                await b.click();
                await sleep(1500);
                if (p.url() !== url) break;
              }
            }
          }
        }
      } catch (err) {
        log(`  ⚠ handler error: ${err.message.slice(0, 80)}`);
        sameCount++;
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
    if (ref) log(`🎯 GPREF: ${ref}`);

    return { success: !!ref, ref, pages: seen.size, logs };

  } catch (err) {
    log(`\n❌ ${err.message.slice(0, 200)}`);
    try { await p.screenshot({ path: '/tmp/gpreg_error.png' }); } catch(e) {}
    return { success: false, pages: seen.size, logs };
  } finally {
    await br.close();
  }
}

// Marathon mode
async function main() {
  const MAX_ATTEMPTS = 8;
  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    console.log(`\n📋 Attempt ${i}/${MAX_ATTEMPTS}`);
    console.log('='.repeat(40));
    
    const result = await run();
    fs.appendFileSync('/tmp/gpreg_results.json', JSON.stringify({
      attempt: i, timestamp: new Date().toISOString(),
      pageCount: result.pages, success: result.success
    }) + '\n');
    
    if (result.success) {
      console.log(`\n✅✅✅ SUCCESS on attempt ${i}!`);
      return;
    }
    
    const wait = 45 + Math.floor(Math.random() * 30);
    console.log(`\n⏳ ${wait}s cooldown...`);
    await sleep(wait * 1000);
  }
  console.log('\n❌ All attempts exhausted.');
}

main().then(() => process.exit(0)).catch(e => { console.log('FATAL:', e.message); process.exit(1); });
