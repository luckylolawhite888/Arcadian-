#!/usr/bin/env python3
"""
Lola News API — lightweight news endpoint for the calendar mini app
Fetches from Tavily, serves via nginx proxy
"""

import json
import urllib.request
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

TAVILY_KEY = os.environ.get("TAVILY_API_KEY", "")
PORT = 8021

class NewsAPI(BaseHTTPRequestHandler):
    
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        
        if parsed.path == "/news":
            query = params.get("q", ["latest ai tech news"])[0]
            limit = int(params.get("limit", ["6"])[0])
            self._fetch_news(query, limit)
        elif parsed.path == "/health":
            self._json({"status": "ok", "news_api": "v1"})
        else:
            self._json({"error": "not found"}, 404)
    
    def do_OPTIONS(self):
        self._cors()
        self.send_response(200)
        self.end_headers()
    
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
    
    def _json(self, data, status=200):
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def _fetch_news(self, query, limit):
        try:
            # Get Tavily key from vault file
            tavily_key = TAVILY_KEY
            if not tavily_key:
                try:
                    with open("/root/.vault/tavily.json") as f:
                        tavily_key = json.load(f).get("api_key", "")
                except:
                    pass
            
            if tavily_key:
                req = urllib.request.Request(
                    "https://api.tavily.com/search",
                    data=json.dumps({
                        "query": query,
                        "search_depth": "basic",
                        "topic": "general",
                        "max_results": limit
                    }).encode(),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {tavily_key}"
                    }
                )
                resp = urllib.request.urlopen(req, timeout=10)
                data = json.loads(resp.read())
                
                results = []
                for r in data.get("results", []):
                    results.append({
                        "title": r.get("title", ""),
                        "url": r.get("url", ""),
                        "snippet": r.get("content", "")[:200]
                    })
                
                self._json({"results": results, "source": "tavily"})
            else:
                self._json({"error": "no api key"}, 500)
                
        except Exception as e:
            self._json({"error": str(e), "results": []}, 500)
    
    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", PORT), NewsAPI)
    print(f"📰 News API running on port {PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
