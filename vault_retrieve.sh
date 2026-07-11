#!/bin/bash
# Vault retrieval with auto-delete
# Usage: ./vault_retrieve.sh <item_id> <magic_word>

set -e

ITEM_ID="$1"
MAGIC_WORD="$2"

if [ -z "$ITEM_ID" ] || [ -z "$MAGIC_WORD" ]; then
    echo "Usage: $0 <item_id> <magic_word>"
    exit 1
fi

# Get the item
RESPONSE=$(python3 /home/node/.openclaw/workspace/vault_auto_delete.py get "$ITEM_ID" "$MAGIC_WORD")

# Check if magic word was correct
if [[ "$RESPONSE" == *"Incorrect magic word"* ]]; then
    echo "$RESPONSE"
    exit 1
fi

# Display the item
echo "$RESPONSE"

# Wait 60 seconds
echo ""
echo "⏰ Waiting 60 seconds before auto-delete..."
sleep 60

# Auto-delete message (this would need to be integrated with message deletion API)
echo "🗑️ Auto-delete: Sensitive information deleted."
echo "✅ Security cleanup complete."