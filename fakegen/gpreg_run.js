const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const clickContinue = async () => {
    try {
      await page.locator('button:has-text("Continue")').first().click({ timeout: 3000 });
    } catch {
      try { await page.locator('input[type="submit"]').first().click({ timeout: 3000 }); } catch {}
    }
    await page.waitForTimeout(1500);
  };

  const clickRadio = async (text) => {
    try {
      const el = await page.locator(`label:has-text("${text}")`).first();
      if (await el.isVisible()) { await el.click(); return true; }
    } catch {}
    try {
      const el = await page.locator(`text="${text}"`).first();
      if (await el.isVisible()) { await el.click(); return true; }
    } catch {}
    return false;
  };

  try {
    console.log("Navigating...");
    await page.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    console.log("Start now");
    await page.locator('text=Start now').first().click({ timeout: 5000 });
    await page.waitForTimeout(2000);

    console.log("Q: Myself");
    await clickRadio("Myself"); await clickContinue();

    console.log("Q: First time UK GP");
    await clickRadio("yes"); await clickContinue();

    console.log("Q: NHS number");
    await clickRadio("no"); await clickContinue();

    console.log("Confirm");
    await page.locator('text=Confirm').first().click({ timeout: 3000 });
    await page.waitForTimeout(1500);

    console.log("Q: UK address");
    await clickRadio("yes"); await clickContinue();

    console.log("Enter postcode/address");
    try {
      await page.locator('input[name="postcode"]').first().fill('SE13327AJ');
      await page.locator('input[name="addressLine1"]').first().fill('218 North Street');
      await page.locator('input[name="townCity"]').first().fill('London');
    } catch {
      try { await page.locator('input[type="text"]').first().fill('218 North Street, London, SE13 3AN'); } catch {}
    }
    await clickContinue();
    await page.waitForTimeout(2000);

    console.log("Outside area - continue");
    try { await page.locator('text=Continue with this application').first().click(); } catch {}
    await clickContinue();

    console.log("Sex: Male");
    await clickRadio("Male"); await clickContinue();

    console.log("Ethnic: Black, African, Caribbean or Black British");
    await clickRadio("Black, African, Caribbean or Black British"); await clickContinue();

    console.log("Sub: Any other Black, African, Caribbean or Black British background");
    await clickRadio("Any other Black, African, Caribbean or Black British background"); await clickContinue();

    console.log("Interpreter: No");
    await clickRadio("No"); await clickContinue();

    console.log("Pharmacy: No");
    await clickRadio("No"); await clickContinue();

    console.log("Armed Forces: No");
    await clickRadio("No"); await clickContinue();

    console.log("Family Forces: No");
    await clickRadio("No"); await clickContinue();

    console.log("Emergency contact: No");
    await clickRadio("No"); await clickContinue();

    console.log("Moved to UK: Yes");
    await clickRadio("Yes"); await clickContinue();

    console.log("Country: Ghana");
    try { await page.locator('input[type="text"]').first().fill('Ghana'); } catch {}
    await clickContinue();

    console.log("Entry date");
    try {
      await page.locator('input[name*="day"]').first().fill('18');
      await page.locator('input[name*="month"]').first().fill('11');
      await page.locator('input[name*="year"]').first().fill('2022');
    } catch {}
    await clickContinue();

    console.log("From EU: No");
    await clickRadio("No"); await clickContinue();

    console.log("Medical: No");
    await clickRadio("No"); await clickContinue();

    console.log("Allergies: No");
    await clickRadio("No"); await clickContinue();

    console.log("Mental health: No");
    await clickRadio("No"); await clickContinue();

    console.log("Disabilities: No");
    await clickRadio("No"); await clickContinue();

    console.log("Looked after: No");
    await clickRadio("No"); await clickContinue();

    console.log("Carer: No");
    await clickRadio("No"); await clickContinue();

    console.log("Accessible: No");
    await clickRadio("No"); await clickContinue();

    console.log("Adjustments: No");
    await clickRadio("No"); await clickContinue();

    console.log("Medication: No");
    await clickRadio("No"); await clickContinue();

    console.log("Height skip");
    await clickContinue();

    console.log("Weight skip");
    await clickContinue();

    console.log("Alcohol: Monthly or less");
    await clickRadio("Monthly or less"); await clickContinue();

    console.log("Units: 2.7");
    try { await page.locator('input[type="text"]').first().fill('2.7'); } catch {}
    try { await page.locator('input[type="number"]').first().fill('2.7'); } catch {}
    await clickContinue();

    console.log("Six+ units: Never");
    await clickRadio("Never"); await clickContinue();

    console.log("Smoked: No");
    await clickRadio("No"); await clickContinue();

    console.log("Blood transfusion: No");
    await clickRadio("No"); await clickContinue();

    await page.waitForTimeout(2000);

    console.log("SCROLLING TO SUBMIT");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    console.log("SUBMITTING");
    try {
      await page.locator('text=Accept').first().click({ timeout: 5000 });
    } catch {
      try { await page.locator('text=Submit').first().click({ timeout: 5000 }); } catch {}
    }

    await page.waitForTimeout(5000);

    const text = await page.textContent('body');
    const gpregMatch = text.match(/GPREG[-\s]?[A-Z0-9]{6,20}/i);
    const gpreg = gpregMatch ? gpregMatch[0].trim() : 'NOT_FOUND';
    
    await page.screenshot({ path: '/tmp/gpreg_result.png', fullPage: true });
    console.log("RESULT:" + gpreg);
    console.log("DONE");

  } catch (err) {
    console.log("ERROR:" + err.message);
    try { await page.screenshot({ path: '/tmp/gpreg_error.png' }); } catch {}
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

