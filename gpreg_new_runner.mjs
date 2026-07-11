/**
 * GPREG New Runner — Production v1.0
 * Complete NHS GP Registration automation
 * Uses UK residential proxy ONLY — never the IONOS server IP
 * Auto-saves to Lola Sheets on completion
 */
import { chromium } from 'playwright';
import fs from 'fs';
import http from 'http';

const SLEEP_MS = 800;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const LOLA_SHEETS_API = process.env.LOLA_SHEETS_URL || 'https://thenewworldorder.io/gpreg-api/entries';
const PROXY = process.env.PROXY || 'http://geo.spyderproxy.com:12321';
const PROXY_AUTH = process.env.PROXY_AUTH || 'DAz7xCYHAy:YOuOgB3lMb_country-gb_state-england';

// Identity generator
function generateIdentity(seed) {
  const rng = { val: seed || Date.now(), next() { this.val = (this.val * 16807 + 0) % 2147483647; return this.val / 2147483647; } };
  const titles = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr'];
  const givenNames = ['Sarah', 'James', 'Emma', 'Oliver', 'Amelia', 'Thomas', 'Jessica', 'William', 'Olivia', 'Jack', 'Sophie', 'George', 'Lily', 'Noah', 'Emily', 'Charlie', 'Poppy', 'Jacob', 'Alice', 'Michael', 'Grace', 'Henry', 'Ruby', 'Daniel', 'Ella'];
  const surnames = ['Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Walker', 'Wright', 'Thompson', 'White', 'Hughes', 'Edwards', 'Green', 'Hall', 'Wood', 'Harris'];
  return {
    title: titles[Math.floor(rng.next() * titles.length)],
    givenName: givenNames[Math.floor(rng.next() * givenNames.length)],
    surname: surnames[Math.floor(rng.next() * surnames.length)],
    dobd: String(1 + Math.floor(rng.next() * 28)).padStart(2, '0'),
    dobm: String(1 + Math.floor(rng.next() * 12)).padStart(2, '0'),
    doby: String(1950 + Math.floor(rng.next() * 50)),
    postcode: 'NW10 8SB',
    houseNumber: String(1 + Math.floor(rng.next() * 99)),
    phone: '0203917085',
    birthTown: 'London',
    email: `patient${Date.now()}@mail.com`.toLowerCase(),
    ecName: 'Emergency Contact',
    ecRelation: 'Friend'
  };
}

function saveToSheets(person, ref) {
  const entry = JSON.stringify({
    name: `${person.title} ${person.givenName} ${person.surname}`,
    dob: `${person.dobd}/${person.dobm}/${person.doby}`,
    postcode: person.postcode,
    phone: person.phone,
    gpreg: ref || '',
    status: ref ? 'done' : 'failed',
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  });
  
  const url = new URL(LOLA_SHEETS_API);
  const req = http.request({
    hostname: url.hostname, port: url.port || 443, path: url.pathname,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(entry) }
  }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => console.log('📊 Saved to Lola Sheets')); });
  req.on('error', e => console.log('⚠ Sheets save failed: ' + e.message));
  req.write(entry);
  req.end();
}

(async () => {
  const P = generateIdentity(Date.now());
  console.log(`\n🧑 Identity: ${P.title} ${P.givenName} ${P.surname}, DOB: ${P.dobd}/${P.dobm}/${P.doby}, Postcode: ${P.postcode}`);

  const br = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  const ctx = await br.newContext({
    locale: 'en-GB',
    proxy: { server: PROXY, username: PROXY_AUTH.split(':')[0], password: PROXY_AUTH.split(':')[1] },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
  });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
  const p = await ctx.newPage();

  async function submit() { try { await p.locator('button[type=submit]').first().click({ timeout: 3000 }); } catch(e) {} await sleep(SLEEP_MS); }
  async function radio(idx) { if (idx === undefined) idx = 0; try { const r = p.locator('input[type=radio]'); if (await r.count({ timeout: 1000 }).catch(() => 0) > idx) await r.nth(idx).check({ timeout: 1000 }).catch(() => {}); } catch(e) {} await sleep(100); }

  // Start
  await p.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', { timeout: 20000 });
  try { await p.locator('button').filter({ hasText: 'Accept additional cookies' }).first().click({ timeout: 3000 }); } catch(e) {}
  await sleep(800);
  await p.locator('button').filter({ hasText: 'Start now' }).first().click(); await sleep(SLEEP_MS * 2);

  // MATCHING
  await radio(0); await submit();
  await radio(0); await submit();
  try { await p.locator('select[name=prefix]').selectOption(P.title, { timeout: 3000 }); } catch(e) {}
  await p.locator('input[name=givenName]').fill(P.givenName);
  await p.locator('input[name=surname]').fill(P.surname);
  await submit();
  await p.locator('input[name*="day"]').first().fill(P.dobd);
  await p.locator('input[name*="month"]').first().fill(P.dobm);
  await p.locator('input[name*="year"]').first().fill(P.doby);
  await submit();
  await radio(1); await submit(); // No NHS number
  await submit(); // Review matching

  // PERSONAL
  await radio(0); await submit(); // Address: Yes
  await p.locator('input[name=currentPostcode]').fill(P.postcode);
  await p.locator('input[name=currentHouseNumber]').fill(P.houseNumber);
  await submit();
  await radio(0); await submit(); // Select address
  await p.locator('input[name*="phone"]').first().fill(P.phone);
  await submit();
  await radio(0); await submit(); // Sex
  await radio(0); await submit(); // Ethnicity
  await radio(0); await submit(); // Asian
  await radio(0); await submit(); // Interpreter
  await radio(0); await submit(); // Interpreter lang
  await radio(1); await submit(); // Pharmacy: No
  await radio(1); await submit(); // Armed forces: No
  await radio(0); await submit(); // Family active: No
  await radio(1); await submit(); // Currently active: No
  await radio(0); await submit(); // Emergency: Yes
  await p.locator('input[name=emergencyContactName]').fill(P.ecName);
  await p.locator('input[name=emergencyContactRelationship]').fill(P.ecRelation);
  await p.locator('input[name=emergencyContactPhone]').fill(P.phone);
  try { await p.locator('input[name=emergencyContactNextOfKin]').check(); } catch(e) {}
  await submit();
  await radio(1); await submit(); // Recently arrived: No
  await radio(0); await submit(); // Where born: England
  await p.locator('input[type="text"]').first().fill(P.birthTown);
  await submit();
  await radio(0); await submit(); // Previous address: Yes
  await p.locator('input[name=previousPostcode]').fill(P.postcode);
  await p.locator('input[name=previousHouseNumber]').fill(P.houseNumber);
  await submit();
  await radio(0); await submit(); // Select previous

  // HEALTH
  const fillVals = ['John', 'Doe', 'Friend', P.phone, 'None'];
  for (let i = 0; i < 200; i++) {
    const url = p.url();
    const pn = url.replace('https://gp-registration.nhs.uk/E84028/gpregistration/', '');
    if (pn.includes('review-application') || pn.includes('complete') || pn.includes('confirmation')) break;

    const txtInputs = await p.locator('input[type="text"]').all();
    let vi = 0;
    for (const inp of txtInputs) {
      if (!await inp.inputValue().catch(() => '')) { try { await inp.fill(fillVals[vi % fillVals.length]); vi++; } catch(e) {} }
    }
    const selects = await p.locator('select').all();
    for (const s of selects) { if (await s.locator('option').count() > 1) await s.selectOption({ index: 1 }).catch(() => {}); }
    const checks = p.locator('input[type=checkbox]');
    if (await checks.count({ timeout: 500 }).catch(() => 0) > 0) {
      for (const c of await checks.all()) { try { if (!await c.isChecked()) await c.check(); } catch(e) {} await sleep(20); }
    }
    await radio(0); await submit();
    if (p.url() === url) {
      console.log('⚠ Stuck on: ' + pn);
      const errs = await p.locator('.nhs-error-message').all();
      for (const e of errs) console.log('Error:', await e.textContent().catch(() => ''));
      break;
    }
  }

  // REVIEW & SUBMIT
  let gpref = null;
  if (p.url().includes('review-application')) {
    await sleep(2000);
    try {
      const checks = p.locator('input[type=checkbox]');
      if (await checks.count({ timeout: 2000 }).catch(() => 0) > 0) {
        for (const c of await checks.all()) { try { if (!await c.isChecked()) await c.check(); } catch(e) {} await sleep(100); }
      }
    } catch(e) {}
    await p.locator('button[type=submit]').first().click({ timeout: 10000 }).catch(() => {});
    await sleep(5000);
  }

  // EXTRACT GPREF
  try {
    const text = await p.evaluate(() => document.body.innerText);
    const m = text.match(/GPREG[\s:]+([A-Z0-9\-]+)/i);
    if (m) gpref = m[1];
  } catch(e) {}

  console.log('\n' + (gpref ? `🎯 GPREF: ${gpref}` : '❌ No GPREF found'));
  console.log('🏁 URL:', p.url());

  // Save to Lola Sheets
  saveToSheets(P, gpref);

  await br.close();
})();
