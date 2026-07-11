#!/bin/bash
echo "🔑 Testing Google Vision API key..."
echo "Key: AIzaSyBVzV_4pOUxqWq_DthDfW_dZq9jXCc0WjI"

# Create test request
cat > test_request.json << 'EOJ'
{
  "requests": [{
    "image": {
      "source": {
        "imageUri": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png"
      }
    },
    "features": [
      {"type": "LABEL_DETECTION", "maxResults": 3},
      {"type": "LOGO_DETECTION", "maxResults": 3}
    ]
  }]
}
EOJ

echo -e "\n📡 Making API request..."
curl -s -X POST \
  "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBVzV_4pOUxqWq_DthDfW_dZq9jXCc0WjI" \
  -H "Content-Type: application/json" \
  -d @test_request.json \
  -o response.json

status_code=$?
http_status=$(head -n1 response.json | grep -o '"HTTP/[^"]* [0-9]*' | tail -c 4)

if [ $status_code -eq 0 ] && [ -n "$http_status" ]; then
    echo "✅ HTTP Status: $http_status"
    
    if [ "$http_status" = "200" ]; then
        echo "🎉 API key is VALID and working!"
        
        # Parse response
        echo -e "\n🏷️  What Google Vision detected:"
        grep -A2 -B2 "description" response.json | head -20
        
    elif [ "$http_status" = "403" ]; then
        echo "❌ API key is INVALID or disabled"
        echo "   Check: https://console.cloud.google.com/apis/credentials"
    else
        echo "⚠️  Unexpected status: $http_status"
        head -c 200 response.json
    fi
else
    echo "❌ Failed to connect to API"
fi

# Cleanup
rm -f test_request.json response.json 2>/dev/null
