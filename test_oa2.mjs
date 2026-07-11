import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chromium',
    executablePath: '/home/node/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-gpu', '--headless=new']
  });
  
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
  
  const logs = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => logs.push({ type: 'PAGE_ERROR', text: err.message }));
  
  await page.goto('https://07542666646.com/out-and-about/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  
  console.log('=== CONSOLE AFTER LOAD ===');
  logs.forEach(l => console.log(`[${l.type}] ${l.text}`));
  
  // Try clicking Browse without account
  const btn = page.locator('.splash-browse');
  console.log('\nClicking Browse without account...');
  await btn.click();
  await page.waitForTimeout(2000);
  
  console.log('\n=== CONSOLE AFTER CLICK ===');
  logs.slice(-10).forEach(l => console.log(`[${l.type}] ${l.text}`));
  
  await page.screenshot({ path: '/tmp/oa_after_click.png' });
  console.log('\nScreenshot saved to /tmp/oa_after_click.png');
  
  await browser.close();
}

main().catch(e => { console.error(e.message); process.exit(1); });
