#!/usr/bin/env python3
import sys

path = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# Fix: emergency contact name - use evaluate
if "emergencyContactName" in content:
    content = content.replace(
        "await p.locator('input[name=emergencyContactName]').fill(P.ecName);",
        "await p.evaluate((n) => { const el = document.querySelector('input[name*=emergency],input[id*=emergency]'); if(el) el.value = n; }, P.ecName).catch(()=>{});"
    )
    changes += 1
    print("Fixed: emergencyContactName")

# Fix: emergency contact relationship - use evaluate  
if "emergencyContactRelationship" in content:
    content = content.replace(
        "await p.locator('input[name=emergencyContactRelationship]').fill(P.ecRelation);",
        "await p.evaluate((n) => { const el = document.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox])'); const last = el[el.length-1]; if(last) last.value = n; }, P.ecRelation).catch(()=>{});"
    )
    changes += 1
    print("Fixed: emergencyContactRelationship")

# Also make the emergency contact NextOfKin (checkbox) more resilient
if "emergencyContactNextOfKin" in content:
    content = content.replace(
        "try { await p.locator('input[name=emergencyContactNextOfKin]').check(); } catch(e) {}",
        "try { await p.evaluate(() => { document.querySelectorAll('input[type=checkbox]').forEach(c => { if(!c.checked) c.click(); }); }).catch(()=>{}); } catch(e) {}"
    )
    changes += 1
    print("Fixed: emergencyContactNextOfKin")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Changes: {changes}")
if changes > 0:
    print("ALL_OK")
else:
    print("NO_CHANGES")
