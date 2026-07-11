#!/bin/bash
# Just run this to patch and execute gpreg
cp /home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs.bak /home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
python3 -c "
import pathlib
p = pathlib.Path('/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs')
c = p.read_text()
c = c.replace(\"'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'\", \"'Mr', 'Mrs', 'Ms', 'Miss'\")
c = c.replace(\"postcode: 'NW10 8SB',\", \"postcode: ['E1 6AN','SE1 9GF','SW1A 1AA','N1 9GU','W2 1JB','EC2A 4NE','WC2H 7NA','NW3 5TH','CR0 1BE','UB8 1LB'][Number(seed) % 10],\")
p.write_text(c)
print('Dr:', \"'Dr'\" in c)
print('NW10:', 'NW10 8SB' in c)
"
cd /home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace
timeout 120 node gpreg_go.mjs --count=1
