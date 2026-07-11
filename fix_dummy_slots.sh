#!/bin/bash
# Fix dummy AdSense slot IDs on toolstack pages
echo "Fixing toolstack.uk dummy slots (1234567890 -> 5772014074)..."
sed -i 's/1234567890/5772014074/g' /var/www/toolstack.uk/public/*.html
echo "Verifying..."
grep -l "1234567890" /var/www/toolstack.uk/public/*.html
if [ $? -eq 0 ]; then
    echo "STILL HAS DUMMY SLOTS - WARNING!"
else
    echo "All clean! 0 pages with dummy slots."
fi

# Also check all other sites
echo "=== Full audit ==="
for dir in /var/www/*/public; do
    site=$(echo "$dir" | awk -F'/' '{print $4}')
    count=$(grep -l "1234567890" "$dir"/*.html 2>/dev/null | wc -l)
    echo "$site: $count pages with dummy slots"
done
