#!/bin/bash
# Deploy Arcadian Media Dashboard with Surge.sh

echo "🚀 Deploying Arcadian Media Dashboard to Surge.sh..."
echo "=================================================="

# Create a deployment directory
DEPLOY_DIR="/tmp/arcadian-media-$(date +%s)"
mkdir -p "$DEPLOY_DIR"

# Copy our standalone HTML file as index.html
cp arcadian_media_standalone.html "$DEPLOY_DIR/index.html"

# Create a simple CNAME file for custom domain (optional)
echo "# Arcadian Media Cyberpunk Dashboard" > "$DEPLOY_DIR/README.md"
echo "Deployed: $(date)" >> "$DEPLOY_DIR/README.md"

echo "✅ Created deployment directory: $DEPLOY_DIR"
echo "📁 Contents:"
ls -la "$DEPLOY_DIR/"

echo ""
echo "🔧 Attempting to deploy with Surge..."
echo ""

# Try to deploy with npx surge
cd "$DEPLOY_DIR"

# First, check if we can run surge
if npx surge --version 2>/dev/null; then
    echo "✅ Surge is available via npx"
    
    # Try to deploy (non-interactively)
    # We'll use a specific domain to make it consistent
    DOMAIN="arcadian-media-$(date +%Y%m%d).surge.sh"
    
    echo "🌐 Deploying to: $DOMAIN"
    
    # Try non-interactive deployment
    echo "Trying non-interactive deployment..."
    npx surge ./ "$DOMAIN" 2>&1 | tee /tmp/surge-deploy.log
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Dashboard deployed!"
        echo "🔗 URL: https://$DOMAIN"
        echo ""
        echo "📋 Bookmark this URL for one-click morning access!"
        echo ""
        echo "💡 The dashboard will be available at this URL permanently."
    else
        echo "❌ Surge deployment failed"
        echo "Check /tmp/surge-deploy.log for details"
        
        # Try interactive mode as fallback
        echo ""
        echo "🔄 Trying interactive deployment..."
        echo "When prompted:"
        echo "1. Press Enter for project path"
        echo "2. Enter domain: $DOMAIN"
        echo "3. Press Enter to confirm"
        echo ""
        npx surge
    fi
else
    echo "❌ Could not run surge via npx"
    echo ""
    echo "📋 MANUAL DEPLOYMENT INSTRUCTIONS:"
    echo "1. Install surge globally: npm install -g surge"
    echo "2. Run: cd \"$DEPLOY_DIR\""
    echo "3. Run: surge"
    echo "4. When prompted, enter domain: arcadian-media.surge.sh"
    echo "5. Press Enter to confirm"
    echo ""
    echo "🌐 Or use Netlify Drop: https://app.netlify.com/drop"
    echo "   Drag & drop the folder: $DEPLOY_DIR"
fi

echo ""
echo "=================================================="
echo "🦊 Arcadian Media Dashboard Deployment Complete!"
echo "=================================================="