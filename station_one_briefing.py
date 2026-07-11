#!/usr/bin/env python3
"""Station One Intelligence & Market Briefing — runs daily at 9:30 AM"""
import json
import os
import sys

# Import shared modules
sys.path.insert(0, '/home/node/.openclaw/workspace')
from station_one_market import get_market_snapshot, format_market_data
from station_one_news import get_headlines_for_sector

# Pickup file from station_one_monitor
PICKUP = "/tmp/station_one_pickup.json"
BRIEFING_OUT = "/tmp/station_one_briefing.txt"

def generate_briefing():
    # 1. Load video data
    try:
        with open(PICKUP) as f:
            data = json.load(f)
    except:
        data = {"status": "no_data", "has_new": False}
    
    # 2. Get market snapshot
    markets = get_market_snapshot()
    
    # 3. Build briefing
    lines = []
    
    if data.get("has_new"):
        for brief in data["briefings"]:
            vid = brief["video"]
            lines.append(f"📺 **S1 Intelligence Brief — {vid['title']}**")
            lines.append(f"📅 {vid['published']} · {vid['url']}")
            lines.append("")
            
            # Techniques
            techs = brief.get("techniques_detected", {})
            if techs:
                for name, meaning in techs.items():
                    lines.append(f"🎯 **Technique: {name}**")
                    lines.append(f"_{meaning}_")
            
            lines.append("")
            
            # Market impact
            impact = brief.get("market_impact", [])
            if impact:
                lines.append("📊 **Market Sectors Hit:**")
                for m in impact:
                    lines.append(f"  • **{m['sector']}** — {m['impact']}")
            
            lines.append("")
            
            # Receipts
            receipts = brief.get("receipts", [])
            if receipts:
                lines.append("📄 **Receipts:**")
                for r in receipts:
                    lines.append(f"  • {r}")
            
            lines.append("")
    
    # Current market snapshot
    lines.append("━" * 30)
    lines.append("**🌍 Current Market Snapshot**")
    lines.append(str(markets))
    lines.append("")
    
    # Fear & Greed + crypto
    lines.append(str(get_crypto_snapshot()))
    
    lines.append("")
    lines.append("---")
    lines.append("📡 _Auto-generated from Station One RSS + Yahoo Finance_")
    
    briefing = "\n".join(lines)
    
    with open(BRIEFING_OUT, "w") as f:
        f.write(briefing)
    
    return briefing

def get_crypto_snapshot():
    import urllib.request
    try:
        req = urllib.request.Request('https://api.alternative.me/fng/?limit=1',
            headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10)
        fng = json.loads(resp.read())['data'][0]
        return f"🪙 **Crypto Fear & Greed:** {fng['value']}/100 — {fng['value_classification']}"
    except:
        return "🪙 Crypto data unavailable"

if __name__ == "__main__":
    print(generate_briefing())
