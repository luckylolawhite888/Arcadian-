#!/bin/bash
# Daily script to update travel deals for morning briefing

echo "🔄 Updating daily travel deals..."
cd /home/node/.openclaw/workspace

# Run enhanced travel system
python3 enhanced_travel_system.py

# Check if successful
if [ $? -eq 0 ]; then
    echo "✅ Travel deals updated successfully"
    echo "📊 Today's deals include:"
    echo "   - 3 Flight deals with witty commentary"
    echo "   - 3 Hotel deals with personality"
    echo "   - Travel tip of the day"
    echo "   - General wanderlust encouragement"
else
    echo "⚠️ Using fallback travel deals"
    # Create simple fallback
    cat > today_travel_deal.txt << EOF
## ✈️ Daily Travel & Hotel Deals

*Our travel agents are taking a mental health day!*

**Today's Wisdom:** 
Sometimes the journey is staying home and ordering takeaway.

*Real deals return tomorrow (probably)*
EOF
fi

echo "🎯 Ready for morning briefing!"