#!/usr/bin/env python3
"""
Enhanced News System for Morning Briefing
Fetches real news across AI, crypto, politics, and geo-economics using Tavily API
"""

import json
import os
import random
from datetime import datetime
import sys

# Try to import Tavily
try:
    from tavily import TavilyClient
    TAVILY_AVAILABLE = True
except ImportError:
    TAVILY_AVAILABLE = False

class EnhancedNewsSystem:
    def __init__(self):
        self.news_categories = {
            "ai_tech": {
                "name": "🤖 AI & Tech",
                "queries": [
                    "artificial intelligence breakthroughs",
                    "tech company earnings",
                    "AI regulation news",
                    "robotics innovations",
                    "cybersecurity threats"
                ],
                "description": "Latest developments in artificial intelligence, technology, and innovation"
            },
            "crypto": {
                "name": "💰 Crypto & Finance",
                "queries": [
                    "Bitcoin price news",
                    "cryptocurrency regulation",
                    "DeFi developments",
                    "blockchain technology",
                    "crypto market analysis"
                ],
                "description": "Cryptocurrency markets, blockchain innovations, and digital finance"
            },
            "politics": {
                "name": "🏛️ Politics & Policy",
                "queries": [
                    "political developments UK US EU",
                    "election news",
                    "government policy changes",
                    "international diplomacy",
                    "legislative updates"
                ],
                "description": "Political shifts, policy changes, and government developments"
            },
            "geo_economics": {
                "name": "🌍 Geo-Economics",
                "queries": [
                    "global trade agreements",
                    "commodity prices oil gold",
                    "currency exchange rates",
                    "supply chain news",
                    "economic indicators GDP inflation"
                ],
                "description": "Global economic trends, trade, and financial markets"
            },
            "business": {
                "name": "⚡ Business & Markets",
                "queries": [
                    "stock market news",
                    "mergers and acquisitions",
                    "startup funding",
                    "consumer spending trends",
                    "corporate earnings"
                ],
                "description": "Business developments, markets, and corporate news"
            }
        }
        
        # Load Tavily API key if available
        self.tavily_client = None
        self.api_key = None
        
        try:
            # Check for Tavily credentials
            creds_path = "/home/node/.openclaw/workspace/tavily_credentials.json"
            if os.path.exists(creds_path):
                with open(creds_path, 'r') as f:
                    creds = json.load(f)
                    self.api_key = creds.get('api_key')
                    
                if self.api_key and TAVILY_AVAILABLE:
                    self.tavily_client = TavilyClient(api_key=self.api_key)
                    print(f"✅ Tavily API connected: {self.api_key[:10]}...")
                else:
                    print("⚠️ Tavily API key found but client not available")
            else:
                print("ℹ️ No Tavily credentials found, using simulated news")
        except Exception as e:
            print(f"⚠️ Could not load Tavily credentials: {e}")
    
    def fetch_real_news(self, category, max_results=3):
        """Fetch real news for a category using Tavily API"""
        if not self.tavily_client or not self.api_key:
            return None
        
        try:
            category_info = self.news_categories[category]
            query = random.choice(category_info["queries"])
            
            print(f"  📡 Fetching {category_info['name']} news: {query}")
            
            # Search with Tavily
            response = self.tavily_client.search(
                query=query,
                search_depth="basic",
                max_results=max_results,
                include_answer=True,
                include_raw_content=False
            )
            
            if response and 'results' in response:
                articles = []
                for result in response['results'][:max_results]:
                    article = {
                        'title': result.get('title', 'No title'),
                        'url': result.get('url', '#'),
                        'content': result.get('content', ''),
                        'source': result.get('source', 'Unknown')
                    }
                    articles.append(article)
                
                return {
                    'category': category_info['name'],
                    'query': query,
                    'articles': articles
                }
        
        except Exception as e:
            print(f"  ❌ Error fetching {category} news: {e}")
        
        return None
    
    def generate_simulated_news(self, category):
        """Generate simulated news when API is not available"""
        category_info = self.news_categories[category]
        
        # Simulated news items based on category
        simulations = {
            "ai_tech": [
                "OpenAI announces new multimodal AI model with improved reasoning capabilities",
                "EU passes comprehensive AI regulation affecting tech companies operating in Europe",
                "Major tech earnings show AI investments driving revenue growth",
                "Breakthrough in quantum computing announced by research team",
                "Cybersecurity firm detects new state-sponsored hacking campaign"
            ],
            "crypto": [
                "Bitcoin surges past $70,000 as institutional adoption increases",
                "SEC delays decision on spot Ethereum ETF, causing market volatility",
                "Major bank announces cryptocurrency custody services for clients",
                "DeFi protocol suffers $50M exploit, highlighting security concerns",
                "Central bank digital currency pilot expands to new regions"
            ],
            "politics": [
                "New trade agreement announced between major economic blocs",
                "Election polls show tightening race in key battleground states",
                "Government announces stimulus package to boost economic growth",
                "Diplomatic tensions rise over territorial disputes",
                "Climate policy negotiations reach critical phase ahead of summit"
            ],
            "geo_economics": [
                "Oil prices climb amid Middle East tensions and supply concerns",
                "Dollar strengthens against major currencies as Fed signals rate hold",
                "Global supply chain disruptions reported due to port closures",
                "Inflation data shows cooling trend in major economies",
                "Trade deficit widens as imports outpace exports"
            ],
            "business": [
                "Stock markets reach new highs on positive earnings reports",
                "Mega-merger announced in tech sector valued at $100B+",
                "Startup raises record funding round for AI healthcare platform",
                "Retail sales data shows consumer spending resilience",
                "Corporate earnings season begins with mixed results across sectors"
            ]
        }
        
        articles = []
        for i in range(2):
            title = random.choice(simulations.get(category, ["News development in this category"]))
            articles.append({
                'title': title,
                'url': '#',
                'content': f"Simulated news item about {category_info['description']}",
                'source': 'Simulated News Service'
            })
        
        return {
            'category': category_info['name'],
            'query': category_info['description'],
            'articles': articles
        }
    
    def get_daily_news_brief(self, use_real_news=True):
        """Get comprehensive daily news brief"""
        print("📰 Generating daily news brief...")
        
        news_brief = []
        
        # Select categories to include (always include AI, Crypto, Politics, Geo-Economics)
        selected_categories = ["ai_tech", "crypto", "politics", "geo_economics"]
        
        # Sometimes include business news
        if random.random() > 0.3:
            selected_categories.append("business")
        
        for category in selected_categories:
            news_data = None
            
            if use_real_news and self.tavily_client:
                news_data = self.fetch_real_news(category)
            
            if not news_data:
                news_data = self.generate_simulated_news(category)
            
            if news_data:
                # Format category section
                news_brief.append(f"**{news_data['category']}**")
                
                # Add articles
                for i, article in enumerate(news_data['articles'][:2], 1):
                    title = article['title']
                    source = article['source']
                    
                    # Truncate long titles
                    if len(title) > 120:
                        title = title[:117] + "..."
                    
                    news_brief.append(f"  {i}. {title}")
                    news_brief.append(f"     *Source: {source}*")
                
                news_brief.append("")  # Empty line between categories
        
        return "\n".join(news_brief)
    
    def save_daily_news(self, filepath=None):
        """Save daily news to file for morning briefing"""
        if filepath is None:
            filepath = "/home/node/.openclaw/workspace/today_news.txt"
        
        news_brief = self.get_daily_news_brief()
        
        with open(filepath, 'w') as f:
            f.write(news_brief)
        
        print(f"✅ Daily news saved to: {filepath}")
        return filepath
    
    def update_morning_briefing_news(self):
        """Update morning briefing to use enhanced news system"""
        briefing_file = "/home/node/.openclaw/workspace/morning_briefing_generator.py"
        
        with open(briefing_file, 'r') as f:
            content = f.read()
        
        # Check if we need to update the news method
        if "enhanced_news_system" not in content:
            print("⚠️ Morning briefing needs update to use enhanced news system")
            print("   Current news system is placeholder only")
        
        return content

def main():
    """Test the enhanced news system"""
    print("📰 ENHANCED NEWS SYSTEM TEST")
    print("=" * 60)
    
    news_system = EnhancedNewsSystem()
    
    # Test with real news if available, otherwise simulated
    use_real = news_system.tavily_client is not None
    
    print(f"Mode: {'REAL NEWS (Tavily API)' if use_real else 'SIMULATED NEWS'}")
    print()
    
    # Generate news brief
    news_brief = news_system.get_daily_news_brief(use_real_news=use_real)
    print(news_brief)
    print()
    
    # Save to file
    saved_file = news_system.save_daily_news()
    
    print("=" * 60)
    print("✅ Enhanced news system ready!")
    
    if not use_real:
        print("\n⚠️  To enable REAL news fetching:")
        print("   1. Install: pip install tavily-python")
        print("   2. Add Tavily API key to tavily_credentials.json")
        print("   3. Restart the system")
    
    # Show sample integration for morning briefing
    print("\n🎯 Sample morning briefing news section:")
    print("-" * 40)
    print("## 📰 Comprehensive News Brief\n")
    print(news_brief[:500] + "..." if len(news_brief) > 500 else news_brief)
    print("-" * 40)

if __name__ == "__main__":
    main()