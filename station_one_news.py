#!/usr/bin/env python3
"""News headlines grabber for Station One sector mapping"""
import urllib.request
import json

def get_headlines_for_sector(sector, limit=3):
    """Get recent headlines for a market sector"""
    sector_keywords = {
        "Oil & Energy": "crude oil energy market",
        "Defense": "defense military stocks aerospace",
        "Aviation": "airlines aviation Boeing",
        "Safe Havens": "gold treasuries safe haven",
        "Technology": "tech stocks AI semiconductor",
        "Trade": "tariffs trade supply chain",
        "Agriculture": "agriculture food commodities",
        "Crypto": "bitcoin crypto",
        "Geopolitics": "geopolitics Iran Strait Hormuz",
    }
    
    keywords = sector_keywords.get(sector, sector)
    
    # Use Google News RSS for free headlines
    try:
        query = urllib.request.quote(keywords)
        req = urllib.request.Request(
            f'https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en',
            headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10)
        data = resp.read().decode('utf-8')
        
        # Simple XML title extraction
        import re
        titles = re.findall(r'<title>(.*?)</title>', data)
        # Skip first (feed title)
        return titles[1:1+limit] if len(titles) > 1 else []
    except:
        return []

if __name__ == "__main__":
    import sys
    sector = sys.argv[1] if len(sys.argv) > 1 else "Oil & Energy"
    headlines = get_headlines_for_sector(sector)
    print(f"Headlines for {sector}:")
    for h in headlines:
        print(f"  • {h[:80]}")
