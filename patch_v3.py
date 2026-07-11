#!/usr/bin/env python3
p = "/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs"
with open(p) as f:
    c = f.read()

# Fix 1: Remove Dr
c = c.replace("'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'", "'Mr', 'Mrs', 'Ms', 'Miss'")

# Fix 2: Simple inline selection using modulo on seed instead of r.next()
# This way we don't consume a random value, just use the seed itself
c = c.replace(
    "postcode: 'NW10 8SB',",
    "postcode: ['E1 6AN','SE1 9GF','SW1A 1AA','N1 9GU','W2 1JB','EC2A 4NE','WC2H 7NA','NW3 5TH','CR0 1BE','UB8 1LB'][Number(seed) % 10],"
)

with open(p, "w") as f:
    f.write(c)
print("OK")
