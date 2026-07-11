#!/bin/bash

# Ghost CMS Publishing Script for The New World Order
GHOST_URL="https://thenewworldorder.io/ghost/api/admin/posts"
ADMIN_KEY="69cd083bed78410001d5501f:f2bb8d1da2236ed97c666ce2c430f9e0b4c9c2d0780084efe5bf1af43fd70117"

echo "============================================================"
echo "THE NEW WORLD ORDER - GHOST CMS PUBLISHING"
echo "============================================================"

# Read and parse the article
echo -e "\n📝 Processing article..."

TITLE=$(grep -m1 '^# ' /home/node/.openclaw/workspace/nwo_analysis.md | sed 's/^# //')

# Extract content between the second set of --- markers
CONTENT=$(awk '/^---$/ {count++; next} count==2 {print}' /home/node/.openclaw/workspace/nwo_analysis.md)
WORD_COUNT=$(wc -w < /home/node/.openclaw/workspace/nwo_analysis.md)

echo "   Title: $TITLE"
echo "   Words: $WORD_COUNT"

# Create HTML content from markdown
HTML_CONTENT=$(echo "$CONTENT" | while IFS= read -r line; do
    if [[ "$line" =~ ^### ]]; then
        echo "<h3>${line:4}</h3>"
    elif [[ "$line" =~ ^## ]]; then
        echo "<h2>${line:3}</h2>"
    elif [[ "$line" =~ ^# ]]; then
        echo "<h1>${line:2}</h1>"
    elif [[ "$line" =~ ^\*\*.*\*\*$ ]]; then
        echo "<p><strong>${line:2:-2}</strong></p>"
    elif [[ "$line" =~ ^\* ]]; then
        echo "<p><em>${line:1}</em></p>"
    elif [[ -n "$line" ]]; then
        echo "<p>$line</p>"
    else
        echo "<br>"
    fi
done)

# Create JSON payload for Ghost API
JSON_PAYLOAD=$(cat <<EOF
{
  "posts": [{
    "title": "$TITLE",
    "html": "$(echo "$HTML_CONTENT" | sed 's/"/\\"/g' | tr '\n' ' ' | sed 's/  */ /g')",
    "status": "published",
    "tags": [{"name": "AI Regulation"}, {"name": "CBDC"}, {"name": "Digital Control"}, {"name": "New World Order"}],
    "custom_excerpt": "An investigative analysis of how global AI regulation and Central Bank Digital Currencies are converging to create unprecedented digital control systems.",
    "featured": false,
    "visibility": "public"
  }]
}
EOF
)

echo -e "\n🚀 Publishing to Ghost CMS..."
echo "   API Endpoint: $GHOST_URL"

# Make the API call
RESPONSE=$(curl -s -X POST "$GHOST_URL" \
  -H "Authorization: Ghost $ADMIN_KEY" \
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
    
    # Extract post URL from response
    POST_URL=$(echo "$RESPONSE_BODY" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$POST_URL" ]; then
        echo -e "\n🌐 LIVE POST URL:"
        echo "   $POST_URL"
        
        # Save the URL
        echo "$POST_URL" > /home/node/.openclaw/workspace/nwo_post_url.txt
        echo -e "\n📁 URL saved to: nwo_post_url.txt"
    else
        # Fallback URL
        SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g')
        POST_URL="https://thenewworldorder.io/$SLUG/"
        echo -e "\n🌐 ESTIMATED POST URL:"
        echo "   $POST_URL"
        echo "$POST_URL" > /home/node/.openclaw/workspace/nwo_post_url.txt
    fi
else
    echo -e "\n❌ PUBLICATION FAILED"
    echo "============================================================"
    echo "Response body:"
    echo "$RESPONSE_BODY"
    exit 1
fi