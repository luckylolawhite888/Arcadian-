#!/bin/bash

# SMS Works API Test Script
JWT_TOKEN="JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJkNDVmZjViMi04M2RkLTRjYTMtOTNjYi04YWVlNzUwZWNkNjMiLCJzZWNyZXQiOiJmOTI4MzE0Y2E2NjdjNzc0NzFhZGU4OWZjYmUyMzllNmNiNjg0NjhkOWUxZjFkOTdmNWYzODllNjcxNWI1ZTNmIiwiaWF0IjoxNzc0MjgyODk3LCJleHAiOjI1NjI2ODI4OTd9.ryPQIES-0CkG6fXraFc4m0d9rZkLdioPLk4_gWEd1k8"
API_URL="https://api.thesmsworks.co.uk"

echo "Testing SMS Works API..."
echo "========================"

# Test 1: Check API status
echo -e "\n1. Testing API connection..."
curl -s -X GET "$API_URL/" \
  -H "Authorization: $JWT_TOKEN" \
  -H "Content-Type: application/json"

# Test 2: Try to send an SMS (will need a real phone number)
echo -e "\n\n2. Testing SMS send endpoint structure..."
echo "Note: Need a real phone number to actually send"

# Create a test payload
cat > /tmp/sms_test.json << EOF
{
  "sender": "LolaTest",
  "destination": "+447123456789",
  "content": "Test message from Lola via SMS Works API",
  "encoding": "gsm"
}
EOF

echo "Test payload created at /tmp/sms_test.json"
echo "To send an actual SMS, replace the phone number and run:"
echo "curl -X POST '$API_URL/message/send' \\"
echo "  -H 'Authorization: $JWT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d @/tmp/sms_test.json"

echo -e "\n\n3. Checking available endpoints..."
echo "Trying common endpoints:"

# Try some common endpoints
for endpoint in "/messages" "/account" "/credits" "/balance" "/status"; do
  echo -n "  $endpoint: "
  curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL$endpoint" \
    -H "Authorization: $JWT_TOKEN" \
    -H "Content-Type: application/json"
  echo ""
done

echo -e "\nDone!"