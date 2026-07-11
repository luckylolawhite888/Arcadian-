#!/bin/bash

# Amadeus API test using curl
API_KEY="UevbFpsw6YmCJVWJOOMUmaG3ZUE06upK"
API_SECRET="zB56MBy7LZuahyGK"

echo "============================================================"
echo "AMADEUS API TEST (using curl)"
echo "============================================================"

echo -e "\n1. Getting access token..."
TOKEN_RESPONSE=$(curl -s -X POST "https://test.api.amadeus.com/v1/security/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=$API_KEY&client_secret=$API_SECRET")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "✗ Failed to get access token"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "✓ Access token obtained: ${ACCESS_TOKEN:0:20}..."

echo -e "\n2. Testing flight search (LHR to CDG)..."
FLIGHT_RESPONSE=$(curl -s -X GET "https://test.api.amadeus.com/v1/shopping/flight-offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -G \
  --data-urlencode "originLocationCode=LHR" \
  --data-urlencode "destinationLocationCode=CDG" \
  --data-urlencode "departureDate=$(date -d "+7 days" +%Y-%m-%d)" \
  --data-urlencode "adults=1" \
  --data-urlencode "max=3")

if echo "$FLIGHT_RESPONSE" | grep -q "data"; then
    FLIGHT_COUNT=$(echo "$FLIGHT_RESPONSE" | grep -o '"id":"[^"]*' | wc -l)
    echo "✓ Flight search successful! Found $FLIGHT_COUNT flights"
    
    # Extract price from first flight
    PRICE=$(echo "$FLIGHT_RESPONSE" | grep -o '"total":"[^"]*' | head -1 | cut -d'"' -f3)
    CURRENCY=$(echo "$FLIGHT_RESPONSE" | grep -o '"currency":"[^"]*' | head -1 | cut -d'"' -f3)
    if [ -n "$PRICE" ]; then
        echo "  Sample price: $PRICE $CURRENCY"
    fi
else
    echo "✗ Flight search failed"
    echo "Response: $FLIGHT_RESPONSE"
fi

echo -e "\n3. Testing hotel search (Paris)..."
HOTEL_RESPONSE=$(curl -s -X GET "https://test.api.amadeus.com/v1/shopping/hotel-offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -G \
  --data-urlencode "cityCode=PAR" \
  --data-urlencode "adults=1" \
  --data-urlencode "roomQuantity=1" \
  --data-urlencode "bestRateOnly=true" \
  --data-urlencode "page[limit]=2")

if echo "$HOTEL_RESPONSE" | grep -q "data"; then
    HOTEL_COUNT=$(echo "$HOTEL_RESPONSE" | grep -o '"type":"hotel-offer"' | wc -l)
    echo "✓ Hotel search successful! Found $HOTEL_COUNT hotels"
    
    # Extract hotel name and price
    HOTEL_NAME=$(echo "$HOTEL_RESPONSE" | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f3)
    HOTEL_PRICE=$(echo "$HOTEL_RESPONSE" | grep -o '"total":"[^"]*' | head -1 | cut -d'"' -f3)
    if [ -n "$HOTEL_NAME" ]; then
        echo "  Sample hotel: $HOTEL_NAME"
        if [ -n "$HOTEL_PRICE" ]; then
            echo "  Sample price: $HOTEL_PRICE"
        fi
    fi
else
    echo "✗ Hotel search failed"
    echo "Response: $HOTEL_RESPONSE"
fi

echo -e "\n============================================================"
echo "TEST COMPLETE"
echo "============================================================"