#!/bin/bash
# TNWO NEO-BRUTALIST DEPLOYMENT SCRIPT
# Run on server with root/sudo access

echo "🚀 DEPLOYING THE NEW WORLD ORDER - NEO-BRUTALIST EMPIRE"
echo "========================================================"
echo "Style: Neo-Brutalist × Bloomberg Terminal"
echo "Colors: International Orange × Cyber Black"
echo "Borders: 4px+ thick black borders"
echo ""

# Check for sudo/root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script requires root/sudo privileges"
    echo "Please run with: sudo bash $0"
    exit 1
fi

# 1. Create directory structure
echo "📁 Creating directory structure..."
mkdir -p /var/www/thenewworldorder/
mkdir -p /var/www/thenewworldorder/backups/

# 2. Backup existing files (if any)
echo "💾 Backing up existing files..."
if [ -f "/var/www/thenewworldorder/index.html" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    cp /var/www/thenewworldorder/*.html /var/www/thenewworldorder/backups/ 2>/dev/null || true
    echo "✅ Existing files backed up to /var/www/thenewworldorder/backups/"
fi

# 3. Deploy Neo-Brutalist HTML files
echo "📄 Deploying Neo-Brutalist portal..."
echo ""

# Homepage
if [ -f "index_neo_brutalist.html" ]; then
    cp index_neo_brutalist.html /var/www/thenewworldorder/index.html
    echo "✅ Homepage deployed: Neo-Brutalist Terminal"
else
    echo "❌ ERROR: index_neo_brutalist.html not found"
    exit 1
fi

# Horoscope Page
if [ -f "horoscope_neo_brutalist.html" ]; then
    cp horoscope_neo_brutalist.html /var/www/thenewworldorder/horoscope.html
    echo "✅ Horoscope deployed: Celestial Outlook Grid"
else
    echo "❌ ERROR: horoscope_neo_brutalist.html not found"
    exit 1
fi

# Members Lounge
if [ -f "members_neo_brutalist.html" ]; then
    cp members_neo_brutalist.html /var/www/thenewworldorder/members.html
    echo "✅ Members Lounge deployed: Elite Briefing Access"
else
    echo "❌ ERROR: members_neo_brutalist.html not found"
    exit 1
fi

# Private Vault
if [ -f "vault_neo_brutalist.html" ]; then
    cp vault_neo_brutalist.html /var/www/thenewworldorder/vault.html
    echo "✅ Private Vault deployed: Elite Content Access"
else
    echo "❌ ERROR: vault_neo_brutalist.html not found"
    exit 1
fi

# Briefing Terminal
if [ -f "briefing_neo_brutalist.html" ]; then
    cp briefing_neo_brutalist.html /var/www/thenewworldorder/briefing.html
    echo "✅ Briefing Terminal deployed: Editor-in-Chief Interface"
else
    echo "❌ ERROR: briefing_neo_brutalist.html not found"
    exit 1
fi

# 4. Set permissions
echo ""
echo "🔐 Setting permissions..."
chown -R www-data:www-data /var/www/thenewworldorder/
chmod 644 /var/www/thenewworldorder/*.html
chmod 755 /var/www/thenewworldorder/

# 5. Verify deployment
echo ""
echo "✅ Verifying deployment..."
echo ""

FILE_COUNT=$(ls -1 /var/www/thenewworldorder/*.html 2>/dev/null | wc -l)
if [ "$FILE_COUNT" -eq 5 ]; then
    echo "🎉 SUCCESS: All 5 TNWO pages deployed"
    echo ""
    echo "📊 DEPLOYMENT SUMMARY:"
    echo "----------------------"
    ls -la /var/www/thenewworldorder/*.html | awk '{print $9, $5 " bytes"}'
    echo ""
    echo "🌐 ACCESS URLs:"
    echo "---------------"
    echo "Homepage:        /var/www/thenewworldorder/index.html"
    echo "Horoscope:       /var/www/thenewworldorder/horoscope.html"
    echo "Members Lounge:  /var/www/thenewworldorder/members.html"
    echo "Private Vault:   /var/www/thenewworldorder/vault.html"
    echo "Briefing:        /var/www/thenewworldorder/briefing.html"
    echo ""
    echo "🔄 NAVIGATION: Bloomberg-style top bar on all pages"
    echo "   [HOME] [HOROSCOPE] [MEMBERS] [VAULT] [BRIEFING]"
else
    echo "❌ ERROR: Expected 5 HTML files, found $FILE_COUNT"
    exit 1
fi

# 6. Nginx instructions
echo ""
echo "📋 NGINX CONFIGURATION:"
echo "----------------------"
echo "Add to /etc/nginx/sites-available/thenewworldorder:"
echo ""
echo "server {"
echo "    listen 80;"
echo "    server_name thenewworldorder.io www.thenewworldorder.io;"
echo "    root /var/www/thenewworldorder;"
echo "    index index.html;"
echo "    location / {"
echo "        try_files \$uri \$uri/ =404;"
echo "    }"
echo "}"
echo ""
echo "Then run:"
echo "sudo ln -s /etc/nginx/sites-available/thenewworldorder /etc/nginx/sites-enabled/"
echo "sudo nginx -t"
echo "sudo systemctl restart nginx"
echo ""
echo "🦊 THE NEO-BRUTALIST EMPIRE IS READY FOR LAUNCH"
echo "==============================================="