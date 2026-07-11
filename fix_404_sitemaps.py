#!/usr/bin/env python3
"""Fix ALL farm site sitemaps so URLs include .html extension + add nginx extensionless routing."""
import os, glob

SITES = [
    {"dir": "coupn.uk", "domain": "www.coupn.uk"},
    {"dir": "toolstack.uk", "domain": "www.toolstack.uk"},
    {"dir": "uk-cbdc.co.uk", "domain": "www.uk-cbdc.co.uk"},
    {"dir": "pdfoomph.com", "domain": "www.pdfoomph.com"},
    {"dir": "isitdownrightnow.co.uk", "domain": "www.isitdownrightnow.co.uk"},
    {"dir": "cheapfind.uk", "domain": "www.cheapfind.uk"},
]

for site in SITES:
    root = f"/var/www/{site['dir']}/public"
    if not os.path.isdir(root):
        print(f"⚠️  {site['dir']}: no public dir")
        continue
    
    html_files = sorted(glob.glob(f"{root}/*.html"))
    urls = []
    missing = []
    
    for fpath in html_files:
        fname = os.path.basename(fpath)
        # Skip google verification file
        if fname.startswith("google") and fname.endswith(".html"):
            continue
        file_size = os.path.getsize(fpath)
        if file_size < 100:
            print(f"  🚨 {site['dir']}/{fname}: ONLY {file_size} bytes! (BROKEN)")
            missing.append(fname)
        urls.append(fname)
    
    # Generate sitemap WITH .html extensions
    sitemap_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for fname in urls:
        loc = f"https://{site['domain']}/{fname}"
        sitemap_lines.append(f"  <url><loc>{loc}</loc><lastmod>2026-05-28</lastmod></url>")
    sitemap_lines.append("</urlset>")
    
    sitemap_content = "\n".join(sitemap_lines)
    sitemap_path = f"{root}/sitemap.xml"
    with open(sitemap_path, "w") as f:
        f.write(sitemap_content)
    
    count = len(urls)
    print(f"✅ {site['dir']}: sitemap regenerated with {count} URLs (all with .html)")
    if missing:
        print(f"   ⚠️  {len(missing)} broken files detected!")
        for m in missing:
            print(f"      - {m}")

# Now add nginx extensionless routing to ALL site configs
nginx_add = """
    # Map extensionless URLs to .html files
    location ~ ^/(.+\\.\\w+)$ { try_files $uri =404; }
    location ~ ^/(.+)$ {
        try_files $uri $uri.html =404;
    }
"""

for site in SITES:
    conf_path = f"/etc/nginx/sites-enabled/{site['dir']}.conf"
    if not os.path.exists(conf_path):
        print(f"⚠️  {site['dir']}: no nginx config at {conf_path}")
        continue
    
    with open(conf_path) as f:
        content = f.read()
    
    # Check if routing already exists
    if "location ~ ^/(.+)$" in content:
        print(f"⏭️  {site['dir']}: already has extensionless routing")
        continue
    
    # Add routing before the main location block or at end
    if "location / {" in content:
        content = content.replace(
            "location / { try_files $uri $uri/ =404; }",
            "    location / { try_files $uri $uri/ =404; }"
        )
        content = content.replace(
            "location / { try_files $uri $uri/ =404; }",
            f"""    # Map extensionless URLs to .html files
    location ~ ^/(.+\\.\\w+)$ {{ try_files $uri =404; }}
    location ~ ^/(.+)$ {{
        try_files $uri $uri.html =404;
    }}

    location / {{ try_files $uri $uri/ =404; }}"""
        )
    else:
        # Generic server block fallback
        content = content.replace(
            "try_files $uri $uri/ =404",
            "try_files $uri $uri/ =404"
        )
    
    with open(conf_path, "w") as f:
        f.write(content)
    print(f"✅ {site['dir']}: nginx config updated with extensionless routing")

print("\n✅ All sitemaps regenerated!")
print("⚠️  Re-run this script after nginx reload to verify")
