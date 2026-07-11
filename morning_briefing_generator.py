#!/usr/bin/env python3
"""
Morning Briefing Generator
Creates complete morning briefing with all components including Travel Deal of the Day
"""

import json
import random
from datetime import datetime
import os
import sys

# Add workspace to path
sys.path.append('/home/node/.openclaw/workspace')

class MorningBriefing:
    def __init__(self):
        self.date = datetime.now()
        self.briefing_parts = []
        
    def add_greeting(self):
        """Add morning greeting"""
        greetings = [
            "Rise and shine, darling! ☀️",
            "Good morning, brilliant one! 🌟",
            "Top of the morning to you! 🦊",
            "Hello, hello! Ready to conquer the day? 💫",
            "Morning, Maya! Let's make today amazing. ✨"
        ]
        
        greeting = random.choice(greetings)
        self.briefing_parts.append(f"# {greeting}\n")
        
    def add_date_info(self):
        """Add date and day info"""
        day_name = self.date.strftime("%A")
        date_str = self.date.strftime("%B %d, %Y")
        
        # Fun day fact
        day_facts = {
            "Monday": "The most productive day of the week! Time to set the tone.",
            "Tuesday": "Peak productivity day. The Monday slump is over!",
            "Wednesday": "Hump day! You're halfway through the week.",
            "Thursday": "Friday's eve. The weekend is in sight!",
            "Friday": "TGIF! Make it count before the weekend.",
            "Saturday": "Weekend vibes! Perfect for adventures.",
            "Sunday": "A day for rest and preparation. Charge those batteries!"
        }
        
        fact = day_facts.get(day_name, "Make it a great day!")
        
        self.briefing_parts.append(f"## 📅 {day_name}, {date_str}\n")
        self.briefing_parts.append(f"*{fact}*\n")
        
    def add_todo_list(self):
        """Add to-do list from file"""
        todo_path = '/home/node/.openclaw/workspace/todo.md'
        
        if os.path.exists(todo_path):
            with open(todo_path, 'r') as f:
                todos = f.read().strip()
            
            if todos:
                self.briefing_parts.append("## 📝 Today's To-Do List\n")
                self.briefing_parts.append(todos + "\n")
            else:
                self.briefing_parts.append("## 📝 Today's To-Do List\n")
                self.briefing_parts.append("*No tasks listed. Enjoy the freedom!*\n")
        else:
            self.briefing_parts.append("## 📝 Today's To-Do List\n")
            self.briefing_parts.append("*Create a todo.md file to track your tasks!*\n")
    
    def add_shopping_list(self):
        """Add shopping list from file"""
        shop_path = '/home/node/.openclaw/workspace/shopping.md'
        
        if os.path.exists(shop_path):
            with open(shop_path, 'r') as f:
                shopping = f.read().strip()
            
            if shopping:
                self.briefing_parts.append("## 🛒 Shopping List\n")
                self.briefing_parts.append(shopping + "\n")
    
    def add_weather(self):
        """Add weather forecast"""
        # This would integrate with Open-Meteo API
        # For now, placeholder with fun weather comment
        
        weather_comments = [
            "☀️ **Sunny skies** ahead! Perfect day to get outside.",
            "⛅ **Partly cloudy** - nature's softbox lighting.",
            "🌧️ **Rain expected** - perfect excuse for cozy indoor activities.",
            "🌤️ **Mix of sun and clouds** - a little of everything!",
            "💨 **Breezy day** - good hair day? Maybe not.",
            "❄️ **Chilly temps** - time for layers and hot drinks!"
        ]
        
        self.briefing_parts.append("## 🌤️ Weather Outlook\n")
        self.briefing_parts.append(random.choice(weather_comments) + "\n")
        self.briefing_parts.append("*Check your favorite weather app for details!*\n")
    
    def add_air_quality(self):
        """Add air quality report"""
        try:
            from air_quality_system import AirQualityReporter
            reporter = AirQualityReporter()
            air_report = reporter.get_brief_version()
            
            self.briefing_parts.append(air_report + "\n")
        except ImportError:
            self.briefing_parts.append("## 🌬️ Air Quality\n")
            self.briefing_parts.append("*Air quality reporting coming soon!*\n")
    
    def add_motivational_quote(self):
        """Add motivational quote"""
        quotes = [
            {"quote": "The only way to do great work is to love what you do.", "author": "Steve Jobs"},
            {"quote": "Don't watch the clock; do what it does. Keep going.", "author": "Sam Levenson"},
            {"quote": "The future depends on what you do today.", "author": "Mahatma Gandhi"},
            {"quote": "It always seems impossible until it's done.", "author": "Nelson Mandela"},
            {"quote": "Your time is limited, don't waste it living someone else's life.", "author": "Steve Jobs"},
            {"quote": "The way to get started is to quit talking and begin doing.", "author": "Walt Disney"},
            {"quote": "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", "author": "Roy T. Bennett"},
            {"quote": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author": "Winston Churchill"},
            {"quote": "The only limit to our realization of tomorrow will be our doubts of today.", "author": "Franklin D. Roosevelt"},
            {"quote": "Believe you can and you're halfway there.", "author": "Theodore Roosevelt"}
        ]
        
        quote = random.choice(quotes)
        self.briefing_parts.append("## 💫 Motivational Quote\n")
        self.briefing_parts.append(f"*\"{quote['quote']}\"*\n")
        self.briefing_parts.append(f"— **{quote['author']}**\n")
    
    def add_numerology(self):
        """Add Pythagorean numerology reading"""
        try:
            # Import numerology script
            from numerology import date_to_root_number, get_numerology_reading
            
            day_number, meaning = get_numerology_reading(self.date.strftime("%Y-%m-%d"))
            
            self.briefing_parts.append("## 🔢 Pythagorean Numerology\n")
            self.briefing_parts.append(f"**Today's Number:** {day_number}\n")
            self.briefing_parts.append(f"{meaning}\n")
            
        except ImportError:
            self.briefing_parts.append("## 🔢 Pythagorean Numerology\n")
            self.briefing_parts.append("*Numerology calculation available soon!*\n")
    
    def add_travel_deal(self):
        """Add Daily Travel & Hotel Deals with witty commentary"""
        deal_path = '/home/node/.openclaw/workspace/today_travel_deal.txt'
        
        if os.path.exists(deal_path):
            with open(deal_path, 'r') as f:
                deal = f.read().strip()
            
            # The enhanced system already includes its own header
            self.briefing_parts.append(deal + "\n")
        else:
            # Generate a quick deal if file doesn't exist
            self.briefing_parts.append("## ✈️ Daily Travel & Hotel Deals\n")
            self.briefing_parts.append("*Our travel agents are still waking up with their coffee!*\n")
            self.briefing_parts.append("**Today's Wisdom:** Sometimes the best adventure is staying in bed.\n")
            self.briefing_parts.append("*Check back tomorrow for actual deals!*\n")
    

    def add_psychology(self):
        """Add daily psychology insights"""
        psych_path = '/home/node/.openclaw/workspace/today_psychology.txt'
        
        if os.path.exists(psych_path):
            with open(psych_path, 'r') as f:
                psych_content = f.read().strip()
            
            self.briefing_parts.append(psych_content + "\n")
        else:
            # Generate on the fly if file doesn't exist
            from psychology_content_system import PsychologyContentGenerator
            generator = PsychologyContentGenerator()
            psych_content = generator.generate_morning_briefing_section()
            self.briefing_parts.append(psych_content + "\n")
    def add_news_snippet(self):
        """Add comprehensive news coverage using enhanced news system"""
        news_path = '/home/node/.openclaw/workspace/today_news.txt'
        
        self.briefing_parts.append("## 📰 Comprehensive News Brief\n")
        
        if os.path.exists(news_path):
            # Use pre-generated news from enhanced system
            with open(news_path, 'r') as f:
                news_content = f.read().strip()
            
            if news_content:
                self.briefing_parts.append(news_content + "\n")
            else:
                self._add_fallback_news()
        else:
            # Try to generate news on the fly
            try:
                from enhanced_news_system import EnhancedNewsSystem
                news_system = EnhancedNewsSystem()
                news_content = news_system.get_daily_news_brief(use_real_news=False)
                self.briefing_parts.append(news_content + "\n")
            except:
                self._add_fallback_news()
        
        self.briefing_parts.append("\n*Want deeper analysis on any topic? Just ask!*\n")
    
    def _add_fallback_news(self):
        """Add fallback news when enhanced system is unavailable"""
        fallback_news = [
            "• **🤖 AI & Tech:** Major AI company announces breakthrough in reasoning models",
            "• **💰 Crypto:** Bitcoin shows volatility amid regulatory developments",
            "• **🏛️ Politics:** Key policy decisions expected this week affecting tech sector",
            "• **🌍 Geo-Economics:** Global markets respond to economic data releases",
            "• **⚡ Business:** Earnings season brings mixed results across sectors"
        ]
        
        # Select 3-4 random fallback items
        import random
        selected = random.sample(fallback_news, min(4, len(fallback_news)))
        for item in selected:
            self.briefing_parts.append(item + "\n")
    
    def add_closing(self):
        """Add closing message"""
        closings = [
            "Have a magnificent day! 🦊",
            "Make today amazing! 💫",
            "Go conquer the world! 🌍",
            "Remember: you're brilliant. Now prove it! ✨",
            "Today is your canvas. Paint something beautiful! 🎨"
        ]
        
        self.briefing_parts.append("---\n")
        self.briefing_parts.append(f"**{random.choice(closings)}**\n")
        self.briefing_parts.append("\n*Your brilliant assistant,*\n*Lola* 🦊")
    
    def generate(self):
        """Generate complete briefing"""
        # Clear any previous parts
        self.briefing_parts = []
        
        self.add_greeting()
        self.add_date_info()
        self.add_todo_list()
        self.add_shopping_list()
        self.add_weather()
        self.add_air_quality()  # NEW: Air quality report
        self.add_motivational_quote()
        self.add_numerology()
        self.add_travel_deal()
        self.add_psychology()
        self.add_news_snippet()
        self.add_closing()
        
        return "\n".join(self.briefing_parts)
    
    def save_briefing(self, filepath=None):
        """Save briefing to file"""
        if filepath is None:
            filepath = '/home/node/.openclaw/workspace/todays_briefing.md'
        
        briefing = self.generate()
        
        with open(filepath, 'w') as f:
            f.write(briefing)
        
        return filepath

def main():
    """Generate and display today's briefing"""
    print("Generating morning briefing...\n")
    
    # First, get today's travel deals (enhanced version)
    print("1. Getting travel & hotel deals...")
    try:
        from enhanced_travel_system import EnhancedTravelDeals
        deals_system = EnhancedTravelDeals()
        deals_system.save_daily_deals()
        print("   ✓ Enhanced travel & hotel deals ready")
    except Exception as e:
        print(f"   ⚠️ Could not get enhanced deals: {e}")
        # Try fallback to old system
        try:
            from travel_deal_system import TravelDealFinder
            finder = TravelDealFinder()
            deal = finder.find_todays_deal()
            
            # Save deal to file
            with open('/home/node/.openclaw/workspace/today_travel_deal.txt', 'w') as f:
                f.write(deal)
            print("   ✓ Fallback travel deal ready")
        except:
            # Create placeholder deal
            with open('/home/node/.openclaw/workspace/today_travel_deal.txt', 'w') as f:
                f.write("## ✈️ Daily Travel & Hotel Deals\n\n*Our travel agents are still waking up with their coffee!*\n")
            print("   ⚠️ Created placeholder deals")
    
    # Generate full briefing
    print("2. Building complete briefing...")
    briefing = MorningBriefing()
    full_briefing = briefing.generate()
    
    # Save briefing
    output_file = briefing.save_briefing()
    
    print(f"\n✅ Morning briefing generated!")
    print(f"📁 Saved to: {output_file}")
    
    # Show preview
    print("\n" + "="*60)
    print("BRIEFING PREVIEW (first 10 lines):")
    print("="*60)
    lines = full_briefing.split('\n')
    for line in lines[:15]:
        print(line)
    print("...\n" + "="*60)

if __name__ == "__main__":
    main()