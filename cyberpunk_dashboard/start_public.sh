#!/bin/bash
# Start dashboard on port 8080 (commonly open port)

echo "🔄 Restarting dashboard on port 8080..."
cd /home/node/.openclaw/workspace/cyberpunk_dashboard

# Kill any existing server
pkill -f simple_server 2>/dev/null
sleep 1

# Modify the server to use port 8080
sed -i 's/PORT = 5000/PORT = 8080/' simple_server.py

# Start server
python3 simple_server.py > /tmp/dashboard_8080.log 2>&1 &
sleep 2

echo "✅ Dashboard started on port 8080"
echo ""
echo "🔗 Try these URLs:"
echo "1. http://212.227.93.74:8080"
echo "2. http://172.17.0.2:8080"
echo ""
echo "📱 Health check: http://212.227.93.74:8080/health"
echo ""
echo "If port 8080 is also blocked, we'll need to use a tunneling service."