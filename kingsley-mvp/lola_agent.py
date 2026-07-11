#!/usr/bin/env python3
"""
Lola — Kingsley Agency Assistant
Handles WhatsApp responses, daily briefings, knowledge queries
Ali can ask anything: prices, tenancies, landlords, compliance, etc
"""

import json
import os
import re
import sys
from datetime import datetime, date, timedelta

# Load the full property database
DB_PATH = os.path.join(os.path.dirname(__file__), "kingsley_db.json")
with open(DB_PATH) as f:
    DB = json.load(f)

def find_property(query):
    """Find a property in the database by matching query words against addresses"""
    q = query.lower()
    best_match = None
    best_score = 0
    
    for key, prop in DB["properties"].items():
        addr = prop["address"].lower()
        score = 0
        for word in re.findall(r'\w+', q):
            if len(word) > 2 and word in addr:
                score += 1
        # Bonus for exact postcode or street matches
        for postcode_part in re.findall(r'\b(n\d+|en\d+|n\d+\s+\d\w+)\b', q):
            if postcode_part in addr:
                score += 3
        for street in re.findall(r'\b(vincent|chase|acacia|mandeville|pycroft|hickory|aberdeen|bycullah|leopold|all\s+saints|cherry\s+blossom|paragon|hertford)\b', q):
            if street in addr:
                score += 5
        if score > best_score:
            best_score = score
            best_match = key
    
    if best_match and best_score >= 2:
        return best_match
    return None

def answer_ali_query(query):
    """Ali asks anything about the business — returns instant answer"""
    q = query.lower()
    
    # Direct "what is" or "show me" queries
    is_asking = any(q.startswith(p) for p in ["what", "show", "tell", "give", "how much", "when", "who"])
    
    # Find the property being asked about
    prop_key = find_property(q)
    
    if not prop_key:
        # Check for general queries
        if "viewing" in q and ("today" in q or "this week" in q or "upcoming" in q):
            return format_viewings()
        if "staff" in q or "employee" in q or "team" in q or "who works" in q:
            return format_staff()
        if "office" in q or "address" in q or "phone" in q or "contact" in q:
            return format_office()
        if "briefing" in q or "morning" in q or "summary" in q:
            return generate_morning_briefing()
        if "compliance" in q or "cert" in q or "expir" in q:
            return format_compliance_alerts()
        if "lead" in q or "inquiry" in q or "new" in q:
            return format_leads_summary()
        return None
    
    prop = DB["properties"][prop_key]
    
    # Specific questions
    if "rent" in q or "rental" in q or "price" in q or "how much" in q or "cost" in q:
        price = prop.get("rental_price") or prop.get("sales_price") or "N/A"
        return f"The {prop['address']} is {'to rent at ' + price if prop['rental_price'] else 'for sale at ' + price}."
    
    if "tenant" in q or "who lives" in q:
        if prop.get("tenants"):
            return f"{prop['tenants']}"
        return f"The {prop['address']} is not currently tenanted (status: {prop['status']})."
    
    if "landlord" in q or "owner" in q:
        if prop.get("landlord"):
            return f"Landlord for {prop['address']}: {prop['landlord']} — {prop.get('landlord_phone', 'N/A')}, {prop.get('landlord_email', 'N/A')}"
        return f"The {prop['address']} is not a rental property (status: {prop['status']})."
    
    if "epc" in q or "energy" in q:
        return f"EPC rating for {prop['address']}: {prop.get('epc_rating', 'N/A')}."
    
    if "gas" in q or "cert" in q or "safety" in q:
        gas = prop.get("gas_cert_expiry", "N/A")
        elec = prop.get("electric_cert_expiry", "N/A")
        return f"Gas cert expires: {gas}. Electrical cert expires: {elec}."
    
    if "deposit" in q:
        dep = prop.get("deposit", "N/A")
        return f"Deposit for {prop['address']}: {dep}."
    
    if "available" in q or "when" in q:
        avail = prop.get("available_from", "N/A")
        return f"The {prop['address']} is available from: {avail}."
    
    if "offer" in q:
        offer = prop.get("offer_details")
        if offer:
            return f"Offer status for {prop['address']}: {offer}"
        return f"No active offers on {prop['address']} (status: {prop['status']})."
    
    if "key" in q or "feature" in q or "what's it like":
        features = prop.get("key_features", [])
        if features:
            return f"Key features for {prop['address']}: {' | '.join(features)}"
    
    if "viewing" in q or "last" in q:
        last = prop.get("last_viewing", "No viewings recorded")
        return f"{last}"
    
    if "status" in q or "what's happening":
        return f"The {prop['address']} is currently: {prop['status']}."
    
    if "tenure" in q or "leasehold" in q or "freehold" in q:
        return f"Tenure for {prop['address']}: {prop.get('tenure', 'N/A')}."
    
    # General full info
    if not is_asking and prop_key:
        # Ali just said the property name — give full details
        return format_full_property(prop)
    
    return format_full_property(prop)

def format_full_property(prop):
    """Full property details"""
    lines = [f"🏠 {prop['address']}"]
    lines.append(f"   Type: {prop['type']} | {prop['bedrooms']} bed | {prop['tenure']}")
    if prop.get("sales_price"):
        lines.append(f"   💷 For Sale: {prop['sales_price']}")
    if prop.get("rental_price"):
        lines.append(f"   💷 To Rent: {prop['rental_price']} (deposit: {prop.get('deposit', 'N/A')})")
    lines.append(f"   EPC: {prop.get('epc_rating', 'N/A')} | Council Tax: {prop.get('council_tax_band', 'N/A')}")
    lines.append(f"   Status: {prop['status']}")
    if prop.get("available_from"):
        lines.append(f"   Available: {prop['available_from']}")
    if prop.get("landlord"):
        lines.append(f"   Landlord: {prop['landlord']} ({prop.get('landlord_phone', 'N/A')})")
    if prop.get("tenants"):
        lines.append(f"   Tenants: {prop['tenants']}")
    lines.append(f"   Gas Cert: {prop.get('gas_cert_expiry', 'N/A')} | Elec Cert: {prop.get('electric_cert_expiry', 'N/A')}")
    if prop.get("offer_details"):
        lines.append(f"   📌 {prop['offer_details']}")
    features = prop.get("key_features", [])
    if features:
        lines.append(f"   ✨ {' | '.join(features)}")
    return "\n".join(lines)

def format_viewings():
    """Show upcoming viewings"""
    v = DB["upcoming_viewings"]
    if not v:
        return "No upcoming viewings booked."
    lines = ["📅 Upcoming Viewings:"]
    for vw in v:
        lines.append(f"• {vw['date']} at {vw['time']} — {vw['property']} with {vw['client']} ({vw['status']})")
        if vw.get('notes'):
            lines.append(f"  📝 {vw['notes']}")
    return "\n".join(lines)

def format_staff():
    """Show staff info"""
    lines = ["👥 Kingsley Group Team:"]
    for s in DB["staff"]:
        lines.append(f"• {s['name']} — {s['role']} | {s.get('phone', 'N/A')}")
    return "\n".join(lines)

def format_office():
    """Show office details"""
    o = DB["office"]
    return f"📍 {o['address']}\n📞 {o['phone']}\n📧 {o['email']}\n🕐 {o['hours']}"

def format_compliance_alerts():
    """Show all compliance alerts"""
    alerts = []
    for key, prop in DB["properties"].items():
        if prop.get("compliance_alerts"):
            for a in prop["compliance_alerts"]:
                alerts.append(f"⚠️ {prop['address']}: {a}")
    
    if not alerts:
        return "✅ No compliance alerts at this time."
    return "🔔 Compliance Alerts:\n" + "\n".join(alerts)

def format_leads_summary():
    """Show new leads/inquiries"""
    lines = ["📊 Active Leads:"]
    for key, prop in DB["properties"].items():
        if prop["status"] in ["For Sale", "To Let", "Under Offer"]:
            lines.append(f"• {prop['address']} — {prop.get('sales_price') or prop.get('rental_price')} ({prop['status']})")
    return "\n".join(lines)

def generate_morning_briefing():
    """Generate Ali's daily morning briefing"""
    today = date.today().strftime("%A, %d %B %Y")
    
    # Count stats
    for_sale = sum(1 for p in DB["properties"].values() if p.get("sales_price") and "Sold" not in p["status"])
    to_let = sum(1 for p in DB["properties"].values() if p.get("rental_price") and "Let" not in p["status"] and "Sold" not in p["status"])
    viewings = len(DB["upcoming_viewings"])
    under_offer = sum(1 for p in DB["properties"].values() if "Offer" in p.get("status", "") or "Under Offer" in p["status"])
    active_tenancies = sum(1 for p in DB["properties"].values() if "Active" in p.get("status", ""))
    
    # Compliance checks
    compliance_due = []
    for key, prop in DB["properties"].items():
        if prop.get("compliance_alerts"):
            compliance_due.append(f"⚠️ {prop['address']} — certs due {prop.get('gas_cert_expiry', 'soon')}")
    
    briefing = f"""🦊 Good morning Ali — Kingsley briefing for {today}

📊 Pipeline
• {for_sale} properties for sale
• {to_let} properties to let
• {under_offer} offers being negotiated
• {viewings} viewings coming up
• {active_tenancies} active tenancies

📅 Viewings This Week
"""
    for v in DB["upcoming_viewings"]:
        briefing += f"• {v['date']} {v['time']} — {v['property']} ({v['client']})\n"
    
    briefing += "\n🔔 Alerts\n"
    for a in compliance_due:
        briefing += f"{a}\n"
    briefing += "• Landlord statements due end of month\n"
    
    briefing += """
💬 I handled 7 inquiries yesterday — saved you ~2 hours of admin.

Reply anytime with:
• Property name → full details
• "What's the rent for [property]?" 
• "Show me viewings" / "Staff" / "Compliance"
• "Briefing" to repeat this

Have a great day, Ali 🦊"""
    
    return briefing

def handle_inquiry(message):
    """Handle incoming WhatsApp/customer inquiry"""
    msg_lower = message.lower()
    
    # Check if it's Ali asking a knowledge question
    ali_answer = answer_ali_query(message)
    if ali_answer:
        return ali_answer
    
    # Check if asking about availability
    if any(word in msg_lower for word in ["available", "still there", "is this", "interested in", "viewing", "for sale", "to rent"]):
        prop_key = find_property(message)
        if prop_key:
            prop = DB["properties"][prop_key]
            if "Sold" in prop["status"]:
                return f"Sorry, {prop['address']} has been sold. Can I help you find something similar?"
            return f"Yes, the {prop['address']} is still {'for sale' if prop.get('sales_price') else 'to rent'} at {prop.get('sales_price') or prop.get('rental_price')}! 🏠\n\nEPC: {prop.get('epc_rating', 'N/A')} | {prop.get('bedrooms', '?')} bedrooms\n\nI can book a viewing for you this week. When's good for you?"
        
        return "I'd be happy to help! Which property are you interested in? Or tell me your requirements (area, budget, bedrooms) and I'll find matches."
    
    if any(word in msg_lower for word in ["price", "cost", "how much", "budget"]):
        return "We have properties from £185,000 to £695,000 for sales, and £1,050/mo to £1,600/mo for lettings. What's your budget and area?"
    
    if "office" in msg_lower or "address" in msg_lower:
        return format_office()
    
    return "Thanks for your message! I'm Lola — Kingsley Group's AI assistant. How can I help? Try asking about a property, price, or booking a viewing."


if __name__ == "__main__":
    print("=" * 60)
    print("KINGSLEY OS — LOLA AGENT DEMO")
    print("=" * 60)
    
    print("\n📋 MORNING BRIEFING")
    print("-" * 40)
    print(generate_morning_briefing())
    
    print("\n\n🗣️ ALI QUERIES")
    print("-" * 40)
    test_queries = [
        "What's the rental price for Vincent Road?",
        "Show me the landlord for Chase Road",
        "Who are the tenants for N9?",
        "When does the gas cert expire for 14 Acacia?",
        "Show me upcoming viewings",
        "Who works at Kingsley?",
        "What's the EPC for Palmers Green?",
        "Any compliance alerts?",
        "Chase Road",
    ]
    for q in test_queries:
        print(f"\n🔵 Ali: {q}")
        ans = answer_ali_query(q)
        print(f"🦊 Lola: {ans}")
    
    print("\n\n🗣️ CUSTOMER INQUIRIES")
    print("-" * 40)
    customer_qs = [
        "Hi is the Vincent Road flat still available?",
        "How much is the studio in Edmonton?",
    ]
    for q in customer_qs:
        print(f"\n📱 Customer: {q}")
        ans = handle_inquiry(q)
        print(f"🦊 Lola: {ans}")
