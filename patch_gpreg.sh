#!/bin/bash
# Patch gpreg_go.mjs: remove Dr, randomize postcode
P=/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs
cp "${P}.bak" "$P"

# Remove Dr from titles (sed hex escapes for single quote)
# Use python for the Dr removal to avoid shell quoting hell
python3 -c "
import pathlib
t = pathlib.Path('$P').read_text()
t = t.replace(\"'Mr', 'Mrs', 'Ms', 'Miss', 'Dr'\", \"'Mr', 'Mrs', 'Ms', 'Miss'\")
pathlib.Path('$P').write_text(t)
"

# Replace postcode with random selection from 10 London postcodes
# Note: use $(...) syntax carefully here
# Use postcodes near the E84028 surgery (Willesden Green) - all NW/adjacent London postcodes
LC_ALL=C sed -i "s/postcode: 'NW10 8SB',/postcode: ['NW10 8SB','NW10 3ST','NW10 5SJ','NW10 4ED','NW3 5TH','NW6 6RR','NW5 4RN','NW1 9BH','NW2 3RT','W10 6SF'][Math.floor(Math.random() * 10)],/" "$P"

echo "PATCH_DONE"
grep "postcode:" "$P" | head -2
