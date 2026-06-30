---
name: propertydata-api
description: UK property valuations, sold prices, market data via PropertyData API
---

# PropertyData API Skill

UK property data API — valuations, sold prices, rental yields, demand, demographics.

## Setup
- **API Key:** Search memory for `RXN25RWFK4` or check `vault/propertydata.json`
- **Base URL:** `https://api.propertydata.co.uk`
- **Auth:** `?key=YOUR_API_KEY` query param or `Authorization: Bearer YOUR_API_KEY`
- **Plan:** 14-day free trial (500 credits), then £28/mo (2000 credits)
- **Trial ends:** May 30, 2026

## Key Endpoints

### Sold Prices
```
GET /sold-prices?key=KEY&postcode=N14%206
```
Returns: average price, range, individual sold prices with addresses, dates

### Market Demand
```
GET /demand?key=KEY&postcode=N14%206EE
```
Returns: buyer's/renter's market rating, months of inventory, days on market

### Property Valuation
```
GET /valuation-sale?key=KEY&postcode=N14%206EE&street=High+Street&number=30&property_type=flat&construction_date=1930
```
Returns: estimated current value

### Rental Yields
```
GET /yields?key=KEY&postcode=N14%206
```

### Land Registry Title (ownership check)
```
GET /title?key=KEY&postcode=N14%206EE
```
KYC — confirms who owns the property

## Usage for Kingsley OS
Ali messages Lola on WhatsApp:
- "Value 123 Acacia Avenue N14" → lookup + response
- "Sold prices EN2 last 6 months" → market report
- "What's the yield on this property?" → calculated

## Cost
- 1 credit per lookup
- 500 credits free trial, 2000/mo on £28 plan
- Land Registry, energy efficiency, planning = same 1 credit
