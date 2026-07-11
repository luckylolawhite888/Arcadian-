#!/usr/bin/env python3
"""Enhanced Station One Monitor with receipt extraction + briefing generation"""
import urllib.request
import json
import xml.etree.ElementTree as ET
import os
import re
import sys

# Try importing market data
_market_avail = True
try:
    sys.path.insert(0, '/home/node/.openclaw/workspace')
    from station_one_market import get_market_snapshot, fetch_price
    from station_one_news import get_headlines_for_sector
except ImportError:
    _market_avail = False

CHANNEL_ID = "UC0hdM3c0wNmXOdPO9AReiqg"
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
STATE_FILE = "/tmp/station_one_state.txt"
PICKUP_FILE = "/tmp/station_one_pickup.json"

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/"
}

def get_feed():
    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=10).read().decode("utf-8")

def parse(xml_data):
    root = ET.fromstring(xml_data)
    entries = []
    for entry in root.findall("atom:entry", NS):
        vid = entry.find("yt:videoId", NS).text
        title = entry.find("atom:title", NS).text
        pub = entry.find("atom:published", NS).text
        link = entry.find("atom:link", NS).attrib.get("href", "")
        desc_elem = entry.find("media:group/media:description", NS)
        desc = (desc_elem.text or "") if desc_elem is not None else ""
        entries.append({
            "id": vid,
            "title": title,
            "url": link,
            "published": pub,
            "description": desc
        })
    return entries

def extract_receipt_urls(description):
    """Extract Google Drive links from description"""
    urls = re.findall(r'https?://drive\.google\.com[^\s\n]+', description)
    return urls

def extract_techniques(description):
    """Identify named manipulation techniques in the description"""
    techniques_map = {
        "Category Shift": "Renaming something to change how people perceive it (e.g. 'tolls' vs 'service fees')",
        "Calibrated Ambiguity": "Deliberately vague language that different audiences interpret differently",
        "News Peg": "Using a current event as a hook to push a predetermined narrative",
        "Fear-Then-Relief": "Creating anxiety then offering relief — makes people less critical of what they accept next",
        "The Real Target": "Attacking someone to send a message to someone else watching (observational learning)",
        "Agenda Setting": "Deciding which stories get covered determines what people think matters",
        "Priming": "Exposing people to one concept to shape how they react to the next one",
        "Framing": "Placing an event in a specific context to control how it's interpreted",
        "Agenda Cutting": "Dropping big news on holidays/weekends to minimise coverage",
        "Satisficing": "People stop looking for information once they find something 'good enough'",
        "Cognitive Dissonance": "Mental discomfort from holding contradictory beliefs — people rationalise rather than change",
        "Availability Heuristic": "People overestimate risks that are vivid/recent in memory",
        "Anchoring": "The first piece of information people get becomes the reference point for all subsequent judgments",
        "Groupthink": "Desire for harmony overrides critical evaluation of alternatives",
        "Pattern Recognition Bias": "Seeing connections that may not exist — the brain's shortcut to find meaning",
        "Narrative Transportation": "Being so absorbed in a story that critical faculties drop",
        "Moral Disengagement": "Justifying harmful actions by reframing them as serving a greater good",
        "Stock Market / Fear Index": "When fear spikes, capital flees to safe havens — gold, USD, bonds. High-volatility sectors get hammered.",
    }
    found = {}
    desc_lower = description.lower()
    for name, meaning in techniques_map.items():
        if name.lower() in desc_lower:
            found[name] = meaning
    return found

def infer_market_impact(description, title):
    """Infer likely market sectors affected based on stories covered"""
    sectors = []
    desc_title = (description + " " + title).lower()
    
    # Energy / Oil
    if any(w in desc_title for w in ["oil", "hormuz", "tanker", "energy", "crude", "gas", "petroleum"]):
        sectors.append({"sector": "Oil & Energy", "impact": "Likely volatility in crude prices. Strait of Hormuz stories = supply chain risk premium."})
    
    # Defense / Military
    if any(w in desc_title for w in ["iran", "israel", "drone", "missile", "military", "defense", "navy", "war"]):
        sectors.append({"sector": "Defense / Aerospace", "impact": "Geopolitical tension typically lifts defense stocks. Watch LMT, RTX, NOC."})
    
    # Aviation
    if any(w in desc_title for w in ["boeing", "airline", "airport", "lufthansa", "787", "aviation"]):
        sectors.append({"sector": "Aviation", "impact": "Safety incidents can temporarily pressure airline/aviation stocks. Boeing-specific stories move BA."})
    
    # Safe havens
    if any(w in desc_title for w in ["fear", "crisis", "crash", "collapse", "panic", "recession"]):
        sectors.append({"sector": "Safe Havens", "impact": "Gold, USD, treasuries likely to rally on fear. Consider GLD, TLT."})
    
    # Tech / AI
    if any(w in desc_title for w in ["ai", "artificial intelligence", "semiconductor", "chip", "nvidia", "tech"]):
        sectors.append({"sector": "Technology", "impact": "AI/tech stories move sector sentiment. Watch QQQ, NVDA, MSFT."})
    
    # Trade / Tariffs
    if any(w in desc_title for w in ["tariff", "trade", "china", "import", "export"]):
        sectors.append({"sector": "Trade / Supply Chain", "impact": "Tariff news typically hits industrials, retailers, and shipping."})
    
    # Biotech / Health
    if any(w in desc_title for w in ["parasite", "screwworm", "disease", "health", "cdc", "usda", "outbreak"]):
        sectors.append({"sector": "Agriculture / Biotech", "impact": "Disease/outbreak stories can move ag stocks, veterinary pharma, and commodity prices."})
    
    # If nothing specific found
    if not sectors:
        sectors.append({"sector": "General Risk-Off", "impact": "Geopolitical tension typically triggers rotation out of risk assets into safe havens."})
    
    return sectors

def generate_briefing(entry):
    """Generate the full briefing text for a video"""
    desc = entry.get("description", "")
    title = entry.get("title", "")
    url = entry.get("url", "")
    published = entry.get("published", "")
    vid = entry.get("id", "")
    
    # Extract receipts
    receipt_urls = extract_receipt_urls(desc)
    
    # Extract techniques
    techniques = extract_techniques(desc)
    
    # Market impact
    market = infer_market_impact(desc, title)
    
    # Clean description for snippet
    clean_desc = desc[:500].strip()
    
    # Date formatting
    pub_date = published[:10] if published else "unknown"
    
    briefing = {
        "video": {
            "id": vid,
            "title": title,
            "url": url,
            "published": pub_date,
            "description_snippet": clean_desc
        },
        "techniques_detected": techniques,
        "receipts": receipt_urls,
        "market_impact": market
    }
    return briefing

def main():
    entries = parse(get_feed())
    if not entries:
        result = {"status": "error", "message": "No entries found"}
        with open(PICKUP_FILE, "w") as f:
            json.dump(result, f, indent=2)
        print(json.dumps(result))
        return

    try:
        with open(STATE_FILE) as f:
            last_id = f.read().strip()
    except FileNotFoundError:
        last_id = ""

    new_videos = []
    for e in entries:
        if e["id"] == last_id:
            break
        new_videos.append(e)

    # Update state
    with open(STATE_FILE, "w") as f:
        f.write(entries[0]["id"])

    # Generate briefings for new videos
    briefings = [generate_briefing(v) for v in new_videos]
    latest_briefing = generate_briefing(entries[0])
    
    # Add market snapshot
    market = {}
    try:
        import station_one_market as mkt
        market["snapshot"] = mkt.get_market_snapshot()
        # Get prices for affected sectors
        for name in ["WTI Crude Oil", "Brent Crude", "Gold (XAU)", "VIX", "S&P 500", "Bitcoin"]:
            price, change = mkt.fetch_price(mkt.SYMBOLS[name]) if hasattr(mkt, 'SYMBOLS') else (None, 0)
            if price:
                market[name] = {"price": round(price, 2) if price < 1000 else round(price), "change": round(change, 2)}
    except:
        pass
    
    # Add fear & greed
    try:
        req = urllib.request.Request('https://api.alternative.me/fng/?limit=1',
            headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10)
        fng = json.loads(resp.read())['data'][0]
        market["fear_greed"] = {"value": fng['value'], "label": fng['value_classification']}
    except:
        pass

    result = {
        "status": "ok",
        "channel": "Station One",
        "count": len(new_videos),
        "has_new": len(new_videos) > 0,
        "briefings": briefings,
        "latest": latest_briefing,
        "market": market
    }
    
    with open(PICKUP_FILE, "w") as f:
        json.dump(result, f, indent=2)
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
