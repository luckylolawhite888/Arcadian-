#!/bin/bash
# Patch Dr and postcode using node on the server (no Python, no sed quote hell)
P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

node -e "
const fs = require('fs');
let c = fs.readFileSync('$P', 'utf8');

// Remove Dr
c = c.replace(/'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'/, \"'Mr', 'Mrs', 'Ms', 'Miss'\");

// Varied postcodes
c = c.replace(\"postcode: 'NW10 8SB',\",
    \"postcode: ['NW10 8SB','NW10 5YP','NW10 7LH','NW10 4HL','NW10 3TT','NW10 6QU','NW10 9AA','NW10 2EF','NW10 1DG','NW10 0ED'][Math.floor(Math.random() * 10)],\");

fs.writeFileSync('$P', c);
console.log('Dr present:', c.includes(\"'Dr'\"));
console.log('NW10 fixed:', !c.includes(\"postcode: 'NW10 8SB',\"));
"

# Run it
cd "$(dirname "$P")"
timeout 120 node gpreg_go.mjs --count=1
