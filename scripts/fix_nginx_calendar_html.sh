#!/bin/bash
# Add explicit calendar.html location BEFORE the catch-all
CONFIG="/etc/nginx/sites-enabled/00-main-site-443.conf"

# Add before the "location /" catch-all block
sed -i 's|location / {|    location = /calendar.html {\n        root /var/www/thenewworldorder;\n    }\n\n    location / {|' "$CONFIG"

nginx -t && systemctl reload nginx && echo "✅ Nginx configured" || echo "❌ Nginx error"
