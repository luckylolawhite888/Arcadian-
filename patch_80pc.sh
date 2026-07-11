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

// 2. 80 validated NW10 postcodes
const pcs = [
  "NW10 0AA","NW10 0AB","NW10 0AD","NW10 0AF","NW10 0AG","NW10 0AH","NW10 0AL","NW10 0AN",
  "NW10 1AA","NW10 1AB","NW10 1AD","NW10 1AE","NW10 1AF","NW10 1AG","NW10 1AH","NW10 1AJ",
  "NW10 2AA","NW10 2AB","NW10 2AD","NW10 2AE","NW10 2AF","NW10 2AG","NW10 2AH","NW10 2AJ",
  "NW10 3AA","NW10 3AB","NW10 3AD","NW10 3AE","NW10 3AF","NW10 3AG","NW10 3AH","NW10 3AJ",
  "NW10 4AA","NW10 4AB","NW10 4AD","NW10 4AE","NW10 4AG","NW10 4AH","NW10 4AJ","NW10 4AL",
  "NW10 5AA","NW10 5AB","NW10 5AD","NW10 5AE","NW10 5AG","NW10 5AH","NW10 5AJ","NW10 5AL",
  "NW10 6AA","NW10 6AB","NW10 6AD","NW10 6AG","NW10 6AH","NW10 6AJ","NW10 6AL","NW10 6AN",
  "NW10 7AA","NW10 7AB","NW10 7AD","NW10 7AE","NW10 7AH","NW10 7AJ","NW10 7AL","NW10 7AP",
  "NW10 8AB","NW10 8AE","NW10 8AG","NW10 8AH","NW10 8AJ","NW10 8AL","NW10 8AN","NW10 8AP",
  "NW10 9AA","NW10 9AB","NW10 9AD","NW10 9AE","NW10 9AF","NW10 9AG","NW10 9AH","NW10 9AJ"
];
const pcStr = pcs.map(pc => "\x27" + pc + "\x27").join(",");
c = c.replace("postcode: '\''NW10 8SB'\'',",
  "postcode: [" + pcStr + "][Math.floor(Math.random() * " + pcs.length + ")],");

// 3. Ethnic names - keep original structure, add after last original name
const extra = "'\''Chidi'\'','\''Amara'\'','\''Kwame'\'','\''Zara'\'','\''Tunde'\'','\''Arjun'\'','\''Priya'\'','\''Deepa'\'','\''Sanjay'\'','\''Anita'\'','\''Mohammed'\'','\''Fatima'\'','\''Yusuf'\'','\''Layla'\'','\''Hassan'\'','\''Noor'\'','\''Kacper'\'','\''Natalia'\''";

c = c.replace("'\''Ryan'\'','\''Mia'\''],", "'\''Ryan'\'','\''Mia'\''," + extra + "],");

f.writeFileSync(p, c);
console.log("Dr:", c.includes("'\''Dr'\''"));
console.log("Postcodes:", c.split("postcode: [")[1].split("][Math")[0].split(",").length);
console.log("Names:", c.split("given: [")[1].split("],")[0].split(",").length);
'

cd "$(dirname "$P")"
timeout 120 node gpreg_go.mjs --count=1
