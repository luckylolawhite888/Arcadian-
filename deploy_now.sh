#!/bin/bash
echo "🚀 DEPLOYING THE NEW WORLD ORDER LANDING PAGE"
echo "=============================================="
echo "Design: 'Let's face it, the old world is dead'"
echo "Colors: All white, dark orange text"
echo "Features: JOIN NOW button, phone collection, countdown to May 8th"
echo ""

# Check if Node.js server is running
if ! pgrep -f "node server.js" > /dev/null; then
    echo "❌ Node.js server not running. Starting it..."
    cd /home/node/.openclaw/workspace/landing-page
    nohup node server.js > server.log 2>&1 &
    sleep 3
fi

echo "✅ Server running on: http://localhost:3000"
echo ""

# Create public access
echo "🌐 Creating public access..."
echo ""
echo "OPTION 1: Use existing domain (thenewworldorder.io)"
echo "   - Replace current Neo-Brutalist site with new landing page"
echo "   - Requires access to current hosting server"
echo ""
echo "OPTION 2: Deploy to subdomain"
echo "   - join.thenewworldorder.io"
echo "   - hunt.thenewworldorder.io"  
echo "   - new.thenewworldorder.io"
echo ""
echo "OPTION 3: Deploy to free hosting"
echo "   - Vercel: thenewworldorder.vercel.app"
echo "   - Netlify: thenewworldorder.netlify.app"
echo "   - GitHub Pages: [username].github.io/thenewworldorder"
echo ""
echo "📋 DEPLOYMENT READY:"
echo "-------------------"
echo "Files are ready at: /home/node/.openclaw/workspace/landing-page/"
echo "Static version:    /home/node/.openclaw/workspace/landing-page/static-version/"
echo ""
echo "🔧 To deploy manually:"
echo "1. Upload static-version/ folder to any hosting"
echo "2. Update FormSubmit.co email in index.html"
echo "3. Point DNS to hosting provider"
echo ""
echo "🦊 The landing page is READY for deployment!"