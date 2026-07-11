#!/usr/bin/env node
/**
 * GPREG GO — Production runner, callable on demand
 *
 * Usage: node gpreg_go.cjs [--count=5]
 *
 * Generates fresh identities, submits to NHS via UK residential proxy,
 * saves every result to Lola Sheets. Never runs on the server IP.
 */
const { chromium } = require('/root/node_modules/playwright-core');
const http = require('http');
const https = require('https');

const PROXY = { server: 'http://geo.spyderproxy.com:12321', username: 'DAz7xCYHAy', password: 'YOuOgB3lMb_country-gb_state-england' };
const LOLA_SHEETS = 'https://thenewworldorder.io/gpreg-api/entries';
const NHS_URL = 'https://gp-registration.nhs.uk/E84028/gpregistration/landing';
const IDENTITY_POOL = {
  titles: ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr'],
  given: ['James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',
          'George','Lily','Noah','Emily','Charlie','Poppy','Jacob','Alice','Michael','Grace',
          'Henry','Ruby','Daniel','Ella','Samuel','Alexa','Ryan','Mia'],
  surnames: ['Smith','Jones','Williams','Taylor','Brown','Davies','Wilson','Evans','Thomas',
             'Roberts','Walker','Wright','Thompson','White','Hughes','Edwards','Green','Hall',
             'Wood','Harris','Martin','Jackson','Clarke','Baker','Hill','Moore','Allen']
};

function rng(seed) {
  let s = seed || Date.now();
  return { next() { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; } };
}

function makePerson(seed) {
  const r = rng(seed);
  return {
    title: IDENTITY_POOL.titles[Math.floor(r.next() * IDENTITY_POOL.titles.length)],
    givenName: IDENTITY_POOL.given[Math.floor(r.next() * IDENTITY_POOL.given.length)],
    surname: IDENTITY_POOL.surnames[Math.floor(r.next() * IDENTITY_POOL.surnames.length)],
    dobd: String(1 + Math.floor(r.next() * 28)).padStart(2, '0'),
    dobm: String(1 + Math.floor(r.next() * 12)).padStart(2, '0'),
    doby: String(1950 + Math.floor(r.next() * 50)),
    postcode: 'NW10 8SB',
    houseNumber: String(1 + Math.floor(r.next() * 99)),
    phone: '0203917085',
    birthTown: 'London',
    ecName: 'Emergency Contact',
    ecRelation: 'Friend'
  };
}

function saveResult(person, gpref, status) {
  const data = JSON.stringify({
    name: `${person.title} ${person.givenName} ${person.surname}`,
    dob: `${person.dobd}/${person.dobm}/${person.doby}`,
    postcode: person.postcode,
    phone: person.phone,
    gpreg: gpref || '',
    status: status,
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  });
  const u = new URL(LOLA_SHEETS);
  const mod = u.protocol === 'https:' ? https : http;
  const req = mod.request({
    hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80),
    path: u.pathname, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
  });
  req.write(data);
  req.end();
  console.log(`  📊 Saved to sheets`);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function submitOne(seed) {
  const P = makePerson(seed);
  const label = `${P.title} ${P.givenName} ${P.surname}`;
  console.log(`\n📋 ${label} | DOB: ${P.dobd}/${P.dobm}/${P.doby} | Postcode: ${P.postcode}`);

  const br = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
  });
  const ctx = await br.newContext({
    locale: 'en-GB',
    proxy: PROXY,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
  });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
  const p = await ctx.newPage();

  let gpref = null;
  let status = 'failed';

  try {
    async function click() { try { await p.locator('button[type=submit]').first().click({ timeout: 3000 }); } catch(e) {} await sleep(800); }
    async function r(idx) { if (idx === undefined) idx = 0; try { const n = p.locator('input[type=radio]'); if (await n.count({ timeout: 800 }).catch(()=>0) > idx) await n.nth(idx).check({ timeout: 800 }).catch(()=>{}); } catch(e){} }

    // Start
    await p.goto(NHS_URL, { timeout: 20000 });
    try { await p.locator('button').filter({ hasText: 'Accept additional cookies' }).first().click({ timeout: 2000 }); } catch(e) {}
    await sleep(600);
    await p.locator('button').filter({ hasText: 'Start now' }).first().click();
    await sleep(1200);

    // == MATCHING ==
    await r(0); await click(); // self
    await r(0); await click(); // first-time
    try { await p.locator('select[name=prefix]').selectOption(P.title, { timeout: 2000 }); } catch(e) {}
    await p.locator('input[name=givenName]').fill(P.givenName);
    await p.locator('input[name=surname]').fill(P.surname);
    await click(); // name
    await p.locator('input[name*=day]').first().fill(P.dobd);
    await p.locator('input[name*=month]').first().fill(P.dobm);
    await p.locator('input[name*=year]').first().fill(P.doby);
    await click(); // dob
    await r(1); await click(); // nhs-no
    await click(); // review-matching

    // == PERSONAL ==
    await r(0); await click(); // address-yes
    await p.locator('input[name=currentPostcode]').fill(P.postcode);
    await p.locator('input[name=currentHouseNumber]').fill(P.houseNumber);
    await click(); // find
    await r(0); await click(); // select
    await p.locator('input[name*=phone]').first().fill(P.phone);
    await click(); // contact
    await r(0); await click(); // sex
    await r(0); await click(); // ethnicity
    await r(0); await click(); // asian
    await r(0); await click(); // interpreter
    await r(0); await click(); // interpreter-lang
    await r(1); await click(); // pharmacy: NO
    await r(1); await click(); // armed-forces: NO
    await r(0); await click(); // family: NO
    await r(1); await click(); // currently-active: NO
    await r(0); await click(); // emergency: YES
    await p.locator('input[name=emergencyContactName]').fill(P.ecName);
    await p.locator('input[name=emergencyContactRelationship]').fill(P.ecRelation);
    await p.locator('input[name=emergencyContactPhone]').fill(P.phone);
    try { await p.locator('input[name=emergencyContactNextOfKin]').check(); } catch(e) {}
    await click();
    await r(1); await click(); // recently-arrived: NO
    await r(0); await click(); // where-born: England
    await p.locator('input[type="text"]').first().fill(P.birthTown);
    await click(); // inside-uk
    await r(0); await click(); // prev-addr: YES
    await p.locator('input[name=previousPostcode]').fill(P.postcode);
    await p.locator('input[name=previousHouseNumber]').fill(P.houseNumber);
    await click(); // find
    await r(0); await click(); // select

    // == HEALTH SECTION ==
    const fillVals = ['John','Doe','Friend',P.phone,'None'];
    for (let i = 0; i < 200; i++) {
      const url = p.url();
      const pn = url.replace('https://gp-registration.nhs.uk/E84028/gpregistration/', '');
      if (pn.includes('review-application') || pn.includes('complete') || pn.includes('confirmation')) break;

      // Fill text fields
      const txtInputs = await p.locator('input[type="text"]').all();
      let vi = 0;
      for (const inp of txtInputs) {
        if (!await inp.inputValue().catch(() => '')) {
          try { await inp.fill(fillVals[vi % fillVals.length]); vi++; } catch(e) {}
        }
      }
      // Fill selects
      const ss = await p.locator('select').all();
      for (const s of ss) { if (await s.locator('option').count() > 1) await s.selectOption({ index: 1 }).catch(() => {}); }
      // Check checkboxes
      const cc = p.locator('input[type=checkbox]');
      if (await cc.count({ timeout: 400 }).catch(() => 0) > 0) {
        for (const c of await cc.all()) { try { if (!await c.isChecked()) await c.check(); } catch(e) {} }
      }
      await r(0); await click();
      if (p.url() === url) { console.log(`  ⚠ Stuck on ${pn}`); break; }
    }

    // == REVIEW + SUBMIT ==
    if (p.url().includes('review-application')) {
      await sleep(2000);
      try {
        const cc = p.locator('input[type=checkbox]');
        if (await cc.count({ timeout: 1000 }).catch(() => 0) > 0) {
          for (const c of await cc.all()) { try { if (!await c.isChecked()) await c.check(); } catch(e) {} }
        }
      } catch(e) {}
      await p.locator('button[type=submit]').first().click({ timeout: 10000 }).catch(() => {});
      await sleep(4000);
    }

    // Extract GPREF
    try {
      const text = await p.evaluate(() => document.body.innerText);
      const m = text.match(/GPREG-(\d+-\d+)/);
      if (m) { gpref = 'GPREG-' + m[1]; status = 'done'; console.log(`  🎯 ${gpref}`); }
      else { console.log(`  ❌ No GPREF found`); }
    } catch(e) {}
  } catch (err) {
    console.log(`  💥 Error: ${err.message?.substring(0, 100) || err}`);
  }

  saveResult(P, gpref, status);
  await br.close();
  return { name: label, gpref, status };
}

// === MAIN ===
const count = parseInt(process.argv.find(a => a.startsWith('--count='))?.split('=')[1] || '1', 10);
const seed = parseInt(process.argv.find(a => a.startsWith('--seed='))?.split('=')[1] || String(Date.now()), 10);
const delay = parseInt(process.argv.find(a => a.startsWith('--delay='))?.split('=')[1] || '10', 10);

console.log(`🔷 GPREG GO — ${count} submission(s), ${delay}s apart`);
console.log(`🔷 Proxy: ${PROXY.server}`);
console.log(`🔷 NHS: ${NHS_URL}`);

(async () => {
  const results = [];
  for (let i = 0; i < count; i++) {
    if (i > 0) await sleep(delay * 1000);
    const result = await submitOne(seed + i);
    results.push(result);
  }

  console.log(`\n📊 RESULTS: ${results.filter(r => r.status === 'done').length}/${count} successful`);
  results.forEach(r => console.log(`  ${r.gpref ? '✅' : '❌'} ${r.name} → ${r.gpref || 'failed'}`));
  console.log(`📊 All saved to Lola Sheets: https://thenewworldorder.io/gpreg-tracker.html`);
})();
