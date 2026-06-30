---
name: rightmove-scraper
description: Scrape Rightmove UK property listings via Apify API — for-sale, to-rent, agent pages, price changes
---

# Rightmove Scraper Skill

Scrape Rightmove.co.uk property listings using Apify's `kawsar~rightmove-scraper` actor (free tier).

## Setup

### Apify Account
- **User:** expert_janitor (luckylolawhite@gmail.com)
- **API Token:** Search memory for `apify_api`
- **Free Tier:** $5/month credits, no credit card needed
- **Actor:** `kawsar~rightmove-scraper` — free to use (no rental required)

### API Pattern

```python
import urllib.request, json

APIFY_TOKEN = "..."  # from memory
ACTOR = "kawsar~rightmove-scraper"

# Run a scrape
body = json.dumps({
    "searchUrl": "https://www.rightmove.co.uk/property-for-sale/N14.html",
    "maxItems": 10,
    "proxy": {"useApifyProxy": True}
}).encode()

req = urllib.request.Request(
    f"https://api.apify.com/v2/acts/{ACTOR}/runs?token={APIFY_TOKEN}",
    data=body,
    headers={"Content-Type": "application/json"}
)
resp = json.loads(urllib.request.urlopen(req).read())
run_id = resp["data"]["id"]
```

### Working Search URLs for Kingsley (N14 area)

| Type | URL |
|------|-----|
| For Sale | `https://www.rightmove.co.uk/property-for-sale/N14.html` |
| To Rent | `https://www.rightmove.co.uk/property-to-rent/N14.html` |

### Data Per Property
- `address`, `price`, `bedrooms`, `url`, `description`, `latitude`, `longitude`

### Cost
- ~$0.70-$2 per 1000 properties — pennies for daily area scrapes

## Kingsley OS Integration
1. Daily cron → scrape N14 for-sale + to-rent
2. Compare with previous day for NEW listings
3. Auto-import into GHL as opportunities
4. Alert Ali on WhatsApp

## Notes
- Proxy required (`useApifyProxy: true`) — included in free tier
- Runs complete in 5-15s for small scrapes
