#!/usr/bin/env python3
import requests
import json
import base64
from datetime import datetime, timedelta

# Load credentials
with open('/home/node/.openclaw/workspace/amadeus_credentials.json', 'r') as f:
    creds = json.load(f)

API_KEY = creds['api_key']
API_SECRET = creds['api_secret']
BASE_URL = creds['base_url']  # Using test environment

def get_access_token():
    """Get OAuth2 access token from Amadeus"""
    url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    data = {
        'grant_type': 'client_credentials',
        'client_id': API_KEY,
        'client_secret': API_SECRET
    }
    
    try:
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        token_data = response.json()
        return token_data.get('access_token')
    except Exception as e:
        print(f"Error getting access token: {e}")
        if response:
            print(f"Response: {response.text}")
        return None

def test_flight_search(access_token):
    """Test flight search API"""
    print("Testing Flight Search API...")
    
    # Set dates for next week
    departure_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
    return_date = (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d')
    
    url = f"{BASE_URL}/shopping/flight-offers"
    
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    params = {
        'originLocationCode': 'LHR',  # London Heathrow
        'destinationLocationCode': 'CDG',  # Paris Charles de Gaulle
        'departureDate': departure_date,
        'adults': 1,
        'max': 5  # Max number of results
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        results = response.json()
        
        print(f"✓ Flight search successful!")
        print(f"Found {len(results.get('data', []))} flight offers")
        
        # Show first result if available
        if results.get('data'):
            first_flight = results['data'][0]
            print(f"\nSample flight:")
            print(f"  Price: {first_flight.get('price', {}).get('total')} {first_flight.get('price', {}).get('currency')}")
            print(f"  Airlines: {', '.join([segment.get('carrierCode', '') for segment in first_flight.get('itineraries', [{}])[0].get('segments', [])])}")
        
        return True
    except Exception as e:
        print(f"✗ Flight search failed: {e}")
        if response:
            print(f"Response: {response.text}")
        return False

def test_hotel_search(access_token):
    """Test hotel search API"""
    print("\nTesting Hotel Search API...")
    
    url = f"{BASE_URL}/shopping/hotel-offers"
    
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    # Search for hotels in Paris
    params = {
        'cityCode': 'PAR',
        'adults': 1,
        'roomQuantity': 1,
        'bestRateOnly': True,
        'radius': 5,
        'radiusUnit': 'KM',
        'paymentPolicy': 'NONE',
        'includeClosed': False,
        'view': 'FULL',
        'sort': 'DISTANCE',
        'page[limit]': 3
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        results = response.json()
        
        print(f"✓ Hotel search successful!")
        print(f"Found {len(results.get('data', []))} hotel offers")
        
        # Show first result if available
        if results.get('data'):
            first_hotel = results['data'][0]
            hotel_info = first_hotel.get('hotel', {})
            offers = first_hotel.get('offers', [])
            
            if offers:
                print(f"\nSample hotel:")
                print(f"  Name: {hotel_info.get('name', 'Unknown')}")
                print(f"  Rating: {hotel_info.get('rating', 'N/A')}")
                print(f"  Price: {offers[0].get('price', {}).get('total')} {offers[0].get('price', {}).get('currency')}")
        
        return True
    except Exception as e:
        print(f"✗ Hotel search failed: {e}")
        if response:
            print(f"Response: {response.text}")
        return False

def main():
    print("=" * 60)
    print("AMADEUS API TEST")
    print("=" * 60)
    
    # Get access token
    print("\n1. Getting access token...")
    access_token = get_access_token()
    
    if not access_token:
        print("✗ Failed to get access token. Check credentials.")
        return
    
    print(f"✓ Access token obtained successfully!")
    
    # Test APIs
    flight_success = test_flight_search(access_token)
    hotel_success = test_hotel_search(access_token)
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY:")
    print("=" * 60)
    print(f"Access Token: {'✓' if access_token else '✗'}")
    print(f"Flight Search: {'✓' if flight_success else '✗'}")
    print(f"Hotel Search: {'✓' if hotel_success else '✗'}")
    
    if access_token and (flight_success or hotel_success):
        print("\n✅ Amadeus API setup successful!")
        print("You can now use flight and hotel search capabilities.")
    else:
        print("\n❌ Some tests failed. Check credentials and API access.")

if __name__ == "__main__":
    main()