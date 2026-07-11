#!/usr/bin/env python3
"""Simple patch: remove Dr, add varied postcodes. That's it."""
p = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs'
with open(p, 'r') as f:
    c = f.read()

c = c.replace("'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'", "'Mr', 'Mrs', 'Ms', 'Miss'")
c = c.replace("postcode: 'NW10 8SB',",
    "postcode: ['E1 6AN','SE1 9GF','SW1A 1AA','N1 9GU','W2 1JB','EC2A 4NE','WC2H 7NA','NW3 5TH','CR0 1BE','UB8 1LB'][Math.floor(r.next() * 10)],")

with open(p, 'w') as f:
    f.write(c)

# Verify
with open(p, 'r') as f:
    check = f.read()
print("Dr in file:", "'Dr'" in check)
print("NW10 in file:", "'NW10 8SB'" in check)
print("OK")
