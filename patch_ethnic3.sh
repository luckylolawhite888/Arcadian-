#!/bin/bash
P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

python3 << 'PYEOF'
import pathlib, re

p = pathlib.Path("/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs")
c = p.read_text()

# 1. Remove Dr
c = c.replace("'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'", "'Mr', 'Mrs', 'Ms', 'Miss'")

# 2. Varied postcodes (near E84028 surgery - all NW10)
c = c.replace("postcode: 'NW10 8SB',",
    "postcode: ['NW10 8SB','NW10 5YP','NW10 7LH','NW10 4HL','NW10 3TT','NW10 6QU','NW10 9AA','NW10 2EF','NW10 1DG','NW10 0ED'][Math.floor(Math.random() * 10)],")

# 3. Diverse given names
diverse = [
    'James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',
    'Henry','Ella','Samuel','Lily','Charlie','George','Noah','Emily','Poppy','Jacob',
    'Alice','Michael','Grace','Ruby','Daniel','Alexa','Ryan','Mia',
    'Chidi','Amara','Kwame','Zara','Tunde','Folake','Chinwe','Kofi','Adaeze','Oluwaseun',
    'Ezinne','Chibueze','Nneka','Temitope','Ayotunde','Chinonso','Ifeanyi','Ngozi',
    'Arjun','Priya','Rajan','Deepa','Sanjay','Anita','Vikram','Sunita','Rajesh','Kavita',
    'Mohammed','Fatima','Aliya','Imran','Zainab','Ahmed','Rashida','Amit',
    'Yusuf','Layla','Hassan','Noor','Khalid','Mariam','Omar','Aisha','Ibrahim','Huda',
    'Kacper','Oliwia','Jakub','Zofia','Milan','Piotr','Natalia','Tomasz','Magda','Dawid'
]

# Build JS single-quote array
new_given = "given: [" + ",".join("'" + n + "'" for n in diverse) + "],"

# Replace the whole given: [...] block
pattern = r"given: \[.*?\],"
c = re.sub(pattern, new_given, c, flags=re.DOTALL)

p.write_text(c)

print("Diverse names:", len(diverse))
print("Dr present:", "'Dr'" in c)
print("NW10 fixed:", "'NW10 8SB'" not in c)
PYEOF

echo "---"
grep "^    given:" "$P"
