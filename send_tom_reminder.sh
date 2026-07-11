#!/bin/bash
echo "📱 SENDING CASH POINT REMINDER TO TOM"
echo "=" * 60

# Load Tom's contact
TOMBER=$(python3 -c "
import json
with open('/home/node/.openclaw/workspace/phonebook.json', 'r') as f:
    contacts = json.load(f)
tom = contacts.get('tom', {})
if tom:
    print(tom['number'])
else:
    print('NOT_FOUND')
")

if [ "$TOMBER" = "NOT_FOUND" ]; then
    echo "❌ Tom not found in contacts"
    exit 1
fi

echo "✅ Tom's number: $TOMBER"

# Create message
MESSAGE="Hey Tom, reminder to go to the cash point today 👉"
echo "📝 Message: \"$MESSAGE\""
echo "📞 To: $TOMBER"
echo "👤 From: Maya"
echo

echo "🚀 ATTEMPTING TO SEND SMS VIA CURL..."
echo

# JWT token from your credentials
JWT_TOKEN="JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJkNDVmZjViMi04M2RkLTRjYTMtOTNjYi04YWVlNzUwZWNkNjMiLCJzZWNyZXQiOiJmOTI4MzE0Y2E2NjdjNzc0NzFhZGU4OWZjYmUyMzllNmNiNjg0NjhkOWUxZjFkOTdmNWYzODllNjcxNWI1ZTNmIiwiaWF0IjoxNzc0MjgyODk3LCJleHAiOjI1NjI2ODI4OTd9.ryPQIES-0CkG6fXraFc4m0d9rZkLdioPLk4_gWEd1k8"

# Create JSON payload
cat > sms_payload.json << EOJ
{
  "sender": "Maya",
  "destination": "$TOMBER",
  "content": "$MESSAGE",
  "tag": "cashpoint_reminder"
}
EOJ

echo "📡 Calling SMS Works API..."
echo "URL: https://api.thesmsworks.co.uk/v1/message/send"
echo

# Make the API call
curl -s -X POST \
  "https://api.thesmsworks.co.uk/v1/message/send" \
  -H "Authorization: $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @sms_payload.json \
  -o sms_response.json

HTTP_STATUS=$(head -n1 sms_response.json 2>/dev/null | grep -o '"HTTP/[^"]* [0-9]*' | tail -c 4 || echo "unknown")

echo "📊 API Response Status: $HTTP_STATUS"
echo

if [ "$HTTP_STATUS" = "201" ]; then
    echo "🎉 SUCCESS! Message sent to Tom!"
    echo "   Response: $(cat sms_response.json | head -c 100)..."
    
    # Update last contacted time
    python3 -c "
import json
from datetime import datetime
with open('/home/node/.openclaw/workspace/phonebook.json', 'r') as f:
    contacts = json.load(f)
if 'tom' in contacts:
    contacts['tom']['last_contacted'] = datetime.now().isoformat()
    with open('/home/node/.openclaw/workspace/phonebook.json', 'w') as f:
        json.dump(contacts, f, indent=2)
    print('✅ Contact updated with last contacted time')
"
    
elif [ "$HTTP_STATUS" = "401" ]; then
    echo "❌ Authentication failed - check JWT token"
    echo "   Response: $(cat sms_response.json | head -c 200)"
elif [ "$HTTP_STATUS" = "402" ]; then
    echo "❌ Payment required - check account balance"
elif [ "$HTTP_STATUS" = "422" ]; then
    echo "❌ Invalid request - check phone number format"
    echo "   Response: $(cat sms_response.json | head -c 200)"
else
    echo "⚠️  Response: $(cat sms_response.json | head -c 200)"
fi

echo
echo "=" * 60

# Cleanup
rm -f sms_payload.json sms_response.json 2>/dev/null
