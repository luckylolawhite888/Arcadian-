#!/bin/bash
echo "🔍 Quick Vision API Test"
echo "=" * 50

API_KEY="AIzaSyBVzV_4pOUxqWq_DthDfW_dZq9jXCc0WjI"

echo "Testing API key: ${API_KEY:0:15}..."
echo

# Create simple test request
cat > test_req.json << 'EOJ'
{
  "requests": [{
    "image": {
      "source": {
        "imageUri": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png"
      }
    },
    "features": [{"type": "LABEL_DETECTION", "maxResults": 3}]
  }]
}
EOJ

echo "📡 Making test request to Vision API..."
echo

curl -s -X POST \
  "https://vision.googleapis.com/v1/images:annotate?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d @test_req.json \
  -o response.json

HTTP_STATUS=$(grep -o '"HTTP/[^"]* [0-9]*' response.json 2>/dev/null | tail -c 4 || echo "unknown")

echo "📊 Result:"
echo "  HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "  ✅ SUCCESS! Vision API is working!"
    echo
    echo "🏷️  Detected labels:"
    grep -A2 "description" response.json | head -6
elif [ "$HTTP_STATUS" = "403" ]; then
    echo "  ❌ ERROR: API not enabled or invalid key"
    echo "  Please enable Vision API first"
elif [ "$HTTP_STATUS" = "429" ]; then
    echo "  ⚠️  WARNING: Quota exceeded"
    echo "  Wait a bit or check billing"
else
    echo "  ⚠️  Response: $(head -c 200 response.json)"
fi

# Cleanup
rm -f test_req.json response.json 2>/dev/null

echo
echo "=" * 50
