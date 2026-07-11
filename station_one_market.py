#!/usr/bin/env python3
"""Market data snapshot for Station One briefing"""
import urllib.request
import json

SYMBOLS = {
    "WTI Crude Oil": "CL=F",
    "Brent Crude": "BZ=F",
    "Gold (XAU)": "GC=F",
    "VIX": "^VIX",
    "S&P 500": "^GSPC",
    "Bitcoin": "BTC-USD",
    "Nasdaq 100": "^NDX",
    "10Y Treasury Yield": "^TNX",
}

def fetch_price(symbol):
    try:
        req = urllib.request.Request(
            f'https://query1.finance.yahoo.com/v8/finance/chart/{urllib.request.quote(symbol, safe="")}?interval=1d&range=3d',
            headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        result = data['chart']['result'][0]
        quotes = result['indicators']['quote'][0]['close']
        meta = result['meta']
        price = meta.get('regularMarketPrice', quotes[-1] if quotes else None)
        prev = quotes[-2] if len(quotes) > 1 else price
        if price and prev and prev != 0:
            change_pct = ((price - prev) / prev) * 100
            return price, change_pct
        return price, 0
    except Exception as e:
        return None, 0

def get_market_snapshot():
    """Get formatted market data"""
    lines = []
    for name, sym in SYMBOLS.items():
        price, change = fetch_price(sym)
        if price is not None:
            arrow = "🔺" if change > 0 else "🔻" if change < 0 else "➡️"
            if isinstance(price, float):
                if price > 1000:
                    lines.append(f"  {arrow} **{name}:** ${price:,.0f} ({change:+.2f}%)")
                elif price > 100:
                    lines.append(f"  {arrow} **{name}:** ${price:,.0f} ({change:+.2f}%)")
                else:
                    lines.append(f"  {arrow} **{name}:** ${price:,.2f} ({change:+.2f}%)")
            else:
                lines.append(f"  {arrow} **{name}:** {price} ({change:+.2f}%)")
        else:
            lines.append(f"  ⚪ **{name}:** unavailable")
    
    return "\n".join(lines)

def format_market_json():
    """Return structured market data for use in briefing generation"""
    data = {}
    for name, sym in SYMBOLS.items():
        price, change = fetch_price(sym)
        data[name] = {"price": price, "change_pct": round(change, 2)} if price else None
    return data

if __name__ == "__main__":
    print(get_market_snapshot())
