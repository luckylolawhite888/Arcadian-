#!/usr/bin/env python3
"""Regenerate sitemaps for all farm sites."""
import os, glob

SITES = [
    {"dir": "coupn.uk", "domain": "www.coupn.uk"},
    {"dir": "toolstack.uk", "domain": "www.toolstack.uk"},
    {"dir": "uk-cbdc.co.uk", "domain": "www.uk-cbdc.co.uk"},
    {"dir": "pdfoomph.com", "domain": "www.pdfoomph.com"},
    {"dir": "isitdownrightnow.co.uk", "domain": "www.isitdownrightnow.co.uk"},
    {"dir": "cheapfind.uk", "domain": "www.cheapfind.uk"},
]

total = 0
for site in SITES:
    root = f"/var/www/{site['dir']}/public"
    if not os.path.isdir(root):
        print(f"⚠️  {site['dir']}: no public dir")
        continue
    
    html_files = sorted(glob.glob(os.path.join(root, "*.html")))
    urls = []
    for fpath in html_files:
        fname = os.path.basename(fpath)
        if fname.startswith("google") and fname.endswith(".html"):
            continue
        file_size = os.path.getsize(fpath)
        if file_size < 100:
            print(f"  🚨 {site['dir']}/{fname}: ONLY {file_size} bytes! (BROKEN)")
        urls.append("https://" + site['domain'] + "/" + fname)
    
    sitemap_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for loc in urls:
        sitemap_lines.append(f"  <url><loc>{loc}</loc><lastmod>2026-05-28</lastmod></url>")
    sitemap_lines.append("</urlset>")
    
    with open(os.path.join(root, "sitemap.xml"), "w") as f:
        f.write("\n".join(sitemap_lines))
    
    total += len(urls)
    print(f"✅ {site['dir']}: {len(urls)} URLs in sitemap")

print(f"\n✅ Total: {total} URLs across {len(SITES)} sites")
