#!/bin/bash

echo "🔌 Testing ModelsLab API with curl..."

# Load API key from vault
VAULT_FILE="/home/node/.openclaw/workspace/.vault/modelslab_credentials.json"

if [ ! -f "$VAULT_FILE" ]; then
    echo "❌ Vault file not found: $VAULT_FILE"
    exit 1
fi

# Extract API key (simplified - in production would use jq)
API_KEY=$(grep -o '"api_key": "[^"]*"' "$VAULT_FILE" | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
    echo "❌ Could not extract API key from vault"
    exit 1
fi

echo "✅ API key loaded: ${API_KEY:0:8}...${API_KEY: -8}"

# Test API endpoint
URL="https://api.modelslab.com/v1/images/generations"

echo -e "\n📡 Testing endpoint: $URL"

# Make API call
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "stable-diffusion-v1.5",
    "prompt": "test image, simple circle",
    "width": 512,
    "height": 512,
    "num_images": 1
  }')

# Extract HTTP status
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS:")

echo "Status Code: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ ModelsLab API connection successful!"
    echo -e "\n📊 Response sample:"
    echo "$RESPONSE_BODY" | head -100
elif [ "$HTTP_STATUS" = "401" ]; then
    echo "❌ API key invalid or expired"
    echo -e "\n🔍 Response:"
    echo "$RESPONSE_BODY"
else
    echo "❌ API error: $HTTP_STATUS"
    echo -e "\n🔍 Response:"
    echo "$RESPONSE_BODY"
fi