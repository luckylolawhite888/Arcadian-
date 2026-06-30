---
name: travel-deals
description: Find flight and hotel deals using Amadeus API
version: 1.0
author: Lola
created: 2026-05-16
---

# Travel Deals System

## Amadeus API
- **Provider:** Amadeus Self-Service API
- **Status:** Flight search working, hotel search available
- **Integration:** Included in morning briefing as "Travel Deal of the Day"

## Flight Search
Search for cheapest flights from London (LHR/LGW/STN) to European cities.
- Budget: Under €300 return
- Destinations: Random selection of European cities
- Output: 3 flight deals with witty commentary

## Hotel Search
- API endpoint available — flights verified working, hotels awaiting integration
- Target: 3+ star hotels in deal destinations
- Price range: Under €200/night

## Files
- `travel_deal_system.py` — Flight deal finder
- `enhanced_travel_system.py` — Full travel + hotel + tip generator
- `today_travel_deal.txt` — Cache file for morning briefing

## Sample Results
- Madrid: €94 return
- Paris: €117 return
- Various European destinations available

## Style
- Witty commentary per destination
- Travel tip of the day
- Closing: "Remember: the best stories start with questionable decisions"
