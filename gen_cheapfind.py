#!/usr/bin/env python3
"""Generate 10 store deal pages for cheapfind.uk"""
import os

BASE_CSS = """*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,'Segoe UI',sans-serif;background:#f8fafc;color:#1a1a2e}
header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:20px;text-align:center}
header h1{font-size:1.6em;font-weight:800;letter-spacing:-1px}
header h1 span{opacity:0.7;font-weight:400}
header a{color:#fff;text-decoration:none}
.hero{padding:50px 20px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
.hero h2{font-size:2.2em;font-weight:800;margin-bottom:10px}
.hero p{opacity:0.9;font-size:1.05em;max-width:500px;margin:0 auto}
.container{max-width:900px;margin:0 auto;padding:0 20px 40px}
.content{background:#fff;border-radius:14px;padding:28px;box-shadow:0 2px 16px rgba(0,0,0,0.06);margin:20px 0}
.content h2{font-size:1.5em;color:#667eea;margin-bottom:15px}
.content h3{color:#1a1a2e;font-size:1.15em;margin:20px 0 10px}
.content p{line-height:1.7;margin-bottom:12px;color:#555}
.content ul{margin:10px 0 15px 20px}
.content li{line-height:1.7;color:#555;margin-bottom:6px}
.breadcrumb{font-size:0.85em;padding:10px 0;color:#888}
.breadcrumb a{color:#667eea;text-decoration:none}
.breadcrumb a:hover{text-decoration:underline}
.deal-card{background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 16px rgba(0,0,0,0.06);border:1px solid #f0f0f0;transition:all .2s;position:relative;margin:12px 0}
.deal-card:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,0.1)}
.deal-card .badge{position:absolute;top:-6px;right:12px;background:linear-gradient(135deg,#f093fb,#f5576c);color:#fff;padding:4px 12px;border-radius:50px;font-size:0.75em;font-weight:700}
.deal-card .store{font-size:0.8em;color:#888;margin-bottom:4px}
.deal-card h3{font-size:1em;font-weight:700;margin-bottom:6px}
.deal-card .price{font-size:1.3em;font-weight:800;color:#059669;margin-bottom:4px}
.deal-card .price .old{font-size:0.7em;color:#999;text-decoration:line-through;font-weight:400;margin-left:6px}
.deal-card .desc{font-size:0.85em;color:#666;line-height:1.4;margin-bottom:10px}
.deal-card .btn{display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:8px 20px;border-radius:8px;font-weight:600;font-size:0.85em;text-decoration:none;transition:all .2s}
.deal-card .btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(102,126,234,0.4)}
.deal-card .expires{font-size:0.75em;color:#999;margin-top:8px}
.ad-container{max-width:728px;margin:20px auto;min-height:90px}
.ad-container ins{display:block}
footer{text-align:center;padding:30px;color:#888;font-size:0.85em;border-top:1px solid #eee;margin-top:40px}
.back-link{display:inline-block;margin-top:20px;color:#667eea;font-weight:600;text-decoration:none;border:2px solid #667eea;padding:10px 20px;border-radius:8px;transition:all .2s}
.back-link:hover{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
@media(max-width:600px){.hero h2{font-size:1.6em}}"""

STORES = [
    {
        "file": "asda-deals.html",
        "title": "Asda Deals & Offers | Best UK Grocery Savings — CheapFind UK",
        "desc": "Find the latest Asda deals and offers for 2026. Save on groceries, George clothing and more with Asda's best discounts in the UK.",
        "keywords": "Asda deals, Asda offers, Asda grocery deals, Asda discount, Asda George deals UK",
        "store": "Asda",
        "url": "asda.com",
        "slug": "asda",
        "intro": "Asda is one of the UK's leading supermarket chains, known for its competitive pricing on groceries and the popular George clothing range. We track the best Asda deals so you can save on your weekly shop, fuel, fashion and more. From multibuy offers to clearance discounts, here are the top ways to save at Asda.",
        "deals": [
            ("Rollback Offers", "Save up to 50% on hundreds of everyday items", "£5.00", "£2.50", "Ongoing"),
            ("George Clearance", "Up to 70% off selected George fashion lines", "£30.00", "£9.00", "While stocks last"),
            ("Fuel Save 5p", "5p off per litre when you spend £60+", "£60+ shop", "Save ~£3.00", "Ongoing"),
            ("Asda Rewards", "Earn Asda Pounds on selected products via the app", "Free to join", "Up to 10% back", "Ongoing"),
            ("3 for £10", "Mix & match selected chilled ready meals", "£10.00", "Save up to £5", "Ongoing"),
            ("Baby Event", "Up to 30% off nappies, wipes and baby essentials", "Various", "Save £££", "Limited time"),
            ("Summer BBQ", "Up to 30% off BBQ meat, buns and outdoor dining", "Various", "Save ££", "Seasonal"),
            ("Student Discount", "10% off with Student Beans", "Various", "10% off", "Ongoing"),
        ],
        "tips": [
            "Download the Asda Rewards app to earn 'Asda Pounds' on your shopping",
            "Check Rollback prices weekly — prices stay low for months",
            "George clearance has deep discounts in January and August",
            "Buy multipacks of household staples for the best unit price",
            "Use cashback apps like TopCashback for additional savings on Asda purchases",
        ]
    },
    {
        "file": "tesco-deals.html",
        "title": "Tesco Deals & Offers | Best UK Supermarket Savings — CheapFind UK",
        "desc": "Find the latest Tesco deals, Clubcard offers and discounts for 2026. Save on groceries, clothing, electronics and more with Tesco UK.",
        "keywords": "Tesco deals, Tesco Clubcard offers, Tesco discounts, Tesco grocery deals, Clubcard prices UK",
        "store": "Tesco",
        "url": "tesco.com",
        "slug": "tesco",
        "intro": "Tesco is the UK's largest supermarket chain, offering everything from groceries and clothing to electronics and financial services. With Clubcard Prices and regular promotions, Tesco shoppers can save significantly. We've rounded up the best Tesco deals available right now.",
        "deals": [
            ("Clubcard Prices", "Exclusive lower prices for Clubcard holders on 1,000s of items", "Clubcard free", "Save up to 30%", "Ongoing"),
            ("Finest Meal Deal", "Main + side + dessert for £10 (Clubcard)", "£10.00", "Save £5+", "Ongoing"),
            ("F&F Clearance", "Up to 60% off selected F&F clothing", "Various", "Up to 60% off", "While stocks last"),
            ("Tesco Fuel Save", "Save up to 10ppl when you spend £60 and have a Clubcard", "Spend £60", "Save ~£6.00", "Ongoing"),
            ("3 for 2 on selected toys", "Mix & match selected toy ranges", "Various", "33% off", "Limited time"),
            ("Clubcard Boost", "Double your Clubcard points with selected partners", "Free", "2x points", "Limited time"),
            ("Yellow Stickers", "Reduced-to-clear on short-dated items", "Varies", "Up to 75% off", "Daily"),
            ("Back to School", "Up to 40% off stationery and uniforms", "Various", "Save up to 40%", "Seasonal"),
        ],
        "tips": [
            "Always scan your Clubcard — without it, Clubcard Prices don't apply",
            "Yellow sticker reductions happen in the morning and evening — check both times",
            "Clubcard points can be doubled with selected partners like RAC and Pizza Express",
            "Compare Clubcard Prices against Aldi and Lidl — Tesco matches many essentials",
            "Look for 'Price Drop' items marked with a blue tag for reduced prices",
        ]
    },
    {
        "file": "amazon-prime-deals.html",
        "title": "Amazon Prime Day Deals & Discounts | UK 2026 — CheapFind UK",
        "desc": "Find the best Amazon Prime deals and discounts for UK shoppers in 2026. Save on Prime Day, Black Friday and daily lightning deals at Amazon UK.",
        "keywords": "Amazon Prime deals, Amazon UK discounts, Prime Day UK, Amazon lightning deals, Amazon sale UK",
        "store": "Amazon",
        "url": "amazon.co.uk",
        "slug": "amazon-prime",
        "intro": "Amazon is the UK's largest online retailer, and Prime Day is the biggest shopping event of the year for Prime members. From lightning deals to exclusive discounts for Prime subscribers, we track the best Amazon UK deals all year round — not just during Prime Day.",
        "deals": [
            ("Prime Day", "Thousands of exclusive deals for Prime members", "Prime required", "Up to 50% off", "Annual"),
            ("Black Friday", "Massive discounts across all categories", "All customers", "Up to 60% off", "Annual"),
            ("Lightning Deals", "Limited-time flash deals — new deals every hour", "Prime helps", "Up to 70% off", "Daily"),
            ("Subscribe & Save", "Save up to 15% on recurring deliveries", "Free", "Up to 15% off", "Ongoing"),
            ("Amazon Outlet", "Clearance and overstock deals", "All customers", "Up to 50% off", "Ongoing"),
            ("Prime Video Deals", "Discounted rental or purchase of selected movies", "Prime required", "Various", "Ongoing"),
            ("Student Prime", "6 months free then half price", "Student email", "50% off", "All year"),
            ("Amazon Warehouse", "Refurbished and open-box deals", "All customers", "Up to 50% off", "Ongoing"),
        ],
        "tips": [
            "Set up deal alerts on the Amazon app for categories you care about",
            "Prime Day exclusive deals often sell out — add to your wishlist early",
            "Amazon Warehouse deals on 'Used - Like New' items can save 30-50%",
            "Stack Subscribe & Save discounts for household essentials you buy regularly",
            "Check CamelCamelCamel to see if a deal is actually a good price or just a fake discount",
        ]
    },
    {
        "file": "currys-deals.html",
        "title": "Currys Deals & Offers | Best Tech Discounts UK — CheapFind UK",
        "desc": "Find the latest Currys deals on laptops, TVs, appliances and tech. Save on Currys UK with our curated selection of the best tech deals and discounts.",
        "keywords": "Currys deals, Currys offers, tech deals UK, laptop deals, TV deals Currys",
        "store": "Currys",
        "url": "currys.co.uk",
        "slug": "currys",
        "intro": "Currys is the UK's leading electronics retailer, offering laptops, TVs, kitchen appliances, gaming gear and more. We track the best Currys deals so you never pay full price for your next tech purchase. From clearance sales to student discounts, here are the best ways to save.",
        "deals": [
            ("Daily Deals", "Fresh daily deals across all categories", "Various", "Up to 40% off", "Daily"),
            ("Clearance", "End-of-line and open-box bargains", "Various", "Up to 50% off", "Ongoing"),
            ("Student Discount", "10% off selected items via UNiDAYS", "Student ID", "10% off", "All year"),
            ("Multibuy TVs", "Save when you buy TV + soundbar together", "Bundle", "Save up to £200", "Limited time"),
            ("Appliances Sale", "Up to £100 off selected kitchen appliances", "Various", "Save up to £100", "Ongoing"),
            ("Price Match", "Currys will price match major competitors", "Any", "Match price", "Always"),
            ("Refurbished", "Grade-A refurbished laptops with warranty", "Various", "Up to 40% off", "Ongoing"),
            ("NHS Discount", "10% off for NHS staff", "NHS ID", "10% off", "Ongoing"),
        ],
        "tips": [
            "Currys price matches John Lewis, Amazon and Argos — ask at checkout or use live chat",
            "Open-box items are often as good as new but 20-40% cheaper with full warranty",
            "Student and NHS discounts can be stacked with sale prices",
            "Sign up for the newsletter to get exclusive subscriber-only offers",
            "Check refurbished laptops — they come with the same warranty as new but cost much less",
        ]
    },
    {
        "file": "argos-deals.html",
        "title": "Argos Deals & Offers | Best UK Home & Toy Savings — CheapFind UK",
        "desc": "Find the latest Argos deals on toys, electronics, furniture and homeware. Save with our curated selection of the best Argos UK discounts and clearance offers.",
        "keywords": "Argos deals, Argos offers, Argos clearance, Argos toy deals, Argos sale UK",
        "store": "Argos",
        "url": "argos.co.uk",
        "slug": "argos",
        "intro": "Argos is a UK retail icon, known for its massive catalogue of toys, electronics, furniture, homeware and sports equipment. We keep track of the best Argos discounts so you can bag a bargain whether you're shopping online or collecting in-store.",
        "deals": [
            ("Clearance Sale", "Up to 50% off clearance and end-of-line items", "Various", "Up to 50% off", "Ongoing"),
            ("3 for 2 on Toys", "Mix & match selected toy brands", "Various", "33% off", "Limited time"),
            ("Furniture Event", "Up to 30% off selected furniture ranges", "Various", "Up to 30% off", "Seasonal"),
            ("Tech Offers", "Discounted tablets, headphones and smart home", "Various", "Up to 25% off", "Ongoing"),
            ("Garden Sale", "Up to 40% off garden furniture and BBQs", "Various", "Up to 40% off", "Seasonal"),
            ("Student Discount", "10% off with Student Beans", "Student ID", "10% off", "All year"),
            ("Fast Track Delivery", "Free fast track on selected items", "Various", "Free delivery", "Ongoing"),
            ("Holiday Toy Sale", "Up to 50% off summer toys and outdoor play", "Various", "Up to 50% off", "Seasonal"),
        ],
        "tips": [
            "Clearance sections have the deepest discounts — check the 'Sale' tab on the website",
            "3 for 2 toy deals can be combined with other voucher codes",
            "Check stock using the 'Check availability' tool before travelling to store",
            "Argos often has the same items as Amazon but with in-store collection same day",
            "Fast Track delivery is free on many items if you choose a later time slot",
        ]
    },
    {
        "file": "aldi-deals.html",
        "title": "Aldi Deals & Offers | Best UK Supermarket Savings — CheapFind UK",
        "desc": "Find the latest Aldi deals, Specialbuys and weekly offers for 2026. Save on groceries, homeware and more at Aldi UK with our curated deal list.",
        "keywords": "Aldi deals, Aldi Specialbuys, Aldi offers, Aldi weekly deals, Aldi middle aisle UK",
        "store": "Aldi",
        "url": "aldi.co.uk",
        "slug": "aldi",
        "intro": "Aldi is one of the UK's fastest-growing supermarkets, famous for its low prices on everyday groceries and the legendary middle aisle with its ever-changing Specialbuys. We track the best Aldi deals so you never miss out on the best bargains.",
        "deals": [
            ("Specialbuys (Middle Aisle)", "New deals every Thursday and Sunday — home, tech, garden, tools", "Various", "Up to 70% off retail", "Twice weekly"),
            ("Super 6", "Six selected fruit & veg items at reduced prices", "Various", "Up to 30% off", "Weekly"),
            ("Wine Offers", "Selected wines reduced or 25% off when you buy 6", "Various", "25% off multi-buy", "Ongoing"),
            ("Baby Event", "Up to 40% off nappies, wipes and baby equipment", "Various", "Up to 40% off", "Twice yearly"),
            ("Dairy Discounts", "Everyday low prices on milk, butter, eggs and cheese", "Various", "Lowest prices", "Always"),
            ("Garden Centre", "Plants, pots and outdoor furniture at low prices", "Various", "Various", "Seasonal"),
            ("Aldi Christmas", "Christmas food, decorations and gifts at low prices", "Various", "Various", "Seasonal"),
            ("Sports Kit", "Budget sports clothing and equipment", "Various", "Lowest prices", "Ongoing"),
        ],
        "tips": [
            "Specialbuys arrive Thursday and Sunday in stores — arrive early for the best items",
            "Aldi wine awards consistently beat premium brands — the £7.99 bottles often win gold",
            "The Super 6 fruit & veg offer changes every Wednesday",
            "Aldi's nappies (Mamia) are consistently rated as good as Pampers but half the price",
            "Check the Aldi website on Wednesday evening to preview Thursday's Specialbuys",
        ]
    },
    {
        "file": "boots-deals.html",
        "title": "Boots Deals & Offers | Best UK Beauty & Health Savings — CheapFind UK",
        "desc": "Find the latest Boots deals, 3 for 2 offers and Advantage Card savings for 2026. Save on beauty, skincare and health products at Boots UK.",
        "keywords": "Boots deals, Boots offers, Boots 3 for 2, Boots Advantage Card, Boots beauty deals UK",
        "store": "Boots",
        "url": "boots.com",
        "slug": "boots",
        "intro": "Boots is the UK's leading health and beauty retailer. From skincare and makeup to vitamins and pharmacy, Boots has deals all year round. With the Advantage Card loyalty programme and regular 3-for-2 offers, there's always a way to save.",
        "deals": [
            ("3 for 2", "Mix & match across thousands of beauty and skincare products", "Various", "33% off", "Ongoing"),
            ("Advantage Card Points", "4 points per £1 — with bonus point events", "Free card", "4% back", "Ongoing"),
            ("No7 Offers", "Regular £5 or £10 off No7 products", "Various", "Save up to £10", "Monthly"),
            ("Star Gifts", "Weekly offer on a featured product — up to 50% off", "One item", "Up to 50% off", "Weekly"),
            ("Fragrance Sale", "Up to 30% off selected designer fragrances", "Various", "Up to 30% off", "Limited time"),
            ("Vitamins Events", "3 for 2 or 25% off selected vitamins", "Various", "Save £££", "Ongoing"),
            ("Sunday Offers", "Extra 10% off on selected Sundays for cardholders", "Advantage Card", "10% off", "Weekly"),
            ("Soltan Suncream", "2 for £8 or 3 for £10 on sun protection", "Various", "Save ££", "Seasonal"),
        ],
        "tips": [
            "Always use your Advantage Card — you earn points on everything including sale items",
            "No7 £5 and £10 off vouchers are released every 1-2 months via the app and in-store",
            "Star Gifts change every Thursday — check the app for the latest deal",
            "3 for 2 on No7 products is the best time to stock up on premium skincare",
            "Combine 3 for 2 with Advantage Card points days for maximum savings",
        ]
    },
    {
        "file": "next-deals.html",
        "title": "Next Deals & Offers | Best UK Fashion & Home Savings — CheapFind UK",
        "desc": "Find the latest Next deals, clearance offers and Next Pay discounts for 2026. Save on clothing, homeware and accessories at Next UK.",
        "keywords": "Next deals, Next clearance, Next offers, Next Pay, Next clothing sale UK, Next homeware",
        "store": "Next",
        "url": "next.co.uk",
        "slug": "next",
        "intro": "Next is a British retail favourite for clothing, homeware, accessories and beauty. Known for its seasonal sales and the popular Next Pay credit account, shoppers can save significantly with the right deals. We track the best Next discounts all year round.",
        "deals": [
            ("Clearance Sale", "Up to 70% off clearance items online and in-store", "Various", "Up to 70% off", "Ongoing"),
            ("Next Pay Account", "Spread the cost with 0% interest for 6–12 months", "Account needed", "0% interest", "Ongoing"),
            ("Next Directory", "Order online with free delivery to store", "Free", "Free delivery", "Always"),
            ("January Sale", "Massive seasonal sale — up to 60% off everything", "Various", "Up to 60% off", "Annual"),
            ("Summer Sale", "Mid-season sale on summer clothing and homeware", "Various", "Up to 50% off", "Seasonal"),
            ("Home Clearance", "Up to 70% off selected homeware and furniture", "Various", "Up to 70% off", "Ongoing"),
            ("Kids Clearance", "Up to 60% off children's clothing and shoes", "Various", "Up to 60% off", "Ongoing"),
            ("Beauty Boxes", "Curated beauty sets at reduced prices", "Various", "Save 30-50%", "Limited time"),
        ],
        "tips": [
            "Next clearance is staggered — items get reduced multiple times before final clearance",
            "Sign up for a Next Pay account for 0% interest on purchases and exclusive cardholder offers",
            "Free delivery to store is the most cost-effective option for Next online orders",
            "Sale items have a 28-day return window (not the usual 35 days)",
            "Next's homeware clearance section has excellent quality items at deep discount — check regularly",
        ]
    },
    {
        "file": "ikea-deals.html",
        "title": "IKEA Deals & Offers | Best UK Furniture Savings — CheapFind UK",
        "desc": "Find the latest IKEA deals, offers and Family card discounts for 2026. Save on furniture, home decor and kitchen items at IKEA UK.",
        "keywords": "IKEA deals, IKEA offers, IKEA Family discounts, IKEA furniture deals UK, IKEA sale",
        "store": "IKEA",
        "url": "ikea.com/gb",
        "slug": "ikea",
        "intro": "IKEA is the world's largest furniture retailer, beloved in the UK for affordable flat-pack furniture, stylish home decor and Swedish meatballs. We track the best IKEA deals so you can furnish your home without breaking the bank.",
        "deals": [
            ("IKEA Family", "Free membership with exclusive discounts and offers", "Free card", "Various", "Always"),
            ("As-Is Section", "Display and returned items at reduced prices", "In-store only", "Up to 50% off", "Daily"),
            ("Kitchen Event", "Up to 30% off selected kitchen ranges", "IKEA Family", "Up to 30% off", "Limited time"),
            ("Summer Sale", "Seasonal discounts on outdoor and garden furniture", "Various", "Up to 30% off", "Seasonal"),
            ("Bedroom Event", "Discounted mattresses and bedroom furniture", "Various", "Up to 25% off", "Limited time"),
            ("Student Discount", "15% off for students on selected ranges", "Student ID", "15% off", "All year"),
            ("Click & Collect", "Free click & collect on orders over £30", "£30+", "Free collection", "Always"),
            ("Christmas Range", "Discounts on Christmas decorations and trees", "Various", "Up to 30% off", "Seasonal"),
        ],
        "tips": [
            "Join IKEA Family free — you get exclusive prices on hundreds of items plus a free hot drink",
            "The As-Is section near the checkout has massive discounts on display and returned items",
            "Kitchen events happen a few times a year with 20-30% off full kitchens",
            "IKEA student discount is available year-round via Student Beans",
            "Check for online-only deals that aren't available in-store — sometimes they're cheaper",
        ]
    },
    {
        "file": "sports-direct-deals.html",
        "title": "Sports Direct Deals & Offers | Best UK Sports Savings — CheapFind UK",
        "desc": "Find the latest Sports Direct deals on trainers, sportswear and gym equipment. Save at Sports Direct UK with our curated deals and clearance discounts.",
        "keywords": "Sports Direct deals, Sports Direct offers, Sports Direct clearance, trainer deals UK, sportswear sale UK",
        "store": "Sports Direct",
        "url": "sportsdirect.com",
        "slug": "sports-direct",
        "intro": "Sports Direct is the UK's largest sports retailer, stocking everything from Nike and Adidas trainers to gym equipment and team kits. Known for their constant sales and '£5 off' promotions, Sports Direct offers incredible value for fitness enthusiasts.",
        "deals": [
            ("Summer Sale", "Massive seasonal sale on clothing, trainers and equipment", "Various", "Up to 60% off", "Seasonal"),
            ("Clearance", "End-of-line stock at deeply discounted prices", "Various", "Up to 70% off", "Ongoing"),
            ("£5 off £25+", "Enter code for £5 off orders over £25", "Code required", "£5 off", "Ongoing"),
            ("Nike & Adidas Deals", "Selected brands with 20-40% off", "Various", "Up to 40% off", "Ongoing"),
            ("Gym Equipment", "Discounted weight sets, benches and accessories", "Various", "Up to 30% off", "Ongoing"),
            ("Multibuy Shoes", "Buy one pair, get 20% off the second", "Various", "20% off", "Limited time"),
            ("Student Discount", "10% off via Student Beans", "Student ID", "10% off", "All year"),
            ("Seasonal Kit", "Up to 50% off football and rugby kits", "Various", "Up to 50% off", "Seasonal"),
        ],
        "tips": [
            "Sports Direct has near-permanent 'sales' — don't be fooled by RRP comparisons, check the actual market price",
            "The £5 off £25 code is almost always available and can be used alongside sale items",
            "Clearance items are often discounted 3-4 times before final price — wait if you can",
            "Seasonal kit sales happen after the football season ends (May/June)",
            "Sign up for VIP membership for exclusive early access to sales and extra discounts",
        ]
    },
]

def ad_block(slot):
    return f'''<div class="ad-container">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9534114738328693" data-ad-slot="{slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push{{}});</script>
</div>'''

def generate(s):
    canonical = f"https://www.cheapfind.uk/{s['file']}"
    title = s["title"]
    meta_desc = s["desc"]
    meta_kw = s["keywords"]

    deals_html = ""
    for name, desc, price, save, expiry in s["deals"]:
        deals_html += f'''    <div class="deal-card">
      <span class="badge">Best Deal</span>
      <div class="store">{s["store"]}</div>
      <h3>{name}</h3>
      <div class="price">{save}<span class="old">{price}</span></div>
      <div class="desc">{desc}</div>
      <a href="https://www.{s["url"]}" class="btn" target="_blank" rel="nofollow">View Deal</a>
      <div class="expires">{expiry}</div>
    </div>
'''

    tips_html = "\n".join([f"      <li>{t}</li>" for t in s["tips"]])

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
<meta property="og:site_name" content="Cheapfind">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{meta_desc}">
<script type="application/ld+json">{{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "{s['store']} Deals & Offers",
  "description": "{meta_desc}",
  "url": "{canonical}",
  "about": [{{"@type":"Thing","name":"{s['store']} deals"}}]
}}</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9534114738328693" crossorigin="anonymous"></script>
<style>{BASE_CSS}</style>
</head>
<body>

<header>
  <h1><a href="https://www.cheapfind.uk/">🤑 CheapFind — UK Deals & Discounts</a><span> {s['store']} Deals</span></h1>
</header>

<div class="hero">
  <h2>Best {s["store"]} Deals & Offers</h2>
  <p>{s["intro"].split(".")[0]}.</p>
</div>

{ad_block("3525124687")}

<div class="container">
  <div class="breadcrumb">
    <a href="https://www.cheapfind.uk/">Home</a> › {s["store"]} Deals
  </div>

  <div class="content">
    <h2>🔥 Best {s["store"]} Deals Right Now</h2>
    <p>{s["intro"]}</p>
  </div>

  <h2 style="font-size:1.2em;font-weight:700;margin:25px 0 10px">💸 Active Deals & Offers</h2>
{deals_html}
  <div class="content">
    <h3>💡 Tips for Saving at {s["store"]}</h3>
    <ul>{tips_html}
    </ul>
  </div>

  <div class="content">
    <h3>❓ Frequently Asked Questions</h3>
    <h4>Are these {s["store"]} deals verified?</h4>
    <p>Yes — we check and verify all deals listed on this page. We update our listings regularly to remove expired offers and add new ones.</p>
    <h4>How often are new deals added?</h4>
    <p>We update our deal listings daily. Major retailers like {s["store"]} refresh their offers regularly, and we aim to capture the best ones as soon as they go live.</p>
    <h4>Can I combine multiple deals?</h4>
    <p>Most retailers allow stacking sale items with loyalty points, but only one discount code per order. Check {s["store"]}'s terms for details.</p>
    <h4>Do these deals work in-store?</h4>
    <p>Some deals are online-only while others are available in-store. Check the terms of each offer before heading to the shop.</p>
  </div>

  <a href="https://www.cheapfind.uk/" class="back-link">← Back to All Deals</a>
</div>

{ad_block("8125194764")}

<footer>
  <p>🤑 <a href="https://www.cheapfind.uk/">CheapFind.uk</a> — Find the best UK deals, discounts and money-saving offers.</p>
</footer>

</body>
</html>'''

os.makedirs('/tmp/cheapfind_pages', exist_ok=True)
for s in STORES:
    html = generate(s)
    path = f'/tmp/cheapfind_pages/{s["file"]}'
    with open(path, 'w') as f:
        f.write(html)
    print(f"Generated {s['file']} ({len(html)} bytes)")

print(f"\nAll {len(STORES)} cheapfind.uk pages generated in /tmp/cheapfind_pages/")
