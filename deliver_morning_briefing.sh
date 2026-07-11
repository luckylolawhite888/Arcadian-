#!/bin/bash
# Morning Briefing Delivery Script
# Run at 8:00 AM Europe/London time

echo "========================================="
echo "MORNING BRIEFING DELIVERY SYSTEM"
echo "Started at: $(date)"
echo "========================================="

cd /home/node/.openclaw/workspace

# Step 1: Generate travel deal
echo "1. Generating travel deal..."
python3 travel_deal_system.py > /tmp/travel_deal.log 2>&1

# Step 2: Generate full briefing
echo "2. Generating morning briefing..."
python3 morning_briefing_generator.py > /tmp/briefing_gen.log 2>&1

# Step 3: Read the briefing
BRIEFING_FILE="/home/node/.openclaw/workspace/todays_briefing.md"
if [ -f "$BRIEFING_FILE" ]; then
    echo "3. Briefing generated successfully!"
    
    # Get first briefing (remove duplicate if exists)
    BRIEFING_CONTENT=$(head -n 100 "$BRIEFING_FILE" | sed '/# Top of the morning/q' | head -n -1)
    
    # For now, just show preview
    echo "========================================="
    echo "BRIEFING PREVIEW:"
    echo "========================================="
    echo "$BRIEFING_CONTENT" | head -30
    echo "..."
    echo "========================================="
    
    # In production, this would send via Telegram using message tool
    echo "✅ Briefing ready for delivery at 8:00 AM"
else
    echo "❌ Briefing file not found!"
    exit 1
fi

echo "========================================="
echo "DELIVERY SYSTEM COMPLETE"
echo "Finished at: $(date)"
echo "========================================="