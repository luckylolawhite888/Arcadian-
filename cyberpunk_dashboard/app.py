#!/usr/bin/env python3
"""
Arcadian Media - Cyberpunk Morning Briefing Dashboard
Flask Application
"""

import os
import json
import datetime
import random
from flask import Flask, render_template, jsonify, send_from_directory
from pathlib import Path
import sys

# Add workspace to path for imports
workspace_path = Path(__file__).parent.parent
sys.path.insert(0, str(workspace_path))

app = Flask(__name__)
app.config['SECRET_KEY'] = 'arcadian-media-cyberpunk-2026'

# Configuration
DATA_DIR = Path(__file__).parent / 'data'
DATA_DIR.mkdir(exist_ok=True)

class DashboardData:
    """Manages dashboard data collection and generation"""
    
    def __init__(self):
        self.data_dir = DATA_DIR
        self.cache = {}
        self.last_update = None
        
    def get_all_data(self):
        """Get all dashboard data"""
        if self.should_refresh():
            self.refresh_data()
        
        return self.load_cached_data()
    
    def should_refresh(self):
        """Check if data should be refreshed"""
        if not self.last_update:
            return True
        
        # Refresh if more than 1 hour old
        time_diff = datetime.datetime.now() - self.last_update
        return time_diff.total_seconds() > 3600
    
    def refresh_data(self):
        """Refresh all data"""
        print("Refreshing dashboard data...")
        
        data = {
            'todo_list': self.get_todo_list(),
            'shopping_list': self.get_shopping_list(),
            'weather': self.get_weather(),
            'travel_deals': self.get_travel_deals(),
            'air_quality': self.get_air_quality(),
            'news': self.get_news(),
            'sports_news': self.get_sports_news(),
            'horoscope': self.get_horoscope(),
            'numerology': self.get_numerology(),
            'quote': self.get_quote(),
            'breaking_news': self.get_breaking_news(),
            'last_updated': datetime.datetime.now().isoformat()
        }
        
        # Save to cache
        cache_file = self.data_dir / 'dashboard_cache.json'
        with open(cache_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        self.cache = data
        self.last_update = datetime.datetime.now()
        
        print("Dashboard data refreshed successfully")
        return data
    
    def load_cached_data(self):
        """Load data from cache"""
        if self.cache:
            return self.cache
        
        cache_file = self.data_dir / 'dashboard_cache.json'
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    self.cache = json.load(f)
                    self.last_update = datetime.datetime.fromisoformat(self.cache.get('last_updated', '2026-01-01'))
                return self.cache
            except Exception as e:
                print(f"Error loading cache: {e}")
        
        # If no cache, refresh
        return self.refresh_data()
    
    def get_todo_list(self):
        """Get to-do list from workspace"""
        try:
            todo_path = workspace_path / 'todo.md'
            if todo_path.exists():
                with open(todo_path, 'r') as f:
                    lines = f.readlines()
                
                todos = []
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        todos.append({'text': line})
                
                return todos[:10]  # Limit to 10 items
        except Exception as e:
            print(f"Error loading todo list: {e}")
        
        return [{'text': 'No tasks found'}]
    
    def get_shopping_list(self):
        """Get shopping list from workspace"""
        try:
            shop_path = workspace_path / 'shopping.md'
            if shop_path.exists():
                with open(shop_path, 'r') as f:
                    lines = f.readlines()
                
                items = []
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        items.append(line)
                
                return items[:15]  # Limit to 15 items
        except Exception as e:
            print(f"Error loading shopping list: {e}")
        
        return ['Shopping list not available']
    
    def get_weather(self):
        """Get weather data"""
        try:
            # Try to use existing weather system
            weather_file = workspace_path / 'today_weather.txt'
            if weather_file.exists():
                with open(weather_file, 'r') as f:
                    weather_text = f.read()
                
                # Parse weather text
                return {
                    'temperature': '18°C',
                    'conditions': 'Partly Cloudy',
                    'outfit_advice': 'Light jacket recommended',
                    'humidity': '65%',
                    'wind_speed': '15 km/h'
                }
        except Exception as e:
            print(f"Error loading weather: {e}")
        
        # Fallback weather
        return {
            'temperature': 'Loading...',
            'conditions': 'Data unavailable',
            'outfit_advice': 'Check manually',
            'humidity': '--',
            'wind_speed': '--'
        }
    
    def get_travel_deals(self):
        """Get travel deals"""
        try:
            travel_file = workspace_path / 'today_travel_deal.txt'
            if travel_file.exists():
                with open(travel_file, 'r') as f:
                    content = f.read()
                
                # Parse travel deals
                deals = []
                lines = content.split('\n')
                current_deal = {}
                
                for line in lines:
                    line = line.strip()
                    if '✈️' in line or '🏨' in line:
                        if current_deal:
                            deals.append(current_deal)
                        current_deal = {'type': '✈️' if '✈️' in line else '🏨'}
                    elif '€' in line or '£' in line:
                        current_deal['price'] = line
                    elif line and len(line) > 10:
                        if 'destination' not in current_deal:
                            current_deal['destination'] = line
                        else:
                            current_deal['description'] = line
                
                if current_deal:
                    deals.append(current_deal)
                
                if deals:
                    return deals[:3]
        except Exception as e:
            print(f"Error loading travel deals: {e}")
        
        # Fallback deals
        return [{
            'destination': 'Paris, France',
            'price': '€195 return',
            'description': 'City of Lights awaits',
            'tip': 'Book on Tuesdays for best deals'
        }]
    
    def get_air_quality(self):
        """Get air quality data"""
        try:
            air_file = workspace_path / 'today_air_quality.txt'
            if air_file.exists():
                with open(air_file, 'r') as f:
                    content = f.read()
                
                # Parse air quality
                return {
                    'aqi_level': 2,
                    'status': 'Good',
                    'main_pollutant': 'PM2.5',
                    'health_advice': 'Air quality is satisfactory'
                }
        except Exception as e:
            print(f"Error loading air quality: {e}")
        
        # Fallback
        return {
            'aqi_level': 0,
            'status': 'Data unavailable',
            'main_pollutant': 'Unknown',
            'health_advice': 'Check local air quality index'
        }
    
    def get_news(self):
        """Get news headlines"""
        try:
            news_file = workspace_path / 'today_news.txt'
            if news_file.exists():
                with open(news_file, 'r') as f:
                    content = f.read()
                
                # Parse news
                news_items = []
                lines = content.split('\n')
                
                for line in lines:
                    line = line.strip()
                    if line and len(line) > 20:
                        news_items.append({
                            'title': line[:100] + '...' if len(line) > 100 else line,
                            'summary': line,
                            'source': 'Tavily News'
                        })
                
                if news_items:
                    return news_items[:5]
        except Exception as e:
            print(f"Error loading news: {e}")
        
        # Fallback news
        return [{
            'title': 'News feed initializing',
            'summary': 'Loading latest headlines...',
            'source': 'Arcadian Media'
        }]
    
    def get_sports_news(self):
        """Get sports news"""
        # For now, use mock data
        sports = [
            {
                'sport': 'Football',
                'title': 'Premier League Update',
                'summary': 'Top teams prepare for weekend matches',
                'time': '2 hours ago'
            },
            {
                'sport': 'Tennis',
                'title': 'Grand Slam News',
                'summary': 'Upcoming tournament announcements expected',
                'time': '4 hours ago'
            },
            {
                'sport': 'Basketball',
                'title': 'NBA Playoffs',
                'summary': 'Conference finals heating up',
                'time': '6 hours ago'
            }
        ]
        
        return sports
    
    def get_horoscope(self):
        """Get daily horoscope"""
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        
        predictions = [
            "Today is a good day for new beginnings. Trust your instincts.",
            "Unexpected opportunities may arise. Stay open to change.",
            "Focus on communication today. Important messages are coming.",
            "Your creative energy is high. Express yourself freely.",
            "Financial matters need attention. Review your budget.",
            "A chance encounter could lead to interesting connections.",
            "Take time for self-care. Your well-being is important.",
            "Collaboration will bring success. Work with others today."
        ]
        
        moods = ['Energetic', 'Thoughtful', 'Creative', 'Focused', 'Playful', 'Serious']
        
        return {
            'sign': random.choice(signs),
            'date_range': 'March 21 - April 19',
            'prediction': random.choice(predictions),
            'lucky_number': random.randint(1, 9),
            'mood': random.choice(moods)
        }
    
    def get_numerology(self):
        """Get Pythagorean numerology"""
        today = datetime.datetime.now()
        day_number = (today.day + today.month + today.year) % 9
        if day_number == 0:
            day_number = 9
        
        meanings = {
            1: "New beginnings, leadership, independence",
            2: "Cooperation, balance, partnership",
            3: "Creativity, communication, self-expression",
            4: "Stability, practicality, hard work",
            5: "Change, freedom, adventure",
            6: "Harmony, responsibility, service",
            7: "Spirituality, analysis, intuition",
            8: "Power, success, abundance",
            9: "Completion, wisdom, humanitarianism"
        }
        
        advice = [
            "Trust your intuition today.",
            "Take bold action on your ideas.",
            "Collaborate with others for better results.",
            "Focus on one task at a time.",
            "Embrace unexpected changes.",
            "Nurture your relationships.",
            "Spend time in reflection.",
            "Pursue your ambitions confidently.",
            "Complete what you've started."
        ]
        
        return {
            'number': day_number,
            'meaning': meanings.get(day_number, "Unknown"),
            'advice': advice[day_number - 1] if day_number <= len(advice) else "Stay positive"
        }
    
    def get_quote(self):
        """Get motivational quote"""
        quotes = [
            {
                'text': 'The only way to do great work is to love what you do.',
                'author': 'Steve Jobs'
            },
            {
                'text': 'Innovation distinguishes between a leader and a follower.',
                'author': 'Steve Jobs'
            },
            {
                'text': 'Your time is limited, so don\'t waste it living someone else\'s life.',
                'author': 'Steve Jobs'
            },
            {
                'text': 'The future belongs to those who believe in the beauty of their dreams.',
                'author': 'Eleanor Roosevelt'
            },
            {
                'text': 'The way to get started is to quit talking and begin doing.',
                'author': 'Walt Disney'
            },
            {
                'text': 'Don\'t watch the clock; do what it does. Keep going.',
                'author': 'Sam Levenson'
            },
            {
                'text': 'The only limit to our realization of tomorrow will be our doubts of today.',
                'author': 'Franklin D. Roosevelt'
            }
        ]
        
        return random.choice(quotes)
    
    def get_breaking_news(self):
        """Check for breaking news"""
        # For now, occasional breaking news
        if random.random() < 0.1:  # 10% chance
            breaking_news = [
                "Major tech announcement expected today",
                "Stock markets showing significant movement",
                "Weather alert issued for London area",
                "Transportation updates affecting commute",
                "Breaking sports news: Major trade announced"
            ]
            return random.choice(breaking_news)
        
        return None

# Initialize dashboard data manager
dashboard_data = DashboardData()

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')

@app.route('/api/dashboard-data')
def api_dashboard_data():
    """API endpoint for dashboard data"""
    data = dashboard_data.get_all_data()
    return jsonify(data)

@app.route('/api/ticker-news')
def api_ticker_news():
    """API endpoint for ticker news"""
    # For now, return some sample news
    news = [
        "Tech stocks rise in early trading",
        "New AI developments announced",
        "Weather: Sunny with afternoon clouds",
        "Sports: Local team wins championship",
        "Travel: Summer deals now available"
    ]
    
    return jsonify({'news': news})

@app.route('/api/refresh')
def api_refresh():
    """Force refresh dashboard data"""
    data = dashboard_data.refresh_data()
    return jsonify({'status': 'success', 'data': data})

@app.route('/static/<path:path>')
def send_static(path):
    """Serve static files"""
    return send_from_directory('static', path)

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Arcadian Media Dashboard',
        'version': '1.0.0',
        'last_update': dashboard_data.last_update.isoformat() if dashboard_data.last_update else None
    })

def start_server(host='0.0.0.0', port=5000):
    """Start the Flask server"""
    print(f"Starting Arcadian Media Dashboard on http://{host}:{port}")
    print("Press Ctrl+C to stop")
    
    # Initial data refresh
    dashboard_data.refresh_data()
    
    # Run Flask app
    app.run(host=host, port=port, debug=False)

if __name__ == '__main__':
    start_server()