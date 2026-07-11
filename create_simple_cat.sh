#!/bin/bash

# Create a simple text file with cat ASCII art
cat > /home/node/.openclaw/workspace/cat_ascii.txt << 'EOF'
🐱 CAT IMAGE 🐱

   /\_/\  
  ( o.o ) 
   > ^ <
   
A simple cat for you!

Features:
• Gray fur
• Green eyes  
• Pink nose
• Whiskers
• Cute expression

Created by Lola 🦊
EOF

echo "✅ Created cat ASCII art at: /home/node/.openclaw/workspace/cat_ascii.txt"
echo ""
cat /home/node/.openclaw/workspace/cat_ascii.txt