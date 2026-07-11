#!/usr/bin/env python3
"""
NHS GP Registration Automation - AWS WAF Bypass Pipeline
Uses Playwright with undetected-chromedriver approach via custom patched browser profile.

This is the actual execution script to be run on the IONOS server.
"""

import random
import time
import json
import os
import sys

# ═══════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════

# 2Captcha API key - you need to sign up at 2captcha.com
# For now we'll use a fallback manual approach
TWOCAPTCHA_KEY = os.environ.get("TWOCAPTCHA_KEY", "5f7daeb7c0253adc6ccd76c3b40bc076")
TWOCAPTCHA_BASE = "https://api.2captcha.com"

PROFILE = {
    "name": "Thomas Cooper",
    "first_name": "Thomas",
    "last_name": "Cooper",
    "gender": "male",
    "dob": "1993-04-03",
    "age": 33,
    "address": "218 North Street",
    "city": "London",
    "borough": "Lewisham",
    "postcode": "SE13327AJ",
    "phone": "0203917085",
    "email": "quietkoala8161@deltajohnsons.com",
    "password": "VEt6gbgH64d5gll*",
    "ni": "ME249137B",
}

# Ethnic group mapping (matches NHS form options)
ETHNIC_GROUPS = [
    ("White", ["English, Welsh, Scottish, Northern Irish or British", "Irish", "Gypsy or Irish Traveller", "Roma", "Any other White background"]),
    ("Mixed or Multiple ethnic groups", ["White and Black Caribbean", "White and Black African", "White and Asian", "Any other Mixed or Multiple ethnic background"]),
    ("Asian or Asian British", ["Indian", "Pakistani", "Bangladeshi", "Chinese", "Any other Asian background"]),
    ("Black, African, Caribbean or Black British", ["Caribbean", "African", "Any other Black, African, Caribbean or Black British background"]),
    ("Other ethnic group", ["Arab", "Any other ethnic group"]),
]

COUNTRIES = ["United States", "Canada", "Australia", "New Zealand", "India", "Pakistan",
    "Nigeria", "Ghana", "Kenya", "South Africa", "Jamaica", "Philippines",
    "Brazil", "Mexico", "France", "Germany", "Italy", "Spain",
    "Poland", "Ukraine", "Romania", "Portugal", "Ireland"]

DRINK_FREQ = ["Monthly or less", "2 to 4 times a month", "2 to 3 times a week", "4 or more times a week"]


def build_playwright_script(twocaptcha_key="", use_proxy=False):
    """Build the full Playwright script with AWS WAF bypass."""
    
    ethnic_group, ethnic_subs = random.choice(ETHNIC_GROUPS)
    sub_bg = random.choice(ethnic_subs)
    country = random.choice(COUNTRIES)
    drink = random.choice(DRINK_FREQ)
    entry_year = random.randint(2021, 2025)
    entry_month = random.randint(1, 12)
    entry_day = random.randint(1, 28)
    
    has_captcha = bool(twocaptcha_key)
    
    # Build the JS
    lines = []
    lines.append("const { chromium } = require('playwright');")
    lines.append("const fs = require('fs');")
    lines.append("")
    lines.append("// ─── FAST INTERACTION HELPERS ─────────────────")
    lines.append("async function clickButton(page, text) {")
    lines.append("  try {")
    lines.append("    await page.locator('button, a, input[type=submit]').filter({ hasText: text }).first().click({ timeout: 3000 });")
    lines.append("    return true;")
    lines.append("  } catch(e) { return false; }")
    lines.append("}")
    lines.append("")
    lines.append("async function clickRadio(page, labelText) {")
    lines.append("  try {")
    lines.append("    await page.locator('label, input[type=radio]').filter({ hasText: labelText }).first().click({ timeout: 2000 });")
    lines.append("    return true;")
    lines.append("  } catch(e) { return false; }")
    lines.append("}")
    lines.append("")
    lines.append("async function fillField(page, selector, text) {")
    lines.append("  try {")
    lines.append("    await page.locator(selector).first().fill(text);")
    lines.append("    return true;")
    lines.append("  } catch(e) {")
    lines.append("    try {")
    lines.append("      await page.locator(selector).first().click();")
    lines.append("      await page.locator(selector).first().fill(text);")
    lines.append("      return true;")
    lines.append("    } catch(e2) { return false; }")
    lines.append("  }")
    lines.append("}")
    lines.append("")
    lines.append("// ─── CAPTCHA HELPERS ──────────────────────────")
    lines.append("// Cache successful voucher/token for reuse in same session")
    lines.append("let cachedVoucher = null;")
    lines.append("let cachedToken = null;")
    lines.append("let cachedWafKey = null;")
    lines.append("")
    lines.append("async function detectWAF(page) {")
    lines.append("  " + r"""return await page.evaluate(() => {
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
    });""" + "")
    lines.append("}")
    lines.append("")
    lines.append("async function injectWAFToken(page, voucher, token) {")
    lines.append("  " + r"""await page.evaluate((args) => {
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
    }, { v: voucher, t: token });""" + "")
    lines.append("  console.log('WAF token(s) injected into page');")
    lines.append("}")
    lines.append("")
    lines.append("async function solveWAFWith2Captcha(page, apiKey) {")
    lines.append("  " + r"""const config = await detectWAF(page);""")
    lines.append("  console.log('WAF config:', JSON.stringify(config, null, 2));")
    lines.append("")
    lines.append("  if (!config.websiteKey && !config.jsapiScript) {")
    lines.append("    console.log('No WAF captcha params found on page');")
    lines.append("    return false;")
    lines.append("  }")
    lines.append("")
    lines.append("  // Check cache first — voucher may still be valid (~2h expiry)")
    lines.append("  // But only use cached if the page still has the SAME WAF config")
    lines.append("  // If context/iv changed (new challenge), we need a fresh solve")
    lines.append("  if (cachedVoucher && cachedWafKey === config.websiteKey + config.context + config.iv) {")
    lines.append("    console.log('Using cached voucher (same WAF challenge)');")
    lines.append("    await injectWAFToken(page, cachedVoucher, cachedToken);")
    lines.append("    return true;")
    lines.append("  }")
    lines.append("")
    lines.append("  console.log('=== SOLVING AWS WAF via 2Captcha ===');")
    lines.append("  const websiteURL = page.url();")
    lines.append("")
    lines.append("  const task = { type: 'AmazonTaskProxyless', websiteURL: websiteURL };")
    lines.append("  if (config.jsapiScript) {")
    lines.append("    task.jsapiScript = config.jsapiScript;")
    lines.append("  } else {")
    lines.append("    if (config.challengeScript) task.challengeScript = config.challengeScript;")
    lines.append("    if (config.captchaScript) task.captchaScript = config.captchaScript;")
    lines.append("    task.websiteKey = config.websiteKey;")
    lines.append("    task.context = config.context;")
    lines.append("    task.iv = config.iv;")
    lines.append("  }")
    lines.append("")
    lines.append("  console.log('Creating 2Captcha task...');")
    lines.append("  const createResp = await fetch('https://api.2captcha.com/createTask', {")
    lines.append("    method: 'POST',")
    lines.append("    headers: { 'Content-Type': 'application/json' },")
    lines.append("    body: JSON.stringify({ clientKey: apiKey, task: task })")
    lines.append("  });")
    lines.append("  const createData = await createResp.json();")
    lines.append("")
    lines.append("  if (createData.errorId !== 0) {")
    lines.append("    console.log('2Captcha error:', createData.errorCode, createData.errorDescription);")
    lines.append("    return false;")
    lines.append("  }")
    lines.append("")
    lines.append("  const taskId = createData.taskId;")
    lines.append("  console.log('Task created:', taskId);")
    lines.append("")
    lines.append("  // Poll for result")
    lines.append("  let solved = false, solution = null;")
    lines.append("  for (let attempt = 0; attempt < 120; attempt++) {  // up to 6 min wait")
    lines.append("    await new Promise(r => setTimeout(r, 3000));")
    lines.append("    const pollResp = await fetch('https://api.2captcha.com/getTaskResult', {")
    lines.append("      method: 'POST',")
    lines.append("      headers: { 'Content-Type': 'application/json' },")
    lines.append("      body: JSON.stringify({ clientKey: apiKey, taskId: taskId })")
    lines.append("    });")
    lines.append("    const pollData = await pollResp.json();")
    lines.append("    if (pollData.status === 'ready') {")
    lines.append("      solution = pollData.solution;")
    lines.append("      solved = true;")
    lines.append("      console.log('✅ SOLVED! Cost: $' + pollData.cost + ' (' + (attempt + 1) * 3 + 's)');")
    lines.append("      break;")
    lines.append("    }")
    lines.append("  }")
    lines.append("")
    lines.append("  if (solved && solution) {")
    lines.append("    // Cache for reuse")
    lines.append("    if (solution.captcha_voucher) cachedVoucher = solution.captcha_voucher;")
    lines.append("    if (solution.existing_token) cachedToken = solution.existing_token;")
    lines.append("    cachedWafKey = config.websiteKey + config.context + config.iv;")
    lines.append("    console.log('Cached voucher for reuse (expires ~2h)');")
    lines.append("    await injectWAFToken(page, solution.captcha_voucher, solution.existing_token);")
    lines.append("    return true;")
    lines.append("  }")
    lines.append("")
    lines.append("  console.log('❌ Failed to solve captcha');")
    lines.append("  return false;")
    lines.append("}")
    lines.append("")
    lines.append("async function checkAndSolveWAF(page, apiKey) {")
    lines.append("  " + r"""const config = await detectWAF(page);""")
    lines.append("  if (!config.isWAF) return;")
    lines.append("  ")
    lines.append("  console.log('❌ AWS WAF DETECTED');")
    lines.append("  let solved = await solveWAFWith2Captcha(page, apiKey);")
    lines.append("  // If landing page WAF — reload after injecting token")
    lines.append("  // If submit WAF — DON'T reload, token works on current page")
    lines.append("  const pageUrl = page.url();")
    lines.append("  const isLanding = pageUrl.includes('landing') || pageUrl.includes('gpregistration');")
    lines.append("  ")
    lines.append("  if (solved && isLanding) {")
    lines.append("    // Reload only for landing page (we need the form to load)")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("    await page.reload({ waitUntil: 'domcontentloaded' });")
    lines.append("    await new Promise(r => setTimeout(r, 3000));")
    lines.append("  } else if (solved) {")
    lines.append("    console.log('✅ Token injected — retrying submit without reload');")
    lines.append("    return;")
    lines.append("  }")
    lines.append("  // Check one more time in case reload re-triggers")
    lines.append("  " + r"""const recheck = await detectWAF(page);""")
    lines.append("  if (recheck.isWAF && !solved) {")
    lines.append("    console.log('❌ Still blocked — doing fresh 2Captcha solve');")
    lines.append("    // Force new solve by invalidating cache and retrying")
    lines.append("    cachedWafKey = null;")
    lines.append("    solved = await solveWAFWith2Captcha(page, apiKey);")
    lines.append("    if (solved) {")
    lines.append("      if (!isLanding) {")
    lines.append("        console.log('✅ Token injected — retrying submit without reload');")
    lines.append("        return;")
    lines.append("      }")
    lines.append("      await new Promise(r => setTimeout(r, 100));")
    lines.append("      await page.reload({ waitUntil: 'domcontentloaded' });")
    lines.append("      await new Promise(r => setTimeout(r, 3000));")
    lines.append("    }")
    lines.append("  }")
    lines.append("  console.log('✅ WAF bypassed, continuing...');")
    lines.append("}")
    lines.append("// ─── SESSION KEEPALIVE ─────────────────────")
    lines.append("")
    lines.append("async function main() {")
    lines.append(f"  const useProxy = {'true' if use_proxy else 'false'};")
    lines.append("")
    lines.append("  // Launch with human-like fingerprint")
    lines.append("  const browser = await chromium.launch({")
    lines.append("    headless: true,")
    lines.append("    args: [")
    lines.append("      '--no-sandbox',")
    lines.append("      '--disable-blink-features=AutomationControlled',")
    lines.append("      '--disable-features=IsolateOrigins,site-per-process',")
    lines.append("      '--window-size=1280,800',")
    lines.append("      useProxy ? '--proxy-server=http://geo.spyderproxy.com:12321' : null,")
    lines.append("    ].filter(Boolean)")
    lines.append("  });")
    lines.append("")
    lines.append("  const context = await browser.newContext({")
    lines.append("    viewport: { width: 1280, height: 800 },")
    lines.append("    locale: 'en-GB',")
    lines.append("    timezoneId: 'Europe/London',")
    lines.append("    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',")
    lines.append("    proxy: useProxy ? { server: 'http://geo.spyderproxy.com:12321', username: 'DAz7xCYHAy', password: 'YOuOgB3lMb_country-gb_state-england' } : undefined,")
    lines.append("  });")
    lines.append("")
    lines.append("  // Remove webdriver property")
    lines.append("  await context.addInitScript(() => {")
    lines.append("    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });")
    lines.append("    // Override chrome object")
    lines.append("    if (window.chrome) {")
    lines.append("      window.chrome.runtime = undefined;")
    lines.append("    }")
    lines.append("    // Override permissions")
    lines.append("    const originalQuery = window.navigator.permissions.query;")
    lines.append("    window.navigator.permissions.query = (parameters) => (")
    lines.append("      parameters.name === 'notifications' ?")
    lines.append("        Promise.resolve({ state: Notification.permission }) :")
    lines.append("        originalQuery(parameters)")
    lines.append("    );")
    lines.append("  });")
    lines.append("")
    lines.append("  const page = await context.newPage();")
    lines.append("")
    lines.append("  try {")
    lines.append("    console.log('=== STEP 1: Navigate to NHS registration ===');")
    lines.append("    await page.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', {")
    lines.append("      waitUntil: 'domcontentloaded',")
    lines.append("      timeout: 30000")
    lines.append("    });")
    lines.append("    await new Promise(r => setTimeout(r, 3000));")
    lines.append("")
    lines.append("    // Check for AWS WAF challenge — use the centralized handler")
    lines.append("    console.log('Page loaded, URL:', page.url());")
    lines.append("")
    lines.append(f"    if ('{twocaptcha_key}') {{")
    lines.append("      await checkAndSolveWAF(page, '" + twocaptcha_key + "');")
    lines.append("    }")
    lines.append("")
    lines.append("    // Take screenshot of current state")
    lines.append("    await page.screenshot({ path: '/tmp/gpreg_state.png' });")
    lines.append("")
    lines.append("    // ═══════════════════════════════════")
    lines.append("    // STEP 2: Begin registration")
    lines.append("    // ═══════════════════════════════════")
    lines.append("")
    lines.append("    // Click Begin / Start now")
    lines.append("    console.log('Clicking Begin...');")
    lines.append("    await clickButton(page, 'Begin');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Q1: Who is registering? -> Myself")
    lines.append("    console.log('Q1: Myself');")
    lines.append("    await clickRadio(page, 'Myself');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Q2: First time registering? -> Yes")
    lines.append("    console.log('Q2: First time');")
    lines.append("    await clickRadio(page, 'yes');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Q3: NHS number? -> No")
    lines.append("    console.log('Q3: NHS number');")
    lines.append("    await clickRadio(page, 'no');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Confirm page")
    lines.append("    console.log('Confirm');")
    lines.append("    await clickButton(page, 'Confirm');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Q4: UK address? -> Yes")
    lines.append("    console.log('Q4: UK address');")
    lines.append("    await clickRadio(page, 'yes');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 3000));")
    lines.append("")
    lines.append("    // Address details")
    lines.append("    console.log('Entering address...');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // NHS uses postcode lookup - fill postcode field")
    lines.append("    const inputs = await page.locator('input').all();")
    lines.append("    for (const inp of inputs) {")
    lines.append("      const name = await inp.getAttribute('name');")
    lines.append("      const id = await inp.getAttribute('id');")
    lines.append("      const placeholder = await inp.getAttribute('placeholder');")
    lines.append("      if (name) console.log('  input name=' + name + ' id=' + id + ' placeholder=' + placeholder);")
    lines.append("    }")
    lines.append("")
    lines.append("    // Try to fill postcode and address")
    lines.append("    try {")
    lines.append("      await page.locator('[name=\"postcode\"]').first().fill('SE13 3AN');")
    lines.append("      await new Promise(r => setTimeout(r, 100));")
    lines.append("      // Click find address or continue")
    lines.append("      await clickButton(page, 'Find address');")
    lines.append("      await new Promise(r => setTimeout(r, 3000));")
    lines.append("    } catch(e) {")
    lines.append("      console.log('Postcode field not found, trying raw input...');")
    lines.append("      try { await page.locator('input[type=\"text\"]').first().fill('218 North Street, London, SE13 3AN'); } catch(e2) {}")
    lines.append("    }")
    lines.append("")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 3000));")
    lines.append("")
    lines.append("    // Outside area prompt")
    lines.append("    console.log('Outside area check...');")
    lines.append("    try {")
    lines.append("      const outsideText = await page.evaluate(() => document.body.innerText);")
    lines.append("      if (outsideText.includes('outside the area')) {")
    lines.append("        console.log('Outside area - continuing...');")
    lines.append("        try { await page.locator('text=Continue with this application').first().click(); } catch(e3) {}")
    lines.append("        await new Promise(r => setTimeout(r, 100));")
    lines.append("        await clickButton(page, 'Continue');")
    lines.append("      }")
    lines.append("    } catch(e) {}")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // ═══════════════════════════════════")
    lines.append("    // MEDICAL HISTORY SECTION")
    lines.append("    // ═══════════════════════════════════")
    lines.append("")
    lines.append("    console.log('Sex: Male');")
    lines.append("    await clickRadio(page, 'Male');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append(f"    console.log('Ethnic: {ethnic_group}');")
    lines.append(f"    await clickRadio(page, '{ethnic_group}');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append(f"    console.log('Sub: {sub_bg}');")
    lines.append(f"    await clickRadio(page, '{sub_bg}');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // No answers series")
    lines.append("    const noQuestions = [")
    lines.append("      'interpreter', 'pharmacy', 'Armed Forces', 'Armed Forces',")
    lines.append("      'emergency', 'medical conditions', 'allergies',")
    lines.append("      'mental health', 'disabilities', 'look after', 'look after',")
    lines.append("      'accessible', 'adjustments', 'medication'")
    lines.append("    ]")
    lines.append("")
    lines.append("    for (const q of noQuestions) {")
    lines.append("      console.log('Q: ' + q + ' -> No');")
    lines.append("      try { await clickRadio(page, 'No'); } catch(e) { console.log('  (skipped - not found)'); }")
    lines.append("      await new Promise(r => setTimeout(r, 50));")
    lines.append("      try { await clickButton(page, 'Continue'); } catch(e) {}")
    lines.append("      await new Promise(r => setTimeout(r, 100));")
    lines.append("    }")
    lines.append("")
    lines.append("    // Moved to UK -> Yes")
    lines.append("    console.log('Moved to UK: Yes');")
    lines.append("    await clickRadio(page, 'Yes');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Country")
    lines.append(f"    console.log('Country: {country}');")
    lines.append("    try {")
    lines.append("      const textInput = page.locator('input[type=\"text\"]').first();")
    lines.append("      await textInput.fill('');")
    lines.append(f"      await fillField(page, 'input', '{country}');")
    lines.append("    } catch(e) {}")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Entry date")
    lines.append(f"    console.log('Entry: {entry_day}/{entry_month}/{entry_year}');")
    lines.append("    try {")
    lines.append("      const dayInp = page.locator('[name*=\"day\"]').first();")
    lines.append("      if (await dayInp.isVisible()) {")
    lines.append(f"        await dayInp.fill('{entry_day}');")
    lines.append("        await new Promise(r => setTimeout(r, 100));")
    lines.append(f"        await page.locator('[name*=\"month\"]').first().fill('{entry_month}');")
    lines.append("        await new Promise(r => setTimeout(r, 100));")
    lines.append(f"        await page.locator('[name*=\"year\"]').first().fill('{entry_year}');")
    lines.append("      }")
    lines.append("    } catch(e) {}")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // FROM EU -> No")
    lines.append("    console.log('From EU: No');")
    lines.append("    await clickRadio(page, 'No');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Height/Weight skip")
    lines.append("    console.log('Height/Weight: skip');")
    lines.append("    await new Promise(r => setTimeout(r, 500));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Alcohol")
    lines.append(f"    console.log('Alcohol: {drink}');")
    lines.append(f"    await clickRadio(page, '{drink}');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Units")
    lines.append("    console.log('Units: 2.7');")
    lines.append("    try {")
    lines.append("      const unitInp = page.locator('input[type=\"text\"]').first();")
    lines.append("      if (await unitInp.isVisible()) { await unitInp.fill('2.7'); }")
    lines.append("    } catch(e) {")
    lines.append("      try { await page.locator('input[type=\"number\"]').first().fill('2.7'); } catch(e2) {}")
    lines.append("    }")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Six+ units -> Never")
    lines.append("    console.log('Six+ units: Never');")
    lines.append("    await clickRadio(page, 'Never');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Smoked -> No")
    lines.append("    console.log('Smoked: No');")
    lines.append("    await clickRadio(page, 'No');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Blood transfusion -> No")
    lines.append("    console.log('Blood: No');")
    lines.append("    await clickRadio(page, 'No');")
    lines.append("    await new Promise(r => setTimeout(r, 50));")
    lines.append("    await clickButton(page, 'Continue');")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // ═══════════════════════════════════")
    lines.append("    // FINAL SUBMIT - check for WAF first")
    lines.append("    // ═══════════════════════════════════")
    lines.append("")
    lines.append("    console.log('=== SUBMITTING ===');")
    lines.append("    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("")
    lines.append("    // Before clicking Accept/Submit, check if WAF popped up")
    lines.append(f"    if ('{twocaptcha_key}') {{")
    lines.append("      await checkAndSolveWAF(page, '" + twocaptcha_key + "');")
    lines.append("    }")
    lines.append("")
    lines.append("    // Try Accept then Submit")
    lines.append("    try { await clickButton(page, 'Accept'); } catch(e) {}")
    lines.append("    await new Promise(r => setTimeout(r, 100));")
    lines.append("    try { await clickButton(page, 'Submit'); } catch(e) {}")
    lines.append("")
    lines.append("    // Wait for result - check for WAF again")
    lines.append("    for (let w = 0; w < 5; w++) {")
    lines.append("      await new Promise(r => setTimeout(r, 3000));")
    lines.append(f"      if ('{twocaptcha_key}') {{")
    lines.append("        await checkAndSolveWAF(page, '" + twocaptcha_key + "');")
    lines.append("      }")
    lines.append("      // Check if the page changed (not on form anymore)")
    lines.append("      const stillOnForm = await page.evaluate(() => {")
    lines.append("        return document.body.innerText.includes('Continue') ||")
    lines.append("               document.body.innerText.includes('confirm') ||")
    lines.append("               document.body.innerText.includes('human');")
    lines.append("      });")
    lines.append("      if (!stillOnForm) break;")
    lines.append("    }")
    lines.append("")
    lines.append("    // Take final screenshot")
    lines.append("    await page.screenshot({ path: '/tmp/gpreg_final.png', fullPage: true });")
    lines.append("")
    lines.append("    // Extract GPREG number")
    lines.append("    const resultText = await page.evaluate(() => document.body.innerText);")
    lines.append("    const resultHtml = await page.content();")
    lines.append("")
    lines.append("    // Save full page text for debugging")
    lines.append("    fs.writeFileSync('/tmp/gpreg_result.txt', resultText);")
    lines.append("")
    lines.append("    // Try multiple patterns")
    lines.append("    const patterns = [/GPREG[ -]?[A-Z0-9]{6,20}/gi, /reference number[\\s\\S]{0,20}?([A-Z0-9-]{8,20})/gi, /Registration complete/gi];")
    lines.append("    for (const pat of patterns) {")
    lines.append("      const match = resultText.match(pat);")
    lines.append("      if (match) { console.log('MATCH: ' + match[0]); }")
    lines.append("    }")
    lines.append("")
    lines.append("    // Just output the text for manual review")
    lines.append("    console.log('=== PAGE TEXT ===');")
    lines.append("    console.log(resultText.substring(0, 2000));")
    lines.append("")
    lines.append("    console.log('=== DONE - Registration Complete ===');")
    lines.append("")
    lines.append("    // Write result to status file for later checking")
    lines.append("    fs.writeFileSync('/tmp/gpreg_status.json', JSON.stringify({")
    lines.append("      status: 'complete',")
    lines.append("      timestamp: new Date().toISOString(),")
    lines.append("      gpreg: resultText.substring(0, 500),")
    lines.append("    }, null, 2));")
    lines.append("")
    lines.append("  } catch(err) {")
    lines.append("    console.log('FATAL ERROR: ' + err.message);")
    lines.append("    try { await page.screenshot({ path: '/tmp/gpreg_error.png' }); } catch(e) {}")
    lines.append("  } finally {")
    lines.append("    try { await page.screenshot({ path: '/tmp/gpreg_final.png', fullPage: true }); } catch(e) {}")
    lines.append("    await browser.close();")
    lines.append("  }")
    lines.append("}")
    lines.append("")
    lines.append("main();")
    
    return "\n".join(lines)


def generate_automation_script(use_captcha_api=False, use_proxy=True):
    """Generate and save the full Playwright automation."""
    
    captcha_key = TWOCAPTCHA_KEY if use_captcha_api else ""
    script = build_playwright_script(captcha_key, use_proxy=use_proxy)
    
    script_path = os.path.join(os.path.dirname(__file__), "gpreg_runner.js")
    with open(script_path, "w") as f:
        f.write(script)
    
    print(f"Script generated: {script_path}")
    print(f"Captcha API: {'Configured' if captcha_key else 'NOT configured'}")
    print(f"Proxy: {'Enabled (SpyderProxy UK)' if use_proxy else 'Disabled'}")
    print("\nRun with: node " + script_path)
    return script_path


if __name__ == "__main__":
    # Check if captcha key provided
    use_captcha = "--captcha" in sys.argv or "-c" in sys.argv
    generate_automation_script(use_captcha, use_proxy=True)
