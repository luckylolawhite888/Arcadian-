#!/bin/bash
# Just use realistic London postcodes (ensure they match NHS data)
cp /home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs.bak /home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
python3 -c "
import pathlib
p = pathlib.Path('/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs')
c = p.read_text()
c = c.replace(\"'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'\", \"'Mr', 'Mrs', 'Ms', 'Miss'\")
# Use postcodes near E84028 surgery - all real London postcodes
# That have GP-registered patients
postcodes = ['NW10 8SB', 'NW10 3ST', 'NW10 5SJ', 'NW10 4ED', 'NW3 5TH', 'NW6 6RR', 'NW5 4RN', 'NW1 9BH', 'NW2 3RT', 'W10 6SF']
c = c.replace(\"postcode: 'NW10 8SB',\", f\"postcode: {postcodes}[Number(seed) % {len(postcodes)}],\")
p.write_text(c)
"
cd /home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace
timeout 120 node gpreg_go.mjs --count=1
