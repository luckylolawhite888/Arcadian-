#!/bin/bash
# Patch GPREG for ALL London postcodes (500 postcodes across all London areas)
# + Diverse ethnic names + No Dr + Out-of-catchment warning handler

P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

node -e '
const f = require("fs");
const p = "'"$P"'";
let c = f.readFileSync(p, "utf8");

// 1. Remove Dr from title pool
c = c.replace(/'\''Dr'\''/, "'\''Mr'\''");
c = c.replace(/'\''Mr'\'', '\''Mrs'\'', '\''Ms'\'', '\''Miss'\'', '\''Mrs'\''/,
  "'\''Mr'\'', '\''Mrs'\'', '\''Ms'\'', '\''Miss'\''");

// 2. Add diverse ethnic surnames
c = c.replace(/surnames = \[([^\]]+)\]/,
  (m, list) => "surnames = [" + list.replace(/\n/g, " ").trim() + ", '\''Okonkwo'\'', '\''Okafor'\'', '\''Eze'\'', '\''Nwachukwu'\'', '\''Adepoju'\'', '\''Ogunlade'\'', '\''Obiora'\'', '\''Chibueze'\'', '\''Hussain'\'', '\''Rahman'\'', '\''Khan'\'', '\''Patel'\'', '\''Sharma'\'', '\''Desai'\'', '\''Kapoor'\'', '\''Al-Rashid'\'', '\''Abdullah'\'', '\''Al-Farsi'\''\]"
);

// 3. Add diverse ethnic given names
c = c.replace(/given = \[([^\]]+)\]/,
  (m, list) => "given = [" + list.replace(/\n/g, " ").trim() + ", '\''Chinonso'\'', '\''Chiamaka'\'', '\''Oluwaseun'\'', '\''Folake'\'', '\''Ngozi'\'', '\''Kwame'\'', '\''Zainab'\'', '\''Fatima'\'', '\''Abdul'\'', '\''Aisha'\'', '\''Priya'\'', '\''Rahul'\'', '\''Ananya'\'', '\''Vikram'\'', '\''Layla'\'', '\''Amir'\'', '\''Hassan'\''\]"
);

// 4. Replace hardcoded postcode with random selection from London pool
const LONDON_PCS = [
$(cat /tmp/london_postcodes.txt | sed "s/.*/  '&'/")
];

c = c.replace(/postcode: '\''NW10 8SB'\''/, "postcode: LONDON_PCS[Math.floor(Math.random() * LONDON_PCS.length)]");

// 5. Insert the postcode array before makePerson
c = c.replace("function makePerson(", "const LONDON_PCS = " + JSON.stringify(LONDON_PCS, null, 2) + ";\n\nfunction makePerson(");

// 6. Add out-of-catchment warning handler after "find" click
c = c.replace(
  "await click(); // find",
  "await click(); // find\n    try { await p.locator('button').filter({ hasText: /Yes|yes|Continue|continue/i }).first().click({ timeout: 2000 }).catch(()=>{}); } catch(e){} // out-of-catchment warning"
);

f.writeFileSync(p, c);
console.log("PATCH COMPLETE. Size:", c.length);
'

# Verify
echo "=== VERIFY ==="
grep -n "LONDON_PCS\|postcode:\|Okonkwo\|out-of-catchment" "$P" | head -5
