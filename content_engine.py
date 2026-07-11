#!/usr/bin/env python3
"""
Ad Farm Content Engine v1 — Bulk page generator
Generates SEO-optimised HTML pages for all 6 sites.
SSH: key at /home/node/.ssh/ionos_ubuntu, host 212.227.93.74, user root
"""

import os, sys, json

# ── Site config ──────────────────────────────────────────────
SITES = {
    "coupn": {
        "domain": "www.coupn.uk",
        "dirs": ["/var/www/coupn.uk/public"],
        "slots": {"header": "7029255420", "incontent": "8504468716", "footer": "5627023935"},
    },
    "cheapfind": {
        "domain": "www.cheapfind.uk",
        "dirs": ["/var/www/cheapfind.uk/public"],
        "slots": {"header": "3525124687", "footer": "8125194764"},
    },
    "isitdownrightnow": {
        "domain": "www.isitdownrightnow.co.uk",
        "dirs": ["/var/www/isitdownrightnow.co.uk/public"],
        "slots": {"header": "1751358101", "footer": "7699643185"},
    },
    "pdfoomph": {
        "domain": "www.pdfoomph.com",
        "dirs": ["/var/www/pdfoomph.com/public"],
        "slots": {"header": "3908268067", "footer": "6893524050"},
    },
    "toolstack": {
        "domain": "www.toolstack.uk",
        "dirs": ["/var/www/toolstack.uk/public"],
        "slots": {"main": "5772014074"},
    },
    "ukcbdc": {
        "domain": "www.uk-cbdc.co.uk",
        "dirs": ["/var/www/uk-cbdc.co.uk/public"],
        "slots": {"incontent": "8316766455"},
    },
}

PUB_ID = "ca-pub-9534114738328693"

# ── Helper ───────────────────────────────────────────────────
def ad_block(slot_id):
    return f'''
    <ins class="adsbygoogle" style="display:block" data-ad-client="{PUB_ID}" data-ad-slot="{slot_id}" data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>'''

def head_boilerplate(title, desc, keywords, domain, path):
    return f'''<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="keywords" content="{keywords}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<link rel="canonical" href="https://{domain}{path}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="https://{domain}{path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{domain.split(".")[0].capitalize()}">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={PUB_ID}" crossorigin="anonymous"></script>
<script type="application/ld+json">{{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "{title}",
  "description": "{desc}",
  "url": "https://{domain}{path}"
}}</script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:-apple-system,system-ui,sans-serif;background:#f8fafc;color:#1a1a2e;line-height:1.7;min-height:100vh;display:flex;flex-direction:column}}
.container{{max-width:780px;margin:0 auto;padding:24px 20px;flex:1}}
h1{{font-size:2em;margin-bottom:16px;color:#111827}}
h2{{font-size:1.35em;margin:28px 0 12px;color:#1f2937}}
p{{margin-bottom:14px;color:#374151}}
ul{{margin:0 0 16px 20px}}
li{{margin-bottom:6px;color:#374151}}
.cta{{background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:#fff;padding:16px 28px;border-radius:12px;display:inline-block;text-decoration:none;font-weight:700;margin:12px 0 20px}}
.cta:hover{{opacity:0.9}}
.ad-wrap{{max-width:728px;margin:20px auto;min-height:90px}}
footer{{background:#1e293b;color:#94a3b8;text-align:center;padding:28px 20px;font-size:.85em;margin-top:30px}}
footer a{{color:#7dd3fc;text-decoration:none}}
</style>
</head>
<body>
<div class="container">'''

def footer_block(domain):
    return f'''</div>
<div class="ad-wrap">{ad_block("5772014074" if "toolstack" in domain else "8316766455" if "uk-cbdc" in domain else "8125194764" if "cheapfind" in domain else "7699643185" if "isitdownrightnow" in domain else "6893524050" if "pdfoomph" in domain else "5627023935")}</div>
<footer><p>© 2026 <a href="https://{domain}">{domain}</a> — Free tools and deals for everyone.</p></footer>
</body>
</html>'''


# ── COUPN: 50 store pages ─────────────────────────────────────
COUPN_STORES = [
    ("argos-vouchers", "Argos", "Argos voucher codes, promo codes and discount deals for 2026. Save on toys, electronics, furniture and more with verified Argos coupons.", ["Argos vouchers", "Argos promo codes", "Argos discount codes UK", "cheap toys Argos"]),
    ("currys-promo-codes", "Currys", "Currys promo codes and voucher codes for 2026. Save on laptops, TVs, appliances and tech with verified Currys discount codes.", ["Currys promo codes", "Currys voucher codes", "Currys discount UK", "cheap laptops Currys"]),
    ("boots-offers", "Boots", "Boots offers, voucher codes and discount deals for 2026. Save on beauty, health, pharmacy and fragrances with verified Boots coupons.", ["Boots vouchers", "Boots offers", "Boots discount codes", "Boots advantage card deals"]),
    ("sainsburys-vouchers", "Sainsbury's", "Sainsbury's voucher codes and discount deals for 2026. Save on groceries, clothing, home and electronics with verified Sainsbury's coupons.", ["Sainsbury's vouchers", "Sainsbury's discount codes", "Sainsbury's offers", "Nectar card deals"]),
    ("asda-discounts", "Asda", "Asda discounts, voucher codes and money-saving deals for 2026. Save on groceries, clothing, home and George range with verified Asda coupons.", ["Asda discount codes", "Asda vouchers", "Asda George deals", "cheap groceries Asda"]),
    ("tesco-vouchers", "Tesco", "Tesco voucher codes and discount deals for 2026. Save on groceries, clothing, electronics and fuel with verified Tesco coupon codes.", ["Tesco vouchers", "Tesco discounts", "Tesco Clubcard deals", "Tesco grocery offers"]),
    ("next-clothing-deals", "Next", "Next clothing deals, voucher codes and discount offers for 2026. Save on fashion, homeware and accessories with verified Next coupons.", ["Next deals", "Next voucher codes", "Next clothing sale", "Next discount codes"]),
    ("nike-discounts", "Nike", "Nike discounts, promo codes and sale deals for 2026. Save on trainers, sportswear, clothing and accessories with verified Nike coupon codes.", ["Nike discount codes", "Nike promo codes", "cheap Nike trainers", "Nike sale UK"]),
    ("adidas-promo", "Adidas", "Adidas promo codes, discounts and sale deals for 2026. Save on trainers, sportswear, Originals and performance gear with verified Adidas coupons.", ["Adidas promo codes", "Adidas discount UK", "Adidas sale", "cheap Adidas trainers"]),
    ("zara-vouchers", "Zara", "Zara voucher codes and sale deals for 2026. Save on fashion, clothing and accessories with verified Zara discount codes.", ["Zara vouchers", "Zara discount codes", "Zara sale UK", "cheap Zara clothes"]),
    ("marks-and-spencer", "M&S", "Marks & Spencer voucher codes and discount deals for 2026. Save on clothing, food, homeware and beauty with verified M&S coupons.", ["M&S vouchers", "Marks and Spencer deals", "M&S discount codes", "M&S food offers"]),
    ("john-lewis-vouchers", "John Lewis", "John Lewis voucher codes and discount deals for 2026. Save on electronics, home, fashion and beauty with verified John Lewis coupons.", ["John Lewis vouchers", "John Lewis discount codes", "John Lewis deals", "John Lewis price match"]),
    ("superdrug-offers", "Superdrug", "Superdrug offers, voucher codes and discount deals for 2026. Save on beauty, skincare, health and makeup with verified Superdrug coupons.", ["Superdrug offers", "Superdrug vouchers", "Superdrug discount codes", "Superdrug beauty deals"]),
    ("morrisons-deals", "Morrisons", "Morrisons deals, voucher codes and discount offers for 2026. Save on groceries, fresh food and household with verified Morrisons coupons.", ["Morrisons deals", "Morrisons vouchers", "Morrisons discount codes", "Morrisons More card"]),
    ("aldi-vouchers", "Aldi", "Aldi voucher codes and specialbuys deals for 2026. Save on groceries, home, garden and weekly offers with verified Aldi deals.", ["Aldi vouchers", "Aldi specialbuys", "Aldi deals UK", "Aldi offers this week"]),
    ("lidl-discounts", "Lidl", "Lidl discounts, weekly offers and voucher codes for 2026. Save on groceries, bakery, middle aisle finds and household with verified Lidl deals.", ["Lidl discounts", "Lidl weekly offers", "Lidl vouchers", "Lidl middle aisle"]),
    ("bandq-vouchers", "B&Q", "B&Q voucher codes and discount deals for 2026. Save on DIY, tools, paint, garden and home improvement with verified B&Q coupons.", ["B&Q vouchers", "B&Q discount codes", "DIY vouchers UK", "B&Q sale"]),
    ("screwfix-deals", "Screwfix", "Screwfix deals, promo codes and discount offers for 2026. Save on tools, electrical, plumbing and building supplies with verified Screwfix coupons.", ["Screwfix deals", "Screwfix promo codes", "Screwfix discount", "trade tools deals"]),
    ("dunelm-offers", "Dunelm", "Dunelm offers, voucher codes and sale deals for 2026. Save on homeware, curtains, furniture, bedding and home decor with verified Dunelm coupons.", ["Dunelm offers", "Dunelm vouchers", "Dunelm discount codes", "Dunelm sale"]),
    ("therange-vouchers", "The Range", "The Range voucher codes and discount deals for 2026. Save on home, garden, arts & crafts, furniture and gifts with verified The Range coupons.", ["The Range vouchers", "The Range discount codes", "The Range deals", "homeware deals"]),
    ("matalan-deals", "Matalan", "Matalan deals, voucher codes and discount offers for 2026. Save on clothing, homeware and family fashion with verified Matalan coupons.", ["Matalan deals", "Matalan voucher codes", "Matalan discount", "Matalan sale"]),
    ("primark-vouchers", "Primark", "Primark voucher codes and sale deals for 2026. Save on clothing, homeware and beauty with verified Primark discount codes and offers.", ["Primark vouchers", "Primark deals", "Primark discount codes", "cheap Primark clothes"]),
    ("tk-maxx", "TK Maxx", "TK Maxx voucher codes and discount deals for 2026. Save on designer fashion, homeware, beauty and gifts with verified TK Maxx coupons.", ["TK Maxx vouchers", "TK Maxx deals", "TK Maxx discount", "designer deals TK Maxx"]),
    ("asos-promo", "ASOS", "ASOS promo codes and discount deals for 2026. Save on fashion, clothing, accessories and beauty with verified ASOS coupon codes.", ["ASOS promo codes", "ASOS discount codes", "ASOS sale", "ASOS student discount"]),
    ("amazon-uk-deals", "Amazon UK", "Amazon UK deals, voucher codes and discount offers for 2026. Save on electronics, fashion, home and more with verified Amazon UK coupon codes.", ["Amazon UK deals", "Amazon discount codes", "Amazon vouchers", "Amazon Prime deals"]),
    ("ebay-uk-discounts", "eBay UK", "eBay UK discount codes and voucher deals for 2026. Save on electronics, fashion, collectibles and more with verified eBay UK promo codes.", ["eBay UK discount codes", "eBay vouchers", "eBay promo codes", "eBay deals UK"]),
    ("very-vouchers", "Very", "Very voucher codes and discount deals for 2026. Save on electronics, fashion, home and toys with verified Very.co.uk coupons.", ["Very vouchers", "Very discount codes", "Very.co.uk deals", "Very credit account"]),
    ("ao-vouchers", "AO", "AO voucher codes and discount deals for 2026. Save on washing machines, fridges, TVs and appliances with verified AO.com coupons.", ["AO vouchers", "AO discount codes", "AO deals", "appliance deals UK"]),
    ("wayfair-deals", "Wayfair", "Wayfair deals, voucher codes and discount offers for 2026. Save on furniture, home decor and garden with verified Wayfair UK coupons.", ["Wayfair deals", "Wayfair discount codes", "Wayfair vouchers", "furniture deals UK"]),
    ("ikea-offers", "IKEA", "IKEA offers, voucher codes and discount deals for 2026. Save on furniture, home accessories and kitchen with verified IKEA UK deals.", ["IKEA offers", "IKEA deals", "IKEA discount codes", "IKEA family card"]),
    ("homebase-vouchers", "Homebase", "Homebase voucher codes and discount deals for 2026. Save on garden, DIY, paint, tools and home improvement with verified Homebase coupons.", ["Homebase vouchers", "Homebase discount codes", "Homebase deals", "garden centre offers"]),
    ("wickes-deals", "Wickes", "Wickes deals, promo codes and discount offers for 2026. Save on DIY, building supplies, kitchen and bathroom with verified Wickes coupons.", ["Wickes deals", "Wickes promo codes", "Wickes discount", "DIY vouchers"]),
    ("pets-at-home", "Pets at Home", "Pets at Home voucher codes and discount deals for 2026. Save on pet food, toys, accessories and vet services with verified Pets at Home coupons.", ["Pets at Home vouchers", "Pets at Home discount", "pet deals UK", "pet food offers"]),
    ("halfords-promo", "Halfords", "Halfords promo codes and discount deals for 2026. Save on cycling, motoring, car accessories and bike servicing with verified Halfords coupons.", ["Halfords promo codes", "Halfords discount", "bike deals UK", "car accessories deals"]),
    ("boots-beauty-offers", "Boots Beauty", "Boots beauty offers, voucher codes and discount deals for 2026. Save on makeup, skincare, haircare and fragrances with verified Boots beauty coupons.", ["Boots beauty offers", "Boots makeup deals", "Boots skincare discount", "Boots fragrance sale"]),
    ("cult-beauty", "Cult Beauty", "Cult Beauty voucher codes and discount deals for 2026. Save on premium skincare, makeup and haircare with verified Cult Beauty coupons.", ["Cult Beauty vouchers", "Cult Beauty discount", "premium beauty deals", "Cult Beauty sale"]),
    ("lookfantastic", "Lookfantastic", "Lookfantastic promo codes and discount deals for 2026. Save on beauty, haircare, skincare and cosmetics with verified Lookfantastic coupons.", ["Lookfantastic promo codes", "Lookfantastic discount", "beauty box deals", "Lookfantastic sale"]),
    ("holland-and-barrett", "Holland & Barrett", "Holland & Barrett voucher codes and discount deals for 2026. Save on vitamins, supplements, health foods and skincare with verified H&B coupons.", ["Holland & Barrett vouchers", "H&B discount", "vitamin deals UK", "health food offers"]),
    ("the-body-shop", "The Body Shop", "The Body Shop voucher codes and discount deals for 2026. Save on skincare, body care, makeup and gifts with verified The Body Shop coupons.", ["The Body Shop vouchers", "The Body Shop discount", "vegan beauty deals", "Body Shop sale"]),
]

def coupn_category_pages():
    cats = [
        ("fashion-vouchers", "Fashion Vouchers", "Save on clothing, shoes and accessories with the best fashion voucher codes in the UK. Top brands including Nike, Adidas, ASOS, Zara and more.", ["fashion vouchers UK", "clothing discount codes", "fashion promo codes"]),
        ("grocery-vouchers", "Grocery Vouchers", "Save on your weekly food shop with grocery voucher codes for Tesco, Sainsbury's, Asda, Morrisons, Aldi, Lidl and more.", ["grocery vouchers UK", "supermarket discount codes", "food shopping deals"]),
        ("electronics-deals", "Electronics Deals", "Save on laptops, TVs, phones and gadgets with electronics voucher codes for Currys, AO, Amazon, Very and more.", ["electronics deals UK", "tech voucher codes", "laptop discounts", "TV deals"]),
        ("beauty-deals", "Beauty Deals", "Save on makeup, skincare, haircare and fragrances with beauty voucher codes for Boots, Superdrug, Cult Beauty, Lookfantastic and more.", ["beauty deals UK", "makeup discount codes", "skincare vouchers", "fragrance offers"]),
        ("home-and-garden", "Home & Garden Vouchers", "Save on furniture, homeware, DIY and garden with home and garden voucher codes for B&Q, Dunelm, IKEA, Wayfair and more.", ["home vouchers UK", "garden deals", "furniture discount codes", "DIY offers"]),
    ]
    pages = []
    for slug, name, desc, kws in cats:
        kw_str = ", ".join(kws)
        body = f'''<h1>{name} — Top UK Voucher Codes for 2026</h1>
<p>Looking to save on {name.lower()}? You've come to the right place. We've rounded up the best verified {name.lower()} voucher codes and discount deals from the UK's top retailers. Whether you're shopping for yourself or looking for a gift, these coupons will help you keep more money in your pocket.</p>
<h2>Why Use Voucher Codes?</h2>
<p>Voucher codes are an easy way to save money on your shopping. With the cost of living continuing to rise in the UK, every penny counts. Using a simple promo code at checkout can save you anywhere from 10% to 50% or more on your purchase.</p>
<h2>Tips for Getting the Best Deals</h2>
<ul>
<li><strong>Check back regularly</strong> — New deals are added daily across our partner stores</li>
<li><strong>Sign up for newsletters</strong> — Many retailers send exclusive discount codes to subscribers</li>
<li><strong>Compare prices</strong> — Don't just use the first code you find; compare offers across different stores</li>
<li><strong>Look for clearance sales</strong> — Combining a sale with a voucher code can lead to massive savings</li>
<li><strong>Use cashback sites</strong> — Stack your voucher code with cashback from TopCashback or Quidco</li>
</ul>
<h2>Popular {name} Stores</h2>
<p>Some of the most popular stores for {name.lower()} in the UK include a wide range of online and high-street retailers. We regularly update our voucher codes to make sure you always have access to working discounts. Bookmark this page and check back often for the latest offers.</p>
<h2>How to Use a Voucher Code</h2>
<p>Using a voucher code is simple. Find the code you want to use, copy it, then paste it into the promo code box at the checkout page of your chosen retailer. Click apply and the discount will be deducted from your total. If the code doesn't work, try a different one from our list.</p>
'''.replace("'", "\\'")
        pages.append((slug, f"{name} — Best UK Voucher Codes for 2026", desc, kw_str, body))
    return pages

def cta_store_link(name):
    return f'<p><a href="/" class="cta">Browse all {name} deals →</a></p>'

def make_coupn():
    """Generate coupn.uk pages — 30 store pages + 20 category/guide pages = 50+"""
    generated = []
    dir_path = SITES["coupn"]["dirs"][0]
    
    # Store pages
    for slug, name, desc, kws in COUPN_STORES:
        kw_str = ", ".join(kws)
        body = f'''<h1>{name} Voucher Codes & Discount Deals — 2026</h1>
<p>Looking for the latest {name.lower()} voucher codes and discount deals? You've found the right place. We've collected the best verified {name.lower()} promo codes to help you save money on your shopping in the UK.</p>
<h2>Why Shop at {name}?</h2>
<p>{name} is one of the UK's most popular retailers, known for great products and customer service. But why pay full price when you can save with a voucher code? Whether you're buying for yourself or as a gift, a quick discount code can make a real difference to your total.</p>
<h2>Types of Deals Available</h2>
<ul>
<li>Percentage off your total order</li>
<li>Fixed amount discount (e.g. £10 off when you spend £50)</li>
<li>Free delivery on orders over a certain amount</li>
<li>Buy one get one free (BOGO) offers</li>
<li>Seasonal sales and clearance events</li>
</ul>
<h2>How to Save More</h2>
<p>Combine your {name.lower()} voucher code with a sale for maximum savings. Sign up for their newsletter to get exclusive deals straight to your inbox. If you're a student, check if they offer a student discount scheme. Using a cashback website like TopCashback can also add extra savings on top of your coupon.</p>
<h2>Latest Deals at {name}</h2>
<p>We update our {name.lower()} deals regularly so you always have access to working discount codes. Check back often — new offers appear frequently and popular codes can sell out fast. Bookmark this page and never miss a saving opportunity at {name}.</p>
'''.replace("'", "\\'")
        html = head_boilerplate(f"{name} Voucher Codes & Discount Deals — 2026", desc, kw_str, SITES["coupn"]["domain"], f"/{slug}.html")
        html += f'<div class="ad-wrap">{ad_block("7029255420")}</div>' + body + f'<div class="ad-wrap">{ad_block("8504468716")}</div>' + footer_block("www.coupn.uk")
        generated.append((f"{dir_path}/{slug}.html", html))
    
    # Category pages
    for slug, name, desc, kw_str, body in coupn_category_pages():
        html = head_boilerplate(name, desc, kw_str, SITES["coupn"]["domain"], f"/{slug}.html")
        html += f'<div class="ad-wrap">{ad_block("7029255420")}</div>' + body + f'<div class="ad-wrap">{ad_block("8504468716")}</div>' + footer_block("www.coupn.uk")
        generated.append((f"{dir_path}/{slug}.html", html))
    
    # Guide pages
    guides = [
        ("how-to-save-money-uk", "How to Save Money in the UK — 2026 Guide", "Practical money-saving tips for UK households in 2026. From grocery hacks to energy bills, learn how to keep more of your hard-earned cash.", "save money UK, money saving tips, frugal living UK, household savings UK",
         "<h1>How to Save Money in the UK — 2026 Guide</h1><p>With the cost of living remaining high in 2026, saving money has never been more important. Here are practical tips to help you keep more of your hard-earned cash, from the weekly food shop to your energy bills.</p><h2>1. Use Voucher Codes for Everything</h2><p>Never pay full price again. Whether you're buying clothes, electronics, or groceries, always search for a voucher code first. Sites like ours collect the latest verified deals so you don't have to hunt around.</p><h2>2. Switch Energy Suppliers</h2><p>Energy prices are still a major expense for UK households. Use comparison sites to find the best deal and switch suppliers regularly. Even saving £10-20 a month adds up over the year.</p><h2>3. Meal Plan and Batch Cook</h2><p>Planning your meals for the week reduces food waste and helps you avoid expensive impulse buys at the supermarket. Batch cooking saves time and money — cook once, eat twice.</p><h2>4. Cancel Unused Subscriptions</h2><p>Check your bank statements for subscriptions you no longer use. Gym memberships, streaming services, and magazine subscriptions can quietly drain your account each month. Cancel anything you haven't used in the last 30 days.</p><h2>5. Use Cashback Sites</h2><p>Sites like TopCashback and Quidco give you money back on purchases you'd make anyway. Stack cashback with a voucher code for double savings on everything from your weekly shop to a new laptop.</p><h2>6. Buy Second-Hand</h2><p>eBay, Vinted, Facebook Marketplace, and charity shops are goldmines for bargains. Clothes, furniture, electronics, and books can all be found for a fraction of the retail price.</p>"
        ),
        ("best-time-to-buy-uk", "Best Time to Buy in the UK — Seasonal Shopping Calendar", "When is the best time to buy in the UK? A complete seasonal shopping calendar showing the cheapest times for electronics, furniture, fashion and more.", "best time to buy UK, seasonal sales UK, when to buy electronics UK, UK shopping calendar",
         "<h1>Best Time to Buy in the UK — Seasonal Shopping Calendar</h1><p>Did you know you can save hundreds of pounds just by timing your purchases right? Here's when to buy what in the UK.</p><h2>January — Boxing Day & January Sales</h2><p>The biggest sales of the year. Up to 70% off on electronics, furniture, fashion, and homeware. Boxing Day (Dec 26) is the start, but prices keep dropping through January. Best for: TVs, laptops, white goods, gym equipment.</p><h2>March-April — Easter Sales</h2><p>Home and garden deals appear as spring arrives. DIY tools, garden furniture, and paint go on sale. Best for: garden furniture, DIY supplies, spring fashion.</p><h2>June — Summer Sales</h2><p>Mid-year sales from most major retailers. Good time to buy outdoor gear, summer clothing, and BBQ equipment. Best for: outdoor gear, summer fashion, camping equipment.</p><h2>July — Amazon Prime Day</h2><p>Huge discounts exclusively for Prime members. Electronics, smart home devices, and kitchen appliances see major price drops. Best for: Amazon devices, electronics, kitchen gadgets.</p><h2>November — Black Friday</h2><p>The biggest shopping event of the year. Up to 80% off across almost every category. But check prices beforehand — some retailers inflate prices before the sale. Best for: everything, but especially TVs, laptops, and luxury items.</p><h2>December — Christmas Sales</h2><p>Last-minute deals appear from mid-December as retailers try to clear stock. Boxing Day starts Dec 26 with massive clearance sales. Best for: gifts, toys, Christmas decorations (half price after Dec 25).</p>"
        ),
        ("voucher-code-tips", "Voucher Code Tips — How to Always Find a Working Discount Code", "Pro tips for finding working voucher codes every time. Never pay full price again with these simple strategies for finding UK discount codes that actually work.", "voucher code tips, how to find discount codes, working promo codes UK, never pay full price",
         "<h1>Voucher Code Tips — How to Always Find a Working Discount Code</h1><p>Ever tried a voucher code only to see 'code expired' or 'not valid for these items'? Here's how to find working codes every time.</p><h2>1. Search Multiple Sites</h2><p>Don't rely on one voucher site. Cross-check between different sources to find the best available code. Some sites have exclusives that others don't.</p><h2>2. Check Expiry Dates</h2><p>Most voucher codes have an expiry date. Always check when the code was last verified. A code that's months old is unlikely to work.</p><h2>3. Read the Terms</h2><p>Many codes have conditions — minimum spend, specific categories, or exclusions. Read the small print before you start shopping to avoid disappointment at checkout.</p><h2>4. Try Variations</h2><p>If a code doesn't work, try a slightly different version. Sometimes codes are case-sensitive. Try all caps, all lowercase, or removing spaces.</p><h2>5. Clear Your Basket</h2><p>Some codes only work on full-price items. Try removing sale items from your basket and applying the code again. If it works, you know the code excludes discounted products.</p><h2>6. Use Incognito Mode</h2><p>Some retailers show different prices or codes depending on your browsing history. Open an incognito/private window to see if a different offer appears.</p><h2>7. Sign Up for Newsletters</h2><p>Many brands offer a welcome discount (often 10-15% off) just for subscribing to their email list. Use a disposable email address if you don't want the spam.</p>"
        ),
    ]
    
    for slug, title, desc, kw_str, body in guides:
        html = head_boilerplate(title, desc, kw_str, SITES["coupn"]["domain"], f"/{slug}.html")
        html += f'<div class="ad-wrap">{ad_block("7029255420")}</div>' + body + f'<div class="ad-wrap">{ad_block("8504468716")}</div>' + footer_block("www.coupn.uk")
        generated.append((f"{dir_path}/{slug}.html", html))
    
    return generated


# ── CHEAPFIND: 40 deal pages ──────────────────────────────────
CHEAPFIND_DEALS = [
    ("tesco-deals", "Tesco Deals", "Best Tesco deals and offers for 2026. Save on groceries, clothing and household essentials.", ["Tesco deals", "Tesco offers", "Tesco Clubcard prices", "Tesco grocery offers"]),
    ("asda-deals", "Asda Deals", "Best Asda deals, offers and price match discounts for 2026. Save money on your weekly Asda shop.", ["Asda deals", "Asda offers", "Asda price match", "Asda George deals"]),
    ("sainsburys-deals", "Sainsbury's Deals", "Best Sainsbury's deals and Nectar card offers for 2026. Save on groceries, clothing and more.", ["Sainsbury's deals", "Sainsbury's offers", "Nectar card offers", "Sainsbury's discounts"]),
    ("morrisons-deals", "Morrisons Deals", "Best Morrisons deals, offers and More card discounts for 2026. Save on groceries, fresh food and household items.", ["Morrisons deals", "Morrisons offers", "Morrisons More card", "Morrisons discounts"]),
    ("aldi-deals", "Aldi Deals", "Best Aldi deals, specialbuys and weekly offers for 2026. Save on groceries, home and garden at Aldi.", ["Aldi deals", "Aldi specialbuys", "Aldi offers this week", "Aldi middle aisle"]),
    ("lidl-deals", "Lidl Deals", "Best Lidl deals, weekly offers and middle aisle finds for 2026. Save on groceries, tools and homeware.", ["Lidl deals", "Lidl weekly offers", "Lidl middle aisle", "Lidl discounts"]),
    ("iceland-deals", "Iceland Deals", "Best Iceland deals and frozen food offers for 2026. Save on frozen groceries, ready meals and everyday essentials.", ["Iceland deals", "Iceland offers", "Iceland frozen food", "Iceland discount codes"]),
    ("co-op-deals", "Co-op Deals", "Best Co-op deals and member prices for 2026. Save on groceries, meal deals and everyday essentials at Co-op.", ["Co-op deals", "Co-op offers", "Co-op membership", "Co-op meal deals"]),
    ("waitrose-deals", "Waitrose Deals", "Best Waitrose deals and myWaitrose offers for 2026. Save on premium groceries, fresh food and wines.", ["Waitrose deals", "Waitrose offers", "Waitrose myWaitrose", "Waitrose discounts"]),
    ("ocado-deals", "Ocado Deals", "Best Ocado deals and Smart Pass offers for 2026. Save on grocery delivery, brands and exclusive products.", ["Ocado deals", "Ocado offers", "Ocado Smart Pass", "Ocado delivery deals"]),
    ("m-and-s-food", "M&S Food Deals", "Best M&S food deals, dine-in offers and Dine In for Two promotions for 2026.", ["M&S food deals", "M&S dine in for two", "M&S food offers", "M&S grocery deals"]),
    ("farmfoods-deals", "Farmfoods Deals", "Best Farmfoods deals and frozen food offers for 2026. Save on frozen goods, meat and everyday essentials.", ["Farmfoods deals", "Farmfoods offers", "Farmfoods frozen food", "cheap frozen food UK"]),
    ("heron-f