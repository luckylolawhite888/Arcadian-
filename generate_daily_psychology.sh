#!/bin/bash
# Daily Psychology Content Generator
# Runs at 5 AM UTC (6 AM UK time) to prepare for 8 AM briefing

cd /home/node/.openclaw/workspace

# Generate psychology content
python3 psychology_content_system.py > /tmp/psychology_generation.log 2>&1

# Check if successful
if [ $? -eq 0 ]; then
    echo "$(date): Psychology content generated successfully" >> /home/node/.openclaw/workspace/psychology_cron.log
else
    echo "$(date): ERROR generating psychology content" >> /home/node/.openclaw/workspace/psychology_cron.log
fi
