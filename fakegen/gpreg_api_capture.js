
const { chromium } = require('playwright');
const fs = require('fs');

const TWOCAPTCHA_KEY = "5f7daeb7c0253adc6ccd76c3b40bc076";
const PRACTICE_CODE = "E84028";

// Captured API data
const apiData = { requests: [], responses: [] };

// ─── WAF SOLVER (copied from working gpreg_runner) ───
let cachedVoucher = null, cachedToken = null, cachedWafKey = null;

async function detectWAF(page) {
  return await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    let result = { isWAF: false, challengeScript: null, captchaScript: null,
      websiteKey: null, context: null, iv: null, jsapiScript: null };
    if (window.location.href.includes('awswaf') ||
        document.body.innerText.includes('confirm you are human')) { result.isWAF = true; }
    for (const s of scripts) {
      if (s.src && s.src.includes('challenge')) result.challengeScript = s.src;
      if (s.src && s.src.includes('captcha')) result.captchaScript = s.src;
      if (s.src && s.src.includes('jsapi')) result.jsapiScript = s.src;
    }
    if (window.__WAF_CONFIG__) {
      result.websiteKey = window.__WAF_CONFIG__.key;
      result.context = window.__WAF_CONFIG__.context;
      result.iv = window.__WAF_CONFIG__.iv;
    }
    if (!result.websiteKey && window.AWSC?.Config) {
      result.websiteKey = window.AWSC.Config.key;
      result.context = window.AWSC.Config.context;
      result.iv = window.AWSC.Config.iv;
    }
    for (const s of scripts) {
      const text = s.textContent || '';
      if (!result.websiteKey) { const m = text.match(/"key"\s*:\s*"([^"]+)"/); if (m) result.websiteKey = m[1]; }
      if (!result.context) { const m = text.match(/"context"\s*:\s*"([^"]+)"/); if (m) result.context = m[1]; }
      if (!result.iv) { const m = text.match(/"iv"\s*:\s*"([^"]+)"/); if (m) result.iv = m[1]; }
    }
    return result;
  });
}

async function injectWAFToken(page, voucher, token) {
  await page.evaluate((args) => {
    const { v, t } = args;
    if (v) { localStorage.setItem('aws-waf-captcha-voucher', v); localStorage.setItem('aws-waf-captcha-token', v); }
    if (t) { localStorage.setItem('aws-waf-token', t); }
    if (v) document.cookie = 'aws-waf-captcha-voucher=' + v + '; path=/; domain=' + window.location.hostname;
    if (t) document.cookie = 'aws-waf-token=' + t + '; path=/; domain=' + window.location.hostname;
  }, { v: voucher, t: token });
  console.log('WAF token(s) injected');
}

async function solveWAFWith2Captcha(page, apiKey) {
  const config = await detectWAF(page);
  console.log('WAF config extracted, websiteKey:', config.websiteKey ? 'yes' : 'no');
  if (!config.websiteKey && !config.jsapiScript) return false;
  if (cachedVoucher && cachedWafKey === config.websiteKey + config.context + config.iv) {
    console.log('Using cached voucher');
    await injectWAFToken(page, cachedVoucher, cachedToken);
    return true;
  }
  console.log('=== SOLVING AWS WAF via 2Captcha ===');
  const websiteURL = page.url();
  const task = { type: 'AmazonTaskProxyless', websiteURL };
  if (config.jsapiScript) {
    task.jsapiScript = config.jsapiScript;
  } else {
    if (config.challengeScript) task.challengeScript = config.challengeScript;
    if (config.captchaScript) task.captchaScript = config.captchaScript;
    task.websiteKey = config.websiteKey; task.context = config.context; task.iv = config.iv;
  }
  const createResp = await fetch('https://api.2captcha.com/createTask', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({clientKey:apiKey, task})
  });
  const createData = await createResp.json();
  if (createData.errorId !== 0) { console.log('2Captcha error:', createData.errorCode); return false; }
  const taskId = createData.taskId; console.log('Task:', taskId);
  let solved = false, solution = null;
  for (let a = 0; a < 60; a++) {
    await new Promise(r => setTimeout(r, 3000));
    const pollResp = await fetch('https://api.2captcha.com/getTaskResult', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({clientKey:apiKey, taskId})
    });
    const pollData = await pollResp.json();
    if (pollData.status === 'ready') {
      solution = pollData.solution; solved = true;
      console.log('SOLVED! $' + pollData.cost);
      break;
    }
  }
  if (solved && solution) {
    if (solution.captcha_voucher) cachedVoucher = solution.captcha_voucher;
    if (solution.existing_token) cachedToken = solution.existing_token;
    cachedWafKey = config.websiteKey + config.context + config.iv;
    await injectWAFToken(page, solution.captcha_voucher, solution.existing_token);
    return true;
  }
  return false;
}

async function checkAndSolveWAF(page, apiKey) {
  const config = await detectWAF(page);
  if (!config.isWAF) return;
  console.log('WAF detected');
  const isLanding = page.url().includes('landing') || page.url().includes('gpregistration');
  const solved = await solveWAFWith2Captcha(page, apiKey);
  if (solved && isLanding) {
    await new Promise(r => setTimeout(r, 1500));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));
  } else if (solved) {
    console.log('Solved submit WAF - NOT reloading');
    return;
  }
}

// ─── INTERCEPTOR ───
async function captureNetwork(page) {
  // Capture API requests
  await page.route('**/*', (route, request) => {
    const url = request.url();
    // Only capture API calls (not static assets, not awswaf)
    if (url.includes('api') || url.includes('graphql') || url.includes('/registration') ||
        url.includes('/gpregistration') || request.method() !== 'GET') {
      apiData.requests.push({
        url: url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData() || null,
        timestamp: Date.now()
      });
      console.log('API REQ:', request.method(), url.substring(0, 120));
    }
    route.continue();
  });

  // Capture API responses
  page.on('response', response => {
    const url = response.url();
    if (url.includes('api') || url.includes('/registration') ||
        url.includes('/gpregistration') || response.status() !== 200) {
      response.text().then(body => {
        apiData.responses.push({
          url: url,
          status: response.status(),
          headers: response.headers(),
          body: body.substring(0, 2000),
          timestamp: Date.now()
        });
        if (body.length < 300) console.log('API RES:', response.status(), url.substring(0, 100));
      }).catch(() => {});
    }
  });
}

// ─── HUMAN INTERACTION HELPERS ───
async function humanClick(page, locator) {
  try {
    const box = await locator.boundingBox();
    if (box) {
      const x = box.x + box.width * (0.3 + Math.random() * 0.4);
      const y = box.y + box.height * (0.3 + Math.random() * 0.4);
      await page.mouse.move(x-50, y-30, {steps:8});
      await new Promise(r => setTimeout(r, 100 + Math.random()*200));
      await page.mouse.move(x, y, {steps:5});
      await page.mouse.click(x, y);
      return true;
    }
  } catch(e) {}
  try { await locator.click({timeout:2000}); return true; } catch(e) { return false; }
}

async function clickButton(page, text) {
  return await humanClick(page, page.locator('button:has-text("' + text + '"), a:has-text("' + text + '")').first());
}

async function clickRadio(page, labelText) {
  return await humanClick(page, page.locator('label:has-text("' + labelText + '")').first());
}

// ─── MAIN ───
async function main() {
  console.log('=== API CAPTURE START ===');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled',
           '--disable-features=IsolateOrigins,site-per-process', '--window-size=1280,800']
  });
  const context = await browser.newContext({
    viewport:{width:1280, height:800}, locale:'en-GB', timezoneId:'Europe/London',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    if (window.chrome) { window.chrome.runtime = undefined; }
  });

  const page = await context.newPage();
  await captureNetwork(page);

  // Navigate to the registration form
  console.log('Navigating...');
  await page.goto('https://gp-registration.nhs.uk/' + PRACTICE_CODE + '/gpregistration/landing', {
    waitUntil: 'domcontentloaded', timeout: 30000
  });
  await new Promise(r => setTimeout(r, 2000));

  // Solve landing page WAF
  if (TWOCAPTCHA_KEY) {
    await checkAndSolveWAF(page, TWOCAPTCHA_KEY);
  }

  // Wait for form to load
  await new Promise(r => setTimeout(r, 3000));

  // Take screenshot
  await page.screenshot({ path: '/tmp/api_capture_state.png' });

  // Save captured API data so far (WAF solve + initial form load)
  fs.writeFileSync('/tmp/api_capture_data.json', JSON.stringify(apiData, null, 2));
  console.log('API data saved (' + apiData.requests.length + ' reqs, ' + apiData.responses.length + ' resps)');

  await page.screenshot({ path: '/tmp/api_capture_final.png' });
  await browser.close();
  console.log('=== API CAPTURE DONE ===');
}

main().catch(err => {
  console.log('FATAL:', err.message);
  process.exit(1);
});
