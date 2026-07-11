#!/bin/bash

TOKEN=$(grep -o '"api_token": "[^"]*"' /home/node/.openclaw/workspace/notion_credentials.json | cut -d'"' -f4)
PAGE_ID="331a4d19-e2e3-803a-a8b3-f9b44e58d373"

echo "📖 Getting full content of Lola central page..."

# Get all blocks
curl -s -X GET "https://api.notion.com/v1/blocks/$PAGE_ID/children" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  | python3 -c "
import json, sys
data = json.load(sys.stdin)

print(f'Total blocks: {len(data.get(\"results\", []))}')
print('=' * 50)

for i, block in enumerate(data.get('results', [])):
    block_id = block['id']
    block_type = block.get('type', 'unknown')
    
    print(f'Block {i+1}:')
    print(f'  ID: {block_id}')
    print(f'  Type: {block_type}')
    
    if block_type in ['heading_1', 'heading_2', 'heading_3', 'paragraph', 'bulleted_list_item', 'numbered_list_item', 'to_do']:
        if 'rich_text' in block[block_type] and block[block_type]['rich_text']:
            text = block[block_type]['rich_text'][0]['text']['content']
            print(f'  Content: {text}')
    
    elif block_type == 'child_page':
        title = block[block_type].get('title', 'Untitled')
        print(f'  Child Page: {title}')
    
    elif block_type == 'child_database':
        title = block[block_type].get('title', 'Untitled Database')
        print(f'  Child Database: {title}')
    
    elif block_type == 'embed':
        url = block[block_type].get('url', 'No URL')
        print(f'  Embed URL: {url}')
    
    print()
" 2>/dev/null || echo "Could not parse blocks"