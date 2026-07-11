#!/bin/bash
# Daily News Generation Script
# Runs before morning briefing to fetch latest news

cd /home/node/.openclaw/workspace

echo "=========================================="
echo "📰 DAILY NEWS GENERATION - $(date)"
echo "=========================================="

# Check if Tavily Python package is installed
if python3 -c "import tavily" 2>/dev/null; then
    echo "✅ Tavily Python client available"
    USE_REAL_NEWS=true
else
    echo "⚠️ Tavily not installed, using simulated news"
    echo "   Install with: pip install tavily-python"
    USE_REAL_NEWS=false
fi

# Check for Tavily API key
if [ -f "tavily_credentials.json" ]; then
    echo "✅ Tavily credentials found"
else
    echo "⚠️ No Tavily credentials found"
    echo "   Create tavily_credentials.json with your API key"
    USE_REAL_NEWS=false
fi

# Generate news
echo ""
echo "🔄 Generating daily news brief..."

if [ "$USE_REAL_NEWS" = true ]; then
    python3 -c "
from enhanced_news_system import EnhancedNewsSystem
import sys

try:
    news_system = EnhancedNewsSystem()
    news_brief = news_system.get_daily_news_brief(use_real_news=True)
    
    with open('today_news.txt', 'w') as f:
        f.write(news_brief)
    
    print('✅ Real news fetched and saved')
    print('📊 News categories: AI/Tech, Crypto, Politics, Geo-Economics')
    
except Exception as e:
    print(f'❌ Error fetching real news: {e}')
    # Fall back to simulated
    from enhanced_news_system import EnhancedNewsSystem
    news_system = EnhancedNewsSystem()
    news_brief = news_system.get_daily_news_brief(use_real_news=False)
    
    with open('today_news.txt', 'w') as f:
        f.write(news_brief)
    
    print('✅ Simulated news saved as fallback')
" 2>&1
else
    python3 -c "
from enhanced_news_system import EnhancedNewsSystem
news_system = EnhancedNewsSystem()
news_brief = news_system.get_daily_news_brief(use_real_news=False)

with open('today_news.txt', 'w') as f:
    f.write(news_brief)

print('✅ Simulated news generated and saved')
print('📊 News categories: AI/Tech, Crypto, Politics, Geo-Economics, Business')
" 2>&1
fi

# Check if news was generated
if [ -f "today_news.txt" ] && [ -s "today_news.txt" ]; then
    NEWS_LINES=$(wc -l < today_news.txt)
    echo ""
    echo "✅ Daily news ready for morning briefing!"
    echo "   File: today_news.txt"
    echo "   Lines: $NEWS_LINES"
    
    # Show preview
    echo ""
    echo "📋 News Preview:"
    echo "----------------"
    head -15 today_news.txt
    echo "----------------"
else
    echo ""
    echo "❌ Failed to generate news file"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ NEWS GENERATION COMPLETE"
echo "=========================================="

# Log this run
echo "$(date): News generated (Real: $USE_REAL_NEWS)" >> /home/node/.openclaw/workspace/news_generation.log