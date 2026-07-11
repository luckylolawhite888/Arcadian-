#!/usr/bin/env python3
"""
GP Registration Automation - generates a Node.js Playwright script.
Run: python3 gpreg_automation.py > gpreg_run.js && node gpreg_run.js
"""

import random
import json

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
}

# Random options
COUNTRIES = ["United States","Canada","Australia","New Zealand","India",
    "Pakistan","Nigeria","Ghana","Kenya","South Africa","Jamaica",
    "Philippines","Brazil","Mexico","France","Germany","Italy","Spain",
    "Poland","Ukraine","Romania","Portugal","Ireland"]

ETHNIC_GROUPS = [
    {"group": "White", "sub": ["English, Welsh, Scottish, Northern Irish or British","Irish","Gypsy or Irish Traveller","Roma","Any other White background"]},
    {"group": "Mixed or Multiple ethnic groups", "sub": ["White and Black Caribbean","White and Black African","White and Asian","Any other Mixed or Multiple ethnic background"]},
    {"group": "Asian or Asian British", "sub": ["Indian","Pakistani","Bangladeshi","Chinese","Any other Asian background"]},
    {"group": "Black, African, Caribbean or Black British", "sub": ["Caribbean","African","Any other Black, African, Caribbean or Black British background"]},
    {"group": "Other ethnic group", "sub": ["Arab","Any other ethnic group"]},
]

DRINK_FREQ = ["Monthly or less","2 to 4 times a month","2 to 3 times a week","4 or more times a week"]

ethnic = random.choice(ETHNIC_GROUPS)
sub_bg = random.choice(ethnic["sub"])
country = random.choice(COUNTRIES)
drink = random.choice(DRINK_FREQ)
entry_year = random.randint(2021, 2025)
entry_month = random.randint(1, 12)
entry_day = random.randint(1, 28)

# Escape special chars for JS
def esc(s):
    return s.replace("'", "\\'").replace('"', '\\"')

js_code = f'''const {{ chromium }} = require('playwright');
(async () => {{
  const browser = await chromium.launch({{ headless: true }});
  const page = await browser.newPage({{ viewport: {{ width: 1280, height: 900 }} }});

  const clickContinue = async () => {{
    try {{
      await page.locator('button:has-text("Continue")').first().click({{ timeout: 3000 }});
    }} catch {{
      try {{ await page.locator('input[type="submit"]').first().click({{ timeout: 3000 }}); }} catch {{}}
    }}
    await page.waitForTimeout(1500);
  }};

  const clickRadio = async (text) => {{
    try {{
      const el = await page.locator(`label:has-text("${{text}}")`).first();
      if (await el.isVisible()) {{ await el.click(); return true; }}
    }} catch {{}}
    try {{
      const el = await page.locator(`text="${{text}}"`).first();
      if (await el.isVisible()) {{ await el.click(); return true; }}
    }} catch {{}}
    return false;
  }};

  try {{
    console.log("Navigating...");
    await page.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', {{ waitUntil: 'networkidle', timeout: 30000 }});
    await page.waitForTimeout(2000);

    console.log("Start now");
    await page.locator('text=Start now').first().click({{ timeout: 5000 }});
    await page.waitForTimeout(2000);

    console.log("Q: Myself");
    await clickRadio("Myself"); await clickContinue();

    console.log("Q: First time UK GP");
    await clickRadio("yes"); await clickContinue();

    console.log("Q: NHS number");
    await clickRadio("no"); await clickContinue();

    console.log("Confirm");
    await page.locator('text=Confirm').first().click({{ timeout: 3000 }});
    await page.waitForTimeout(1500);

    console.log("Q: UK address");
    await clickRadio("yes"); await clickContinue();

    console.log("Enter postcode/address");
    try {{
      await page.locator('input[name="postcode"]').first().fill('SE13327AJ');
      await page.locator('input[name="addressLine1"]').first().fill('218 North Street');
      await page.locator('input[name="townCity"]').first().fill('London');
    }} catch {{
      try {{ await page.locator('input[type="text"]').first().fill('218 North Street, London, SE13 3AN'); }} catch {{}}
    }}
    await clickContinue();
    await page.waitForTimeout(2000);

    console.log("Outside area - continue");
    try {{ await page.locator('text=Continue with this application').first().click(); }} catch {{}}
    await clickContinue();

    console.log("Sex: Male");
    await clickRadio("Male"); await clickContinue();

    console.log("Ethnic: {esc(ethnic['group'])}");
    await clickRadio("{esc(ethnic['group'])}"); await clickContinue();

    console.log("Sub: {esc(sub_bg)}");
    await clickRadio("{esc(sub_bg)}"); await clickContinue();

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

    console.log("Country: {esc(country)}");
    try {{ await page.locator('input[type="text"]').first().fill('{esc(country)}'); }} catch {{}}
    await clickContinue();

    console.log("Entry date");
    try {{
      await page.locator('input[name*="day"]').first().fill('{entry_day}');
      await page.locator('input[name*="month"]').first().fill('{entry_month}');
      await page.locator('input[name*="year"]').first().fill('{entry_year}');
    }} catch {{}}
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

    console.log("Alcohol: {esc(drink)}");
    await clickRadio("{esc(drink)}"); await clickContinue();

    console.log("Units: 2.7");
    try {{ await page.locator('input[type="text"]').first().fill('2.7'); }} catch {{}}
    try {{ await page.locator('input[type="number"]').first().fill('2.7'); }} catch {{}}
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
    try {{
      await page.locator('text=Accept').first().click({{ timeout: 5000 }});
    }} catch {{
      try {{ await page.locator('text=Submit').first().click({{ timeout: 5000 }}); }} catch {{}}
    }}

    await page.waitForTimeout(5000);

    const text = await page.textContent('body');
    const gpregMatch = text.match(/GPREG[-\\s]?[A-Z0-9]{{6,20}}/i);
    const gpreg = gpregMatch ? gpregMatch[0].trim() : 'NOT_FOUND';
    
    await page.screenshot({{ path: '/tmp/gpreg_result.png', fullPage: true }});
    console.log("RESULT:" + gpreg);
    console.log("DONE");

  }} catch (err) {{
    console.log("ERROR:" + err.message);
    try {{ await page.screenshot({{ path: '/tmp/gpreg_error.png' }}); }} catch {{}}
    process.exit(1);
  }} finally {{
    await browser.close();
  }}
}})();
'''

print(js_code)
