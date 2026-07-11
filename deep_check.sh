#!/bin/bash

TOKEN=$(grep -o '"api_token": "[^"]*"' /home/node/.openclaw/workspace/notion_credentials.json | cut -d'"' -f4)
PAGE_ID="331a4d19-e2e3-803a-a8b3-f9b44e58d373"

echo "🔍 Deep check of Notion workspace..."

# 1. Check if we can still access the page
echo -e "\n1. Checking Lola central page access..."
curl -s -X GET "https://api.notion.com/v1/pages/$PAGE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'✅ Page accessible')
    print(f'Title: {data[\"properties\"][\"title\"][\"title\"][0][\"text\"][\"content\"]}')
    print(f'Last edited: {data.get(\"last_edited_time\", \"Unknown\")}')
    print(f'URL: {data.get(\"url\", \"No URL\")}')
except:
    print('❌ Cannot access page')
" 2>/dev/null

# 2. Search for ANYTHING in the workspace
echo -e "\n2. Searching entire workspace..."
curl -s -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -d '{}' \
  | python3 -c "
import json, sys
data = json.load(sys.stdin)
results = data.get('results', [])

print(f'Total items in workspace: {len(results)}')

# Categorize
databases = []
pages = []
for item in results:
    obj_type = item.get('object', 'unknown')
    if obj_type == 'database':
        title = item.get('title', [{}])[0].get('text', {}).get('content', 'Untitled')
        databases.append((title, item['id']))
    elif obj_type == 'page':
        # Try to get page title
        title = 'Untitled'
        props = item.get('properties', {})
        if 'title' in props and props['title']['title']:
            title = props['title']['title'][0]['text']['content']
        pages.append((title, item['id']))

print(f'Databases: {len(databases)}')
for title, db_id in databases:
    print(f'  • {title} ({db_id[:8]}...)')

print(f'Pages: {len(pages)}')
for title, page_id in pages[:5]:  # Show first 5
    print(f'  • {title} ({page_id[:8]}...)')
if len(pages) > 5:
    print(f'  ... and {len(pages) - 5} more')
" 2>/dev/null || echo "Search failed"

# 3. Check if there are any blocks at all in Lola central
echo -e "\n3. Checking Lola central blocks (with pagination)..."
curl -s -X GET "https://api.notion.com/v1/blocks/$PAGE_ID/children?page_size=100" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  | python3 -c "
import json, sys
data = json.load(sys.stdin)
results = data.get('results', [])
has_more = data.get('has_more', False)
next_cursor = data.get('next_cursor')

print(f'Blocks found: {len(results)}')
print(f'Has more pages: {has_more}')
print(f'Next cursor: {next_cursor}')

if results:
    print('\\nFirst few blocks:')
    for i, block in enumerate(results[:3]):
        block_type = block.get('type', 'unknown')
        print(f'  {i+1}. Type: {block_type}')
        if block_type in ['child_database', 'child_page']:
            child_data = block.get(block_type, {})
            print(f'     Title: {child_data.get(\"title\", \"Untitled\")}')
        elif 'rich_text' in block.get(block_type, {}) and block[block_type]['rich_text']:
            text = block[block_type]['rich_text'][0]['text']['content'][:50]
            print(f'     Preview: {text}...')
else:
    print('Page appears to be empty')
" 2>/dev/null || echo "Could not check blocks"