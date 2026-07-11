#!/bin/bash
# News Site Server - Start automatically
cd /home/node/.openclaw/workspace
# Kill any existing instance
pkill -f "node news_server.mjs" 2>/dev/null
# Start server
node news_server.mjs &
echo "News server started on port 18990"
