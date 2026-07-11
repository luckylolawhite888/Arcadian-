#!/usr/bin/env python3
"""
Psychology-Inspired Content System
Daily motivational content in the "Secrets of Psychology" style
"""

import random
from datetime import datetime
import json
import os

class PsychologyContentGenerator:
    def __init__(self):
        # Core psychology principles database
        self.principles = {
            "stoicism": [
                "You control your reactions, not events.",
                "The obstacle is the way.",
                "Waste no time arguing what a good person should be. Be one.",
                "He who fears death will never do anything worth of a man who is alive.",
                "The happiness of your life depends upon the quality of your thoughts."
            ],
            "cognitive": [
                "Your thoughts create your reality.",
                "Challenge your assumptions or they'll challenge you.",
                "The story you tell yourself becomes the life you live.",
                "Emotions are data, not directives.",
                "What you focus on expands."
            ],
            "behavioral": [
                "Small actions compound into massive results.",
                "Consistency beats intensity every time.",
                "Your environment shapes your behavior more than your willpower.",
                "Habits are the compound interest of self-improvement.",
                "Motion creates emotion."
            ],
            "entrepreneurial": [
                "The market doesn't care about your feelings.",
                "Execution beats ideas 100% of the time.",
                "Your first version will be wrong. Ship it anyway.",
                "Revenue solves most problems.",
                "Talk to customers more than you talk to yourself."
            ],
            "digital_age": [
                "Attention is the new currency. Spend it wisely.",
                "Your digital footprint outlives your memory.",
                "Algorithms don't have feelings. Optimize accordingly.",
                "The internet remembers everything. Act accordingly.",
                "Your online presence is your permanent resume."
            ]
        }
        
        # Witty commentary templates (in the style you showed)
        self.commentary_templates = [
            "The weak {weak_action}. The strong {strong_action}.",
            "They say {common_belief}. They're wrong.",
            "{topic} doesn't {verb} people — it reveals them.",
            "Your future isn't built by {abstract_concept}, but by {concrete_action}.",
            "If you want {desired_outcome}, you must accept {required_cost}.",
            "{thing} punishes {negative_trait} and rewards {positive_trait}.",
            "No one is coming to {rescue_action}. You are the cavalry.",
            "You won't regret {action_taken}. You'll regret {inaction}.",
            "{resource} multiplies with {positive_behavior}. It evaporates with {negative_behavior}.",
            "The {desired_result} you want lives on the other side of {required_effort}."
        ]
        
        # Daily themes
        self.daily_themes = {
            0: "Mindset Monday",      # Stoicism & mindset
            1: "Tactical Tuesday",    # Execution & action
            2: "Wisdom Wednesday",    # Cognitive principles
            3: "Hustle Thursday",     # Entrepreneurial
            4: "Future Friday",       # Digital age & trends
            5: "Reflection Saturday", # Behavioral insights
            6: "Strategy Sunday"      # Weekly planning
        }
        
        # Emoji mapping for themes
        self.theme_emojis = {
            "Mindset Monday": "🧠",
            "Tactical Tuesday": "🎯",
            "Wisdom Wednesday": "💡",
            "Hustle Thursday": "⚡",
            "Future Friday": "🚀",
            "Reflection Saturday": "🪞",
            "Strategy Sunday": "🗺️"
        }
    
    def get_daily_theme(self):
        """Get today's theme based on day of week"""
        today = datetime.now().weekday()
        theme = self.daily_themes[today]
        emoji = self.theme_emojis[theme]
        return f"{emoji} {theme}"
    
    def generate_rule(self, category=None):
        """Generate a psychology-inspired rule"""
        if category is None:
            category = random.choice(list(self.principles.keys()))
        
        # Get base principle
        principle = random.choice(self.principles[category])
        
        # Generate witty commentary
        template = random.choice(self.commentary_templates)
        
        # Fill template based on category
        if category == "stoicism":
            filled = template.format(
                weak_action="complain about circumstances",
                strong_action="change their response",
                common_belief="you can control everything",
                topic="Adversity",
                verb="break",
                abstract_concept="wishing things were different",
                concrete_action="accepting what is and acting accordingly",
                desired_outcome="peace",
                required_cost="letting go of control",
                thing="Life",
                negative_trait="resistance",
                positive_trait="acceptance",
                rescue_action="make you resilient",
                action_taken="facing discomfort",
                inaction="avoiding growth opportunities",
                resource="Inner peace",
                positive_behavior="acceptance",
                negative_behavior="resistance",
                desired_result="serenity",
                required_effort="surrendering control"
            )
        elif category == "entrepreneurial":
            filled = template.format(
                weak_action="wait for perfect conditions",
                strong_action="create momentum",
                common_belief="ideas are everything",
                topic="Success",
                verb="create",
                abstract_concept="brilliant ideas",
                concrete_action="consistent execution",
                desired_outcome="business growth",
                required_cost="imperfect action",
                thing="The market",
                negative_trait="perfectionism",
                positive_trait="shipping",
                rescue_action="build your business for you",
                action_taken="launching something imperfect",
                inaction="polishing forever",
                resource="Momentum",
                positive_behavior="action",
                negative_behavior="overthinking",
                desired_result="traction",
                required_effort="public vulnerability"
            )
        else:  # Generic fill
            filled = template.format(
                weak_action="wait",
                strong_action="act",
                common_belief="it's complicated",
                topic="Character",
                verb="change",
                abstract_concept="big dreams",
                concrete_action="small decisions",
                desired_outcome="results",
                required_cost="action",
                thing="Discipline",
                negative_trait="procrastination",
                positive_trait="consistency",
                rescue_action="do the work for you",
                action_taken="trying and failing",
                inaction="never starting",
                resource="Progress",
                positive_behavior="daily effort",
                negative_behavior="excuses",
                desired_result="transformation",
                required_effort="uncomfortable consistency"
            )
        
        return f"{principle}\n*\"{filled}\"*"
    
    def generate_daily_content(self, num_rules=3):
        """Generate complete daily psychology content"""
        theme = self.get_daily_theme()
        
        content = f"# {theme}\n"
        content += "## Psychology Insights for Today\n\n"
        
        # Generate rules
        categories = list(self.principles.keys())
        random.shuffle(categories)
        
        for i in range(min(num_rules, len(categories))):
            rule = self.generate_rule(categories[i])
            content += f"**Rule {i+1}:** {rule}\n\n"
        
        # Add call to action
        content += "---\n"
        content += "### 🦊 Today's Challenge:\n"
        
        challenges = [
            "Identify one assumption you're making and question it.",
            "Take one small action you've been avoiding.",
            "Notice three things you're grateful for right now.",
            "Have one difficult conversation you've been postponing.",
            "Eliminate one distraction for the next hour.",
            "Teach someone one thing you learned today.",
            "Write down three goals for tomorrow before bed."
        ]
        
        content += f"*{random.choice(challenges)}*\n\n"
        
        # Add signature
        content += "---\n"
        content += "**Psychology-powered by Lola** 🦊\n"
        content += "*Daily mental upgrades for the ambitious*"
        
        return content
    
    def generate_morning_briefing_section(self):
        """Generate psychology section for morning briefing"""
        theme = self.get_daily_theme()
        
        section = f"## {theme}\n\n"
        
        # One powerful rule for the day
        rule = self.generate_rule()
        section += f"💭 **Today's Mental Upgrade:**\n{rule}\n\n"
        
        # Quick challenge
        quick_challenges = [
            "Challenge one assumption today.",
            "Take one imperfect action.",
            "Notice what you're avoiding.",
            "Practice 5 minutes of focused attention.",
            "Have one brave conversation."
        ]
        
        section += f"🎯 **Micro-challenge:** *{random.choice(quick_challenges)}*\n\n"
        
        return section
    
    def save_daily_content(self, filepath=None):
        """Save today's psychology content to file"""
        if filepath is None:
            date_str = datetime.now().strftime("%Y-%m-%d")
            filepath = f"/home/node/.openclaw/workspace/psychology_{date_str}.md"
        
        content = self.generate_daily_content()
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"✅ Psychology content saved to: {filepath}")
        return filepath
    
    def get_todays_psychology_quote(self):
        """Get a standalone psychology quote for other uses"""
        quotes = [
            "Your mind is software. Program it wisely.",
            "Discipline is choosing between what you want now and what you want most.",
            "The quality of your life is the quality of your questions.",
            "You don't rise to the level of your goals. You fall to the level of your systems.",
            "What you tolerate, you cannot change.",
            "Clarity comes from engagement, not thought.",
            "Your environment is stronger than your willpower. Design it accordingly.",
            "Motion creates emotion. Action precedes motivation.",
            "The story you tell yourself becomes the life you live.",
            "Your attention is your most valuable asset. Guard it fiercely."
        ]
        
        return random.choice(quotes)

def main():
    """Generate and display today's psychology content"""
    print("🧠 Generating Psychology-Inspired Content...")
    print("=" * 60)
    
    generator = PsychologyContentGenerator()
    
    # Show theme
    theme = generator.get_daily_theme()
    print(f"Today's Theme: {theme}")
    print()
    
    # Generate content
    content = generator.generate_daily_content()
    print(content)
    print()
    
    # Save to file
    saved_file = generator.save_daily_content()
    
    print("=" * 60)
    print("✅ Daily psychology content ready!")
    print(f"📁 Saved to: {saved_file}")
    
    # Also save a version for morning briefing
    briefing_section = generator.generate_morning_briefing_section()
    briefing_file = "/home/node/.openclaw/workspace/today_psychology.txt"
    
    with open(briefing_file, 'w') as f:
        f.write(briefing_section)
    
    print(f"📋 Morning briefing section saved to: {briefing_file}")

if __name__ == "__main__":
    main()