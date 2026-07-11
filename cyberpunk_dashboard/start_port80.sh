#!/bin/bash
# Start dashboard on port 80 (standard HTTP port)

echo "🔄 Starting dashboard on port 80 (standard HTTP)..."
cd /home/node/.openclaw/workspace/cyberpunk_dashboard

# Kill any existing server
pkill -f simple_server 2>/dev/null
sleep 1

# Check if we can bind to port 80 (might need sudo)
python3 -c "
import socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('0.0.0.0', 80))
    s.close()
    print('Port 80 is available')
except PermissionError:
    print('Need sudo for port 80')
except OSError as e:
    print(f'Port 80 error: {e}')
"

# Try port 80 first, fallback to 8080
PORT=80
python3 -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.bind(('0.0.0.0', 80))
    s.close()
    print('Will use port 80')
except:
    print('Will use port 8080')
"

# Modify the server to use port 80
sed -i 's/PORT = 8080/PORT = 80/' simple_server.py

# Start server (might fail if no permission for port 80)
python3 simple_server.py > /tmp/dashboard_80.log 2>&1 &
sleep 3

# Check if running
if curl -s http://localhost:80/health > /dev/null 2>&1; then
    echo "✅ Dashboard started on port 80"
    echo ""
    echo "🔗 Try this URL: http://212.227.93.74"
    echo "   (no port needed for port 80)"
elif curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "⚠️  Port 80 failed, using 8080"
    sed -i 's/PORT = 80/PORT = 8080/' simple_server.py
    pkill -f simple_server
    python3 simple_server.py > /tmp/dashboard_8080.log 2>&1 &
    sleep 2
    echo "✅ Dashboard on port 8080"
    echo "🔗 Try: http://212.227.93.74:8080"
else
    echo "❌ Could not start dashboard"
fi