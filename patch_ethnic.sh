#!/bin/bash
# Patch gpreg: remove Dr, diverse ethnic names, varied NW10 postcodes
P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

python3 << 'PYEOF'
import pathlib, json

p = pathlib.Path("/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs")
c = p.read_text()

# 1. Remove Dr from titles
c = c.replace("'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'", "'Mr', 'Mrs', 'Ms', 'Miss'")

# 2. Varied NW10 postcodes
c = c.replace(
    "postcode: 'NW10 8SB',",
    "postcode: ['NW10 8SB','NW10 5YP','NW10 7LH','NW10 4HL','NW10 3TT','NW10 6QU','NW10 9AA','NW10 2EF','NW10 1DG','NW10 0ED'][Math.floor(Math.random() * 10)],"
)

# 3. Replace given names with diverse pool (50 names mixing British + ethnic)
diverse_given = [
    # British/Western (15)
    'James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',
    'Henry','Ella','Samuel','Lily','Charlie',
    # West African / Nigerian (15)
    'Chidi','Amara','Kwame','Zara','Tunde','Folake','Chinwe','Kofi','Adaeze','Oluwaseun',
    'Ezinne','Chibueze','Nneka','Temitope','Ayotunde',
    # South Asian (15)
    'Arjun','Priya','Rajan','Deepa','Sanjay','Anita','Vikram','Sunita','Rajesh','Kavita',
    'Mohammed','Fatima','Aliya','Imran','Zainab',
    # Arab / Middle Eastern / Eastern European (15)
    'Yusuf','Layla','Hassan','Noor','Khalid','Mariam','Omar','Aisha','Ibrahim','Huda',
    'Kacper','Oliwia','Jakub','Zofia','Milan'
]
c = c.replace(
    "'James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie'",
    json.dumps(diverse_given)[1:-1]
)
# Fix the line continuation
c = c.replace(",'George','Lily','Noah','Emily','Charlie','Poppy','Jacob','Alice','Michael','Grace',",
              ",'George','Lily','Noah','Emily','Poppy','Jacob','Alice','Michael','Grace',")
c = c.replace(",'Henry','Ruby','Daniel','Ella','Samuel','Alexa','Ryan','Mia'",
              ",'Henry','Ruby','Daniel','Samuel','Alexa','Ryan','Mia'")

p.write_text(c)
print("DONE")
PYEOF

echo "PATCH_OK"
grep "titles:" "$P" | head -1
grep "given:" "$P" | head -1
