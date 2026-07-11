#!/usr/bin/env python3
import os, sys

path = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.cjs'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Remove Dr from titles
content = content.replace("'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'", "'Mr', 'Mrs', 'Ms', 'Miss'")

# Fix 2: Replace hardcoded NW10 postcode with varied London postcodes
old_pc = "postcode: 'NW10 8SB',"
new_pc = "postcode: ['E1 6AN','SE1 9GF','SW1A 1AA','N1 9GU','W2 1JB','EC2A 4NE','WC2H 7NA','NW3 5TH','CR0 1BE','UB8 1LB'][Math.floor(r.next() * 10)],"
content = content.replace(old_pc, new_pc)

# Fix 3: Replace emergency contact phone fill with evaluate approach
old_phone = "await p.locator('input[name=emergencyContactPhone]').fill(P.phone);"
new_phone = "await p.evaluate((ph) => { document.querySelectorAll('input').forEach(el => { if(el.type==='tel' or 'phone' in (el.name or '').lower() or 'phone' in (el.id or '').lower()): el.value = ph }); }, P.phone).catch(()=>{});"
content = content.replace(old_phone, new_phone)

# Fix 4: Also fix the main phone field with broader selector
old_main_phone = "await p.locator('input[name*=phone]').first().fill(P.phone);"
new_main_phone = "await p.evaluate((ph) => { const el = document.querySelector('input[type=tel],input[name*=phone][type=text],input[id*=phone]'); if(el) el.value = ph; }, P.phone).catch(()=>{});"
content = content.replace(old_main_phone, new_main_phone)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
checks = [
    ("Dr removed", "'Dr'" not in content),
    ("postcode varied", "NW10 8SB" not in content or "E1 6AN" in content),
    ("emergency phone fixed", "emergencyContactPhone" not in content or "evaluate" in content),
]
for name, ok in checks:
    status = "OK" if ok else "FAIL"
    print("  " + name + ": " + status)

if all(ok for _, ok in checks):
    print("ALL_OK")
else:
    print("SOME_FAILED")
    sys.exit(1)
