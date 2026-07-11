#!/bin/bash
# Patch gpreg: remove Dr, diverse ethnic names, varied NW10 postcodes
P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

python3 << 'PYEOF'
path = "/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs"
with open(path) as f:
    c = f.read()

# 1. Remove Dr from titles
c = c.replace("'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'", "'Mr', 'Mrs', 'Ms', 'Miss'")

# 2. Varied NW10 postcodes  
c = c.replace(
    "postcode: 'NW10 8SB',",
    "postcode: ['NW10 8SB','NW10 5YP','NW10 7LH','NW10 4HL','NW10 3TT','NW10 6QU','NW10 9AA','NW10 2EF','NW10 1DG','NW10 0ED'][Math.floor(Math.random() * 10)],"
)

# 3. Replace given names — keep single-quote JS syntax
diverse = [
    'James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',
    'Henry','Ella','Samuel','Lily','Charlie','George','Noah','Emily','Poppy','Jacob',
    'Alice','Michael','Grace','Ruby','Daniel','Alexa','Ryan','Mia',
    # Nigerian/West African
    'Chidi','Amara','Kwame','Zara','Tunde','Folake','Chinwe','Kofi','Adaeze','Oluwaseun',
    'Ezinne','Chibueze','Nneka','Temitope','Ayotunde','Chinonso','Ifeanyi','Ngozi',
    # South Asian
    'Arjun','Priya','Rajan','Deepa','Sanjay','Anita','Vikram','Sunita','Rajesh','Kavita',
    'Mohammed','Fatima','Aliya','Imran','Zainab','Ahmed','Rashida','Amit',
    # Arab/Middle Eastern
    'Yusuf','Layla','Hassan','Noor','Khalid','Mariam','Omar','Aisha','Ibrahim','Huda',
    # Eastern European
    'Kacper','Oliwia','Jakub','Zofia','Milan','Piotr','Natalia','Tomasz','Magda','Dawid',
    'Anna','Mateusz','Agnieszka','Krzysztof'
]
# Build the JS single-quote array string
given_str = "'" + "','".join(diverse) + "'"

# Find and replace the 2 given name lines
old_given = "'James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',"
c = c.replace(old_given, given_str[0:100] + "',")
# The rest of given names are on the next 3 lines — replace entire block
# Let's just find the continuation
old_cont = "'George','Lily','Noah','Emily','Charlie','Poppy','Jacob','Alice','Michael','Grace',"
new_cont = given_str[100:]
c = c.replace(old_cont, new_cont + "',")

# Remove any leftover remnants that might cause double commas
c = c.replace("','Henry','Ruby','Daniel','Ella','Samuel','Alexa','Ryan','Mia'", "'")
c = c.replace("','George','Lily','Noah','Emily','Poppy','Jacob','Alice','Michael','Grace'", ",")

with open(path, 'w') as f:
    f.write(c)
print("DONE")
print("Total given names:", len(diverse))
PYEOF

echo "---"
grep "n:" "$P" | head -1
