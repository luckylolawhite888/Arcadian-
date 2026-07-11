#!/usr/bin/env python3
"""
Enhanced Pythagorean numerology for morning briefing.
- Day Number (today's universal energy)
- Life Path Number (Maya's fixed = 8)
- Personal Day/Month/Year
- Daily recommendations based on Personal Day
"""

from datetime import datetime

MAYA_LIFE_PATH = 8

LIFE_PATH_MEANINGS = {
    1: "The Leader — Born to pioneer, initiate, and stand alone. Your path is independence.",
    2: "The Diplomat — Born to cooperate, balance, and unite. Your path is partnership.",
    3: "The Creator — Born to express, inspire, and communicate. Your path is joy.",
    4: "The Builder — Born to work hard, organise, and create stability. Your path is discipline.",
    5: "The Traveller — Born to experience freedom, change, and adventure. Your path is exploration.",
    6: "The Nurturer — Born to love, heal, and take responsibility. Your path is service.",
    7: "The Seeker — Born to analyse, research, and understand. Your path is wisdom.",
    8: "The Powerhouse — Born to lead, achieve, and create abundance. Your path is mastery.",
    9: "The Humanitarian — Born to give, inspire, and complete. Your path is compassion.",
    11: "The Intuitive — Born to illuminate and inspire on a higher plane.",
    22: "The Master Builder — Born to turn dreams into reality at scale.",
    33: "The Master Teacher — Born to elevate humanity through compassion."
}

DAY_MEANINGS = {
    1: "New beginnings. Take that first step.",
    2: "Patience and partnership. Listen more today.",
    3: "Express yourself. Create something.",
    4: "Get organised. Do the boring work.",
    5: "Embrace change. Say yes to something unexpected.",
    6: "Focus on home and loved ones.",
    7: "Rest, reflect, research. Go inward.",
    8: "Power day. Take action on finances or goals.",
    9: "Let go. Finish something. Make space for what's next."
}

PERSONAL_DAY_MEANINGS = {
    1: "🟢 A day to start something. Your energy is fresh and assertive.",
    2: "🔵 A day to cooperate. Slow down and listen to others.",
    3: "🟡 A day to enjoy. Socialise, create, have fun.",
    4: "🟠 A day to work. Head down, get things done.",
    5: "🟣 A day to break free. Expect surprises and embrace them.",
    6: "💗 A day for family. Nurture your closest relationships.",
    7: "🔮 A day to reflect. Take time alone to think.",
    8: "💰 A power day for business decisions and financial moves.",
    9: "🌈 A day to release. Let go of what no longer serves you."
}

MONTH_MEANINGS = {
    1: "A month of fresh starts and new directions.",
    2: "A month for patience, cooperation, and relationships.",
    3: "A month for creativity, fun, and self-expression.",
    4: "A month for hard work, discipline, and building foundations.",
    5: "A month for change, travel, and embracing the unexpected.",
    6: "A month for family, home, and taking responsibility.",
    7: "A month for reflection, research, and going inward.",
    8: "A month for business, finances, and power moves.",
    9: "A month for completion, letting go, and preparing for renewal."
}

YEAR_MEANINGS = {
    1: "🌱 A year of new beginnings. Plant seeds for the next 9 years.",
    2: "🤝 A year of connection. Build relationships and partnerships.",
    3: "🎨 A year of expression. Create, socialise, enjoy life.",
    4: "🏗️ A year of foundation. Work hard, build stability.",
    5: "🦋 A year of freedom. Big changes, adventure, growth.",
    6: "🏡 A year of responsibility. Family, home, service to others.",
    7: "📚 A year of wisdom. Study, reflect, go deep.",
    8: "🚀 A year of power. Financial growth, leadership, achievement.",
    9: "🎯 A year of completion. Finish what you started. Prepare for renewal."
}

# ─── Daily Recommendations ───────────────────────────────────────────────────
# Based on the Personal Day number — what activities vibe with today's energy

RECOMMENDATIONS = {
    1: {
        "good_for": [
            "🚀 Start that new project you've been putting off",
            "🗣️ Have that difficult conversation — initiate",
            "🛍️ Buy something new for yourself (hat, trainers, fresh fit)",
            "🥗 Eat light, fresh foods — salads, fruit, green juices",
        ],
        "activities": [
            "Launch a new routine",
            "Make the first move on a goal",
            "Visit somewhere you've never been",
        ],
        "avoid": [
            "Big financial commitments",
            "Letting others decide for you",
        ],
        "food_vibe": "New, fresh, light. Think salads, smoothies, first bites.",
        "self_care": "A fresh haircut or new hairstyle. New beginnings for your look.",
    },
    2: {
        "good_for": [
            "💇‍♀️ Haircuts, facials, skin treatments — nurture yourself",
            "🤝 Partnership talks, meetings, collaborations",
            "📞 Reach out to someone you've been meaning to call",
            "🥚 Eggs, dairy, comfort foods — soft, nurturing energy",
        ],
        "activities": [
            "Book a spa day or facial",
            "Have a heart-to-heart with a friend",
            "Work on a joint project",
        ],
        "avoid": [
            "Making big solo decisions",
            "Rushing into confrontation",
        ],
        "food_vibe": "Comforting, soft. Eggs, toast, warm bowls, tea.",
        "self_care": "Facial, face mask, skin routine. Day to pamper your face.",
    },
    3: {
        "good_for": [
            "🎨 Creative projects — write, draw, record, design",
            "🍝 Eating out, trying new restaurants, social meals",
            "🎭 Go see a movie, play, or live music",
            "📱 Post on social media, share something you made",
        ],
        "activities": [
            "Try a restaurant you've never been to",
            "Start a creative hobby",
            "Host friends for dinner or drinks",
        ],
        "avoid": [
            "Isolating yourself",
            "Overthinking — just do it",
        ],
        "food_vibe": "Social eating. Tapas, sharing plates, new cuisine, dessert.",
        "self_care": "Dress up. Wear something colourful. Express yourself through fashion.",
    },
    4: {
        "good_for": [
            "🧹 Deep clean, organise, declutter your space",
            "🏠 Home improvement projects, DIY",
            "📋 Plan your week, make lists, get admin done",
            "🥘 Home cooking — hearty, grounding meals",
        ],
        "activities": [
            "Marie Kondo a room",
            "Sort your finances, pay bills",
            "Meal prep for the week",
        ],
        "avoid": [
            "Impulse spending",
            "Starting new projects (finish existing ones)",
        ],
        "food_vibe": "Hearty, grounding. Roasts, stews, home-cooked meals, root veg.",
        "self_care": "A long bath, foot soak, or massage. Ground your body.",
    },
    5: {
        "good_for": [
            "✈️ Book a trip, plan a getaway, explore somewhere new",
            "🍜 Try a cuisine you've never had before",
            "🎲 Say yes to spontaneous plans",
            "🏃‍♂️ Do something physically adventurous",
        ],
        "activities": [
            "Book a spontaneous trip or day out",
            "Try a new sport or activity class",
            "Go somewhere unfamiliar in your city",
        ],
        "avoid": [
            "Sticking to a rigid schedule",
            "Overcommitting — leave room for spontaneity",
        ],
        "food_vibe": "Adventurous eating. Ethiopian, Jamaican, something you've never tried.",
        "self_care": "Get outside. Nature walk, city explore, fresh air. Move your body.",
    },
    6: {
        "good_for": [
            "👨‍👩‍👧‍👧 Family time — call your mum, visit someone",
            "🍳 Cook a proper meal at home, comfort food",
            "🏡 Nest — make your home cosy",
            "💆 Self-care, rest, stay in",
        ],
        "activities": [
            "Cook a meal for someone you love",
            "Have a movie night at home",
            "Tidy and beautify your living space",
        ],
        "avoid": [
            "Overworking or neglecting loved ones",
            "Taking on other people's problems",
        ],
        "food_vibe": "Home cooking. Your signature dish, comfort food, Sunday roast energy.",
        "self_care": "Stay home. Face mask, candles, cosy blankets. Nurture your nest.",
    },
    7: {
        "good_for": [
            "📚 Read a book, research something, learn a new skill",
            "🧘 Meditate, journal, go inward",
            "🔍 Analyse a problem — the answer is inside you",
            "🍵 Light meals, teas, cleanse energy",
        ],
        "activities": [
            "Spend an hour with no phone",
            "Read or study something deep",
            "Go for a solo walk in nature",
        ],
        "avoid": [
            "Big social events",
            "Making hasty decisions",
        ],
        "food_vibe": "Light, clean. Teas, broths, fish, simple fresh ingredients.",
        "self_care": "Silence. No music, no podcast. Just you and your thoughts.",
    },
    8: {
        "good_for": [
            "💰 **POWER DAY** — Business decisions, investments, financial moves",
            "📈 Review your portfolio, chase payments, negotiate",
            "💪 Exercise, lift heavy, push your physical limits",
            "🥩 Eat protein — meat, eggs, power meals",
            "🎯 Make that big call you've been avoiding",
        ],
        "activities": [
            "Send that invoice",
            "Make a business decision",
            "Invest in yourself (course, coaching, tool)",
            "Work out hard",
        ],
        "avoid": [
            "Procrastinating on important matters",
            "Being passive — this is YOUR day",
        ],
        "food_vibe": "Power food. Steak, eggs, protein shakes, red meat. Fuel for the machine.",
        "self_care": "A power workout. Lift heavy, run hard, sweat. Then a protein meal.",
    },
    9: {
        "good_for": [
            "🧹 Clear out — donate clothes, delete files, end subscriptions",
            "🎁 Give something away, practice generosity",
            "🏁 Finish a project you started",
            "🧘 Let go of grudges, forgive, release",
        ],
        "activities": [
            "Donate to charity",
            "Delete unused apps and files",
            "Write a closure letter or message",
            "Clean out your wardrobe",
        ],
        "avoid": [
            "Starting something new",
            "Holding onto things that are done",
        ],
        "food_vibe": "Light, cleansing. Soups, detox, fruit. Prepare for renewal.",
        "self_care": "Let go of something physical. Throw away, donate, clear space.",
    },
}


def reduce_to_root(n, keep_master=True):
    """Reduce number to single digit, optionally keeping master numbers."""
    if keep_master and n in (11, 22, 33):
        return n
    while n > 9:
        n = sum(int(d) for d in str(n))
    return n


def day_number(date_str=None):
    """Today's universal day number."""
    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")
    d = sum(int(c) for c in date_str if c.isdigit())
    return reduce_to_root(d)


def personal_year_number(date_str=None, life_path=MAYA_LIFE_PATH):
    """Personal Year = current year + life path, reduced."""
    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")
    year = date_str.split("-")[0]
    year_sum = sum(int(c) for c in year)
    return reduce_to_root(year_sum + life_path)


def personal_month_number(date_str=None, life_path=MAYA_LIFE_PATH):
    """Personal Month = personal year + current month number, reduced."""
    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")
    parts = date_str.split("-")
    py = personal_year_number(date_str, life_path)
    month = int(parts[1])
    return reduce_to_root(py + month)


def personal_day_number(date_str=None, life_path=MAYA_LIFE_PATH):
    """Personal Day = personal month + current day of month, reduced."""
    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")
    parts = date_str.split("-")
    pm = personal_month_number(date_str, life_path)
    day = int(parts[2])
    return reduce_to_root(pm + day)


def full_reading(date_str=None):
    """Return a full numerology reading dict."""
    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")

    dn = day_number(date_str)
    pn = personal_day_number(date_str)
    py = personal_year_number(date_str)
    pm = personal_month_number(date_str)

    reco = RECOMMENDATIONS.get(pn, {})

    return {
        "date": date_str,
        "day_number": dn,
        "day_meaning": DAY_MEANINGS.get(dn, ""),
        "life_path": MAYA_LIFE_PATH,
        "life_path_meaning": LIFE_PATH_MEANINGS.get(MAYA_LIFE_PATH, ""),
        "personal_year": py,
        "personal_year_meaning": YEAR_MEANINGS.get(py, ""),
        "personal_month": pm,
        "personal_month_meaning": MONTH_MEANINGS.get(pm, ""),
        "personal_day": pn,
        "personal_day_meaning": PERSONAL_DAY_MEANINGS.get(pn, ""),
        "is_power_day": (pn == 8),
        "recommendations": reco,
    }


def format_for_briefing(date_str=None):
    """Return a nicely formatted string for the morning briefing."""
    r = full_reading(date_str)
    lines = [
        f"🔢 **Numerology** — {r['date']}",
        f"",
        f"**Day {r['day_number']}** — {r['day_meaning']}",
        f"**Life Path {r['life_path']}** — {r['life_path_meaning']}",
        f"",
        f"You're in a **Personal Year {r['personal_year']}** — {r['personal_year_meaning']}",
        f"**Personal Month {r['personal_month']}** — {r['personal_month_meaning']}",
        f"**Personal Day {r['personal_day']}** — {r['personal_day_meaning']}",
    ]

    # Power day callout
    if r.get("is_power_day"):
        lines.append("")
        lines.append("🔥 **POWER DAY** — This is YOUR day. Make moves. 💪🏽")

    # Daily recommendations
    reco = r.get("recommendations", {})
    if reco:
        lines.append("")
        lines.append("💡 **Today's Recommendations:**")

        if reco.get("good_for"):
            lines.append("**✅ Good for:**")
            for g in reco["good_for"]:
                lines.append(f"  {g}")

        if reco.get("activities"):
            lines.append("**🎯 Try this:**")
            for a in reco["activities"]:
                lines.append(f"  • {a}")

        if reco.get("food_vibe"):
            lines.append(f"**🥘 Eat:** {reco['food_vibe']}")

        if reco.get("self_care"):
            lines.append(f"**🧘 Self-care:** {reco['self_care']}")

        if reco.get("avoid"):
            lines.append("")
            lines.append("**⛔ Avoid:**")
            for av in reco["avoid"]:
                lines.append(f"  • {av}")

    return "\n".join(lines)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", help="YYYY-MM-DD")
    args = parser.parse_args()
    print(format_for_briefing(args.date))
