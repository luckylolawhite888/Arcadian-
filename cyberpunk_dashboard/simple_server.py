#!/usr/bin/env python3
"""
Simple HTTP server for Arcadian Media Dashboard
Uses Python's built-in HTTP server
"""

import http.server
import socketserver
import json
import os
import datetime
import random
from pathlib import Path
import urllib.parse

# Configuration
PORT = 80
DATA_DIR = Path(__file__).parent / 'data'
DATA_DIR.mkdir(exist_ok=True)

# Sample dashboard data
def generate_sample_data():
    """Generate sample dashboard data"""
    today = datetime.datetime.now()
    
    # Sample to-do list
    todo_list = [
        {"text": "[ ] Get Lex a POS (Point of Sale) system"},
        {"text": "[ ] Research POS options for small businesses"},
        {"text": "[x] Check vault status"},
        {"text": "[x] Test auto-deletion"}
    ]
    
    # Sample shopping list
    shopping_list = [
        "Milk",
        "Eggs",
        "Bread",
        "Coffee"
    ]
    
    # Sample weather
    weather = {
        "temperature": "18°C",
        "conditions": "Partly Cloudy",
        "outfit_advice": "Light jacket recommended",
        "humidity": "65%",
        "wind_speed": "15 km/h"
    }
    
    # Sample travel deals
    travel_deals = [
        {
            "destination": "Paris, France",
            "price": "€195 return",
            "description": "City of Lights awaits",
            "tip": "Book on Tuesdays for best deals"
        },
        {
            "destination": "Madrid, Spain",
            "price": "€220 return",
            "description": "Sunny Spanish getaway",
            "tip": "Direct flights available"
        }
    ]
    
    # Sample air quality
    air_quality = {
        "aqi_level": 2,
        "status": "Good",
        "main_pollutant": "PM2.5",
        "health_advice": "Air quality is satisfactory"
    }
    
    # Sample news
    news = [
        {
            "title": "Tech Stocks Rise in Early Trading",
            "summary": "Major tech companies show gains in pre-market trading.",
            "source": "Financial Times"
        },
        {
            "title": "New AI Developments Announced",
            "summary": "Breakthrough in natural language processing announced.",
            "source": "Tech News"
        }
    ]
    
    # Sample sports news
    sports_news = [
        {
            "sport": "Football",
            "title": "Premier League Update",
            "summary": "Top teams prepare for weekend matches.",
            "time": "2 hours ago"
        },
        {
            "sport": "Tennis",
            "title": "Grand Slam News",
            "summary": "Upcoming tournament announcements expected.",
            "time": "4 hours ago"
        }
    ]
    
    # Sample horoscope
    horoscope = {
        "sign": "Aries",
        "date_range": "March 21 - April 19",
        "prediction": "Today is a good day for new beginnings. Trust your instincts.",
        "lucky_number": 7,
        "mood": "Energetic"
    }
    
    # Sample numerology
    numerology = {
        "number": 5,
        "meaning": "Change, freedom, adventure",
        "advice": "Embrace unexpected changes today."
    }
    
    # Sample quote
    quote = {
        "text": "The only way to do great work is to love what you do.",
        "author": "Steve Jobs"
    }
    
    return {
        "todo_list": todo_list,
        "shopping_list": shopping_list,
        "weather": weather,
        "travel_deals": travel_deals,
        "air_quality": air_quality,
        "news": news,
        "sports_news": sports_news,
        "horoscope": horoscope,
        "numerology": numerology,
        "quote": quote,
        "breaking_news": "Major tech announcement expected today" if random.random() < 0.3 else None,
        "last_updated": today.isoformat()
    }

class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler for the dashboard"""
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urllib.parse.urlparse(self.path)
        
        # API endpoints
        if parsed_path.path == '/api/dashboard-data':
            self.send_api_response(generate_sample_data())
            return
        elif parsed_path.path == '/api/ticker-news':
            self.send_api_response({
                "news": [
                    "Tech stocks rise in early trading",
                    "New AI developments announced",
                    "Weather: Sunny with afternoon clouds",
                    "Sports: Local team wins championship"
                ]
            })
            return
        elif parsed_path.path == '/api/refresh':
            self.send_api_response({
                "status": "success",
                "message": "Dashboard data refreshed"
            })
            return
        elif parsed_path.path == '/health':
            self.send_api_response({
                "status": "healthy",
                "service": "Arcadian Media Dashboard",
                "version": "1.0.0"
            })
            return
        
        # Serve static files or index.html
        if parsed_path.path == '/':
            self.path = '/templates/index.html'
        elif parsed_path.path.startswith('/static/'):
            # Remove /static/ prefix for file serving
            self.path = self.path[7:]
        
        # Let SimpleHTTPRequestHandler serve the file
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def send_api_response(self, data):
        """Send JSON API response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = json.dumps(data, indent=2)
        self.wfile.write(response.encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom log message format"""
        print(f"{self.address_string()} - [{self.log_date_time_string()}] {format % args}")

def start_server():
    """Start the HTTP server"""
    # Change to the dashboard directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create static directory structure if it doesn't exist
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    
    # Start server
    with socketserver.TCPServer(("", PORT), DashboardHandler) as httpd:
        print(f"🚀 Arcadian Media Dashboard running on http://localhost:{PORT}")
        print(f"📊 Dashboard: http://localhost:{PORT}/")
        print(f"📈 API Health: http://localhost:{PORT}/health")
        print(f"🔧 API Data: http://localhost:{PORT}/api/dashboard-data")
        print("\nPress Ctrl+C to stop\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == '__main__':
    start_server()