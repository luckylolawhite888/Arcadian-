import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });
  
  const context = await browser.newContext({
    viewport: { width: 430, height: 900 },
    deviceScaleFactor: 2
  });
  
  // Capture console
  const page = await context.newPage();
  const logs = [];
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    logs.push({ type: 'error', text: err.message + '\n' + err.stack?.slice(0,200) });
  });
  
  // Navigate
  console.log('Navigating...');
  await page.goto('https://07542666646.com/out-and-about/', { 
    waitUntil: 'networkidle',
    timeout: 15000 
  });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/tmp/oa_test_1_splash.png', fullPage: false });
  console.log('Screenshot 1 (splash) saved');
  
  // Log initial errors
  console.log('\n--- Console logs after load ---');
  logs.forEach(l => console.log(`[${l.type}] ${l.text}`));
  
  // Try clicking "Browse without account"  
  console.log('\n--- Clicking "Browse without account" ---');
  const browseLink = page.locator('.splash-browse');
  await browseLink.click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: '/tmp/oa_test_2_home.png', fullPage: false });
  console.log('Screenshot 2 (s-home) saved');
  
  logs.forEach(l => console.log(`[${l.type}] ${l.text}`));
  
  // Now click a deal card
  console.log('\n--- Clicking first deal card ---');
  const firstDeal = page.locator('.deal-card').first();
  await firstDeal.click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: '/tmp/oa_test_3_detail.png', fullPage: false });
  console.log('Screenshot 3 (detail) saved');
  
  logs.forEach(l => console.log(`[${l.type}] ${l.text}`));
  
  await browser.close();
}

main().catch(e => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
