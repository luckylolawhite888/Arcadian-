#!/usr/bin/env python3
"""
GPREG API Server — tiny REST API for Lola Sheets tracker.
Stores entries in a JSON file so Lola can write entries server-side.
"""
import json, os, sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

DATA_FILE = "/var/www/thenewworldorder/gpreg_data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE) as f:
            return json.load(f)
    return []

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

class GPREGHandler(BaseHTTPRequestHandler):
    def _set_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/entries":
            data = load_data()
            self.send_response(200)
            self._set_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/entries":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            entry = json.loads(body)
            data = load_data()
            entry["id"] = len(data) + 1
            entry["created_at"] = entry.get("created_at", "")
            data.append(entry)
            save_data(data)
            self.send_response(201)
            self._set_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True, "id": entry["id"]}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/entries/"):
            entry_id = int(parsed.path.split("/")[-1])
            data = load_data()
            data = [d for d in data if d.get("id") != entry_id]
            save_data(data)
            self.send_response(200)
            self._set_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"[GPREG API] {args[0]} {args[1]} {args[2]}")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8022
    server = HTTPServer(("0.0.0.0", port), GPREGHandler)
    print(f"GPREG API server on :{port}")
    server.serve_forever()
