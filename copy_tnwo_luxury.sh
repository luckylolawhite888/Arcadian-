#!/bin/bash

# SIMPLE TNWO LUXURY COPY SCRIPT
# Copy files to current directory for manual deployment

echo "📦 Copying TNWO Luxury files to current directory..."

# Create directory
mkdir -p tnwo_luxury_deploy

# Copy and rename HTML files
cp TNWO_LUXURY_HOMEPAGE.html tnwo_luxury_deploy/index.html
cp horoscope_luxury.html tnwo_luxury_deploy/horoscope.html
cp members_luxury.html tnwo_luxury_deploy/members.html
cp vault_luxury.html tnwo_luxury_deploy/vault.html
cp briefing_luxury.html tnwo_luxury_deploy/briefing.html

# Copy assets
cp TNWO_LUXURY_STYLE.css tnwo_luxury_deploy/
cp unsplash_integration.js tnwo_luxury_deploy/

# Create simple .htaccess
cat > tnwo_luxury_deploy/.htaccess << 'EOF'
# Simple TNWO Configuration
Options -Indexes

# Force HTTPS (if configured)
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Cache static assets
<FilesMatch "\.(css|js)$">
    Header set Cache-Control "max-age=86400, public"
</FilesMatch>
EOF

# Create README
cat > tnwo_luxury_deploy/README.txt << 'EOF'
TNWO LUXURY WEBSITE - DEPLOYMENT PACKAGE

Files:
- index.html          (Homepage)
- horoscope.html      (Celestial outlook)
- members.html        (Members lounge)
- vault.html          (Private vault)
- briefing.html       (Editor terminal)
- TNWO_LUXURY_STYLE.css
- unsplash_integration.js
- .htaccess

Deployment:
1. Upload all files to web server
2. Ensure .htaccess is processed (Apache)
3. For Nginx, configure server block
4. Test all 5 pages

Unsplash API Key (in unsplash_integration.js):
nIYmJCSP_PaeNOOM8tKVS_04D6uuXcB58o1XKcqk_As

Total size: ~70KB
Deployed: $(date)
EOF

echo "✅ Files copied to: tnwo_luxury_deploy/"
echo ""
echo "📊 File summary:"
ls -lh tnwo_luxury_deploy/*.html | awk '{print $5, $9}'
ls -lh tnwo_luxury_deploy/*.css tnwo_luxury_deploy/*.js 2>/dev/null | awk '{print $5, $9}'
echo ""
echo "🚀 Next: Upload tnwo_luxury_deploy/ to your web server"
echo "   Target: /var/www/thenewworldorder/"