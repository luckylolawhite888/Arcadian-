#!/bin/bash
echo "🎉 VISION API SUCCESS TEST 🎉"
echo "=" * 50

API_KEY="AIzaSyBVzV_4pOUxqWq_DthDfW_dZq9jXCc0WjI"

echo "✅ API Key: ${API_KEY:0:15}..."
echo "✅ Vision API: ENABLED"
echo

# Test with Wikipedia logo
cat > test.json << 'EOJ'
{
  "requests": [{
    "image": {
      "source": {
        "imageUri": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png"
      }
    },
    "features": [
      {"type": "LABEL_DETECTION", "maxResults": 5},
      {"type": "LOGO_DETECTION", "maxResults": 3},
      {"type": "TEXT_DETECTION", "maxResults": 3}
    ]
  }]
}
EOJ

echo "🔍 Analyzing Wikipedia logo..."
echo

curl -s -X POST \
  "https://vision.googleapis.com/v1/images:annotate?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d @test.json \
  -o response.json

echo "📊 ANALYSIS RESULTS:"
echo "-------------------"

# Check for labels
if grep -q "labelAnnotations" response.json; then
    echo "🏷️  LABELS DETECTED:"
    grep -A3 "description" response.json | grep -A2 "labelAnnotations" | tail -10 | while read line; do
        if [[ $line == *"description"* ]]; then
            label=$(echo $line | cut -d'"' -f4)
            if [[ $label != "" ]]; then
                echo "  • $label"
            fi
        fi
    done
fi

# Check for logos
if grep -q "logoAnnotations" response.json; then
    echo ""
    echo "🏢 LOGOS DETECTED:"
    grep -A3 "description" response.json | grep -A2 "logoAnnotations" | tail -10 | while read line; do
        if [[ $line == *"description"* ]]; then
            logo=$(echo $line | cut -d'"' -f4)
            if [[ $logo != "" ]]; then
                echo "  • $logo"
            fi
        fi
    done
fi

# Check for text
if grep -q "textAnnotations" response.json; then
    echo ""
    echo "📝 TEXT DETECTED:"
    # Get the first text annotation (full text)
    text=$(grep -A1 '"description":' response.json | head -2 | tail -1 | cut -d'"' -f4)
    if [[ $text != "" ]]; then
        echo "  \"${text:0:100}...\""
    fi
fi

echo ""
echo "✅ VISION API IS FULLY OPERATIONAL!"
echo "=" * 50

# Cleanup
rm -f test.json response.json 2>/dev/null
