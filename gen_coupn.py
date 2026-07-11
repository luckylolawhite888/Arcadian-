#!/usr/bin/env python3
"""Generate 8 store coupon pages for coupn.uk"""
import os

BASE_CSS = """*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,Segoe UI,sans-serif;background:#f0fdf4;color:#1a1a2e}
header{background:linear-gradient(135deg,#059669,#10b981);color:#fff;padding:20px;text-align:center}
header h1{font-size:1.6em;font-weight:800;letter-spacing:-1px}
header a{color:#fff;text-decoration:none}
.hero{background:linear-gradient(135deg,#059669,#10b981);color:#fff;padding:40px 20px;text-align:center}
.hero h2{font-size:2.2em;font-weight:800;margin-bottom:8px}
.hero p{opacity:.9;font-size:1.05em}
.container{max-width:900px;margin:0 auto;padding:0 20px 40px}
.content{background:#fff;border-radius:14px;padding:30px;box-shadow:0 2px 16px rgba(0,0,0,.06);margin:20px 0}
.content h2{color:#059669;font-size:1.6em;margin-bottom:15px}
.content h3{color:#1a1a2e;font-size:1.2em;margin:20px 0 10px}
.content p{line-height:1.7;margin-bottom:12px;color:#444}
.content ul{margin:10px 0 15px 20px}
.content li{line-height:1.7;color:#444;margin-bottom:6px}
.highlight{background:#f0fdf4;border-left:4px solid #059669;padding:15px;margin:15px 0;border-radius:0 8px 8px 0}
.highlight strong{color:#059669}
.code-box{font-size:1.2em;font-weight:800;font-family:monospace;letter-spacing:1px;background:#f0fdf4;color:#059669;padding:12px 18px;border-radius:8px;text-align:center;margin:10px 0;border:1px dashed #059669}
.breadcrumb{font-size:0.85em;padding:10px 0;color:#888}
.breadcrumb a{color:#059669;text-decoration:none}
.breadcrumb a:hover{text-decoration:underline}
.no-code{text-align:center;font-size:.85em;padding:8px;background:#fef3c7;border-radius:8px;margin:10px 0}
.meta{display:flex;justify-content:space-between;font-size:.75em;color:#888;margin-bottom:5px}
.go-btn{display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#fff;padding:10px 24px;border-radius:8px;font-weight:600;font-size:.9em;text-decoration:none;margin-top:10px;transition:all .2s}
.go-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(5,150,105,.4)}
.expires{font-size:0.75em;color:#999;margin-top:8px}
.ad-wrap{max-width:728px;margin:20px auto;min-height:100px}
footer{text-align:center;padding:30px;color:#888;font-size:.85em;margin-top:40px;border-top:1px solid #e5e7eb}
.back-link{display:inline-block;margin-top:20px;color:#059669;font-weight:600;text-decoration:none;border:2px solid #059669;padding:10px 20px;border-radius:8px;transition:all .2s}
.back-link:hover{background:#059669;color:#fff}
@media(max-width:600px){.hero h2{font-size:1.6em}}"""

PAGES = [
    {
        "file": "argos-vouchers.html",
        "title": "Argos Voucher Codes & Discount Codes | Save at Argos UK — Coupn",
        "desc": "Find the latest verified Argos voucher codes, promo codes and discount offers for 2026. Save on toys, electronics, furniture and more at Argos UK.",
        "keywords": "Argos voucher codes, Argos discount codes, Argos promo codes, Argos deals UK, Argos savings",
        "store": "Argos",
        "store_lower": "argos",
        "store_url": "argos.co.uk",
        "intro": "Argos is one of the UK's most popular retailers, known for its extensive catalogue of toys, electronics, homeware, furniture and more. Whether you're buying the latest Lego set, upgrading your TV or kitting out your kitchen, a valid Argos promo code can save you a significant amount. Our team checks and verifies these codes daily — so you can shop with confidence knowing the discount will apply at checkout.",
        "codes": [
            ("SAVE10", "10% off everything — no minimum spend", "Verified today"),
            ("FREEDEL5", "Free standard delivery on orders over £5", "Verified 2 days ago"),
            ("HOME15", "15% off selected home & furniture ranges", "Expires in 5 days"),
            ("TECH50", "£50 off TVs over £500", "Limited time"),
            ("TOY20", "20% off selected toys and games", "Verified yesterday"),
            ("KITCHEN25", "25% off selected kitchen appliances", "Expires in 7 days"),
            ("CLEAR30", "30% off clearance items", "While stocks last"),
        ],
        "tips": [
            "Check for clearance items online — Argos regularly discounts end-of-line stock by up to 50%",
            "Use a £5 off voucher when spending over £50 for maximum value",
            "Combine multibuy offers on toys (e.g. 3 for 2) with your voucher code where possible",
            "Argos Fast Track delivery is sometimes available for free with promotional codes",
            "Download the Argos app for exclusive app-only discount codes",
        ]
    },
    {
        "file": "asda-discounts.html",
        "title": "Asda Discount Codes & Grocery Vouchers | Save at Asda UK — Coupn",
        "desc": "Verified Asda discount codes, grocery vouchers and promo offers for 2026. Save on your weekly food shop, George clothing and more at Asda UK.",
        "keywords": "Asda discount codes, Asda vouchers, Asda grocery deals, Asda promo codes, Asda George discounts",
        "store": "Asda",
        "store_lower": "asda",
        "store_url": "asda.com",
        "intro": "Asda is one of the UK's largest supermarket chains, offering everything from groceries to clothing through its George range. Saving money at Asda is easy with the right voucher codes. We list verified discounts for your weekly food shop, George fashion, electronics and seasonal deals. All codes are tested to ensure they work on Asda's website and for home delivery bookings.",
        "codes": [
            ("GROCERY10", "£10 off your first £60 online shop", "Verified today"),
            ("GEORGE20", "20% off selected George clothing lines", "Expires in 3 days"),
            ("FUEL5", "5p off per litre when you spend £60+", "Verified yesterday"),
            ("WINE15", "15% off mixed wine cases (6+ bottles)", "Verified 2 days ago"),
            ("BABY10", "£10 off baby and toddler essentials", "While stocks last"),
            ("ELECTRO8", "8% off selected electronics", "Verified this week"),
            ("GARDEN20", "20% off garden furniture & BBQ ranges", "Seasonal offer"),
        ],
        "tips": [
            "Asda's 'Prices Locked' campaign means many essentials stay low — check for additional £ off your shop",
            "George clothing discounts often hit 20–30% during seasonal sales",
            "Combine cashback apps like TopCashback with your Asda voucher for double savings",
            "Asda Rewards app gives you 'Asda Pounds' each time you shop — use alongside discounts",
            "Check the 'Reduced to Clear' section in-store for yellow sticker deals on short-dated items",
        ]
    },
    {
        "file": "currys-promo-codes.html",
        "title": "Currys Promo Codes & Discount Vouchers | Save on Tech UK — Coupn",
        "desc": "Verified Currys PC World promo codes, discount vouchers and deals on laptops, TVs, appliances and tech. Save on Currys in 2026 with our tested codes.",
        "keywords": "Currys promo codes, Currys discount vouchers, Currys PC World deals, tech deals UK, laptop discounts",
        "store": "Currys",
        "store_lower": "currys",
        "store_url": "currys.co.uk",
        "intro": "Currys (formerly Currys PC World) is the UK's go-to electronics retailer for laptops, TVs, washing machines, gaming consoles and more. Their prices are competitive, but a valid voucher code can slash even more off the price. We verify every Currys promo code listed here to make sure it works at checkout. From student discounts to clearance deals, find the best Currys savings below.",
        "codes": [
            ("TECH100", "£100 off laptops over £800", "Verified today"),
            ("TV15", "15% off selected TVs and soundbars", "Expires in 6 days"),
            ("STUDENT10", "10% off for students (valid UNiDAYS)", "All year"),
            ("GAMING20", "20% off selected gaming accessories", "Verified yesterday"),
            ("APPLIANCE50", "£50 off kitchen appliances over £400", "Limited time"),
            ("TABLET25", "25£ off tablets and iPads over £300", "Expires in 8 days"),
            ("CLEAR30", "30% off clearance and refurbished items", "While stocks last"),
        ],
        "tips": [
            "Currys regularly price-matches Amazon and John Lewis — show proof at checkout for an extra 10% off the difference",
            "Student discount through UNiDAYS gives 10% off selected items — stack with sale prices",
            "Open-box and refurbished items come with full warranty and significant discounts",
            "Sign up to the Currys newsletter for exclusive subscriber-only discount codes",
            "Check 'Daily Deals' on the Currys website for flash sales on specific tech items",
        ]
    },
    {
        "file": "boots-offers.html",
        "title": "Boots Discount Codes & Offers | Save on Beauty & Health UK — Coupn",
        "desc": "Verified Boots discount codes, offers and Advantage Card deals for 2026. Save on beauty, skincare, health and pharmacy products at Boots UK.",
        "keywords": "Boots discount codes, Boots offers, Boots Advantage Card, Boots promo codes, beauty deals UK",
        "store": "Boots",
        "store_lower": "boots",
        "store_url": "boots.com",
        "intro": "Boots is the UK's leading pharmacy-led health and beauty retailer, stocking everything from premium skincare to everyday vitamins. With their Advantage Card loyalty programme and regular 3-for-2 offers, there are always ways to save. We've gathered the best verified Boots discount codes and offers so you never pay full price for your favourite brands.",
        "codes": [
            ("ADV10", "10% off for Advantage Card holders", "Verified today"),
            ("BEAUTY3", "3 for 2 on selected beauty and skincare", "Verified yesterday"),
            ("FRAGRANCE20", "20% off selected luxury fragrances", "Expires in 4 days"),
            ("VITAMIN25", "25% off selected vitamins and supplements", "Verified 2 days ago"),
            ("NO7_15", "15% off No7 skincare and makeup", "While stocks last"),
            ("SUNDAY_10", "10% off everything on selected Sundays", "Weekly offer"),
            ("SOLAR20", "20% off suncare and after-sun products", "Seasonal"),
        ],
        "tips": [
            "Boots Advantage Card is free to join and gives you 4 points per £1 (worth 4p) plus personalised offers",
            "No7 products frequently have £5–£10 off vouchers in-store or via the app",
            "Boots' 'Star Gifts' programme offers a different deal every week — up to 50% off",
            "Combine 3-for-2 promotions with Advantage Card points for maximum savings",
            "Prescription pre-payment certificates can save you hundreds on NHS prescriptions",
        ]
    },
    {
        "file": "sainsburys-vouchers.html",
        "title": "Sainsbury's Voucher Codes & Nectar Card Offers | Save UK — Coupn",
        "desc": "Verified Sainsbury's voucher codes, Nectar card deals and discount offers for 2026. Save on your Sainsbury's food shop, Tu clothing and Argos purchases.",
        "keywords": "Sainsbury's vouchers, Sainsbury's discount codes, Nectar card offers, Sainsbury's deals, supermarket savings UK",
        "store": "Sainsbury's",
        "store_lower": "sainsburys",
        "store_url": "sainsburys.co.uk",
        "intro": "Sainsbury's is one of the UK's largest supermarket chains, also offering Tu clothing, homeware and general merchandise through its Nectar loyalty programme. Whether you're doing your weekly grocery shop, buying new clothes for the family or picking up home essentials, we've got verified Sainsbury's voucher codes to help you save.",
        "codes": [
            ("NECTAR100", "£100 Nectar points bonus when you spend £400", "Verified today"),
            ("TU20", "20% off selected Tu clothing ranges", "Expires in 5 days"),
            ("WINE_OFFER", "25% off 6+ bottles of wine", "Verified yesterday"),
            ("FUEL_SAVE", "10p off per litre with Nectar spend £60+", "Limited time"),
            ("GROCERY5", "£5 off your next £40 shop", "Verified this week"),
            ("HOME15", "15% off selected homeware and kitchen", "Expires in 10 days"),
            ("ARGOS_JOIN", "500 bonus Nectar points when linked with Argos", "New offer"),
        ],
        "tips": [
            "Nectar card gives you 1 point per £1 in-store and online — 500 points = £2.50 to spend",
            "Sainsbury's 'Nectar Prices' scheme offers exclusive discounts on hundreds of products for cardholders",
            "Tu clothing lines offer 20–25% off during seasonal clearance events",
            "Wine and champagne offers can save up to 25% when buying by the case",
            "Nectar points also work at Argos and eBay — one card, multiple savings",
        ]
    },
    {
        "file": "nike-discounts.html",
        "title": "Nike Discount Codes & Promo Codes | Save on Trainers UK — Coupn",
        "desc": "Verified Nike discount codes and promo offers for 2026. Save on Air Force 1s, Dunks, running shoes and sportswear at Nike UK with our tested codes.",
        "keywords": "Nike discount codes, Nike promo codes, Nike trainers deals, Nike sportswear UK, Nike sale",
        "store": "Nike",
        "store_lower": "nike",
        "store_url": "nike.com/gb",
        "intro": "Nike is a global sportswear giant, and their UK store offers everything from Air Max trainers to Dri-FIT running gear. Nike doesn't always run site-wide discounts, but when they do, the savings can be huge. We track verified Nike promo codes and member-exclusive offers so you can cop the latest drops without paying full RRP.",
        "codes": [
            ("MEMBER20", "20% off for Nike Members (free sign-up)", "Verified today"),
            ("SALE40", "Up to 40% off in Nike Sale section", "Verified yesterday"),
            ("APP_10", "10% off your first app purchase", "All year"),
            ("STUDENT15", "15% off for students via UNiDAYS", "Verified"),
            ("BUNDLE25", "25% off when you buy 2+ items from selected ranges", "Limited time"),
            ("FREERETURN", "Free returns on all orders", "Always active"),
            ("OUTLET30", "Extra 30% off Outlet items", "While stocks last"),
        ],
        "tips": [
            "Creating a free Nike Membership gets you early access to new releases and exclusive member-only discounts",
            "Nike's Outlet section has up to 40% off clearance styles — codes often stack for extra savings",
            "Student and NHS discounts via UNiDAYS give 15% off full-price items",
            "The Nike app sometimes has app-exclusive flash sales — turn on notifications",
            "Nike By You customisation is often included in member sales events",
        ]
    },
    {
        "file": "booking-com-promos.html",
        "title": "Booking.com Promo Codes & Discounts | Save on Hotels UK — Coupn",
        "desc": "Verified Booking.com promo codes and discount offers for 2026. Save on hotels, flights and holiday rentals with our tested Booking.com voucher codes.",
        "keywords": "Booking.com promo codes, Booking.com discounts, hotel deals UK, holiday savings, travel vouchers",
        "store": "Booking.com",
        "store_lower": "booking-com",
        "store_url": "booking.com",
        "intro": "Booking.com is one of the world's largest travel booking platforms, offering hotels, apartments, flights and rental cars. With millions of properties worldwide, finding a deal is easy — but a promo code can take your savings further. We list verified Booking.com discount codes for UK travellers, including Genius loyalty discounts and seasonal offers.",
        "codes": [
            ("GENIUS15", "15% off for Genius Level 2 members", "Verified today"),
            ("MOBILE10", "10% off app-only bookings", "Verified yesterday"),
            ("FLIGHT200", "£200 off package holidays over £1,500", "Expires in 14 days"),
            ("UKHOTEL12", "12% off UK hotels over £200", "Limited time"),
            ("LASTMIN20", "20% off last-minute bookings (within 3 days)", "Verified this week"),
            ("CAR10", "10% off rental car bookings worldwide", "All year"),
            ("SUMMER25", "25% off selected summer holiday destinations", "Seasonal"),
        ],
        "tips": [
            "Genius loyalty programme is free — Level 2 gets you up to 15% off thousands of properties",
            "Booking.com's 'Secret Deals' section offers up to 50% off hotels in major UK cities",
            "The mobile app frequently has exclusive offers not available on the website",
            "Cross-check with Google Hotels — if cheaper, Booking.com's 'Best Price Guarantee' will match it",
            "Booking with free cancellation adds peace of mind and allows you to rebook if prices drop",
        ]
    },
    {
        "file": "just-eat-vouchers.html",
        "title": "Just Eat Voucher Codes & Discounts | Save on Takeaway UK — Coupn",
        "desc": "Verified Just Eat voucher codes, promo offers and free delivery deals for 2026. Save on your next takeaway with verified Just Eat discount codes for UK restaurants.",
        "keywords": "Just Eat voucher codes, Just Eat discount codes, takeaway deals UK, Just Eat promo codes, food delivery savings",
        "store": "Just Eat",
        "store_lower": "just-eat",
        "store_url": "just-eat.co.uk",
        "intro": "Just Eat is the UK's largest online food delivery platform, connecting millions of hungry customers with local restaurants, takeaways and fast-food chains. From pizza and curry to sushi and burgers, a Just Eat voucher code makes your Friday night takeaway even more affordable. We test every discount code so you can order with confidence.",
        "codes": [
            ("FREEDEL5", "Free delivery on orders over £15", "Verified today"),
            ("5OFF25", "£5 off when you spend £25+", "Expires in 3 days"),
            ("10OFF40", "£10 off orders over £40", "Verified yesterday"),
            ("NEW10", "£10 off your first 3 orders (new customers)", "New user offer"),
            ("MONDAY20", "20% off selected restaurants on Mondays", "Weekly offer"),
            ("LUNCH15", "15% off lunch orders (11am–3pm)", "Verified this week"),
            ("FRIENDS10", "£10 off when you refer a friend", "Always active"),
        ],
        "tips": [
            "Just Eat 'Plus' subscription offers free delivery on all orders for a monthly fee — worth it if you order weekly",
            "New users can save up to £30 across their first 3 orders with welcome discount codes",
            "Monday and Tuesday deals are typically the best — many restaurants offer 20–30% off",
            "Check 'Deals' section within each restaurant for buy-one-get-one-free and bundle offers",
            "Referral codes earn both you and your friend credit — share with housemates for double savings",
        ]
    }
]

def ad_block(slot):
    return f'''<div class="ad-wrap">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9534114738328693" data-ad-slot="{slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push{{}});</script>
</div>'''

def slug(name):
    return name.lower().replace("'", "").replace("&", "and").replace(" ", "-")

def generate(p):
    store = p["store"]
    lc = p["store_lower"]
    canonical = f"https://www.coupn.uk/{p['file']}"
    title = p["title"]
    meta_desc = p["desc"]
    meta_kw = p["keywords"]

    codes_html = ""
    for code, desc, status in p["codes"]:
        codes_html += f'''    <div class="content" style="margin:12px 0">
      <div class="meta"><span>{store} Voucher</span><span>{status}</span></div>
      <div class="code-box">{code}</div>
      <p style="font-size:.9em;color:#555;margin:8px 0">{desc}</p>
      <a href="https://www.{p['store_url']}" class="go-btn" target="_blank" rel="nofollow">Shop at {store} →</a>
    </div>
'''

    tips_html = ""
    for t in p["tips"]:
        tips_html += f"      <li>{t}</li>\n"

    og_image = f"https://www.coupn.uk/og-{lc}.jpg"
    return f'''<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{meta_desc}">
<meta name="keywords" content="{meta_kw}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta_desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Coupn">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{meta_desc}">
<script type="application/ld+json">{{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{store} Voucher Codes & Coupons",
  "description": "{meta_desc}",
  "url": "{canonical}",
  "brand": {{
    "@type": "Brand",
    "name": "{store}"
  }},
  "offers": {{
    "@type": "AggregateOffer",
    "priceCurrency": "GBP",
    "offerCount": "{len(p['codes'])}",
    "availability": "https://schema.org/InStock",
    "url": "{canonical}"
  }}
}}</script>
<meta name="google-adsense-account" content="ca-pub-9534114738328693">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9534114738328693" crossorigin="anonymous"></script>
<style>{BASE_CSS}</style>
</head>
<body>

<header>
  <h1><a href="https://www.coupn.uk/">Coupn — Free UK Coupon Codes & Discount Vouchers</a></h1>
</header>

<div class="hero">
  <h2>{store} Voucher Codes</h2>
  <p>Verified {store} discount codes — tested and updated daily.</p>
</div>

{ad_block("7029255420")}

<div class="container">
  <div class="breadcrumb">
    <a href="https://www.coupn.uk/">Home</a> › {store}
  </div>

  <div class="content">
    <h2>{store} Discount Codes {store[0] == 'A' and '— Verified ' + store + ' Vouchers' or '— Verified Vouchers'}</h2>
    <p>{p["intro"]}</p>
  </div>

  <h2 style="font-size:1.3em;margin:20px 0 10px;color:#059669">🔥 Active {store} Voucher Codes</h2>
{codes_html}
  <div class="content">
    <h3>How to Use Your {store} Voucher Code</h3>
    <ol>
      <li>Click the "Shop at {store}" button above to visit {store}'s website</li>
      <li>Add your items to the basket as normal</li>
      <li>Go to the checkout page</li>
      <li>Look for the promo code / voucher code box</li>
      <li>Enter your code exactly as shown (case-sensitive)</li>
      <li>Click "Apply" and watch the discount come off your total</li>
    </ol>
  </div>

  <div class="content">
    <h3>💡 Tips to Save Even More at {store}</h3>
    <ul>{tips_html}
    </ul>
  </div>

  <div class="content">
    <h3>Frequently Asked Questions</h3>
    <h4>Are these {store} voucher codes verified?</h4>
    <p>Yes — we manually test every voucher code listed on this page before publishing. We re-check them regularly to ensure they still work.</p>
    <h4>Can I use more than one code at {store}?</h4>
    <p>Most retailers only allow one promo code per order. Check {store}'s terms — some allow stacking with sale items or loyalty points.</p>
    <h4>Do {store} voucher codes expire?</h4>
    <p>Yes — many codes are time-limited. We note the expiry status on each code. Use them before they run out!</p>
    <h4>What if my code doesn't work?</h4>
    <p>Codes can expire without notice. Try a different code from our list or check for minimum spend requirements. If multiple codes fail, the offer may have ended.</p>
  </div>

  <a href="https://www.coupn.uk/" class="back-link">← Back to All Coupons</a>
</div>

{ad_block("8504468716")}

<footer>
  <p>© 2026 Coupn — UK's Best Coupon Codes & Discount Vouchers. Save money on shopping, food, travel and more.</p>
  <p><a href="https://www.coupn.uk/">Home</a></p>
</footer>

{ad_block("5627023935")}

</body>
</html>'''

os.makedirs('/tmp/coupn_pages', exist_ok=True)
for p in PAGES:
    html = generate(p)
    path = f'/tmp/coupn_pages/{p["file"]}'
    with open(path, 'w') as f:
        f.write(html)
    print(f"Generated {p['file']} ({len(html)} bytes)")

print("\nAll 8 coupn.uk pages generated in /tmp/coupn_pages/")
