#!/bin/bash
P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

python3 << 'PYEOF'
import pathlib
p = pathlib.Path("/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs")
c = p.read_text()

# 1. Remove Dr
c = c.replace("'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'", "'Mr', 'Mrs', 'Ms', 'Miss'")

# 2. Varied postcodes
c = c.replace("postcode: 'NW10 8SB',",
    "postcode: ['NW10 8SB','NW10 5YP','NW10 7LH','NW10 4HL','NW10 3TT','NW10 6QU','NW10 9AA','NW10 2EF','NW10 1DG','NW10 0ED'][Math.floor(Math.random() * 10)],")

# 3. Diverse given names - 40 total, mix of Western + ethnic
# Keep the original 28 Western names + add 12 ethnic
diverse = [
    'James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',
    'Henry','Ella','Samuel','Lily','Charlie','George','Noah','Emily','Poppy','Jacob',
    'Alice','Michael','Grace','Ruby','Daniel','Alexa','Ryan','Mia',
    # Additional diverse names
    'Chidi','Amara','Kwame','Zara','Arjun','Priya','Fatima','Mohammed','Yusuf','Layla',
    'Kacper','Natalia'
]

# Build given: with the SAME structure as original (4 lines of ~10 names)
given_lines = ["    given: ['James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',"]
for offset in range(10, len(diverse), 10):
    chunk = diverse[offset:offset+10]
    if len(diverse) - offset <= 10 and offset + 10 >= len(diverse):
        # Last line — close with ],
        given_lines.append("            '" + "','".join(chunk) + "'],")
    else:
        given_lines.append("            '" + "','".join(chunk) + "',")
        # If next is last

# Fix: actually let's just do 3 clean lines
# Line 1: first 10 with comma (already in template)
# Line 2: next 10 with line continuation comma  
# Line 3: rest up to 40 with closing ]

idx = 10  # after James...Sophie
line2 = diverse[idx:idx+10]   # 10 names
idx += 10
line3 = diverse[idx:]           # rest

new_given = "    given: ['James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',\n"
new_given += "            '" + "','".join(line2) + "',\n"
new_given += "            '" + "','".join(line3) + "'],\n"

# Replace the entire given block — match from "given:" to the line with "],\n"
# Old format had 4 lines ending with "],"
old_pattern = "    given: ['James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie',\n            'George','Lily','Noah','Emily','Charlie','Poppy','Jacob','Alice','Michael','Grace',\n            'Henry','Ruby','Daniel','Ella','Samuel','Alexa','Ryan','Mia'],"
c = c.replace(old_pattern, new_given.rstrip('\n'))

p.write_text(c)
print("OK:", len(diverse), "names, Dr:", "'Dr'" in c)
PYEOF

echo "---"
grep "given:" "$P" | head -4
