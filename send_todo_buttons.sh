#!/bin/bash
# Send interactive todo buttons to Telegram

echo "Sending todo buttons to Telegram..."

# Read todo items
ITEMS=$(python3 -c "
import todo_manager
items = todo_manager.read_todo()
for i, item in enumerate(items[:10]):
    print(f'{i+1}. {item}')
")

if [ -z "$ITEMS" ]; then
    echo "Todo list is empty!"
    exit 0
fi

# Create message
MESSAGE="📋 *Mark Todo Items as Done:*\n\n$ITEMS\n\nClick a button below to mark it as done."

echo "Message:"
echo "$MESSAGE"
echo ""
echo "Note: Buttons would be sent via OpenClaw message tool with interactive buttons"
echo "This requires the OpenClaw message tool which can send interactive buttons"
echo ""
echo "To implement: Need to handle button callbacks to update todo.md"