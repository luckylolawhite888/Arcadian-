#!/bin/bash
# Morning Briefing Delivery Script — Runs on IONOS server
# Called via cron at 10:00 UTC (11:00 AM BST)

set -e

SERVER="212.227.93.74"
KEY="/home/node/.ssh/ionos_ubuntu"
BRIEFING_DIR="/root/briefing"

echo "=== MORNING BRIEFING DELIVERY ==="
echo "Started at: $(date)"
echo "Server: $SERVER"

# Step 1: Generate travel deals
echo "1. Generating travel deals..."
ssh -i "$KEY" root@$SERVER "cd $BRIEFING_DIR && python3 travel_deal_system.py" > /dev/null 2>&1

# Step 2: Generate the full briefing
echo "2. Generating morning briefing..."
ssh -i "$KEY" root@$SERVER "cd $BRIEFING_DIR && python3 morning_briefing_generator.py" > /dev/null 2>&1

# Step 3: Read the generated briefing
echo "3. Reading briefing..."
BRIEFING=$(ssh -i "$KEY" root@$SERVER "cat $BRIEFING_DIR/../todays_briefing.md 2>/dev/null || cat $BRIEFING_DIR/todays_briefing.md 2>/dev/null || echo 'NOT FOUND'")

if [ "$BRIEFING" = "NOT FOUND" ]; then
    echo "❌ Briefing file not found on server!"
    # Fallback: generate quick briefing locally
    python3 -c "
from datetime import datetime
print('# Morning Briefing — ' + datetime.now().strftime('%A %B %d'))
print()
print('⚠️ Auto-generation failed. Here is a quick roundup:')
" > /tmp/quick_briefing.md
    exit 1
fi

echo "✅ Briefing generated successfully!"
echo ""

# Step 4: Send via OpenClaw Telegram API on the server
echo "4. Delivering briefing via Telegram..."
ssh -i "$KEY" root@$SERVER "
curl -s -X POST http://localhost:18789/api/message/send \\
  -H 'Content-Type: application/json' \\
  -d '{
    \"channel\": \"telegram\",
    \"target\": \"1523950034\",
    \"message\": $(cat $BRIEFING_DIR/../todays_briefing.md 2>/dev/null | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')
  }'
" > /dev/null 2>&1

echo "✅ Briefing delivered to Telegram!"
echo "=== COMPLETE at $(date) ==="
