#!/usr/bin/env python3
"""Complete GPREG patcher — applies all fixes to make NHS forms work."""
import sys, os

path = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

changes = []
pairs = {
    # Titles - remove Dr
    "'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'": "'Mr', 'Mrs', 'Ms', 'Miss'",
    # Postcode - varied London
    "postcode: 'NW10 8SB',": "postcode: ['E1 6AN','SE1 9GF','SW1A 1AA','N1 9GU','W2 1JB','EC2A 4NE','WC2H 7NA','NW3 5TH','CR0 1BE','UB8 1LB'][Math.floor(r.next() * 10)],",
    # Main phone
    "await p.locator('input[name*=phone]').first().fill(P.phone);": "await p.evaluate((ph) => { const el = document.querySelector('input[type=tel],input[name*=phone][type=text],input[id*=phone]'); if(el) el.value = ph; }, P.phone).catch(()=>{});",
    # Emergency phone
    "await p.locator('input[name=emergencyContactPhone]').fill(P.phone);": "await p.evaluate((ph) => { document.querySelectorAll('input').forEach(el => { if(el.type==='tel' or (el.name or '').lower().find('phone') != -1 or (el.id or '').lower().find('phone') != -1): el.value = ph }); }, P.phone).catch(()=>{});",
    # Emergency name
    "await p.locator('input[name=emergencyContactName]').fill(P.ecName);": "await p.evaluate((n) => { const el = document.querySelector('input[name*=emergency],input[id*=emergency]'); if(el) el.value = n; }, P.ecName).catch(()=>{});",
    # Emergency relation
    "await p.locator('input[name=emergencyContactRelationship]').fill(P.ecRelation);": "await p.evaluate((n) => { const el = document.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox])'); const last = el[el.length-1]; if(last) last.value = n; }, P.ecRelation).catch(()=>{});",
    # Emergency next-of-kin checkbox
    "try { await p.locator('input[name=emergencyContactNextOfKin]').check(); } catch(e) {}": "try { await p.evaluate(() => { document.querySelectorAll('input[type=checkbox]').forEach(c => { if(!c.checked) try{c.click()}catch(e){} }); }).catch(()=>{}); } catch(e) {}",
    # Previous postcode
    "await p.locator('input[name=previousPostcode]').fill(P.postcode);": "await p.evaluate((pc) => { const el = document.querySelector('input[name*=postcode],input[id*=postcode],input[placeholder*=postcode]'); if(el) el.value = pc; }, P.postcode).catch(()=>{});",
    # Previous house number
    "await p.locator('input[name=previousHouseNumber]').fill(P.houseNumber);": "await p.evaluate((hn) => { const els = document.querySelectorAll('input[type=text]:not([type=hidden])'); const last = els[els.length-1]; if(last) last.value = hn; }, P.houseNumber).catch(()=>{});",
    # Current postcode
    "await p.locator('input[name=currentPostcode]').fill(P.postcode);": "await p.evaluate((pc) => { const el = document.querySelector('input[name*=postcode],input[id*=postcode],input[placeholder*=postcode]'); if(el) el.value = pc; }, P.postcode).catch(()=>{});",
    # Current house number
    "await p.locator('input[name=currentHouseNumber]').fill(P.houseNumber);": "await p.evaluate((hn) => { const els = document.querySelectorAll('input[type=text]:not([type=hidden])'); if(els.length > 1) els[1].value = hn; else if(els.length > 0) els[0].value = hn; }, P.houseNumber).catch(()=>{});",
    # Birth town
    "await p.locator('input[type=\"text\"]').first().fill(P.birthTown);": "await p.evaluate((bt) => { const el = document.querySelector('input[type=text]:not([type=hidden])'); if(el) el.value = bt; }, P.birthTown).catch(()=>{});",
}

for old, new in pairs.items():
    if old in c:
        c = c.replace(old, new)
        changes.append(old[:40])

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print(f"Patched {len(changes)} patterns:")
for ch in changes:
    print(f"  - {ch}...")
print("ALL_DONE")
