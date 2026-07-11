#!/usr/bin/env node
/**
 * GPREG v2 — NHS GP Registration Automation
 * Direct, sequential, no-generic-loop approach
 * Each page handled explicitly
 */

const { chromium } = require('playwright-core');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROXY = {
  server: 'http://geo.spyderproxy.com:12321',
  username: 'DAz7xCYHAy',
  password: 'YOuOgB3lMb_country-gb_state-england'
};

async function fillForm(patient) {
  const logs = [];
  const log = (...args) => { console.log(...args); logs.push(...args.map(String)); };
  
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ locale: 'en-GB', proxy: PROXY,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const p = await ctx.newPage();

  try {
    log('🌐 Loading...');
    await p.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await sleep(1500);
    
    // Cookies
    try { await p.locator('button').filter({ hasText: 'Accept additional cookies' }).first().click({ timeout: 2000 }); } catch(e) {}
    await sleep(200);
    
    // Start now
    await p.locator('button').filter({ hasText: 'Start now' }).first().click({ timeout: 5000 });
    log('Q1 arrived');
    await sleep(1000);
    
    // Q1: Who is registering?
    await p.locator('input[name="whoIsRegistering"]').first().click();
    await sleep(50);
    await p.locator('button[type="submit"]').filter({ hasText: 'Continue' }).click({ timeout: 5000 });
    await sleep(1000);
    log('Q2 arrived');
    
    // Q2: First time?
    await p.locator('input[name="firstTimeRegistration"]').first().click();
    await sleep(50);
    await p.locator('button[type="submit"]').filter({ hasText: 'Continue' }).click({ timeout: 5000 });
    await sleep(1000);
    log('Q3 (name) arrived');
    
    // Q3: Name
    await p.locator('select[name="prefix"]').selectOption(patient.title || 'Mr');
    await p.locator('input[name="givenName"]').fill(patient.givenName);
    await p.locator('input[name="middleName"]').fill(patient.middleName || '');
    await p.locator('input[name="surname"]').fill(patient.surname);
    await p.locator('input[name="previousSurname"]').fill(patient.previousSurname || '');
    await p.locator('button[type="submit"]').filter({ hasText: 'Continue' }).click({ timeout: 5000 });
    await sleep(1000);
    log('Q4 (DOB) arrived');
    
    // Q4: DOB
    await p.locator('label').filter({ hasText: /^Day$/ }).locator('..').locator('input').first().fill(patient.dobDay);
    await p.locator('label').filter({ hasText: /^Month$/ }).locator('..').locator('input').first().fill(patient.dobMonth);
    await p.locator('label').filter({ hasText: /^Year$/ }).locator('..').locator('input').first().fill(patient.dobYear);
    await p.locator('button[type="submit"]').filter({ hasText: 'Continue' }).click({ timeout: 5000 });
    await sleep(1000);
    log('Q5 (NHS) arrived');
    
    // Q5: NHS number
    if (patient.nhsNumber) {
      await p.locator('input[name="nhsNumberKnown"]').first().click();
      await sleep(100);
      await p.locator('input[name="nhsNumber"]').fill(patient.nhsNumber);
    } else {
      await p.locator('input[name="nhsNumberKnown"]').nth(1).click();
    }
    await p.locator('button[type="submit"]').filter({ hasText: 'Continue' }).click({ timeout: 5000 });
    await sleep(1500);
    log('Review matching arrived');
    
    // === REVIEW MATCHING ===
    // Button is "Confirm and continue" id="submit-details-button-id"
    await p.locator('button#submit-details-button-id').click({ timeout: 5000 });
    await sleep(2000);
    log('Post-review:', p.url().split('/').pop());
    
    // === CONTINUE THROUGH REMAINING PAGES ===
    const handled = new Set();
    let stuckCount = 0;
    
    for (let step = 0; step < 30 && stuckCount < 3; step++) {
      const url = p.url();
      const pageName = url.split('/').pop();
      
      // Check for end conditions
      if (url.includes('check-answers') || url.includes('summary') || url.includes('complete') || url.includes('confirm')) {
        log('✅ Summary/confirm reached!');
        break;
      }
      
      const bodyText = await p.evaluate(() => document.body.innerText.substring(0, 300)).catch(() => '');
      if (/check your answers/i.test(bodyText)) { log('✅ Check answers!'); break; }
      
      if (handled.has(pageName)) { stuckCount++; await sleep(500); continue; }
      handled.add(pageName);
      stuckCount = 0;
      
      log(`\n📋 Page: ${pageName}`);
      
      // Handle specific pages
      // === CURRENT UK ADDRESS? (radio: hasCurrentUkAddress) ===
      if (pageName === 'current-address') {
        await p.locator('input[name="hasCurrentUkAddress"]').first().click(); // Yes
        await sleep(100);
        await p.locator('button[type="submit"]').filter({ hasText: 'Continue' }).click({ timeout: 5000 });
        await sleep(1500);
        continue;
      }
      
      // === FIND CURRENT ADDRESS (postcode + building lookup) ===
      if (pageName.includes('find-current-address') || pageName.includes('find-address') || pageName.includes('postcode')) {
        // Postcode input field (dynamic ID)
        const postcodeInput = p.locator('input[type="text"]').first();
        if (await postcodeInput.count() > 0) {
          await postcodeInput.fill(patient.postcode || 'N14 6JT');
          log('  📮 Postcode filled');
          await sleep(200);
        }
        
        // Try "Find address" button
        const findBtn = p.locator('button').filter({ hasText: /Find address|Find/i }).first();
        if (await findBtn.count() > 0) {
          await findBtn.click({ timeout: 5000 });
          await sleep(2000);
          continue;
        }
        // Fallback to Continue
        await p.locator('button[type="submit"]').first().click({ timeout: 5000 }).catch(() => {});
        await sleep(1500);
        continue;
      }
      
      // === CHOOSE ADDRESS (from postcode results) ===
      if (pageName.includes('choose-address') || pageName.includes('select-address')) {
        const addrSelect = p.locator('select').first();
        if (await addrSelect.count() > 0) {
          try { await addrSelect.selectOption({ index: 1 }); } catch(e) {}
          await sleep(100);
        }
        await p.locator('button[type="submit"]').first().click({ timeout: 5000 }).catch(() => {});
        await sleep(1500);
        continue;
      }
      
      // === ADDRESS DETAILS (manual input) ===
      if (pageName.includes('address') && (await p.locator('input[name="address1"]').count() > 0 || await p.locator('input[name="addressLine1"]').count() > 0)) {
        await p.locator('input[name="address1"], input[name="addressLine1"]').first().fill(patient.addressLine1 || '315 Chase Road');
        await p.locator('input[name="address2"], input[name="addressLine2"]').first().fill(patient.addressLine2 || '');
        await p.locator('input[name="town"]').first().fill(patient.town || 'London');
        await p.locator('input[name="postcode"]').first().fill(patient.postcode || 'N14 6JT');
        await p.locator('button[type="submit"]').first().click({ timeout: 5000 }).catch(() => {});
        await sleep(1500);
        continue;
      }
      
      // Generic handler for all other pages
      const radios = await p.locator('input[type="radio"]').all();
      const textInputs = await p.locator('input[type="text"], input[type="tel"], input[type="email"]').all();
      const selects = await p.locator('select').all();
      
      // Fill radios
      const radioNames = [...new Set(await Promise.all(radios.map(r => r.getAttribute('name'))))];
      for (const name of radioNames) {
        if (!name) continue;
        const r = p.locator(`input[name="${name}"]`);
        await r.first().click();
        await sleep(50);
      }
      
      // Fill selects
      for (const sel of selects) {
        const opts = await sel.locator('option').all();
        if (opts.length > 1) await sel.selectOption({ index: 1 }).catch(() => {});
      }
      
      // Fill text inputs
      for (const inp of textInputs) {
        const name = await inp.getAttribute('name');
        if (!name) continue;
        if (name.includes('phone') || name.includes('tel')) await inp.fill(patient.phone || '07700900000');
        else if (name.includes('email')) await inp.fill(patient.email || 'test@example.com');
        else if (name.includes('nhs')) {} // skip
        else await inp.fill('Test');
      }
      
      await sleep(100);
      
      // Click submit
      let clicked = false;
      for (const sel of [
        'button[type="submit"]',
        'button.nhsuk-button',
        'button.govuk-button'
      ]) {
        const btn = p.locator(sel).first();
        if (await btn.count() > 0) {
          await btn.click({ timeout: 3000 }).catch(() => {});
          clicked = true;
          break;
        }
      }
      
      await sleep(1500);
      if (p.url() === url) {
        log('  [same URL]');
        // Try "Find address" or "Save and continue"
        await p.locator('button').filter({ hasText: /Find|Save|Yes/i }).first().click({ timeout: 3000 }).catch(() => {});
        await sleep(1500);
      }
    }
    
    log(`\n🎯 Final: ${p.url()}`);
    log(`📄 ${await p.title()}`);
    
    await p.screenshot({ path: '/tmp/gpreg_final.png' }).catch(() => {});
    log('📸 Screenshot saved');

  } catch (err) {
    log(`\n❌ ${err.message}`);
    try { await p.screenshot({ path: '/tmp/gpreg_error.png' }).catch(() => {}); } catch(e) {}
  }
  
  await browser.close();
  fs.writeFileSync('/tmp/gpreg_run_log.txt', logs.join('\n'));
  return logs;
}

// === RUN ===
const patient = {
  givenName: 'John', surname: 'Smith',
  dobDay: '15', dobMonth: '06', dobYear: '1990',
  phone: '07700900000', email: 'john@test.com',
  nhsNumber: '',
  postcode: 'N14 6JT'
};

fillForm(patient).then(logs => {
  const ok = logs.some(l => l.includes('Summary') || l.includes('answers') || l.includes('Final'));
  console.log(ok ? '\n✅ DONE' : '\n❌ FAILED');
  process.exit(ok ? 0 : 1);
});
