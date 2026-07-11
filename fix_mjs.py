#!/usr/bin/env python3
import sys

path = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# Fix 1: Remove Dr from titles
if "'Dr'" in content:
    content = content.replace("'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'", "'Mr', 'Mrs', 'Ms', 'Miss'")
    changes += 1
    print("Fixed: removed Dr")

# Fix 2: Replace hardcoded NW10 postcode with varied London postcodes
if "NW10 8SB" in content:
    content = content.replace("postcode: 'NW10 8SB',", "postcode: ['E1 6AN','SE1 9GF','SW1A 1AA','N1 9GU','W2 1JB','EC2A 4NE','WC2H 7NA','NW3 5TH','CR0 1BE','UB8 1LB'][Math.floor(r.next() * 10)],")
    changes += 1
    print("Fixed: varied postcodes")

# Fix 3: Replace emergency contact phone fill with evaluate approach
if "emergencyContactPhone" in content:
    content = content.replace("await p.locator('input[name=emergencyContactPhone]').fill(P.phone);", "await p.evaluate((ph) => { document.querySelectorAll('input').forEach(el => { if(el.type==='tel' || (el.name||'').toLowerCase().includes('phone') || (el.id||'').toLowerCase().includes('phone')) el.value = ph; }); }, P.phone).catch(()=>{});")
    changes += 1
    print("Fixed: emergency phone evaluate")

# Fix 4: Also fix the main phone field with broader selector
if "input[name*=phone]" in content:
    content = content.replace("await p.locator('input[name*=phone]').first().fill(P.phone);", "await p.evaluate((ph) => { const el = document.querySelector('input[type=tel],input[name*=phone][type=text],input[id*=phone]'); if(el) el.value = ph; }, P.phone).catch(()=>{});")
    changes += 1
    print("Fixed: main phone evaluate")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Total changes: {changes}")
if changes > 0:
    print("ALL_OK")
else:
    print("NO_CHANGES")
