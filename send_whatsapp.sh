#!/bin/bash
# Send a message via WAHA WhatsApp
# Usage: ./send_whatsapp.sh "message text"
MSG=$(echo "$1" | sed 's/"/\\"/g')
curl -s --max-time 10 -X POST "http://212.227.93.74:3000/api/sendText" \
  -H "X-API-Key: hom_lola_2026" \
  -H "Content-Type: application/json" \
  -d "{\"session\":\"default\",\"chatId\":\"17167118545150@lid\",\"text\":\"$MSG\"}" > /dev/null 2>&1
echo "WhatsApp sent ✅"
