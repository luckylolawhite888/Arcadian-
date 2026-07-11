#!/usr/bin/env python3
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta

class AmadeusClient:
    def __init__(self, api_key, api_secret):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = "https://test.api.amadeus.com/v1"
        self.access_token = None
        self.token_expiry = None
    
    def get_token(self):
        """Get OAuth2 access token"""
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
                self.token_expiry = datetime.now() + timedelta(seconds=result.get('expires_in', 1799))
                return self.access_token
        except Exception as e:
            print(f"Error getting token: {e}")
            return None
    
    def make_request(self, endpoint, params=None):
        """Make API request"""
        if not self.access_token or (self.token_expiry and datetime.now() > self.token_expiry):
            self.get_token()
        
        if not self.access_token:
            return None
        
        url = f"{self.base_url}/{endpoint}"
        if params:
            query_string = urllib.parse.urlencode(params)
            url = f"{url}?{query_string}"
        
        req = urllib.request.Request(url)
        req.add_header('Authorization', f'Bearer {self.access_token}')
        
        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            print(f"API request error: {e}")
            return None
    
    def search_flights(self, origin, destination, departure_date, adults=1):
        """Search for flights"""
        params = {
            'originLocationCode': origin,
            'destinationLocationCode': destination,
            'departureDate': departure_date,
            'adults': adults,
            'max': 10
        }
        return self.make_request('shopping/flight-offers', params)
    
    def search_hotels(self, city_code, adults=1):
        """Search for hotels"""
        params = {
            'cityCode': city_code,
            'adults': adults,
            'roomQuantity': 1,
            'bestRateOnly': True,
            'page[limit]': 10
        }
        return self.make_request('shopping/hotel-offers', params)

def main():
    # Test the client
    client = AmadeusClient(
        api_key="UevbFpsw6YmCJVWJOOMUmaG3ZUE06upK",
        api_secret="zB56MBy7LZuahyGK"
    )
    
    print("Testing Amadeus API...")
    
    # Get token
    token = client.get_token()
    if token:
        print(f"✓ Token obtained: {token[:20]}...")
        
        # Test flight search
        departure_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        flights = client.search_flights('LHR', 'CDG', departure_date)
        
        if flights and 'data' in flights:
            print(f"✓ Found {len(flights['data'])} flights")
            if flights['data']:
                first = flights['data'][0]
                price = first.get('price', {}).get('total', 'N/A')
                currency = first.get('price', {}).get('currency', 'N/A')
                print(f"  Sample: {price} {currency}")
        
        # Test hotel search
        hotels = client.search_hotels('PAR')
        if hotels and 'data' in hotels:
            print(f"✓ Found {len(hotels['data'])} hotels")
            if hotels['data']:
                first = hotels['data'][0]
                hotel_name = first.get('hotel', {}).get('name', 'N/A')
                print(f"  Sample: {hotel_name}")
    else:
        print("✗ Failed to get token")

if __name__ == "__main__":
    main()