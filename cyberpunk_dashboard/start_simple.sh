#!/bin/bash
# Simple startup script for Arcadian Media Dashboard

echo "🦊 Starting Arcadian Media Cyberpunk Dashboard"
echo "=============================================="
echo ""
echo "🎨 Theme: Orange & Black Cyberpunk"
echo "📰 Features: News Ticker, Breaking News, Sports, Horoscopes"
echo "🕐 Updates: 11 AM London time daily"
echo "🌐 Access: Public URL available"
echo ""

# Check if files exist
if [ ! -f "templates/index.html" ]; then
    echo "❌ Error: templates/index.html not found!"
    exit 1
fi

if [ ! -f "static/css/style.css" ]; then
    echo "❌ Error: static/css/style.css not found!"
    exit 1
fi

echo "✅ All dashboard files found"
echo "🚀 Starting server on port 5000..."
echo ""
echo "📊 Open your browser to: http://localhost:5000"
echo "📱 Or access from network: http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "💡 For public access, use:"
echo "   ngrok http 5000  (if ngrok is installed)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Python server
python3 simple_server.py