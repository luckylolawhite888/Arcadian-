#!/bin/bash
# Simple London patch using the proven method from patch_613pc.sh

P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

node -e '
const f = require("fs");
let c = f.readFileSync("'"$P"'", "utf8");

// Remove Dr
c = c.replace(/'\''Dr'\''/g, "");

// Remove extra comma from empty Dr slot
c = c.replace(/, ,/g, ",");
c = c.replace(/,]/g, "]");

// Add ethnic surnames  
c = c.replace(/surnames = \[([^\]]+)\]/,
  (m, list) => "surnames = [" + list.replace(/\n/g," ").trim() + ", '\''Okonkwo'\'', '\''Okafor'\'', '\''Eze'\'', '\''Nwachukwu'\'', '\''Adepoju'\'', '\''Ogunlade'\'', '\''Obiora'\'', '\''Chibueze'\'', '\''Hussain'\'', '\''Rahman'\'', '\''Khan'\'', '\''Patel'\'', '\''Sharma'\'', '\''Desai'\'', '\''Kapoor'\'', '\''Al-Rashid'\'', '\''Abdullah'\'', '\''Al-Farsi'\'']"
);

// Add ethnic given names
c = c.replace(/given = \[([^\]]+)\]/,
  (m, list) => "given = [" + list.replace(/\n/g," ").trim() + ", '\''Chinonso'\'', '\''Chiamaka'\'', '\''Oluwaseun'\'', '\''Folake'\'', '\''Ngozi'\'', '\''Kwame'\'', '\''Zainab'\'', '\''Fatima'\'', '\''Abdul'\'', '\''Aisha'\'', '\''Priya'\'', '\''Rahul'\'', '\''Ananya'\'', '\''Vikram'\'', '\''Layla'\'', '\''Amir'\'', '\''Hassan'\'']"
);

// Out-of-catchment handler
c = c.replace("await click(); // find",
  "await click(); // find\n    try { await p.locator('\''button'\'').filter({ hasText: /Yes|yes|Continue|continue/i }).first().click({ timeout: 2000 }).catch(()=>{}); } catch(e){} // out-of-catchment");

f.writeFileSync("'"$P"'", c);
console.log("P1: OK. Size: " + c.length);
'

# Step 2: Add London postcodes separately (to avoid escaping hell)
# Read postcodes and build a JS file on the server
POSTCODES=$(cat /home/node/.openclaw/workspace/postcodes_for_patch.txt)
node -e '
const f = require("fs");
const p = "'"$P"'";
let c = f.readFileSync(p, "utf8");

const pcs = '"$(printf '%s\n' "$POSTCODES" | head -500)"';

// Insert postcode array
c = c.replace("function makePerson(", "const LONDON_PCS = " + JSON.stringify(pcs) + ";\n\nfunction makePerson(");

// Replace postcode assignment
c = c.replace("postcode: '\''NW10 8SB'\''", "postcode: LONDON_PCS[Math.floor(Math.random() * LONDON_PCS.length)]");

f.writeFileSync(p, c);
console.log("P2: OK. Size: " + c.length);
'

# Verify
echo "=== VERIFY ==="
grep -n "LONDON_PCS\|Okonkwo\|out-of-catchment" "$P" | head -5
