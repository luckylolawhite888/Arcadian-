#!/bin/bash
# Fix nginx config to add calendar API proxy
CONFIG="/etc/nginx/sites-enabled/00-main-site-443.conf"

# Remove the broken line if it exists
sed -i '/location \/calendar-api/,/}/d' "$CONFIG"
sed -i '/Access-Control-Allow-Origin/d' "$CONFIG"

# Find the server block closing brace and insert before it
sed -i 's|location /blog/|location /calendar-api/ {\n        proxy_pass http://127.0.0.1:8020/;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        add_header Access-Control-Allow-Origin *;\n    }\n\n    location /blog/|' "$CONFIG"

# Test and reload
nginx -t && systemctl reload nginx && echo "✅ Nginx reloaded" || echo "❌ Nginx config error"
