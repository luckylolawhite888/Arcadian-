#!/usr/bin/env python3
"""
Kingsley WhatsApp Agent — demo-ready responses for Ali
"""
import json, re

DB_PATH = "/home/node/.openclaw/workspace/kingsley-mvp/kingsley_db.json"

def load_db():
    with open(DB_PATH) as f:
        return json.load(f)

def handle_query(msg):
    msg_lower = msg.lower()
    db = load_db()
    
    # Property search
    if any(w in msg_lower for w in ["property", "house", "flat", "apartment", "listing", "for sale", "to let", "available", "price"]):
        return search_properties(msg_lower, db)
    
    # Stats
    if any(w in msg_lower for w in ["stats", "pipeline", "how many", "performance", "briefing", "today"]):
        return show_stats(db)
    
    # Meetings / schedule
    if any(w in msg_lower for w in ["meeting", "appointment", "viewing", "schedule"]):
        return show_schedule(db)
    
    # General Kingsley intro
    if any(w in msg_lower for w in ["hello", "hi", "hey", "what can you", "help", "capabilities"]):
        return get_introduction(db)
    
    return fallback()

def search_properties(msg, db):
    results = []
    for key, prop in db["properties"].items():
        addr = prop["address"].lower()
        score = 0
        for word in re.findall(r'\w+', msg):
            if len(word) > 2 and word in addr:
                score += 1
        if score > 0:
            results.append((score, prop))
    
    if not results:
        return "I don't have any listings matching that right now. Let me note your interest and I can alert you when something suitable comes in! What area are you looking at?"
    
    results.sort(key=lambda x: -x[0])
    top = results[:3]
    
    response = "Here's what I found:\n\n"
    for score, prop in top:
        status = prop.get("status", "")
        emoji = "✅" if "sold" in status.lower() or "let" in status.lower() else "🏠"
        response += f"{emoji} **{prop['address']}**\n"
        response += f"   💷 {prop.get('price', prop.get('rent', 'POA'))}\n"
        response += f"   📋 {status} | {prop.get('type', 'property')}\n"
        response += f"   {prop.get('description', '')[:100]}...\n\n"
    
    response += "Want more details on any of these? Just ask! 🦊"
    return response

def show_stats(db):
    stats = db.get("stats", {})
    props = db.get("properties", {})
    total = len(props)
    sold = sum(1 for p in props.values() if "sold" in p.get("status","").lower())
    let = sum(1 for p in props.values() if "let" in p.get("status","").lower())
    active = total - sold - let
    
    return (
        f"📊 **Kingsley Group — Today's Snapshot**\n\n"
        f"🏠 Total Listings: {total}\n"
        f"✅ Sold: {sold}\n"
        f"🔑 Let: {let}\n"
        f"📌 Active: {active}\n\n"
        f"📅 Viewings Today: {stats.get('todays_viewings', 0)}\n"
        f"🆕 New Enquiries: {stats.get('new_enquiries', 0)}\n"
        f"📞 Follow-ups Due: {stats.get('follow_ups_due', 0)}\n\n"
        f"Want me to send a full morning briefing like this every day?"
    )

def show_schedule(db):
    schedule = db.get("schedule", [])
    if not schedule:
        return "No appointments scheduled for today. Want me to help you organise your week?"
    
    response = "📅 **Today's Schedule**\n\n"
    for item in schedule[:5]:
        response += f"⏰ {item.get('time', 'TBC')} - {item.get('title', 'Appointment')}\n"
        response += f"   📍 {item.get('location', item.get('address', ''))}\n\n"
    return response

def get_introduction(db):
    return (
        "Hi! I'm Lola, your AI assistant for Kingsley Group. 🦊\n\n"
        "Here's what I can help you with right now:\n\n"
        "🏠 **Search Properties** — Ask about listings, prices, availability\n"
        "📊 **Pipeline Stats** — See your sales and lettings at a glance\n"
        "📅 **Schedule** — Viewings, appointments, reminders\n"
        "📋 **Property Details** — Full info on any listing\n\n"
        "Just ask me anything! For example: 'What 3-bed houses do you have in Southgate?'"
    )

def fallback():
    return (
        "I'm not sure I understood that, but I'm learning! 🦊\n\n"
        "Try asking me:\n"
        "• 'What properties are available?'\n"
        "• 'Show me today's stats'\n"
        "• 'Tell me about 123 Example Street'\n"
        "• 'What can you help me with?'"
    )

if __name__ == "__main__":
    import sys
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "hello"
    print(handle_query(query))
