#!/usr/bin/env python3
"""Check Station One for new videos since last check"""
import json
import sys
import os

# Import the monitor
sys.path.insert(0, '/home/node/.openclaw/workspace')
from station_one_monitor import main as check_station_one

# Redirect output to capture it
from io import StringIO
old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    check_station_one()
    result = json.loads(sys.stdout.getvalue())
except Exception as e:
    sys.stdout = old_stdout
    result = {"status": "error", "message": str(e)}

sys.stdout = old_stdout

# Write results to pickup file
pickup = "/tmp/station_one_pickup.json"
with open(pickup, "w") as f:
    json.dump(result, f, indent=2)

if result.get("count", 0) > 0:
    print(f"🆕 Station One: {result['count']} new video(s)")
    for v in result["new_videos"]:
        print(f"  • {v['title']} - {v['url']}")
else:
    print("No new Station One videos since last check")
