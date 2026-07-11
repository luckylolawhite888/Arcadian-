#!/usr/bin/env python3
"""
Lola Calendar API Server
=========================
Lightweight calendar API for the Telegram Mini App.
Runs on IONOS server behind nginx.
SQLite storage — no Google, no third parties.
"""

import json
import sqlite3
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime, date
from urllib.parse import urlparse, parse_qs

DB_PATH = "/root/lola-calendar/calendar.db"
PORT = 8020

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT DEFAULT '',
            desc TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    c.execute("CREATE INDEX IF NOT EXISTS idx_date ON events(date)")
    conn.commit()
    conn.close()

class CalendarAPI(BaseHTTPRequestHandler):
    
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        
        if parsed.path == "/events" and "month" in params and "year" in params:
            month = int(params["month"][0])
            year = int(params["year"][0])
            self._get_events(year, month)
        elif parsed.path == "/events/today":
            self._get_today_events()
        elif parsed.path == "/health":
            self._json_response({"status": "ok", "events_api": "v1"})
        else:
            self._json_response({"error": "not found"}, 404)
    
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b"{}"
        data = json.loads(body)
        
        if self.path == "/events":
            self._add_event(data)
        else:
            self._json_response({"error": "not found"}, 404)
    
    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/events/"):
            event_id = parsed.path.split("/")[-1]
            self._delete_event(event_id)
        else:
            self._json_response({"error": "not found"}, 404)
    
    def do_OPTIONS(self):
        self._send_cors()
        self.send_response(200)
        self.end_headers()
    
    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
    
    def _json_response(self, data, status=200):
        self.send_response(status)
        self._send_cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def _get_events(self, year, month):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Get all events for the month
        prefix = f"{year}-{month:02d}"
        c.execute(
            "SELECT id, title, date, time, desc FROM events WHERE date LIKE ? ORDER BY date, time",
            (f"{prefix}%",)
        )
        
        rows = c.fetchall()
        events_by_date = {}
        
        for row in rows:
            eid, title, date_str, time, desc = row
            if date_str not in events_by_date:
                events_by_date[date_str] = []
            events_by_date[date_str].append({
                "id": eid,
                "title": title,
                "time": time or "",
                "desc": desc or ""
            })
        
        conn.close()
        self._json_response({"events": events_by_date})
    
    def _get_today_events(self):
        today = date.today().isoformat()
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute(
            "SELECT id, title, date, time, desc FROM events WHERE date = ? ORDER BY time",
            (today,)
        )
        rows = c.fetchall()
        events = [{"id": r[0], "title": r[1], "date": r[2], "time": r[3], "desc": r[4]} for r in rows]
        conn.close()
        self._json_response({"events": events, "date": today})
    
    def _add_event(self, data):
        title = data.get("title", "").strip()
        date_str = data.get("date", "")
        time = data.get("time", "")
        desc = data.get("desc", "").strip()
        
        if not title or not date_str:
            self._json_response({"error": "title and date required"}, 400)
            return
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute(
            "INSERT INTO events (title, date, time, desc) VALUES (?, ?, ?, ?)",
            (title, date_str, time, desc)
        )
        conn.commit()
        event_id = c.lastrowid
        conn.close()
        
        self._json_response({"success": True, "id": event_id})
    
    def _delete_event(self, event_id):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("DELETE FROM events WHERE id = ?", (event_id,))
        conn.commit()
        deleted = c.rowcount > 0
        conn.close()
        
        if deleted:
            self._json_response({"success": True})
        else:
            self._json_response({"error": "not found"}, 404)
    
    def log_message(self, format, *args):
        pass  # Quiet logging

if __name__ == "__main__":
    init_db()
    server = HTTPServer(("127.0.0.1", PORT), CalendarAPI)
    print(f"📅 Calendar API running on port {PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
