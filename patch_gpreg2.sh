#!/bin/bash
P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

# Remove Dr
python3 -c "
import pathlib
t = pathlib.Path('$P').read_text()
t = t.replace(\"'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'\", \"'Mr', 'Mrs', 'Ms', 'Miss'\")
t = t.replace(\"postcode: 'NW10 8SB',\", \"postcode: ['NW10 8SB','NW10 5YP','NW10 7LH','NW10 4HL','NW10 3TT','NW10 6QU','NW10 9AA','NW10 2EF','NW10 1DG','NW10 0ED'][Math.floor(Math.random() * 10)],\")
pathlib.Path('$P').write_text(t)
"
echo "PATCH_DONE"
grep "postcode:" "$P" | head -2
