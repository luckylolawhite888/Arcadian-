#!/bin/bash
# DEPLOYMENT VERIFICATION SCRIPT

echo "🔍 THE NEW WORLD ORDER - DEPLOYMENT VERIFICATION"
echo "================================================"

# Check if site is accessible
echo ""
echo "🌐 CHECKING LIVE SITE..."
if curl -s --head http://thenewworldorder.io | grep "200 OK" > /dev/null; then
    echo "✅ Site is accessible: HTTP 200 OK"
    
    # Check for new landing page content
    if curl -s http://thenewworldorder.io | grep -q "Let's face it, the old world is dead"; then
        echo "✅ New landing page detected: 'Let's face it, the old world is dead'"
    else
        echo "❌ OLD SITE STILL ACTIVE: Neo-Brutalist site detected"
        echo "   Run DEPLOY.sh to replace with new landing page"
    fi
    
    # Check for JOIN NOW button
    if curl -s http://thenewworldorder.io | grep -q "JOIN NOW"; then
        echo "✅ JOIN NOW button present"
    fi
    
    # Check for countdown timer
    if curl -s http://thenewworldorder.io | grep -q "8th of May"; then
        echo "✅ Countdown timer present (May 8th)"
    fi
    
    # Check for phone input
    if curl -s http://thenewworldorder.io | grep -q "phoneInput"; then
        echo "✅ Phone collection system ready"
    fi
else
    echo "❌ Site not accessible or returning error"
fi

# Check local files
echo ""
echo "📁 CHECKING LOCAL DEPLOYMENT..."
if [ -f "/var/www/thenewworldorder/index.html" ]; then
    echo "✅ Local file exists: /var/www/thenewworldorder/index.html"
    echo "   Size: $(stat -c%s "/var/www/thenewworldorder/index.html") bytes"
    echo "   Modified: $(stat -c%y "/var/www/thenewworldorder/index.html")"
else
    echo "❌ Local file missing: /var/www/thenewworldorder/index.html"
fi

echo ""
echo "📊 VERIFICATION COMPLETE"
echo "========================"