#!/usr/bin/env python3
"""Generate store deal pages for cheapfind.uk — v2 with full monetisation"""
import os

AMAZON_TAG = "coupn28-21"
ADS_CLIENT = "ca-pub-9534114738328693"
ADS_SLOT_1 = "3525124687"
ADS_SLOT_2 = "8125194764"
SITE_URL = "https://www.cheapfind.uk"
SITE_NAME = "CheapFind UK"
OUT = '/tmp/cheapfind_v2'

AFF_DISCLAIMER = '<p>As an Amazon Associate we earn from qualifying purchases. We may also earn commission from other affiliate partners.</p>'

CSS = """*{margin:0;padding:0;box-sizing:border-box}
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
footer.site-footer{text-align:center;padding:30px;color:#888;font-size:0.85em;border-top:1px solid #eee;margin-top:40px}
footer.site-footer a{color:#667eea;text-decoration:none}
footer.site-footer .footer-links{margin:10px 0}
footer.site-footer .footer-links a{margin:0 8px}
.back-link{display:inline-block;margin-top:20px;color:#667eea;font-weight:600;text-decoration:none;border:2px solid #667eea;padding:10px 20px;border-radius:8px;transition:all .2s}
.back-link:hover{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
@media(max-width:600px){.hero h2{font-size:1.6em}}"""

def footer():
    return '\\n'.join([
        '<footer class="site-footer">',
        '  <p>&copy; 2026 <a href="' + SITE_URL + '">' + SITE_NAME + '</a> \u2014 Find the best UK deals, discounts and money-saving offers.</p>',
        '  ' + AFF_DISCLAIMER,
        '  <div class="footer-links">',
        '    <a href="' + SITE_URL + '/about.html">About</a>',
        '    <a href="' + SITE_URL + '/privacy.html">Privacy Policy</a>',
        '    <a href="' + SITE_URL + '/contact.html">Contact</a>',
        '  </div>',
        '</footer>'
    ])

def ad_block(slot):
    return '\\n'.join([
        '<div class="ad-container">',
        '  <ins class="adsbygoogle" style="display:block" data-ad-client="' + ADS_CLIENT + '" data-ad-slot="' + slot + '" data-ad-format="auto" data-full-width-responsive="true"></ins>',
        '  <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>',
        '</div>'
    ])

STORES = [
    {"f":"asda-deals.html","t":"Asda Deals & Offers | Best UK Grocery Savings \u2014 CheapFind UK","d":"Find the latest Asda deals and offers for 2026. Save on groceries, George clothing and more with Asda\u0027s best discounts in the UK.","k":"Asda deals, Asda offers, Asda grocery deals, Asda discount, Asda George deals UK","s":"Asda","u":"asda.com","sl":"asda",
     "i":"Asda is one of the UK\u0027s leading supermarket chains, known for its competitive pricing on groceries and the popular George clothing range. We track the best Asda deals so you can save on your weekly shop, fuel, fashion and more. From multibuy offers to clearance discounts, here are the top ways to save at Asda.",
     "dl":["Rollback Offers","Save up to 50% on hundreds of everyday items","\u00a35.00","\u00a32.50","Ongoing","George Clearance","Up to 70% off selected George fashion lines","\u00a330.00","\u00a39.00","While stocks last","Fuel Save 5p","5p off per litre when you spend \u00a360+","\u00a360+ shop","Save ~\u00a33.00","Ongoing","Asda Rewards","Earn Asda Pounds on selected products via the app","Free to join","Up to 10% back","Ongoing","3 for \u00a310","Mix & match selected chilled ready meals","\u00a310.00","Save up to \u00a35","Ongoing","Baby Event","Up to 30% off nappies, wipes and baby essentials","Various","Save \u00a3\u00a3\u00a3","Limited time","Summer BBQ","Up to 30% off BBQ meat, buns and outdoor dining","Various","Save \u00a3\u00a3","Seasonal","Student Discount","10% off with Student Beans","Various","10% off","Ongoing"],
     "tp":["Download the Asda Rewards app to earn \u0027Asda Pounds\u0027 on your shopping","Check Rollback prices weekly \u2014 prices stay low for months","George clearance has deep discounts in January and August","Buy multipacks of household staples for the best unit price","Use cashback apps like TopCashback for additional savings on Asda purchases"]},
]

# ... Too long. Let me take a different approach - write directly to temp dir
# I'll use a simpler method
print("Script too long for heredoc. Using alternative approach.")
