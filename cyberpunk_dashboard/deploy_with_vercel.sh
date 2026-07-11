#!/bin/bash
# Deploy Arcadian Media Dashboard with Vercel (no login needed)

echo "🚀 Deploying Arcadian Media Dashboard to Vercel..."
echo "=================================================="

# Create a deployment directory
DEPLOY_DIR="/tmp/arcadian-media-vercel-$(date +%s)"
mkdir -p "$DEPLOY_DIR"

# Copy our standalone HTML file as index.html
cp arcadian_media_standalone.html "$DEPLOY_DIR/index.html"

# Create vercel.json configuration
cat > "$DEPLOY_DIR/vercel.json" << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "name": "arcadian-media",
  "alias": ["arcadian-media.vercel.app"]
}
EOF

echo "✅ Created deployment directory: $DEPLOY_DIR"
echo "📁 Contents:"
ls -la "$DEPLOY_DIR/"

echo ""
echo "🔧 Deploying with Vercel (anonymous deployment)..."
echo ""

cd "$DEPLOY_DIR"

# Try to deploy with Vercel (--yes for non-interactive, --prod for production)
echo "Running: npx vercel --yes --prod 2>&1"
DEPLOY_OUTPUT=$(npx vercel --yes --prod 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract URL from output
URL=$(echo "$DEPLOY_OUTPUT" | grep -o "https://[^ ]*\.vercel\.app" | head -1)

if [ -n "$URL" ]; then
    echo ""
    echo "🎉🎉🎉 SUCCESS! Dashboard deployed! 🎉🎉🎉"
    echo "🔗 URL: $URL"
    echo ""
    echo "📋 Bookmark this URL for one-click morning access!"
    echo ""
    echo "💡 The dashboard will be available at this URL."
    echo "🦊 You can click it every morning for your briefing!"
    
    # Also try to get the preview URL
    PREVIEW_URL=$(echo "$DEPLOY_OUTPUT" | grep -o "https://[^ ]*\.vercel\.app" | tail -1)
    if [ "$PREVIEW_URL" != "$URL" ] && [ -n "$PREVIEW_URL" ]; then
        echo "🔍 Preview: $PREVIEW_URL"
    fi
else
    echo ""
    echo "❌ Could not extract deployment URL"
    echo ""
    echo "📋 Try manual deployment:"
    echo "1. Go to: https://vercel.com/new"
    echo "2. Drag & drop the folder: $DEPLOY_DIR"
    echo "3. Deploy without login (anonymous)"
    echo "4. Get your URL!"
fi

echo ""
echo "=================================================="
echo "🦊 Arcadian Media Dashboard - One-Click Morning Access!"
echo "=================================================="