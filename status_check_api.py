#!/usr/bin/env python3
"""Status checker API for isitdownrightnow.co.uk.
Supports:
  /api/check?url=netflix.com  - Check any URL
  /api/status                 - Return status of all monitored services
  /api/refresh                - Force refresh all monitored services
Runs on port 5002."""
import http.server
import json
import socket
import threading
import time
import urllib.parse
from datetime import datetime, timezone

MONITORED = {
    "Google": "google.com",
    "YouTube": "youtube.com",
    "GitHub": "github.com",
    "Reddit": "reddit.com",
    "Twitter/X": "twitter.com",
    "Instagram": "instagram.com",
    "WhatsApp": "whatsapp.com",
    "Netflix": "netflix.com",
    "Amazon": "amazon.co.uk",
    "BBC": "bbc.co.uk",
    "Facebook": "facebook.com",
    "Apple": "apple.com",
    "Microsoft": "microsoft.com",
    "Cloudflare": "cloudflare.com",
    "Discord": "discord.com",
}

cache = {"sites": {}, "checked": None}

def check_host(host, port=443):
    """Check if host is reachable on given port."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        start = time.time()
        result = sock.connect_ex((host, port))
        elapsed = int((time.time() - start) * 1000)
        sock.close()
        if result == 0:
            return {"status": "up", "ms": elapsed}
        else:
            return {"status": "down", "ms": elapsed}
    except:
        return {"status": "unreachable", "ms": None}

def refresh_all():
    """Check all monitored services."""
    results = {}
    for name, host in MONITORED.items():
        results[name] = check_host(host)
        time.sleep(0.1)  # rate limit
    cache["sites"] = results
    cache["checked"] = datetime.now(timezone.utc).isoformat()
    return results

class CheckHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        
        if parsed.path == "/check" or parsed.path == "/api/check":
            url = params.get("url", [params.get("host", [None])[0]])[0]
            if not url:
                self.send_json({"status": "error", "message": "No URL specified"})
                return
            # Strip protocol if present
            url = url.replace("https://", "").replace("http://", "").split("/")[0].split("?")[0]
            # Try 443 first, then 80
            result = check_host(url, 443)
            if result["status"] != "up":
                result = check_host(url, 80)
            self.send_json(result)
        
        elif parsed.path == "/api/status":
            if not cache["checked"] or (time.time() - datetime.fromisoformat(cache["checked"]).timestamp() > 120):
                refresh_all()
            self.send_json({"sites": cache["sites"], "checked": cache["checked"]})
        
        elif parsed.path == "/api/refresh":
            refresh_all()
            self.send_json({"sites": cache["sites"], "checked": cache["checked"], "message": "Refreshed"})
        
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")
    
    def send_json(self, data):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def log_message(self, format, *args):
        pass  # keep logs quiet

if __name__ == "__main__":
    # Pre-warm cache
    refresh_all()
    print(f"Status checker API running on port 5002 — {len(MONITORED)} monitored services")
    server = http.server.HTTPServer(("127.0.0.1", 5002), CheckHandler)
    server.serve_forever()
