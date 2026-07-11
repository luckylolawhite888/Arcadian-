#!/bin/bash

# The New World Order Publishing Script
API_URL="https://thenewworldorder.io/api/posts"
API_KEY="64278e9eaf4ac0f4b71a628ed1"

echo "============================================================"
echo "THE NEW WORLD ORDER - PUBLISHING SYSTEM"
echo "============================================================"

# Read and parse the article
echo -e "\n📝 Processing article..."

TITLE=$(grep -m1 '^# ' /home/node/.openclaw/workspace/nwo_analysis.md | sed 's/^# //')
CONTENT=$(sed -n '/^---$/,/^---$/p' /home/node/.openclaw/workspace/nwo_analysis.md | sed '1d;$d')
WORD_COUNT=$(wc -w < /home/node/.openclaw/workspace/nwo_analysis.md)

echo "   Title: $TITLE"
echo "   Words: $WORD_COUNT"

# Create JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "title": "$TITLE",
  "content": "$(echo "$CONTENT" | sed 's/"/\\"/g' | tr '\n' ' ' | sed 's/  */ /g')",
  "status": "published",
  "meta": {
    "category": "Geopolitical Analysis",
    "tags": ["AI Regulation", "CBDC", "Digital Control", "New World Order"],
    "word_count": $WORD_COUNT
  }
}
EOF
)

echo -e "\n🚀 Publishing to NWO site..."
echo "   API Endpoint: $API_URL"

# Make the API call
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD" \
  -w "\n%{http_code}")

# Extract status code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

echo -e "\n📡 Response:"
echo "   HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "\n✅ PUBLICATION SUCCESSFUL"
    echo "============================================================"
    
    # Try to extract post ID
    POST_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$POST_ID" ]; then
        POST_URL="https://thenewworldorder.io/posts/$POST_ID"
        echo -e "\n🌐 LIVE POST URL:"
        echo "   $POST_URL"
        
        # Save the URL
        echo "$POST_URL" > /home/node/.openclaw/workspace/nwo_post_url.txt
        echo -e "\n📁 URL saved to: nwo_post_url.txt"
    else
        echo -e "\n⚠️  Could not extract post ID"
        echo "   Default URL: https://thenewworldorder.io"
        echo "https://thenewworldorder.io" > /home/node/.openclaw/workspace/nwo_post_url.txt
    fi
else
    echo -e "\n❌ PUBLICATION FAILED"
    echo "============================================================"
    echo "Response body:"
    echo "$RESPONSE_BODY"
    exit 1
fi