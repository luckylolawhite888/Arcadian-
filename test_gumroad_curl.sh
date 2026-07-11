#!/bin/bash

ACCESS_TOKEN="4RBA6NUQETEXGIJSQHEMHEWE3FRJI4VA"

echo "🔌 Testing Gumroad API connection..."
echo "Token: ${ACCESS_TOKEN:0:8}...${ACCESS_TOKEN: -8}"

# Test user endpoint
echo -e "\n📊 Testing /user endpoint..."
curl -s -X GET "https://api.gumroad.com/v2/user" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'user' in data:
        print('✅ API CONNECTION SUCCESSFUL!')
        user = data['user']
        print(f'   Name: {user.get(\"name\", \"N/A\")}')
        print(f'   Email: {user.get(\"email\", \"N/A\")}')
        print(f'   Balance: \${user.get(\"balance\", 0)/100:.2f}')
        print(f'   Products: {user.get(\"products_count\", 0)}')
    else:
        print('❌ API Error:', data.get('message', 'Unknown error'))
except Exception as e:
    print('❌ Failed to parse response:', e)
" 2>/dev/null || echo "Raw response:" && curl -s -X GET "https://api.gumroad.com/v2/user" -H "Authorization: Bearer $ACCESS_TOKEN" | head -200

# Test products endpoint
echo -e "\n📦 Testing /products endpoint..."
curl -s -X GET "https://api.gumroad.com/v2/products" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    products = data.get('products', [])
    print(f'Found {len(products)} product(s)')
    
    for product in products:
        print(f'\\n  📋 Product: {product.get(\"name\", \"Unnamed\")}')
        print(f'     ID: {product.get(\"id\", \"N/A\")}')
        print(f'     Price: \${product.get(\"price\", 0)/100:.2f}')
        print(f'     Published: {product.get(\"published\", False)}')
        print(f'     Sales: {product.get(\"sales_count\", 0)}')
        
        # Check if it's our product
        name = product.get('name', '').lower()
        if 'lola' in name or 'ai assistant' in name:
            print(f'     ✅ This appears to be our Lola product!')
            print(f'     🔗 URL: https://gumroad.com/l/{product.get(\"id\", \"N/A\")}')
            
except Exception as e:
    print('❌ Failed to parse products:', e)
" 2>/dev/null || echo "Could not parse products response"