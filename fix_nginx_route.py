#!/usr/bin/env python3
import sys, os

path = "/etc/nginx/sites-enabled/00-main-site-443.conf"

# Read
with open(path) as f:
    lines = f.readlines()

# Find the gpreg-api closing - look for "location /gpreg-api/" then find next "}"
insert_at = None
for i, line in enumerate(lines):
    if 'location /gpreg-api/' in line:
        # Walk forward to find the first standalone "}"
        for j in range(i+1, len(lines)):
            if lines[j].strip() == '}':
                insert_at = j + 1  # insert AFTER this line
                break
        break

if insert_at is None:
    print("Could not find gpreg-api block")
    sys.exit(1)

block = """    # Ad Farm Analytics API
    location /adfarm-analytics/ {
        proxy_pass http://127.0.0.1:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header Access-Control-Allow-Origin *;
    }
"""

result = lines[:insert_at] + [block] + lines[insert_at:]

with open(path, 'w') as f:
    f.writelines(result)

# Test
ec = os.system("nginx -t 2>&1")
if ec != 0:
    print("nginx test FAILED")
    sys.exit(1)
else:
    os.system("systemctl reload nginx")
    print("OK")
