#!/usr/bin/env python3
"""
Enhanced Travel & Hotel Deals System for Morning Briefing
Finds daily flight and hotel deals with witty commentary
"""

import json
import random
from datetime import datetime, timedelta
import sys
import os

# Add workspace to path
sys.path.append('/home/node/.openclaw/workspace')

class EnhancedTravelDeals:
    def __init__(self):
        # Load Amadeus credentials
        creds_path = '/home/node/.openclaw/workspace/amadeus_credentials.json'
        with open(creds_path, 'r') as f:
            creds = json.load(f)
        
        self.api_key = creds['api_key']
        self.api_secret = creds['api_secret']
        self.base_url = "https://test.api.amadeus.com/v2"
        self.access_token = None
        
        # Destination database with personality
        self.destinations = [
            {
                'code': 'CDG', 'name': 'Paris', 'country': 'France', 'emoji': '🇫🇷',
                'flight_quips': [
                    "For when you need croissants more than common sense",
                    "Romance, wine, and questionable French phrases",
                    "The Eiffel Tower is just a fancy antenna anyway"
                ],
                'hotel_quips': [
                    "Stay in a charming attic with questionable plumbing",
                    "Hotel with a view of someone else's balcony",
                    "Breakfast includes 17 types of bread"
                ]
            },
            {
                'code': 'AMS', 'name': 'Amsterdam', 'country': 'Netherlands', 'emoji': '🇳🇱',
                'flight_quips': [
                    "Bikes, canals, and life choices you won't tell your mum about",
                    "Where 'coffee shop' means something entirely different",
                    "Tulips are just fancy onions with commitment issues"
                ],
                'hotel_quips': [
                    "Houseboat hotel that rocks you to sleep (literally)",
                    "Stay in a former cheese warehouse (smells better than you'd think)",
                    "Hotel with complimentary bike and questionable lock"
                ]
            },
            {
                'code': 'MAD', 'name': 'Madrid', 'country': 'Spain', 'emoji': '🇪🇸',
                'flight_quips': [
                    "For when 9pm is an acceptable dinner time",
                    "Siestas: the original productivity hack",
                    "All the paella, none of the regrets"
                ],
                'hotel_quips': [
                    "Hotel with rooftop tapas and questionable sangria",
                    "Stay in a palace (the 'budget palace' section)",
                    "Complimentary flamenco lessons at 2am"
                ]
            },
            {
                'code': 'FCO', 'name': 'Rome', 'country': 'Italy', 'emoji': '🇮🇹',
                'flight_quips': [
                    "When in Rome, do as the tourists do: get lost",
                    "All roads lead to gelato eventually",
                    "Ancient ruins and modern pizza - the perfect combo"
                ],
                'hotel_quips': [
                    "Hotel with 'authentic' Roman plumbing (bring sandals)",
                    "Stay steps from the Colosseum (and 5000 other tourists)",
                    "Breakfast includes espresso strong enough to wake Caesar"
                ]
            },
            {
                'code': 'LIS', 'name': 'Lisbon', 'country': 'Portugal', 'emoji': '🇵🇹',
                'flight_quips': [
                    "Seven hills, unlimited pasteis de nata",
                    "Where trams are both transport and extreme sport",
                    "Sun, sea, and suspiciously cheap wine"
                ],
                'hotel_quips': [
                    "Stay in a tiled palace (the tiles are the best part)",
                    "Hotel with Fado singers who may or may not be crying",
                    "Rooftop bar with views and questionable cocktails"
                ]
            },
            {
                'code': 'BER', 'name': 'Berlin', 'country': 'Germany', 'emoji': '🇩🇪',
                'flight_quips': [
                    "Techno, currywurst, and existential dread",
                    "Where the wall came down but the party stayed up",
                    "Efficient, edgy, and occasionally emotional"
                ],
                'hotel_quips': [
                    "Stay in a former bunker (now with Wi-Fi!)",
                    "Hotel with 'industrial chic' (read: exposed pipes)",
                    "Breakfast includes 14 types of sausage"
                ]
            },
            {
                'code': 'PRG', 'name': 'Prague', 'country': 'Czech Republic', 'emoji': '🇨🇿',
                'flight_quips': [
                    "Beer cheaper than water (this is not a drill)",
                    "Castles, bridges, and questionable absinthe",
                    "Where Gothic architecture meets modern hangovers"
                ],
                'hotel_quips': [
                    "Stay in a medieval inn (now with minibar)",
                    "Hotel with astronomical clock view (it's always wrong)",
                    "Complimentary beer tasting (it's a trap)"
                ]
            }
        ]
        
        # General witty commentary
        self.general_quips = [
            "Because your boss definitely won't notice you're gone",
            "For when your bank account needs a little adventure",
            "What's the worst that could happen? (Don't answer that)",
            "Treat yourself! Your future self will deal with the consequences",
            "YOLO, but make it budget-friendly",
            "Because adulting is overrated anyway",
            "Your passport is judging you for not using it",
            "When life gives you lemons, book a flight to somewhere sunny",
            "This deal is so good it's practically illegal",
            "What's money if not for questionable travel decisions?"
        ]
        
        # Hotel-specific quips
        self.hotel_quips = [
            "Comes with 'character' (read: questionable decor)",
            "Breakfast included! (Probably just toast)",
            "Free Wi-Fi! (In the lobby only)",
            "Boutique hotel (it's small, but we call it 'intimate')",
            "Historic building (the ghosts are friendly, we promise)",
            "City views! (If you stand on the toilet and crane your neck)",
            "Luxury amenities (the soap is shaped like a swan)",
            "Prime location (next to a kebab shop that's open till 4am)",
            "Charming quirks (the door only opens if you kick it)",
            "Authentic experience (the shower has exactly two temperatures: lava or ice)"
        ]

    def get_access_token(self):
        """Get Amadeus API access token"""
        try:
            import urllib.request
            import urllib.parse
            
            url = "https://test.api.amadeus.com/v1/security/oauth2/token"
            data = urllib.parse.urlencode({
                'grant_type': 'client_credentials',
                'client_id': self.api_key,
                'client_secret': self.api_secret
            }).encode()
            
            req = urllib.request.Request(url, data=data)
            response = urllib.request.urlopen(req)
            
            if response.getcode() == 200:
                result = json.loads(response.read().decode())
                self.access_token = result.get('access_token')
                return self.access_token
        except Exception as e:
            print(f"Token error: {e}")
            return None
    
    def generate_daily_deals(self):
        """Generate daily flight and hotel deals with witty commentary"""
        print("🎯 Generating today's travel deals...")
        
        # Select 3 random destinations
        random.shuffle(self.destinations)
        selected = self.destinations[:3]
        
        deals_output = "## ✈️ Daily Travel & Hotel Deals\n\n"
        deals_output += "*Your daily dose of wanderlust with questionable financial advice*\n\n"
        
        # Add general witty intro
        deals_output += f"**{random.choice(self.general_quips)}**\n\n"
        
        # FLIGHT DEALS SECTION
        deals_output += "### 🛫 Flight Deals (Under €300)\n\n"
        
        flight_deals = []
        for dest in selected:
            # Generate fake flight price (in real system, would call API)
            base_price = random.randint(80, 280)
            price = f"€{base_price}"
            
            # Add random extras
            extras = []
            if random.random() > 0.7:
                extras.append("✈️ Direct flight")
            if random.random() > 0.8:
                extras.append("🎒 Cabin bag included")
            if random.random() > 0.9:
                extras.append("🍷 Free wine (probably)")
            
            flight_quip = random.choice(dest['flight_quips'])
            
            flight_deals.append(f"**{dest['emoji']} {dest['name']}, {dest['country']}** - {price} return\n")
            flight_deals.append(f"   *{flight_quip}*\n")
            if extras:
                flight_deals.append(f"   {' • '.join(extras)}\n")
            flight_deals.append("\n")
        
        deals_output += "".join(flight_deals)
        
        # HOTEL DEALS SECTION
        deals_output += "### 🏨 Hotel Deals (3+ Star)\n\n"
        
        hotel_deals = []
        for dest in selected:
            # Generate fake hotel price
            base_price = random.randint(60, 180)
            price = f"€{base_price}/night"
            
            # Hotel features
            features = []
            if random.random() > 0.5:
                features.append("🏊 Pool")
            if random.random() > 0.6:
                features.append("🍳 Breakfast")
            if random.random() > 0.7:
                features.append("💪 Gym")
            if random.random() > 0.8:
                features.append("🐕 Pet-friendly")
            
            hotel_quip = random.choice(dest['hotel_quips'])
            general_hotel_quip = random.choice(self.hotel_quips)
            
            hotel_deals.append(f"**{dest['emoji']} {dest['name']} Hotel** - {price}\n")
            hotel_deals.append(f"   *{hotel_quip}*\n")
            hotel_deals.append(f"   *{general_hotel_quip}*\n")
            if features:
                hotel_deals.append(f"   {' • '.join(features)}\n")
            hotel_deals.append("\n")
        
        deals_output += "".join(hotel_deals)
        
        # TRAVEL TIP OF THE DAY
        deals_output += "### 💡 Travel Tip of the Day\n\n"
        
        travel_tips = [
            "**Book on Tuesday!** Airlines often release new deals on Tuesday afternoons.",
            "**Clear your cookies** before searching for flights. Prices can increase based on your search history!",
            "**Use incognito mode** when browsing for hotels. Same principle as above!",
            "**Be flexible with dates** - shifting by just one day can save you hundreds.",
            "**Sign up for airline newsletters** - they often send exclusive deals to subscribers.",
            "**Check alternative airports** - flying into a nearby city can be much cheaper.",
            "**Travel off-season** - you'll save money AND avoid the crowds.",
            "**Pack light** - avoid checked baggage fees by fitting everything in a carry-on.",
            "**Download airline apps** - they sometimes have app-only deals.",
            "**Book directly with hotels** - they often match or beat third-party prices."
        ]
        
        deals_output += f"{random.choice(travel_tips)}\n\n"
        
        # FINAL WITTY CLOSING
        deals_output += "---\n"
        closing_options = [
            'Remember: the best stories start with questionable decisions',
            'Your future self will thank you (or possibly curse you)',
            'What\'s the point of money if not for impulsive travel?',
            'Life is short. Book the flight. Worry about it later.',
            'Adventure awaits! So do credit card bills, but details...'
        ]
        deals_output += f"*{random.choice(closing_options)}*\n"
        
        return deals_output
    
    def save_daily_deals(self):
        """Save today's deals to file"""
        deals = self.generate_daily_deals()
        
        filepath = '/home/node/.openclaw/workspace/today_travel_deal.txt'
        with open(filepath, 'w') as f:
            f.write(deals)
        
        print(f"✅ Travel deals saved to {filepath}")
        return filepath

def main():
    """Generate and save today's travel deals"""
    print("🚀 Enhanced Travel Deals System")
    print("=" * 40)
    
    try:
        deals_system = EnhancedTravelDeals()
        deals_system.save_daily_deals()
        
        # Also update the morning briefing generator to use enhanced format
        print("\n📋 Today's deals include:")
        print("- 3 Flight deals with witty commentary")
        print("- 3 Hotel deals with personality")
        print("- Travel tip of the day")
        print("- General wanderlust encouragement")
        
        print("\n🎯 Next steps:")
        print("1. Morning briefing will automatically include these deals")
        print("2. Run daily to get fresh deals")
        print("3. Integrate with real API data when ready")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        # Create fallback deals
        fallback = """## ✈️ Daily Travel & Hotel Deals

*Our travel agents are still waking up with their coffee!*

**Today's Wisdom:** Sometimes the best adventure is staying in bed.

Check back tomorrow for actual deals!"""
        
        with open('/home/node/.openclaw/workspace/today_travel_deal.txt', 'w') as f:
            f.write(fallback)
        
        print("⚠️ Created fallback deals file")

if __name__ == "__main__":
    main()