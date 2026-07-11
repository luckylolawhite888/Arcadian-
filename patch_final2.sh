#!/bin/bash
P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

node -e '
const f = require("fs");
const p = "'"$P"'";
let c = f.readFileSync(p, "utf8");

// 1. Remove Dr
c = c.replace(/'\''Mr'\'', '\''Mrs'\'', '\''Ms'\'', '\''Miss'\'', '\''Dr'\''/,
  "'\''Mr'\'', '\''Mrs'\'', '\''Ms'\'', '\''Miss'\''");

// 2. Postcodes - only ones known to work (NW10 residential areas near E84028)
c = c.replace("postcode: '\''NW10 8SB'\'',",
  "postcode: ['\''NW10 8SB'\'','\''NW10 8SB'\'','\''NW10 8SB'\'','\''NW10 4HL'\'','\''NW10 0ED'\'','\''NW10 2EF'\'','\''NW10 9AA'\'','\''NW10 8TD'\'','\''NW10 8NY'\'','\''NW10 4JN'\''][Math.floor(Math.random() * 10)],");

// 3. Ethnic names - keep original structure, just add after last original name
const extra = "'\''Chidi'\'','\''Amara'\'','\''Kwame'\'','\''Zara'\'','\''Tunde'\'','\''Arjun'\'','\''Priya'\'','\''Deepa'\'','\''Sanjay'\'','\''Anita'\'','\''Mohammed'\'','\''Fatima'\'','\''Yusuf'\'','\''Layla'\'','\''Hassan'\'','\''Noor'\'','\''Kacper'\'','\''Natalia'\''";

c = c.replace("'\''Ryan'\'','\''Mia'\''],", "'\''Ryan'\'','\''Mia'\''," + extra + "],");

f.writeFileSync(p, c);
console.log("Dr:", c.includes("'\''Dr'\''"));
console.log("Names:", c.split("given: [")[1].split("],")[0].split(",").length);
'

cd "$(dirname "$P")"
timeout 120 node gpreg_go.mjs --count=1
