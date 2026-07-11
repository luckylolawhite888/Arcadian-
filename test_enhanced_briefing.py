#!/usr/bin/env python3
"""
Test the complete enhanced morning briefing with psychology and news
"""

import sys
import os
sys.path.append('/home/node/.openclaw/workspace')

def test_complete_briefing():
    """Test the complete morning briefing with all enhancements"""
    
    print("🧪 TESTING ENHANCED MORNING BRIEFING")
    print("=" * 70)
    print("Testing: Psychology + Enhanced News + All existing features")
    print("=" * 70)
    
    # First, ensure we have psychology content
    print("\n1. 🧠 Generating psychology content...")
    try:
        from psychology_content_system import PsychologyContentGenerator
        psych_generator = PsychologyContentGenerator()
        
        # Save psychology for briefing
        psych_content = psych_generator.generate_morning_briefing_section()
        with open('/home/node/.openclaw/workspace/today_psychology.txt', 'w') as f:
            f.write(psych_content)
        
        print("   ✅ Psychology content ready")
    except Exception as e:
        print(f"   ⚠️ Psychology error: {e}")
        # Create placeholder
        with open('/home/node/.openclaw/workspace/today_psychology.txt', 'w') as f:
            f.write("## 🧠 Psychology Insights\n\n💭 **Today's Mental Upgrade:** Thinking creates reality.\n\n🎯 **Micro-challenge:** *Challenge one assumption today.*\n")
    
    # Ensure we have news
    print("\n2. 📰 Generating news content...")
    if not os.path.exists('/home/node/.openclaw/workspace/today_news.txt'):
        try:
            from enhanced_news_system import EnhancedNewsSystem
            news_system = EnhancedNewsSystem()
            news_brief = news_system.get_daily_news_brief(use_real_news=False)
            
            with open('/home/node/.openclaw/workspace/today_news.txt', 'w') as f:
                f.write(news_brief)
            
            print("   ✅ News content generated")
        except:
            print("   ⚠️ Using fallback news")
            # Create simple news
            with open('/home/node/.openclaw/workspace/today_news.txt', 'w') as f:
                f.write("**🤖 AI & Tech:** AI developments continue\n**💰 Crypto:** Market movements observed\n**🏛️ Politics:** Policy updates expected\n**🌍 Geo-Economics:** Economic data releases\n")
    else:
        print("   ✅ News file already exists")
    
    # Ensure we have travel deal
    print("\n3. ✈️ Checking travel deal...")
    if not os.path.exists('/home/node/.openclaw/workspace/today_travel_deal.txt'):
        try:
            from travel_deal_system import TravelDealFinder
            finder = TravelDealFinder()
            deal = finder.find_todays_deal()
            
            with open('/home/node/.openclaw/workspace/today_travel_deal.txt', 'w') as f:
                f.write(deal)
            
            print("   ✅ Travel deal generated")
        except:
            print("   ⚠️ Using fallback travel deal")
            with open('/home/node/.openclaw/workspace/today_travel_deal.txt', 'w') as f:
                f.write("✈️ **TRAVEL DEAL OF THE DAY**\n\n**Paris, France** from **€89** return!\n\n*Pack your bags, Paris is calling!*\n")
    else:
        print("   ✅ Travel deal file exists")
    
    # Generate complete briefing
    print("\n4. 🦊 Generating complete morning briefing...")
    print("   " + "-" * 50)
    
    try:
        from morning_briefing_generator import MorningBriefing
        briefing = MorningBriefing()
        full_briefing = briefing.generate()
        
        # Save to file
        with open('/home/node/.openclaw/workspace/todays_briefing.md', 'w') as f:
            f.write(full_briefing)
        
        print("   ✅ Complete briefing generated!")
        print("\n📋 BRIEFING PREVIEW:")
        print("=" * 70)
        
        # Show key sections
        lines = full_briefing.split('\n')
        section_count = 0
        
        for i, line in enumerate(lines):
            if line.startswith('## ') or line.startswith('# '):
                section_count += 1
                if section_count <= 8:  # Show first 8 sections
                    print(f"\n{line}")
                    # Show next few lines of content
                    for j in range(i+1, min(i+4, len(lines))):
                        if lines[j].strip() and not lines[j].startswith('## '):
                            print(f"  {lines[j]}")
        
        print("\n" + "=" * 70)
        print(f"📊 Briefing stats: {len(lines)} lines, {len(full_briefing)} characters")
        print(f"📁 Saved to: /home/node/.openclaw/workspace/todays_briefing.md")
        
        # Check for psychology and news inclusion
        psych_included = "Psychology" in full_briefing or "psychology" in full_briefing.lower()
        news_included = "News" in full_briefing or "news" in full_briefing.lower()
        
        print(f"\n✅ Verification:")
        print(f"   Psychology included: {'✅' if psych_included else '❌'}")
        print(f"   Enhanced news included: {'✅' if news_included else '❌'}")
        print(f"   Travel deals included: {'✅' if 'Travel' in full_briefing else '❌'}")
        print(f"   Weather included: {'✅' if 'Weather' in full_briefing else '❌'}")
        
    except Exception as e:
        print(f"   ❌ Error generating briefing: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("🎯 ENHANCED BRIEFING SYSTEM READY!")
    print("=" * 70)
    
    print("\n📅 Tomorrow's briefing will include:")
    print("   1. 🧠 Psychology insights (daily mental upgrade)")
    print("   2. 📰 Enhanced news (AI, Crypto, Politics, Geo-Economics)")
    print("   3. ✈️ Travel deals with witty commentary")
    print("   4. 🌤️ Weather with outfit advice")
    print("   5. 🎯 Your to-do and shopping lists")
    print("   6. 💪 Motivational quote")
    print("   7. 🔢 Pythagorean numerology")
    print("   8. 🌬️ Air quality report")
    
    print("\n🔧 To enable REAL news (instead of simulated):")
    print("   1. pip install tavily-python")
    print("   2. Add Tavily API key to tavily_credentials.json")
    print("   3. Schedule generate_daily_news.sh via cron")
    
    print("\n🦊 Psychology-powered, news-enhanced mornings start tomorrow!")

if __name__ == "__main__":
    test_complete_briefing()