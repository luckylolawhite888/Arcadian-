#!/usr/bin/env python3
import json, os, base64, sys

# Read the gpreg_go.cjs file
path = os.path.expanduser('/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.cjs')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
replaced = False
for i, line in enumerate(lines):
    if 'input[type=tel]' in line and 'phone' in line.lower() and ('fill' in line or 'evaluate' in line):
        lines[i] = "    await p.evaluate((ph) => { document.querySelectorAll('input').forEach(el => { if(el.type==='tel' or 'phone' in (el.name or '').lower() or 'phone' in (el.id or '').lower()): el.value = ph }); }, P.phone).catch(()=>{});"
        replaced = True
        print(f'Replaced line {i+1}', flush=True)
        break

if replaced:
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print('OK', flush=True)
else:
    print('NOT_FOUND', flush=True)
    sys.exit(1)
