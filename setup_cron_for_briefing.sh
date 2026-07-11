#!/bin/bash
# Setup cron job for morning briefing at 11:00 AM BST daily

echo "Setting up morning briefing cron job..."
echo "========================================="

# Create the cron job entry
CRON_JOB="0 10 * * * /home/node/.openclaw/workspace/deliver_morning_briefing.sh > /home/node/.openclaw/workspace/briefing_cron.log 2>&1"
# Note: 10:00 UTC = 11:00 BST (during BST period)

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "deliver_morning_briefing.sh"; then
    echo "❌ Cron job already exists. Removing old entry..."
    crontab -l | grep -v "deliver_morning_briefing.sh" | crontab -
fi

# Add the cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job added:"
echo "   Time: 10:00 UTC daily (11:00 AM BST)"
echo "   Command: /home/node/.openclaw/workspace/deliver_morning_briefing.sh"
echo "   Log: /home/node/.openclaw/workspace/briefing_cron.log"

# Show current crontab
echo ""
echo "Current crontab:"
echo "================"
crontab -l 2>/dev/null || echo "No crontab entries"

echo ""
echo "To test immediately, run:"
echo "  /home/node/.openclaw/workspace/deliver_morning_briefing.sh"
echo ""
echo "To check logs:"
echo "  tail -f /home/node/.openclaw/workspace/briefing_cron.log"