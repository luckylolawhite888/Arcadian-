#!/bin/bash
# Setup daily 11 AM London time update for Arcadian Media Dashboard

echo "🕐 Setting up daily 11 AM London time update..."
echo "================================================"

# Create update script
cat > /home/node/.openclaw/workspace/cyberpunk_dashboard/update_dashboard.sh << 'EOF'
#!/bin/bash
# Daily dashboard update script

echo "$(date): Updating Arcadian Media Dashboard..."

# Navigate to dashboard directory
cd /home/node/.openclaw/workspace/cyberpunk_dashboard

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Refresh dashboard data
python3 -c "
import sys
sys.path.insert(0, '.')
from app import dashboard_data
data = dashboard_data.refresh_data()
print(f'Dashboard updated at $(date)')
print(f'- Todo items: {len(data[\"todo_list\"])}')
print(f'- News items: {len(data[\"news\"])}')
"

echo "Update complete!"
EOF

chmod +x /home/node/.openclaw/workspace/cyberpunk_dashboard/update_dashboard.sh

# Create cron job for 11 AM London time (10 AM UTC in winter, 11 AM UTC in summer)
# Note: London is UTC+0 in winter, UTC+1 in summer (BST)
# We'll schedule for 11:00 UTC which is 12:00 London in summer, 11:00 London in winter
# User can adjust based on actual timezone needs

echo ""
echo "📅 To set up the daily 11 AM London update, add this to your crontab:"
echo ""
echo "0 11 * * * /home/node/.openclaw/workspace/cyberpunk_dashboard/update_dashboard.sh >> /home/node/.openclaw/workspace/cyberpunk_dashboard/update.log 2>&1"
echo ""
echo "This will run at 11:00 UTC daily."
echo ""
echo "For 11:00 London time (GMT/BST):"
echo "- Winter (GMT): Use 11 11 * * * (11:11 UTC)"
echo "- Summer (BST): Use 10 11 * * * (10:11 UTC)"
echo ""
echo "To edit crontab: crontab -e"
echo ""
echo "✅ Update script created: /home/node/.openclaw/workspace/cyberpunk_dashboard/update_dashboard.sh"
echo "📝 Log file: /home/node/.openclaw/workspace/cyberpunk_dashboard/update.log"