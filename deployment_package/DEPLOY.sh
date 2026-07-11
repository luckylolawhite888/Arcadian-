#!/bin/bash
# MISSION CRITICAL DEPLOYMENT SCRIPT
# Editor-in-Chief / System Architect: Execute with sudo

echo "🚀 THE NEW WORLD ORDER - LANDING PAGE DEPLOYMENT"
echo "=================================================="
echo "Timestamp: $(date)"
echo "Mission: Replace Neo-Brutalist site with new landing page"
echo ""

# 1. Backup existing site
echo "📦 BACKING UP EXISTING SITE..."
BACKUP_DIR="/var/www/thenewworldorder_backup_$(date +%Y%m%d_%H%M%S)"
if [ -d "/var/www/thenewworldorder" ]; then
    sudo cp -r /var/www/thenewworldorder "$BACKUP_DIR"
    echo "✅ Backup created: $BACKUP_DIR"
else
    echo "⚠️  No existing site found at /var/www/thenewworldorder"
    sudo mkdir -p /var/www/thenewworldorder
fi

# 2. Deploy new landing page
echo ""
echo "📄 DEPLOYING NEW LANDING PAGE..."
sudo cp index.html /var/www/thenewworldorder/
echo "✅ index.html deployed"

# 3. Set permissions
echo ""
echo "🔐 SETTING PERMISSIONS..."
sudo chown -R www-data:www-data /var/www/thenewworldorder/
sudo chmod -R 755 /var/www/thenewworldorder/
echo "✅ Permissions set: www-data:www-data, 755"

# 4. Verify deployment
echo ""
echo "✅ VERIFICATION..."
if [ -f "/var/www/thenewworldorder/index.html" ]; then
    FILE_SIZE=$(stat -c%s "/var/www/thenewworldorder/index.html")
    echo "✅ Deployment successful: /var/www/thenewworldorder/index.html ($FILE_SIZE bytes)"
    echo ""
    echo "📋 FILE CHECKSUM:"
    md5sum /var/www/thenewworldorder/index.html
else
    echo "❌ DEPLOYMENT FAILED: index.html not found at target"
    exit 1
fi

# 5. Restart web server (if applicable)
echo ""
echo "🔄 RESTARTING WEB SERVER..."
if systemctl is-active --quiet nginx; then
    sudo systemctl restart nginx
    echo "✅ nginx restarted"
elif systemctl is-active --quiet apache2; then
    sudo systemctl restart apache2
    echo "✅ apache2 restarted"
else
    echo "⚠️  No web server detected (nginx/apache2)"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETE"
echo "======================"
echo "New landing page is LIVE at:"
echo "http://thenewworldorder.io"
echo ""
echo "🦊 'Let's face it, the old world is dead'"
echo "   - The Editor-in-Chief"