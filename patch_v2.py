#!/usr/bin/env python3
p = "/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs"
with open(p) as f:
    c = f.read()

# Fix 1: Remove Dr from titles
c = c.replace("'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'", "'Mr', 'Mrs', 'Ms', 'Miss'")

# Fix 2: Use a simple random postcode - rotate through a list
# Instead of inline array, add a postcodes array to the function scope
c = c.replace(
    "postcode: 'NW10 8SB',",
    "postcode: ['E1 6AN','SE1 9GF','SW1A 1AA','N1 9GU','W2 1JB','EC2A 4NE','WC2H 7NA','NW3 5TH','CR0 1BE','UB8 1LB'][Math.floor(Math.random() * 10)],"
)

with open(p, "w") as f:
    f.write(c)
print("OK")
print("Dr in file:", "'Dr'" in c)
print("NW10 in file:", "NW10 8SB" in c)
