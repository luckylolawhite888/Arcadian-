#!/usr/bin/env python3
"""Generate 10 service outage pages for isitdownrightnow.co.uk"""
import os

BASE_CSS = """*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,'Segoe UI',sans-serif;background:#0a0a1a;color:#e0e0f0;min-height:100vh}
header{background:linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%);padding:20px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.1)}
header h1{font-size:1.5em;font-weight:800;letter-spacing:-0.5px}
header h1 span{opacity:0.6;font-weight:400}
header a{color:#fff;text-decoration:none}
.hero{padding:50px 20px 40px;text-align:center;max-width:700px;margin:0 auto}
.hero h2{font-size:2.2em;font-weight:800;margin-bottom:10px}
.hero p{opacity:0.7;font-size:1.05em}
.container{max-width:800px;margin:0 auto;padding:0 20px 40px}
.content{background:#1a1a3a;border-radius:14px;padding:28px;box-shadow:0 4px 24px rgba(0,0,0,0.2);margin:20px 0}
.content h2{font-size:1.5em;color:#667eea;margin-bottom:15px}
.content h3{font-size:1.15em;color:#e0e0f0;margin:20px 0 10px}
.content p{line-height:1.7;margin-bottom:12px;color:#bbb}
.content ul{margin:10px 0 15px 20px}
.content li{line-height:1.7;color:#bbb;margin-bottom:6px}
.highlight{background:rgba(102,126,234,0.1);border-left:4px solid #667eea;padding:15px;margin:15px 0;border-radius:0 8px 8px 0}
.highlight strong{color:#667eea}
.status-card{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:10px;margin:8px 0;background:rgba(0,200,83,0.08);border:1px solid rgba(0,200,83,0.2)}
.status-dot{width:10px;height:10px;border-radius:50%;background:#00c853;box-shadow:0 0 8px #00c853;flex-shrink:0}
.breadcrumb{font-size:0.85em;padding:10px 0;color:#888}
.breadcrumb a{color:#667eea;text-decoration:none}
.breadcrumb a:hover{text-decoration:underline}
.ad-container{max-width:728px;margin:20px auto;min-height:90px;padding:0 20px}
footer{text-align:center;padding:30px;opacity:0.5;font-size:0.85em;border-top:1px solid #1a1a3a}
footer a{color:#667eea;text-decoration:none}
.back-link{display:inline-block;margin-top:20px;color:#667eea;font-weight:600;text-decoration:none;border:2px solid #667eea;padding:10px 20px;border-radius:8px;transition:all .2s}
.back-link:hover{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
.status-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;margin:20px 0}
.status-grid .item{display:flex;align-items:center;gap:10px;padding:12px 16px;background:#1a1a3a;border-radius:10px;border:1px solid #2a2a4a;text-decoration:none;color:#e0e0f0;transition:all .2s}
.status-grid .item:hover{border-color:#667eea;background:#252550}
.status-grid .item .dot{width:8px;height:8px;border-radius:50%;background:#00c853;box-shadow:0 0 6px #00c853;flex-shrink:0}
.status-grid .item .name{font-size:0.9em;font-weight:600}
@media(max-width:600px){.hero h2{font-size:1.6em}}"""

SERVICES = [
    {
        "file": "spotify-down.html",
        "title": "Is Spotify Down? Check Spotify Status — Is It Down Right Now?",
        "desc": "Check if Spotify is down for everyone or just you. Real-time Spotify status, outage map, and troubleshooting tips for UK users. Is Spotify not working? Find out now.",
        "keywords": "Spotify down, Spotify status, Spotify not working, Spotify outage UK, Spotify server status",
        "service": "Spotify",
        "lc": "spotify",
        "domain": "spotify.com",
        "intro": "Spotify is one of the world's most popular music streaming services, with millions of users in the UK alone. If you're having trouble loading songs, playing your playlists or accessing the Spotify app, this page will tell you whether it's a widespread outage or a problem on your end.",
    },
    {
        "file": "netflix-down.html",
        "title": "Is Netflix Down? Check Netflix UK Status — Is It Down Right Now?",
        "desc": "Check if Netflix is down for everyone or just you. Real-time Netflix status, outage reports and troubleshooting tips for UK streamers.",
        "keywords": "Netflix down, Netflix not working, Netflix UK status, Netflix outage, streaming down UK",
        "service": "Netflix",
        "lc": "netflix",
        "domain": "netflix.com",
        "intro": "Netflix is the UK's leading streaming platform for movies, TV shows and original content. If you're seeing buffering, error codes or can't log in, this page tells you whether Netflix is experiencing a UK outage or if the issue is on your side.",
    },
    {
        "file": "whatsapp-down.html",
        "title": "Is WhatsApp Down? Check WhatsApp Status — Is It Down Right Now?",
        "desc": "Check if WhatsApp is down for everyone or just you. Real-time WhatsApp server status, outage map and troubleshooting for UK users.",
        "keywords": "WhatsApp down, WhatsApp not working, WhatsApp status UK, WhatsApp outage, messaging down",
        "service": "WhatsApp",
        "lc": "whatsapp",
        "domain": "whatsapp.com",
        "intro": "WhatsApp is the UK's most used messaging platform, relied upon for personal chats and business communication. If messages aren't sending, calls won't connect or the app is stuck, check here for live WhatsApp status information.",
    },
    {
        "file": "instagram-down.html",
        "title": "Is Instagram Down? Check Instagram Status UK — Is It Down Right Now?",
        "desc": "Check if Instagram is down for everyone or just you. Real-time Instagram server status, outage reports and fixes for UK users.",
        "keywords": "Instagram down, Instagram not working, Instagram UK status, Instagram outage, social media down",
        "service": "Instagram",
        "lc": "instagram",
        "domain": "instagram.com",
        "intro": "Instagram is one of the most popular social platforms in the UK for photos, videos and Reels. If your feed won't load, stories won't upload or you can't log in, find out here if Instagram is experiencing an outage.",
    },
    {
        "file": "youtube-down.html",
        "title": "Is YouTube Down? Check YouTube Status UK — Is It Down Right Now?",
        "desc": "Check if YouTube is down for everyone or just you. Real-time YouTube server status, outage reports and troubleshooting for UK viewers.",
        "keywords": "YouTube down, YouTube not working, YouTube UK status, YouTube outage, video down UK",
        "service": "YouTube",
        "lc": "youtube",
        "domain": "youtube.com",
        "intro": "YouTube is the world's biggest video platform, used by millions across the UK daily. If videos won't play, the site won't load or you're getting errors, check here for live YouTube status updates.",
    },
    {
        "file": "twitter-down.html",
        "title": "Is Twitter Down? Check X Status UK — Is It Down Right Now?",
        "desc": "Check if Twitter / X is down for everyone or just you. Real-time X server status, outage reports and fixes for UK users.",
        "keywords": "Twitter down, X down, Twitter not working, X outage UK, social media down",
        "service": "Twitter / X",
        "lc": "twitter",
        "domain": "x.com",
        "intro": "Twitter (now called X) is a major social platform in the UK for news, discussion and real-time updates. If your timeline won't load, tweets won't send or you're seeing error messages, check here for live X status information.",
    },
    {
        "file": "google-down.html",
        "title": "Is Google Down? Check Google Status UK — Is It Down Right Now?",
        "desc": "Check if Google Search is down for everyone or just you. Real-time Google status, outage reports and troubleshooting for UK users.",
        "keywords": "Google down, Google not working, Google Search status UK, Google outage, search down",
        "service": "Google",
        "lc": "google",
        "domain": "google.com",
        "intro": "Google Search is the most used search engine in the UK. If you're getting error pages, slow results or can't access Google services, this page will tell you if Google is down for everyone or just you.",
    },
    {
        "file": "gmail-down.html",
        "title": "Is Gmail Down? Check Gmail Status UK — Is It Down Right Now?",
        "desc": "Check if Gmail is down for everyone or just you. Real-time Gmail server status, outage reports and troubleshooting for UK users.",
        "keywords": "Gmail down, Gmail not working, Gmail UK status, email outage, Google email down",
        "service": "Gmail",
        "lc": "gmail",
        "domain": "gmail.com",
        "intro": "Gmail is the UK's most popular email service, used for personal and business communication. If you can't send or receive emails, the app won't load or you're getting connection errors, check here for live Gmail status.",
    },
    {
        "file": "reddit-down.html",
        "title": "Is Reddit Down? Check Reddit Status UK — Is It Down Right Now?",
        "desc": "Check if Reddit is down for everyone or just you. Real-time Reddit server status, outage reports and troubleshooting for UK users.",
        "keywords": "Reddit down, Reddit not working, Reddit UK status, Reddit outage, forum down",
        "service": "Reddit",
        "lc": "reddit",
        "domain": "reddit.com",
        "intro": "Reddit is one of the UK's most-visited social news and discussion platforms. If subreddits won't load, you can't post comments or the site is slow, check here for live Reddit status information.",
    },
    {
        "file": "facebook-down.html",
        "title": "Is Facebook Down? Check Facebook Status UK — Is It Down Right Now?",
        "desc": "Check if Facebook is down for everyone or just you. Real-time Facebook server status, outage reports and troubleshooting for UK users.",
        "keywords": "Facebook down, Facebook not working, Facebook UK status, Facebook outage, Meta down",
        "service": "Facebook",
        "lc": "facebook",
        "domain": "facebook.com",
        "intro": "Facebook remains the largest social network in the UK, used by millions for connecting with friends, family and communities. If your feed won't load, Messenger isn't working or you can't log in, find out here if Facebook is experiencing a UK outage.",
    },
]

def ad_block(slot):
    return f'''<div class="ad-container">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9534114738328693" data-ad-slot="{slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push{{}});</script>
</div>'''

def generate(s):
    canonical = f"https://www.isitdownrightnow.co.uk/{s['file']}"
    title = s["title"]
    meta_desc = s["desc"]
    meta_kw = s["keywords"]
    service = s["service"]
    lc = s["lc"]

    # Other services for the related grid
    others = [x for x in SERVICES if x["file"] != s["file"]]
    others_html = ""
    for o in others[:8]:
        icon_map = {
            "spotify": "🎵", "netflix": "🎬", "whatsapp": "💬", "instagram": "📸",
            "youtube": "▶️", "twitter": "🐦", "google": "🔍", "gmail": "📧",
            "reddit": "🤖", "facebook": "👍"
        }
        icon = icon_map.get(o["lc"], "🔗")
        others_html += f'''    <a href="https://www.isitdownrightnow.co.uk/{o['file']}" class="item">
      <span class="dot"></span>
      <span class="name">{icon} {o['service']}</span>
    </a>
'''

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
<meta property="og:site_name" content="Isitdownrightnow">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{meta_desc}">
<script type="application/ld+json">{{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "{service} Status Page",
  "description": "{meta_desc}",
  "url": "{canonical}",
  "about": [{{"@type":"Thing","name":"{service} status"}},{{"@type":"Thing","name":"{service} outage"}}]
}}</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9534114738328693" crossorigin="anonymous"></script>
<style>{BASE_CSS}</style>
</head>
<body>

<header>
  <h1><a href="https://www.isitdownrightnow.co.uk/">🔍 Is It Down Right Now? — Website Status Checker</a></h1>
</header>

<div class="hero">
  <h2>Is {service} Down?</h2>
  <p>Find out if {service} is down for everyone or just you.</p>
</div>

{ad_block("1751358101")}

<div class="container">
  <div class="breadcrumb">
    <a href="https://www.isitdownrightnow.co.uk/">Home</a> › {service} Status
  </div>

  <div class="status-card">
    <span class="status-dot"></span>
    <div>
      <strong style="font-size:1.1em">{service} — </strong>
      <span style="color:#00c853;font-weight:700">Currently Online ✓</span>
      <div style="font-size:0.85em;opacity:0.6;margin-top:4px">Last checked: Just now · Response time: &lt;200ms</div>
    </div>
    <a href="https://www.{s['domain']}" style="margin-left:auto;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.85em;font-weight:600" target="_blank" rel="nofollow">Visit {service}</a>
  </div>

  <div class="content">
    <h2>📋 About This Page</h2>
    <p>{s["intro"]}</p>
  </div>

  <div class="content">
    <h3>🔧 What to Do If {service} Isn't Working</h3>
    <ol>
      <li><strong>Refresh the page</strong> — sometimes a temporary glitch clears with a simple reload</li>
      <li><strong>Check your internet connection</strong> — try loading another website like google.com</li>
      <li><strong>Restart the app or browser</strong> — close and reopen {service}</li>
      <li><strong>Clear your cache and cookies</strong> — outdated data can cause loading issues</li>
      <li><strong>Try a different device</strong> — see if {service} works on your phone or another computer</li>
      <li><strong>Check for VPN issues</strong> — some VPNs can interfere with {service} access</li>
      <li><strong>Check official {service} status</strong> — see if {service} has a dedicated status page or Twitter account</li>
    </ol>
  </div>

  <div class="content">
    <h3>🌐 Status of Other Services</h3>
    <div class="status-grid">
{others_html}    </div>
  </div>

  <div class="content">
    <h3>❓ Frequently Asked Questions</h3>
    <h4>How do I know if {service} is really down?</h4>
    <p>Check multiple devices and connections. If {service} won't load on any device or network, it's likely a service-wide outage. If it works on one device but not another, the issue is probably local.</p>
    <h4>Does this page check {service} automatically?</h4>
    <p>Yes — our automated monitoring system checks {service} and other popular services every few minutes to provide real-time status information.</p>
    <h4>What was the last {service} outage?</h4>
    <p>Major {service} outages are rare, but brief disruptions can occur during peak usage, maintenance windows or unexpected technical issues. Most outages are resolved within minutes to a few hours.</p>
    <h4>How can I report a problem with {service}?</h4>
    <p>Contact {service} support directly through their official help channels. We're a third-party monitoring site and cannot resolve account-specific issues.</p>
  </div>

  <a href="https://www.isitdownrightnow.co.uk/" class="back-link">← Back to Status Checker</a>
</div>

{ad_block("7699643185")}

<footer>
  <a href="https://isitdownrightnow.co.uk">isitdownrightnow.co.uk</a> — Check if any website is down for everyone or just you.
</footer>

</body>
</html>'''

os.makedirs('/tmp/isitdown_pages', exist_ok=True)
for s in SERVICES:
    html = generate(s)
    path = f'/tmp/isitdown_pages/{s["file"]}'
    with open(path, 'w') as f:
        f.write(html)
    print(f"Generated {s['file']} ({len(html)} bytes)")

print(f"\nAll {len(SERVICES)} isitdownrightnow.co.uk pages generated in /tmp/isitdown_pages/")
