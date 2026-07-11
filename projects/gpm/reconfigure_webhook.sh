#!/bin/bash
# Reconfigure WAHA webhook to debug port
set -e

KEY="scarlett-waha-2026"

# Delete old session
docker exec waha curl -s -X DELETE "http://localhost:3000/api/sessions/default?x-api-key=${KEY}"
sleep 2

# Create new session with webhook pointing to debug port
docker exec waha curl -s -X POST "http://localhost:3000/api/sessions?x-api-key=${KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"default\",\"config\":{\"webhooks\":[{\"url\":\"http://172.17.0.1:3002/\",\"events\":[\"message\"]}]}}"

sleep 2

# Start session
docker exec waha curl -s -X POST "http://localhost:3000/api/sessions/default/start?x-api-key=${KEY}"

echo ""
echo "Session recreated, waiting for QR..."
sleep 8

# Check status
docker exec waha curl -s "http://localhost:3000/api/sessions/default?x-api-key=${KEY}" | python3 -c "import sys,json; s=json.load(sys.stdin); print('Status:', s.get('status')); print('State:', s.get('engine',{}).get('state'))"
