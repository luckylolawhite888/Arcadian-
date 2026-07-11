#!/usr/bin/env node
/**
 * GPREG GO v7 — Production runner for NHS GP Registration
 * 
 * Features:
 * - Always uses UK residential proxy (never IONOS IP)
 * - Auto-saves to Lola Sheets API
 * - Click-anything approach (buttons + links + submit inputs)
 * - Cookie banner handling on every page
 * - Retry on proxy timeout
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('/root/node_modules/playwright-core');
import http from 'http';
import https from 'https';

const PROXY = { server: 'http://geo.spyderproxy.com:12321', username: 'DAz7xCYHAy', password: 'YOuOgB3lMb_country-gb_state-england' };
const LOLA_SHEETS = 'https://thenewworldorder.io/gpreg-api/entries';

const NAMES = {
  given: ['James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',
          'George','Lily','Noah','Emily','Charlie','Poppy','Jacob','Alice','Michael','Grace',
          'Henry','Ruby','Daniel','Ella','Samuel','Alexa','Ryan','Mia'],
  sur: ['Smith','Jones','Williams','Taylor','Brown','Davies','Wilson','Evans','Thomas',
        'Roberts','Walker','Wright','Thompson','White','Hughes','Edwards','Green','Hall',
        'Wood','Harris','Martin','Jackson','Clarke','Baker','Hill','Moore','Allen'],
  titles: ['Mr','Mrs','Ms','Miss','Dr']
};

function rng(seed) {
  let s = seed || Date.now();
  return { next() { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; } };
}

function makePerson(seed) {
  const r = rng(seed);
  return {
    title: NAMES.titles[Math.floor(r.next() * NAMES.titles.length)],
    givenName: NAMES.given[Math.floor(r.next() * NAMES.given.length)],
    middleName: '',
    surname: NAMES.sur[Math.floor(r.next() * NAMES.sur.length)],
    dobd: String(1 + Math.floor(r.next() * 28)).padStart(2,'0'),
    dobm: String(1 + Math.floor(r.next() * 12)).padStart(2,'0'),
    doby: String(1950 + Math.floor(r.next() * 50)),
    postcode: 'NW10 8SB', houseNumber: String(1 + Math.floor(r.next() * 99)),
    phone: '0203917085', birthTown: 'London',
    ecName: 'Emergency Contact', ecRelation: 'Friend'
  };
}

function saveResult(person, gpref, status) {
  const data = JSON.stringify({
    name: `${person.title} ${person.givenName} ${person.surname}`,
    dob: `${person.dobd}/${person.dobm}/${person.doby}`,
    postcode: person.postcode, phone: person.phone,
    gpreg: gpref || '', status: status,
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
  req.write(data); req.end();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Universal click handler: tries button[type=submit], then any button, then any link
async function go(p) {
  await sleep(400);
  
  // Try clicking Continue by text (most common)
  for (const txt of ['Continue', 'Submit', 'Save and continue', 'Accept and submit']) {
    try {
      const el = p.locator('button').filter({ hasText: txt }).first();
      if (await el.count({ timeout: 200 }).catch(() => 0) > 0) {
        await el.click({ timeout: 1000 }).catch(() => {});
        await sleep(400);
        return true;
      }
    } catch(e) {}
  }

  // Try button[type=submit]
  try {
    const b = p.locator('button[type=submit]').first();
    if (await b.count({ timeout: 200 }).catch(() => 0) > 0) {
      await b.click({ timeout: 1000 }).catch(() => {});
      await sleep(400);
      return true;
    }
  } catch(e) {}

  // Try any button (skip Skip/Back links)
  try {
    const b = p.locator('button').first();
    if (await b.count({ timeout: 200 }).catch(() => 0) > 0) {
      const text = await b.textContent().catch(() => '');
      if (text && !text.includes('Skip') && !text.includes('Back')) {
        await b.click({ timeout: 1000 }).catch(() => {});
        await sleep(400);
        return true;
      }
    }
  } catch(e) {}

  // Try input[type=submit]
  try {
    const si = p.locator('input[type=submit]').first();
    if (await si.count({ timeout: 200 }).catch(() => 0) > 0) {
      await si.click({ timeout: 1000 }).catch(() => {});
      await sleep(400);
      return true;
    }
  } catch(e) {}

  return false;
}

// Select radio button by index
async function r(p, idx = 0) {
  try {
    const radios = p.locator('input[type=radio]');
    const count = await radios.count({ timeout: 500 }).catch(() => 0);
    if (count > idx) {
      await radios.nth(idx).check({ timeout: 800 }).catch(() => {});
      return true;
    }
  } catch(e) {}
  return false;
}

// Fill a text field by name
async function fill(p, name, val) {
  try {
    await p.locator(`input[name="${name}"]`).first().fill(val, { timeout: 800 }).catch(() => {});
  } catch(e) {}
}

// Check all checkboxes on the page
async function checkAllCheckboxes(p) {
  try {
    const cbs = p.locator('input[type=checkbox]');
    if (await cbs.count({ timeout: 200 }).catch(() => 0) > 0) {
      for (const cb of await cbs.all()) {
        try { if (!(await cb.isChecked().catch(() => false))) await cb.check({ timeout: 400 }); } catch(e) {}
      }
    }
  } catch(e) {}
}

// Accept cookies if banner present
async function acceptCookies(p) {
  try {
    const cb = p.locator('button').filter({ hasText: 'Accept additional cookies' });
    if (await cb.count({ timeout: 500 }).catch(() => 0) > 0) {
      await cb.first().click({ timeout: 800 }).catch(() => {});
      await sleep(300);
    }
  } catch(e) {}
}

async function submitOne(seed) {
  const P = makePerson(seed);
  const label = `${P.title} ${P.givenName} ${P.surname}`;
  console.log(`\n📋 ${label}`);

  const br = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  const ctx = await br.newContext({
    locale: 'en-GB', proxy: PROXY,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
  });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
  const p = await ctx.newPage();

  let gpref = null;
  let status = 'failed';

  try {
    // Start: navigate, handle cookies, click start
    console.log('  Loading landing page...');
    await p.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await sleep(1000);
    
    // Accept cookies
    await acceptCookies(p);
    await sleep(500);

    // Click "Start now" button with retry
    console.log('  Clicking Start now...');
    let clicked = false;
    for (let attempt = 0; attempt < 3 && !clicked; attempt++) {
      try {
        if (attempt > 0) {
          await acceptCookies(p);
          await sleep(500);
        }
        await p.locator('button.landing-start__button').click({ timeout: 3000 });
        clicked = true;
        console.log('  Clicked Start now');
      } catch(e) {
        if (attempt < 2) console.log(`  Retry ${attempt + 1}...`);
        else console.log('  Could not click Start now (3 attempts)');
      }
    }
    await sleep(1500);

    let maxPages = 300;
    let lastUrl = '';
    let lastPage = '';
    let stuckCount = 0;

    while (maxPages-- > 0) {
      await sleep(600);
      const url = p.url();
      if (url === lastUrl) { stuckCount++; if (stuckCount > 2) { console.log(`  Stuck on ${lastPage}`); break; } }
      else { stuckCount = 0; lastUrl = url; }

      const pageName = url.replace('https://gp-registration.nhs.uk/E84028/gpregistration/', '').split('?')[0];
      if (pageName.includes('complete') || pageName.includes('confirmation')) break;
      
      lastPage = pageName;
      console.log(`  📄 ${pageName}`);

      // Accept cookies on every page
      await acceptCookies(p);

      // Handle specific fields
      if (pageName === 'name') {
        try { await p.locator('select').first().selectOption(P.title, { timeout: 1000 }); } catch(e) {}
        await fill(p, 'givenName', P.givenName);
        await fill(p, 'middleName', P.middleName);
        await fill(p, 'surname', P.surname);
        await fill(p, 'previousSurname', '');
      }
      else if (pageName === 'date-of-birth') {
        await fill(p, 'day', P.dobd);
        await fill(p, 'month', P.dobm);
        await fill(p, 'year', P.doby);
      }
      else if (pageName === 'find-current-address') {
        await fill(p, 'currentPostcode', P.postcode);
        await fill(p, 'currentHouseNumber', P.houseNumber);
      }
      else if (pageName === 'select-current-address') {
        await r(p, 0);
      }
      else if (pageName === 'contact-details') {
        await fill(p, 'phone', P.phone);
      }
      else if (pageName === 'nhs-number-known') {
        await r(p, 1); // Select "No"
      }
      else if (pageName === 'review-matching' || pageName === 'review-application') {
        await checkAllCheckboxes(p);
      }
      else if (pageName === 'emergency-contact') {
        await fill(p, 'emergencyContactName', P.ecName);
        await fill(p, 'emergencyContactRelationship', P.ecRelation);
        await fill(p, 'emergencyContactPhone', P.phone);
        try { await p.locator('input[name=emergencyContactNextOfKin]').check({ timeout: 300 }); } catch(e) {}
      }
      else if (pageName.includes('height')) {
        await fill(p, 'heightInputFeet', '5');
        await fill(p, 'heightInputInches', '6');
      }
      else if (pageName.includes('weight')) {
        await fill(p, 'weightInputStones', '10');
        await fill(p, 'weightInputPounds', '0');
      }
      else if (pageName.includes('inside-uk') || pageName === 'inside-uk-born') {
        const textInputs = await p.locator('input[type="text"]').all();
        for (const inp of textInputs) {
          if (!(await inp.inputValue().catch(() => ''))) {
            await inp.fill(P.birthTown).catch(() => {});
            break;
          }
        }
      }
      else if (pageName.includes('previous-address')) {
        await fill(p, 'previousPostcode', P.postcode);
        await fill(p, 'previousHouseNumber', P.houseNumber);
      }

      // Select first radio button by default
      await r(p, 0);

      // Check all checkboxes
      await checkAllCheckboxes(p);

      // Navigate
      if (!await go(p)) {
        // If go() returns false, nothing to click - try any link
        try {
          const firstLink = p.locator('a').first();
          const href = await firstLink.getAttribute('href').catch(() => null);
          if (href && href !== '#' && !href.startsWith('javascript')) {
            await firstLink.click({ timeout: 1000 }).catch(() => {});
            await sleep(600);
          }
        } catch(e) {}
      }
    }

    // Extract GPREF
    await sleep(2000);
    try {
      const text = await p.evaluate(() => document.body.innerText);
      const m = text.match(/GPREG-(\d+-\d+)/);
      if (m) { gpref = 'GPREG-' + m[1]; status = 'done'; console.log(`  🎯 ${gpref}`); }
      else {
        const lastUrlPart = p.url().split('/').pop();
        console.log(`  ❌ No GPREF. Last page: ${lastUrlPart}`);
      }
    } catch(e) { console.log('  ❌ Error reading result'); }

  } catch(err) {
    console.log(`  💥 ${err.message?.substring(0, 120) || err}`);
  }

  saveResult(P, gpref, status);
  console.log(`  📊 Saved`);
  await br.close();
  return { name: label, gpref, status };
}

// === MAIN ===
const count = parseInt(process.argv.find(a => a.startsWith('--count='))?.split('=')[1] || '1', 10);
const seed = parseInt(process.argv.find(a => a.startsWith('--seed='))?.split('=')[1] || String(Date.now()), 10);
const delay = parseInt(process.argv.find(a => a.startsWith('--delay='))?.split('=')[1] || '10', 10);

console.log(`🔷 GPREG v7 — ${count} submission(s), ${delay}s apart`);

(async () => {
  const results = [];
  for (let i = 0; i < count; i++) {
    if (i > 0) await sleep(delay * 1000);
    results.push(await submitOne(seed + i));
  }
  console.log(`\n📊 ${results.filter(r => r.status === 'done').length}/${count} OK`);
  results.forEach(r => console.log(`  ${r.gpref ? '✅' : '❌'} ${r.name} → ${r.gpref || 'failed'}`));
  console.log(`🦊 Track: https://thenewworldorder.io/gpreg-tracker.html`);
})();
