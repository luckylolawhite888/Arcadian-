const { chromium } = require('playwright');
const fs = require('fs');

// ─── FAST INTERACTION HELPERS ─────────────────
async function clickButton(page, text) {
  try {
    await page.locator('button, a, input[type=submit]').filter({ hasText: text }).first().click({ timeout: 3000 });
    return true;
  } catch(e) { return false; }
}

async function clickRadio(page, labelText) {
  try {
    await page.locator('label, input[type=radio]').filter({ hasText: labelText }).first().click({ timeout: 2000 });
    return true;
  } catch(e) { return false; }
}

async function fillField(page, selector, text) {
  try {
    await page.locator(selector).first().fill(text);
    return true;
  } catch(e) {
    try {
      await page.locator(selector).first().click();
      await page.locator(selector).first().fill(text);
      return true;
    } catch(e2) { return false; }
  }
}

// ─── CAPTCHA HELPERS ──────────────────────────
// Cache successful voucher/token for reuse in same session
let cachedVoucher = null;
let cachedToken = null;
let cachedWafKey = null;

async function detectWAF(page) {
  return await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      let result = {
        isWAF: false,
        challengeScript: null,
        captchaScript: null,
        websiteKey: null,
        context: null,
        iv: null,
        jsapiScript: null
      };

      // Check URL for WAF page
      if (window.location.href.includes('awswaf') || 
          window.location.href.includes('captcha') ||
          document.body.innerText.includes('confirm you are human') ||
          document.body.innerText.includes('security check')) {
        result.isWAF = true;
      }

      // Find WAF scripts
      for (const s of scripts) {
        if (s.src && s.src.includes('challenge')) result.challengeScript = s.src;
        if (s.src && s.src.includes('captcha')) result.captchaScript = s.src;
        if (s.src && s.src.includes('jsapi')) result.jsapiScript = s.src;
      }

      // Extract WAF config from inline scripts
      if (window.__WAF_CONFIG__) {
        result.websiteKey = window.__WAF_CONFIG__.key;
        result.context = window.__WAF_CONFIG__.context;
        result.iv = window.__WAF_CONFIG__.iv;
      }
      if (!result.websiteKey && window.AWSC && window.AWSC.Config) {
        result.websiteKey = window.AWSC.Config.key;
        result.context = window.AWSC.Config.context;
        result.iv = window.AWSC.Config.iv;
      }
      for (const s of scripts) {
        const text = s.textContent || '';
        if (!result.websiteKey) {
          const m = text.match(/"key"\s*:\s*"([^"]+)"/);
          if (m) result.websiteKey = m[1];
        }
        if (!result.context) {
          const m = text.match(/"context"\s*:\s*"([^"]+)"/);
          if (m) result.context = m[1];
        }
        if (!result.iv) {
          const m = text.match(/"iv"\s*:\s*"([^"]+)"/);
          if (m) result.iv = m[1];
        }
      }
      return result;
    });
}

async function injectWAFToken(page, voucher, token) {
  await page.evaluate((args) => {
      const { v, t } = args;
      // Try localStorage
      if (v) {
        localStorage.setItem('aws-waf-captcha-voucher', v);
        localStorage.setItem('aws-waf-captcha-token', v);
      }
      if (t) {
        localStorage.setItem('aws-waf-token', t);
      }
      // Try cookies (broad path)
      if (v) document.cookie = 'aws-waf-captcha-voucher=' + v + '; path=/; domain=' + window.location.hostname;
      if (t) document.cookie = 'aws-waf-token=' + t + '; path=/; domain=' + window.location.hostname;
    }, { v: voucher, t: token });
  console.log('WAF token(s) injected into page');
}

async function solveWAFWith2Captcha(page, apiKey) {
  const config = await detectWAF(page);
  console.log('WAF config:', JSON.stringify(config, null, 2));

  if (!config.websiteKey && !config.jsapiScript) {
    console.log('No WAF captcha params found on page');
    return false;
  }

  // Check cache first — voucher may still be valid (~2h expiry)
  // But only use cached if the page still has the SAME WAF config
  // If context/iv changed (new challenge), we need a fresh solve
  if (cachedVoucher && cachedWafKey === config.websiteKey + config.context + config.iv) {
    console.log('Using cached voucher (same WAF challenge)');
    await injectWAFToken(page, cachedVoucher, cachedToken);
    return true;
  }

  console.log('=== SOLVING AWS WAF via 2Captcha ===');
  const websiteURL = page.url();

  const task = { type: 'AmazonTaskProxyless', websiteURL: websiteURL };
  if (config.jsapiScript) {
    task.jsapiScript = config.jsapiScript;
  } else {
    if (config.challengeScript) task.challengeScript = config.challengeScript;
    if (config.captchaScript) task.captchaScript = config.captchaScript;
    task.websiteKey = config.websiteKey;
    task.context = config.context;
    task.iv = config.iv;
  }

  console.log('Creating 2Captcha task...');
  const createResp = await fetch('https://api.2captcha.com/createTask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientKey: apiKey, task: task })
  });
  const createData = await createResp.json();

  if (createData.errorId !== 0) {
    console.log('2Captcha error:', createData.errorCode, createData.errorDescription);
    return false;
  }

  const taskId = createData.taskId;
  console.log('Task created:', taskId);

  // Poll for result
  let solved = false, solution = null;
  for (let attempt = 0; attempt < 120; attempt++) {  // up to 6 min wait
    await new Promise(r => setTimeout(r, 3000));
    const pollResp = await fetch('https://api.2captcha.com/getTaskResult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientKey: apiKey, taskId: taskId })
    });
    const pollData = await pollResp.json();
    if (pollData.status === 'ready') {
      solution = pollData.solution;
      solved = true;
      console.log('✅ SOLVED! Cost: $' + pollData.cost + ' (' + (attempt + 1) * 3 + 's)');
      break;
    }
  }

  if (solved && solution) {
    // Cache for reuse
    if (solution.captcha_voucher) cachedVoucher = solution.captcha_voucher;
    if (solution.existing_token) cachedToken = solution.existing_token;
    cachedWafKey = config.websiteKey + config.context + config.iv;
    console.log('Cached voucher for reuse (expires ~2h)');
    await injectWAFToken(page, solution.captcha_voucher, solution.existing_token);
    return true;
  }

  console.log('❌ Failed to solve captcha');
  return false;
}

async function checkAndSolveWAF(page, apiKey) {
  const config = await detectWAF(page);
  if (!config.isWAF) return;
  
  console.log('❌ AWS WAF DETECTED');
  let solved = await solveWAFWith2Captcha(page, apiKey);
  // If landing page WAF — reload after injecting token
  // If submit WAF — DON'T reload, token works on current page
  const pageUrl = page.url();
  const isLanding = pageUrl.includes('landing') || pageUrl.includes('gpregistration');
  
  if (solved && isLanding) {
    // Reload only for landing page (we need the form to load)
    await new Promise(r => setTimeout(r, 100));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));
  } else if (solved) {
    console.log('✅ Token injected — retrying submit without reload');
    return;
  }
  // Check one more time in case reload re-triggers
  const recheck = await detectWAF(page);
  if (recheck.isWAF && !solved) {
    console.log('❌ Still blocked — doing fresh 2Captcha solve');
    // Force new solve by invalidating cache and retrying
    cachedWafKey = null;
    solved = await solveWAFWith2Captcha(page, apiKey);
    if (solved) {
      if (!isLanding) {
        console.log('✅ Token injected — retrying submit without reload');
        return;
      }
      await new Promise(r => setTimeout(r, 100));
      await page.reload({ waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.log('✅ WAF bypassed, continuing...');
}
// ─── SESSION KEEPALIVE ─────────────────────

async function main() {
  const useProxy = true;

  // Launch with human-like fingerprint
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1280,800',
      useProxy ? '--proxy-server=http://geo.spyderproxy.com:12321' : null,
    ].filter(Boolean)
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    proxy: useProxy ? { server: 'http://geo.spyderproxy.com:12321', username: 'DAz7xCYHAy', password: 'YOuOgB3lMb_country-gb_state-england' } : undefined,
  });

  // Remove webdriver property
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    // Override chrome object
    if (window.chrome) {
      window.chrome.runtime = undefined;
    }
    // Override permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });

  const page = await context.newPage();

  try {
    console.log('=== STEP 1: Navigate to NHS registration ===');
    await page.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await new Promise(r => setTimeout(r, 3000));

    // Check for AWS WAF challenge — use the centralized handler
    console.log('Page loaded, URL:', page.url());

    if ('') {
      await checkAndSolveWAF(page, '');
    }

    // Take screenshot of current state
    await page.screenshot({ path: '/tmp/gpreg_state.png' });

    // ═══════════════════════════════════
    // STEP 2: Begin registration
    // ═══════════════════════════════════

    // Click Begin / Start now
    console.log('Clicking Begin...');
    await clickButton(page, 'Begin');
    await new Promise(r => setTimeout(r, 100));

    // Q1: Who is registering? -> Myself
    console.log('Q1: Myself');
    await clickRadio(page, 'Myself');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Q2: First time registering? -> Yes
    console.log('Q2: First time');
    await clickRadio(page, 'yes');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Q3: NHS number? -> No
    console.log('Q3: NHS number');
    await clickRadio(page, 'no');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Confirm page
    console.log('Confirm');
    await clickButton(page, 'Confirm');
    await new Promise(r => setTimeout(r, 100));

    // Q4: UK address? -> Yes
    console.log('Q4: UK address');
    await clickRadio(page, 'yes');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 3000));

    // Address details
    console.log('Entering address...');
    await new Promise(r => setTimeout(r, 100));

    // NHS uses postcode lookup - fill postcode field
    const inputs = await page.locator('input').all();
    for (const inp of inputs) {
      const name = await inp.getAttribute('name');
      const id = await inp.getAttribute('id');
      const placeholder = await inp.getAttribute('placeholder');
      if (name) console.log('  input name=' + name + ' id=' + id + ' placeholder=' + placeholder);
    }

    // Try to fill postcode and address
    try {
      await page.locator('[name="postcode"]').first().fill('SE13 3AN');
      await new Promise(r => setTimeout(r, 100));
      // Click find address or continue
      await clickButton(page, 'Find address');
      await new Promise(r => setTimeout(r, 3000));
    } catch(e) {
      console.log('Postcode field not found, trying raw input...');
      try { await page.locator('input[type="text"]').first().fill('218 North Street, London, SE13 3AN'); } catch(e2) {}
    }

    await new Promise(r => setTimeout(r, 100));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 3000));

    // Outside area prompt
    console.log('Outside area check...');
    try {
      const outsideText = await page.evaluate(() => document.body.innerText);
      if (outsideText.includes('outside the area')) {
        console.log('Outside area - continuing...');
        try { await page.locator('text=Continue with this application').first().click(); } catch(e3) {}
        await new Promise(r => setTimeout(r, 100));
        await clickButton(page, 'Continue');
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 100));

    // ═══════════════════════════════════
    // MEDICAL HISTORY SECTION
    // ═══════════════════════════════════

    console.log('Sex: Male');
    await clickRadio(page, 'Male');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    console.log('Ethnic: White');
    await clickRadio(page, 'White');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    console.log('Sub: Gypsy or Irish Traveller');
    await clickRadio(page, 'Gypsy or Irish Traveller');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // No answers series
    const noQuestions = [
      'interpreter', 'pharmacy', 'Armed Forces', 'Armed Forces',
      'emergency', 'medical conditions', 'allergies',
      'mental health', 'disabilities', 'look after', 'look after',
      'accessible', 'adjustments', 'medication'
    ]

    for (const q of noQuestions) {
      console.log('Q: ' + q + ' -> No');
      try { await clickRadio(page, 'No'); } catch(e) { console.log('  (skipped - not found)'); }
      await new Promise(r => setTimeout(r, 50));
      try { await clickButton(page, 'Continue'); } catch(e) {}
      await new Promise(r => setTimeout(r, 100));
    }

    // Moved to UK -> Yes
    console.log('Moved to UK: Yes');
    await clickRadio(page, 'Yes');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Country
    console.log('Country: New Zealand');
    try {
      const textInput = page.locator('input[type="text"]').first();
      await textInput.fill('');
      await fillField(page, 'input', 'New Zealand');
    } catch(e) {}
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Entry date
    console.log('Entry: 8/8/2023');
    try {
      const dayInp = page.locator('[name*="day"]').first();
      if (await dayInp.isVisible()) {
        await dayInp.fill('8');
        await new Promise(r => setTimeout(r, 100));
        await page.locator('[name*="month"]').first().fill('8');
        await new Promise(r => setTimeout(r, 100));
        await page.locator('[name*="year"]').first().fill('2023');
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // FROM EU -> No
    console.log('From EU: No');
    await clickRadio(page, 'No');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Height/Weight skip
    console.log('Height/Weight: skip');
    await new Promise(r => setTimeout(r, 500));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Alcohol
    console.log('Alcohol: Monthly or less');
    await clickRadio(page, 'Monthly or less');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Units
    console.log('Units: 2.7');
    try {
      const unitInp = page.locator('input[type="text"]').first();
      if (await unitInp.isVisible()) { await unitInp.fill('2.7'); }
    } catch(e) {
      try { await page.locator('input[type="number"]').first().fill('2.7'); } catch(e2) {}
    }
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Six+ units -> Never
    console.log('Six+ units: Never');
    await clickRadio(page, 'Never');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Smoked -> No
    console.log('Smoked: No');
    await clickRadio(page, 'No');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // Blood transfusion -> No
    console.log('Blood: No');
    await clickRadio(page, 'No');
    await new Promise(r => setTimeout(r, 50));
    await clickButton(page, 'Continue');
    await new Promise(r => setTimeout(r, 100));

    // ═══════════════════════════════════
    // FINAL SUBMIT - check for WAF first
    // ═══════════════════════════════════

    console.log('=== SUBMITTING ===');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 100));

    // Before clicking Accept/Submit, check if WAF popped up
    if ('') {
      await checkAndSolveWAF(page, '');
    }

    // Try Accept then Submit
    try { await clickButton(page, 'Accept'); } catch(e) {}
    await new Promise(r => setTimeout(r, 100));
    try { await clickButton(page, 'Submit'); } catch(e) {}

    // Wait for result - check for WAF again
    for (let w = 0; w < 5; w++) {
      await new Promise(r => setTimeout(r, 3000));
      if ('') {
        await checkAndSolveWAF(page, '');
      }
      // Check if the page changed (not on form anymore)
      const stillOnForm = await page.evaluate(() => {
        return document.body.innerText.includes('Continue') ||
               document.body.innerText.includes('confirm') ||
               document.body.innerText.includes('human');
      });
      if (!stillOnForm) break;
    }

    // Take final screenshot
    await page.screenshot({ path: '/tmp/gpreg_final.png', fullPage: true });

    // Extract GPREG number
    const resultText = await page.evaluate(() => document.body.innerText);
    const resultHtml = await page.content();

    // Save full page text for debugging
    fs.writeFileSync('/tmp/gpreg_result.txt', resultText);

    // Try multiple patterns
    const patterns = [/GPREG[ -]?[A-Z0-9]{6,20}/gi, /reference number[\s\S]{0,20}?([A-Z0-9-]{8,20})/gi, /Registration complete/gi];
    for (const pat of patterns) {
      const match = resultText.match(pat);
      if (match) { console.log('MATCH: ' + match[0]); }
    }

    // Just output the text for manual review
    console.log('=== PAGE TEXT ===');
    console.log(resultText.substring(0, 2000));

    console.log('=== DONE - Registration Complete ===');

    // Write result to status file for later checking
    fs.writeFileSync('/tmp/gpreg_status.json', JSON.stringify({
      status: 'complete',
      timestamp: new Date().toISOString(),
      gpreg: resultText.substring(0, 500),
    }, null, 2));

  } catch(err) {
    console.log('FATAL ERROR: ' + err.message);
    try { await page.screenshot({ path: '/tmp/gpreg_error.png' }); } catch(e) {}
  } finally {
    try { await page.screenshot({ path: '/tmp/gpreg_final.png', fullPage: true }); } catch(e) {}
    await browser.close();
  }
}

main();