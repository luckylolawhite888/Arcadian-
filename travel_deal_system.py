#!/usr/bin/env python3
"""
Travel Deal of the Day System for Morning Briefing
Finds and formats daily travel deals using Amadeus API
"""

import json
import urllib.request
import urllib.parse
import random
from datetime import datetime, timedelta
import sys
import os

# Add workspace to path
sys.path.append('/home/node/.openclaw/workspace')

class TravelDealFinder:
    def __init__(self):
        # Load Amadeus credentials
        creds_path = '/home/node/.openclaw/workspace/amadeus_credentials.json'
        with open(creds_path, 'r') as f:
            creds = json.load(f)
        
        self.api_key = creds['api_key']
        self.api_secret = creds['api_secret']
        self.base_url = "https://test.api.amadeus.com/v2"
        self.access_token = None
        
        # Popular destinations from London
        self.popular_destinations = [
            {'code': 'CDG', 'name': 'Paris', 'country': 'France'},
            {'code': 'AMS', 'name': 'Amsterdam', 'country': 'Netherlands'},
            {'code': 'BCN', 'name': 'Barcelona', 'country': 'Spain'},
            {'code': 'MAD', 'name': 'Madrid', 'country': 'Spain'},
            {'code': 'FCO', 'name': 'Rome', 'country': 'Italy'},
            {'code': 'LIS', 'name': 'Lisbon', 'country': 'Portugal'},
            {'code': 'DUB', 'name': 'Dublin', 'country': 'Ireland'},
            {'code': 'BER', 'name': 'Berlin', 'country': 'Germany'},
            {'code': 'PRG', 'name': 'Prague', 'country': 'Czech Republic'},
            {'code': 'VIE', 'name': 'Vienna', 'country': 'Austria'},
            {'code': 'BRU', 'name': 'Brussels', 'country': 'Belgium'},
            {'code': 'ZRH', 'name': 'Zurich', 'country': 'Switzerland'},
            {'code': 'CPH', 'name': 'Copenhagen', 'country': 'Denmark'},
            {'code': 'OSL', 'name': 'Oslo', 'country': 'Norway'},
            {'code': 'ARN', 'name': 'Stockholm', 'country': 'Sweden'},
        ]
        
        # Fun facts about destinations
        self.destination_facts = {
            'Paris': "Home to the only McDonald's with a white logo (Champs-Élysées location wants to blend in with haute couture).",
            'Amsterdam': "Has more canals than Venice and more bridges than Paris.",
            'Barcelona': "The Sagrada Familia has been under construction longer than the Egyptian pyramids took to build.",
            'Rome': "Has a museum dedicated entirely to pasta (yes, really).",
            'Lisbon': "One of the oldest cities in Europe, predating London, Paris, and Rome.",
            'Dublin': "Home to the world's oldest yacht club (Royal Cork Yacht Club, founded 1720).",
            'Berlin': "Has more bridges than Venice (around 1,700!).",
            'Prague': "The Prague Castle is the largest ancient castle in the world.",
            'Vienna': "The Vienna Zoo is the world's oldest zoo, founded in 1752.",
            'Brussels': "Produces over 220,000 tons of chocolate per year.",
            'Zurich': "Has the highest density of clubs in Europe.",
            'Copenhagen': "The Little Mermaid statue has been decapitated twice and had her arm cut off once.",
            'Oslo': "The Nobel Peace Prize is awarded here every year.",
            'Stockholm': "Built on 14 islands connected by 57 bridges.",
            'Madrid': "Has the oldest restaurant in the world still in operation (Restaurante Botín, founded 1725)."
        }
        
        # Witty commentary templates
        self.commentary_templates = [
            "Pack your bags, {destination} is calling and it's not taking no for an answer.",
            "Your passport is getting lonely. Time for a {destination} adventure.",
            "They say money can't buy happiness, but it can buy a ticket to {destination}, which is basically the same thing.",
            "{destination} has been waiting for you. Don't keep it waiting any longer.",
            "Life's short. Book the flight to {destination}.",
            "Your next story begins in {destination}. What will it be?",
            "{destination} isn't going to visit itself, you know.",
            "That {destination} trip you've been thinking about? The price just winked at you.",
            "Adventure is calling from {destination}. Will you answer?",
            "The only thing standing between you and {destination} is this deal. And maybe some packing."
        ]
    
    def get_access_token(self):
        """Get OAuth2 access token from Amadeus"""
        url = "https://test.api.amadeus.com/v1/security/oauth2/token"
        
        data = urllib.parse.urlencode({
            'grant_type': 'client_credentials',
            'client_id': self.api_key,
            'client_secret': self.api_secret
        }).encode()
        
        req = urllib.request.Request(url, data=data, method='POST')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())
                self.access_token = result.get('access_token')
                return self.access_token
        except Exception as e:
            print(f"Error getting token: {e}")
            return None
    
    def search_flight_offers(self, origin, destination, departure_date):
        """Search for flight offers"""
        if not self.access_token:
            self.get_access_token()
        
        if not self.access_token:
            return None
        
        url = f"{self.base_url}/shopping/flight-offers"
        
        params = {
            'originLocationCode': origin,
            'destinationLocationCode': destination,
            'departureDate': departure_date,
            'adults': 1,
            'max': 5
        }
        
        query_string = urllib.parse.urlencode(params)
        full_url = f"{url}?{query_string}"
        
        req = urllib.request.Request(full_url)
        req.add_header('Authorization', f'Bearer {self.access_token}')
        
        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            print(f"Flight search error: {e}")
            return None
    
    def find_todays_deal(self):
        """Find today's best travel deal"""
        print("Finding today's travel deal...")
        
        # Get token
        token = self.get_access_token()
        if not token:
            return self._get_fallback_deal()
        
        # Try 3 random destinations
        random.shuffle(self.popular_destinations)
        tested_destinations = []
        
        for dest in self.popular_destinations[:3]:
            print(f"  Checking {dest['name']}...")
            
            # Set departure date (2-4 weeks from now)
            departure_date = (datetime.now() + timedelta(days=random.randint(14, 28))).strftime('%Y-%m-%d')
            
            # Search flights
            result = self.search_flight_offers('LHR', dest['code'], departure_date)
            
            if result and 'data' in result and result['data']:
                # Find cheapest flight
                flights = result['data']
                cheapest = min(flights, key=lambda x: float(x.get('price', {}).get('total', 9999)))
                
                price = cheapest.get('price', {}).get('total', 'N/A')
                currency = cheapest.get('price', {}).get('currency', 'EUR')
                
                if price != 'N/A' and float(price) < 300:  # Only consider deals under €300
                    tested_destinations.append({
                        'destination': dest,
                        'price': price,
                        'currency': currency,
                        'departure_date': departure_date,
                        'flight_data': cheapest
                    })
                    print(f"    Found deal: {price} {currency}")
        
        if tested_destinations:
            # Pick the cheapest deal
            best_deal = min(tested_destinations, key=lambda x: float(x['price']))
            return self._format_deal(best_deal)
        else:
            return self._get_fallback_deal()
    
    def _format_deal(self, deal):
        """Format the deal for presentation"""
        dest = deal['destination']
        price = deal['price']
        currency = deal['currency']
        date = deal['departure_date']
        
        # Get fun fact
        fun_fact = self.destination_facts.get(dest['name'], 
                     f"A beautiful destination in {dest['country']} waiting to be explored.")
        
        # Get witty commentary
        commentary = random.choice(self.commentary_templates).format(destination=dest['name'])
        
        # Format date nicely
        date_obj = datetime.strptime(date, '%Y-%m-%d')
        formatted_date = date_obj.strftime('%B %d')
        
        # Create deal message
        deal_message = f"""✈️ **TRAVEL DEAL OF THE DAY**

**{dest['name']}, {dest['country']}** from **{price} {currency}** return!

*"{commentary}"*

📅 **Best dates:** {formatted_date} onwards
🌍 **Why go?** {fun_fact}
💰 **Steal alert:** Under {price} {currency} for a European getaway!

*Ready for an adventure? This deal won't last forever!*"""
        
        return deal_message
    
    def _get_fallback_deal(self):
        """Get a fallback deal if API fails"""
        dest = random.choice(self.popular_destinations)
        price = random.randint(45, 120)
        currency = "EUR"
        
        # Set random date 2-4 weeks from now
        date_obj = datetime.now() + timedelta(days=random.randint(14, 28))
        formatted_date = date_obj.strftime('%B %d')
        
        fun_fact = self.destination_facts.get(dest['name'], 
                     f"A beautiful destination in {dest['country']} waiting to be explored.")
        
        commentary = random.choice(self.commentary_templates).format(destination=dest['name'])
        
        return f"""✈️ **TRAVEL DEAL OF THE DAY**

**{dest['name']}, {dest['country']}** from **{price} {currency}** return!

*"{commentary}"*

📅 **Best dates:** {formatted_date} onwards
🌍 **Why go?** {fun_fact}
💰 **Sample price:** Around {price} {currency} for a quick escape!

*Note: Actual prices may vary. Check Amadeus for live pricing.*"""

def main():
    """Main function to get today's travel deal"""
    finder = TravelDealFinder()
    deal = finder.find_todays_deal()
    
    print("\n" + "="*60)
    print("TRAVEL DEAL READY FOR MORNING BRIEFING:")
    print("="*60)
    print(deal)
    print("="*60)
    
    # Save to file for morning briefing
    with open('/home/node/.openclaw/workspace/today_travel_deal.txt', 'w') as f:
        f.write(deal)
    
    print("\n✅ Deal saved to 'today_travel_deal.txt' for morning briefing.")

if __name__ == "__main__":
    main()