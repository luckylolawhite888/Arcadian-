#!/bin/bash
P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

node -e '
const f = require("fs");
const p = "'"$P"'";
let c = f.readFileSync(p, "utf8");

// 1. Remove Dr
c = c.replace(/\x27Mr\x27, \x27Mrs\x27, \x27Ms\x27, \x27Miss\x27, \x27Dr\x27/, "\x27Mr\x27, \x27Mrs\x27, \x27Ms\x27, \x27Miss\x27");

// 2. Postcode
c = c.replace("postcode: \x27NW10 8SB\x27,",
    "postcode: [\x27NW10 8SB\x27,\x27NW10 5YP\x27,\x27NW10 7LH\x27,\x27NW10 4HL\x27,\x27NW10 3TT\x27,\x27NW10 6QU\x27,\x27NW10 9AA\x27,\x27NW10 2EF\x27,\x27NW10 1DG\x27,\x27NW10 0ED\x27][Math.floor(Math.random() * 10)],");

// 3. Names - keep original exact structure, just add ethnic ones
// After Mia, add: Nigerian, South Asian, Arab, E European
const extra = "\x27Chidi\x27,\x27Amara\x27,\x27Kwame\x27,\x27Zara\x27,\x27Tunde\x27,\x27Folake\x27,\x27Chinwe\x27,\x27Kofi\x27,\x27Adaeze\x27,\x27Arjun\x27,\x27Priya\x27,\x27Rajan\x27,\x27Deepa\x27,\x27Sanjay\x27,\x27Anita\x27,\x27Vikram\x27,\x27Sunita\x27,\x27Mohammed\x27,\x27Fatima\x27,\x27Yusuf\x27,\x27Layla\x27,\x27Hassan\x27,\x27Noor\x27,\x27Khalid\x27,\x27Mariam\x27,\x27Omar\x27,\x27Aisha\x27,\x27Ibrahim\x27,\x27Huda\x27,\x27Kacper\x27,\x27Oliwia\x27,\x27Jakub\x27,\x27Zofia\x27,\x27Milan\x27,\x27Piotr\x27,\x27Natalia\x27,\x27Tomasz\x27,\x27Magda\x27,\x27Dawid\x27";

// Append after "Mia" in the given array
c = c.replace("\x27Mia\x27],", "\x27Mia\x27," + extra + "],");

f.writeFileSync(p, c);
console.log("Dr:", c.includes("\x27Dr\x27"));
console.log("Names count:", c.match(/\x27[^\x27]+\x27/g).length);
'

cd "$(dirname "$P")"
timeout 120 node gpreg_go.mjs --count=1
