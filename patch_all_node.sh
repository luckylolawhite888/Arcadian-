#!/bin/bash
P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

node -e "
const fs = require('fs');
let c = fs.readFileSync('$P', 'utf8');

// 1. Remove Dr
c = c.replace(/'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'/, \"'Mr', 'Mrs', 'Ms', 'Miss'\");

// 2. Varied postcodes  
c = c.replace(\"postcode: 'NW10 8SB',\",
    \"postcode: ['NW10 8SB','NW10 5YP','NW10 7LH','NW10 4HL','NW10 3TT','NW10 6QU','NW10 9AA','NW10 2EF','NW10 1DG','NW10 0ED'][Math.floor(Math.random() * 10)],\");

// 3. Diverse given names - keep original structure (3 lines)
const diverse = [
    'James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',
    'Henry','Ella','Samuel','Lily','Charlie','George','Noah','Emily','Poppy','Jacob',
    'Alice','Michael','Grace','Ruby','Daniel','Alexa','Ryan','Mia',
    // Nigerian/West African
    'Chidi','Amara','Kwame','Zara','Tunde','Folake','Chinwe','Kofi','Adaeze','Oluwaseun',
    // South Asian
    'Arjun','Priya','Rajan','Deepa','Sanjay','Anita','Vikram','Sunita','Mohammed','Fatima',
    // Arab/Middle Eastern
    'Yusuf','Layla','Hassan','Noor','Khalid','Mariam','Omar','Aisha','Ibrahim','Huda',
    // Eastern European
    'Kacper','Oliwia','Jakub','Zofia','Milan','Piotr','Natalia','Tomasz','Magda','Dawid'
];

// Build the new given block matching original 3-line structure
const buildChunk = (arr, start, count) => {
    const chunk = arr.slice(start, start + count);
    return \"'\" + chunk.join(\"','\") + \"'\";
};

let newGiven = \"    given: [\" + buildChunk(diverse, 0, 10) + \",\\n\";
newGiven += \"            \" + buildChunk(diverse, 10, 10) + \",\\n\";
newGiven += \"            \" + buildChunk(diverse, 20) + \"],\";

// Replace old given block - match the pattern
const oldPattern = /    given: .*?\\n.*?\\n.*?\\],/s;
c = c.replace(oldPattern, newGiven);

fs.writeFileSync('$P', c);
console.log('Names:', diverse.length);
console.log('Dr:', c.includes(\"'Dr'\"));
console.log('Given line:', c.split('\\n').filter(l => l.includes('given: ['))[0]?.substring(0,80));
"

cd "$(dirname "$P")"
timeout 120 node gpreg_go.mjs --count=1
