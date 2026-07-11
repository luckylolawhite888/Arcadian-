#!/usr/bin/env python3
"""
GPREG System — CLI trigger
Usage: python3 gpreg_trigger.py [--gender male|female]
Generates identity, creates Playwright script, uploads to server, runs it, returns result.
"""
import json, os, sys, subprocess, time, random, re

SERVER = "root@212.227.93.74"
SSH_KEY = "/home/node/.ssh/ionos_ubuntu"
SCRIPTS_DIR = "/tmp"
LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))

PREFIXES = {"male": "Mr", "female": "Miss"}
FIRST_NAMES = {
    "male": ["James", "Oliver", "William", "Jack", "Henry", "George", "Thomas", "Daniel", "Samuel", "Joseph"],
    "female": ["Charlotte", "Olivia", "Amelia", "Emily", "Ella", "Jessica", "Sophie", "Lily", "Grace", "Isabella"]
}
LAST_NAMES = ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davis", "Patel", "Clark",
              "Walker", "Wright", "Mitchell", "Roberts", "Thompson", "Cook", "Morgan", "Cooper", "Bailey", "Reed"]
ETHNIC_GROUPS = {
    "male": ["1", "1"],  # White British
    "female": ["1", "1"]
}
COUNTRIES = ["Australia", "New Zealand", "Canada", "United States", "India", "South Africa", "Ireland", "France", "Germany", "Spain"]
GENDER_RADIO = {"male": "1", "female": "2"}
PREFIX = {"male": "Mr", "female": "Miss"}

def generate_identity(gender="random"):
    if gender == "random":
        gender = random.choice(["male", "female"])
    
    first = random.choice(FIRST_NAMES[gender])
    last = random.choice(LAST_NAMES)
    dob_day = random.randint(1, 28)
    dob_month = random.randint(1, 12)
    dob_year = random.randint(1975, 2002)
    country = random.choice(COUNTRIES)
    feet = random.choice(["5", "5", "5", "6", "6"])
    inches = random.choice(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"])
    stone = random.randint(8, 14)
    pounds = random.randint(0, 13)
    house = str(random.randint(1, 60))
    
    return {
        "gender": gender,
        "prefix": PREFIX[gender],
        "firstName": first,
        "surname": last,
        "fullName": f"{first} {last}",
        "dob": f"{dob_day:02d}/{dob_month:02d}/{dob_year}",
        "dob_day": f"{dob_day:02d}",
        "dob_month": f"{dob_month:02d}",
        "dob_year": str(dob_year),
        "age": 2026 - dob_year,
        "house": house,
        "postcode": "NW10 8SB",
        "phone": "0203917085",
        "email": f"{first.lower()}.{last.lower()}.nw10@proton.me",
        "placeOfBirth": "London",
        "countryEntered": country,
        "feet": feet,
        "inches": inches,
        "stone": str(stone),
        "pounds": str(pounds),
        "sexRadio": GENDER_RADIO[gender],
        "sessionTag": f"gpreg-{first.lower()}-{last.lower()}"
    }

def build_script(id_dict):
    """Generate the full Playwright script with the identity embedded."""
    return f'''const {{ chromium }} = require('playwright');
const fs = require('fs');
const ID = {json.dumps(id_dict)};
async function r(page, v) {{ await page.locator('input[type="radio"][value="' + v + '"]').first().click({{ force: true, timeout: 3000 }}); await new Promise(r => setTimeout(r, 150)); await page.locator('button[type="submit"]').first().click({{ timeout: 3000 }}); await new Promise(r => setTimeout(r, 1000)); }}
async function s(page) {{ await page.locator('button[type="submit"]').first().click({{ timeout: 3000 }}); await new Promise(r => setTimeout(r, 1000)); }}
(async () => {{
  const browser = await chromium.launch({{ headless: true, args: ['--no-sandbox'] }});
  const context = await browser.newContext({{ viewport: {{ width: 1280, height: 800 }}, locale: 'en-GB', timezoneId: 'Europe/London', proxy: {{ server: 'http://geo.spyderproxy.com:12321', username: 'DAz7xCYHAy', password: 'YOuOgB3lMb_country-gb_state-england_session-' + ID.sessionTag }} }});
  const page = await context.newPage();
  await page.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing', {{ waitUntil: 'domcontentloaded', timeout: 30000 }});
  await new Promise(r => setTimeout(r, 2000));
  try {{ await page.locator('button').filter({{ hasText: /accept.*cookies/i }}).first().click({{ timeout: 2000 }}); }} catch(e) {{}}
  await page.locator('button').filter({{ hasText: 'Start now' }}).first().click({{ timeout: 5000 }}); await new Promise(r => setTimeout(r, 1000));
  await r(page, '1'); await r(page, '1');
  await page.locator('select[name="prefix"]').selectOption(ID.prefix); await page.locator('input[name="givenName"]').fill(ID.firstName); await page.locator('input[name="surname"]').fill(ID.surname); await s(page);
  await page.locator('input[name="dob-day"]').fill(ID.dob_day); await page.locator('input[name="dob-month"]').fill(ID.dob_month); await page.locator('input[name="dob-year"]').fill(ID.dob_year); await s(page);
  await r(page, '0'); await s(page);
  await r(page, '1');
  await page.locator('input[name="currentPostcode"]').fill(ID.postcode); await page.locator('input[name="currentHouseNumber"]').fill(ID.house); await new Promise(r => setTimeout(r, 500)); await s(page); await new Promise(r => setTimeout(r, 3000));
  let a = await page.evaluate(() => document.querySelectorAll('input[type="radio"][name="currentAddress"]').length);
  if (a > 0) {{ await page.locator('input[type="radio"][name="currentAddress"]').first().click({{ force: true, timeout: 2000 }}); await new Promise(r => setTimeout(r, 200)); await s(page); }}
  try {{ await s(page); }} catch(e) {{}}
  await new Promise(r => setTimeout(r, 1000));
  let cr = await page.evaluate(() => Array.from(document.querySelectorAll('input[type="radio"]')).map(r => r.value));
  if (cr.includes('1')) {{ await r(page, '1'); await new Promise(r => setTimeout(r, 1000)); }}
  let cf = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(el => ({{name: el.name}})));
  if (cf.some(f => f.name === 'phone')) await page.locator('input[name="phone"]').fill(ID.phone);
  if (cf.some(f => f.name === 'mobilePhone')) await page.locator('input[name="mobilePhone"]').fill(ID.phone);
  if (cf.some(f => f.name === 'email')) await page.locator('input[name="email"]').fill(ID.email);
  await s(page);
  for (let i = 0; i < 60; i++) {{
    let body = await page.evaluate(() => document.body.innerText.substring(0, 300));
    if (body.includes('submitted') || body.includes('reference number') || body.includes('Application complete')) {{
      const t = await page.evaluate(() => document.body.innerText);
      fs.writeFileSync('/tmp/gpreg_result.txt', t);
      await page.screenshot({{ path: '/tmp/gpreg_final.png', fullPage: true }});
      console.log('DONE:' + t.substring(0, 2000));
      break;
    }}
    let form = await page.evaluate(() => Array.from(document.querySelectorAll('input, select')).map(el => ({{type: el.type, name: el.name}})));
    let rv = await page.evaluate(() => Array.from(document.querySelectorAll('input[type="radio"]')).map(r => r.value));
    let txt = form.filter(f => (f.type === 'text' || f.type === 'number') && f.name);
    if (txt.some(f => f.name === 'height') && txt.some(f => f.name === 'inches')) {{ await page.locator('input[name="height"]').fill(ID.feet); await page.locator('input[name="inches"]').fill(ID.inches); await s(page); continue; }}
    if (txt.some(f => f.name === 'weight') && txt.some(f => f.name === 'pounds')) {{ await page.locator('input[name="weight"]').fill(ID.stone); await page.locator('input[name="pounds"]').fill(ID.pounds); await s(page); continue; }}
    if (txt.length > 0 && rv.length === 0) {{ for (const f of txt) {{ let v = ID.placeOfBirth; if (f.name.includes('countryEntered')) v = ID.countryEntered; try {{ await page.locator('input[name="' + f.name + '"]').fill(v); }} catch(e) {{}} }} await s(page); continue; }}
    if (rv.includes('2') && ID.sexRadio === '2') {{ await r(page, '2'); }}
    else if (rv.includes('0')) {{ await r(page, '0'); }}
    else if (rv.length >= 1) {{ await r(page, rv[0]); }}
    else {{ try {{ await s(page); }} catch(e) {{ break; }} }}
  }}
  let t = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('/tmp/gpreg_result.txt', t);
  console.log('FINAL:' + t.substring(0, 2000));
  await browser.close();
}})();
'''

def run():
    gender = "random"
    if len(sys.argv) > 1 and sys.argv[1] in ["male", "female", "random"]:
        gender = sys.argv[1]
    
    identity = generate_identity(gender)
    script = build_script(identity)
    
    # Write locally
    local_script = os.path.join(SCRIPTS_DIR, "gpreg_current.js")
    with open(local_script, "w") as f:
        f.write(script)
    
    print(f"🔷 GPREG — {identity['fullName']} ({identity['gender']}, {identity['age']}yo)")
    print(f"   Uploading to server...")
    
    # Upload
    subprocess.run(["scp", "-i", SSH_KEY, local_script, f"{SERVER}:/tmp/gpreg_current.js"], 
                   capture_output=True)
    
    print(f"   Running on server...")
    
    # Run
    result = subprocess.run([
        "ssh", "-i", SSH_KEY, SERVER,
        f"PLAYWRIGHT_BROWSERS_PATH=/tmp/node_modules NODE_PATH=/tmp/node_modules timeout 300 node /tmp/gpreg_current.js"
    ], capture_output=True, text=True, timeout=310)
    
    output = result.stdout + result.stderr
    
    # Fetch full confirm text from server for accurate ref
    confirm_result = subprocess.run([
        "ssh", "-i", SSH_KEY, SERVER,
        "cat /tmp/gpreg_result.txt"
    ], capture_output=True, text=True, timeout=10)
    confirm_text = confirm_result.stdout
    
    gpreg_match = re.search(r'GPREG-\d+-\d+', confirm_text)
    if not gpreg_match:
        gpreg_match = re.search(r'GPREG[-\s]?[A-Z0-9]{6,20}', confirm_text)
    gpreg = gpreg_match.group(0) if gpreg_match else "NOT FOUND"
    
    confirmed = "Application complete" in confirm_text or "reference number" in confirm_text
    
    print(f"\n{'─'*50}")
    if confirmed:
        print(f"✅ {gpreg}")
    else:
        print(f"❌ Submission failed — check server logs")
    print(f"{'─'*50}")
    print(f"\n🧾 Full Identity:")
    print(f"   {identity['prefix']} {identity['firstName']} {identity['surname']}")
    print(f"   DOB: {identity['dob']} ({identity['age']}yo)")
    print(f"   Address: {identity['house']} Acton Lane, London, NW10 8SB")
    print(f"   Phone: {identity['phone']}")
    print(f"   Email: {identity['email']}")
    print(f"   Born: {identity['placeOfBirth']}")
    print(f"   From: {identity['countryEntered']}")
    if confirmed:
        print(f"\n   🎯 {gpreg}")
    print()
    
    # Log it
    log_entry = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime()),
        "gpreg": gpreg if confirmed else None,
        "identity": identity,
        "success": confirmed
    }
    
    log_file = os.path.join(LOCAL_DIR, "gpreg_log.json")
    try:
        with open(log_file, "r") as f:
            log = json.load(f)
    except:
        log = []
    log.append(log_entry)
    with open(log_file, "w") as f:
        json.dump(log, f, indent=2)
    
    return identity, gpreg, confirmed

if __name__ == "__main__":
    run()
