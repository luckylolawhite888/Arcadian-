#!/usr/bin/env python3
"""
Integrate psychology content into morning briefing
"""

import sys
import os
sys.path.append('/home/node/.openclaw/workspace')

def update_morning_briefing():
    """Update morning briefing generator to include psychology section"""
    
    briefing_file = "/home/node/.openclaw/workspace/morning_briefing_generator.py"
    
    # Read current briefing
    with open(briefing_file, 'r') as f:
        content = f.read()
    
    # Check if psychology section already exists
    if "add_psychology" in content:
        print("✅ Psychology section already exists in morning briefing")
        return
    
    # Find where to insert psychology section (after travel deals, before news)
    # Look for add_travel_deal method and add_news_snippet after it
    lines = content.split('\n')
    
    # Find add_travel_deal method
    travel_deal_start = None
    for i, line in enumerate(lines):
        if "def add_travel_deal" in line:
            travel_deal_start = i
            break
    
    if travel_deal_start is None:
        print("❌ Could not find add_travel_deal method")
        return
    
    # Find the end of add_travel_deal method
    travel_deal_end = None
    indent_level = None
    for i in range(travel_deal_start + 1, len(lines)):
        line = lines[i]
        if line.strip().startswith("def "):
            # Found next method
            travel_deal_end = i
            break
        if line.strip() and indent_level is None:
            # Set indent level from first non-empty line
            indent_level = len(line) - len(line.lstrip())
    
    if travel_deal_end is None:
        travel_deal_end = len(lines)
    
    # Insert psychology method after travel_deal
    psychology_method = '''
    def add_psychology(self):
        """Add daily psychology insights"""
        psych_path = '/home/node/.openclaw/workspace/today_psychology.txt'
        
        if os.path.exists(psych_path):
            with open(psych_path, 'r') as f:
                psych_content = f.read().strip()
            
            self.briefing_parts.append(psych_content + "\\n")
        else:
            # Generate on the fly if file doesn't exist
            from psychology_content_system import PsychologyContentGenerator
            generator = PsychologyContentGenerator()
            psych_content = generator.generate_morning_briefing_section()
            self.briefing_parts.append(psych_content + "\\n")'''
    
    # Insert the method
    lines.insert(travel_deal_end, psychology_method)
    
    # Now update the generate() method to include psychology
    # Find generate method
    generate_start = None
    for i, line in enumerate(lines):
        if "def generate" in line and "(" in line and "self" in line:
            generate_start = i
            break
    
    if generate_start is None:
        print("❌ Could not find generate method")
        return
    
    # Find where travel_deal is called in generate()
    for i in range(generate_start, len(lines)):
        if "self.add_travel_deal()" in lines[i]:
            # Insert psychology after travel_deal
            lines.insert(i + 1, "        self.add_psychology()")
            break
    
    # Write updated content
    with open(briefing_file, 'w') as f:
        f.write('\n'.join(lines))
    
    print("✅ Successfully integrated psychology into morning briefing!")
    print("   - Added add_psychology() method")
    print("   - Added psychology section after travel deals")
    
    # Test the integration
    print("\\n🧪 Testing integration...")
    try:
        from psychology_content_system import PsychologyContentGenerator
        generator = PsychologyContentGenerator()
        
        # Generate today's psychology content
        psych_content = generator.generate_morning_briefing_section()
        
        # Save to file for morning briefing
        with open('/home/node/.openclaw/workspace/today_psychology.txt', 'w') as f:
            f.write(psych_content)
        
        print("✅ Psychology content generated and saved")
        print("\\n📋 Sample psychology section:")
        print("-" * 40)
        print(psych_content)
        print("-" * 40)
        
    except Exception as e:
        print(f"❌ Error testing integration: {e}")

def create_daily_psychology_cron():
    """Create cron job for daily psychology content generation"""
    
    cron_script = '''#!/bin/bash
# Daily Psychology Content Generator
# Runs at 5 AM UTC (6 AM UK time) to prepare for 8 AM briefing

cd /home/node/.openclaw/workspace

# Generate psychology content
python3 psychology_content_system.py > /tmp/psychology_generation.log 2>&1

# Check if successful
if [ $? -eq 0 ]; then
    echo "$(date): Psychology content generated successfully" >> /home/node/.openclaw/workspace/psychology_cron.log
else
    echo "$(date): ERROR generating psychology content" >> /home/node/.openclaw/workspace/psychology_cron.log
fi
'''
    
    cron_file = "/home/node/.openclaw/workspace/generate_daily_psychology.sh"
    
    with open(cron_file, 'w') as f:
        f.write(cron_script)
    
    # Make executable
    os.chmod(cron_file, 0o755)
    
    print(f"✅ Daily psychology cron script created: {cron_file}")
    print("\\n⏰ To schedule daily at 5 AM UTC (6 AM UK):")
    print(f"   crontab -e")
    print(f"   Add: 0 5 * * * {cron_file}")
    print("\\n📝 This ensures psychology content is ready for 8 AM morning briefing")

def main():
    """Main integration function"""
    print("🧠 INTEGRATING PSYCHOLOGY INTO DAILY SYSTEM")
    print("=" * 60)
    
    # 1. Update morning briefing
    update_morning_briefing()
    print()
    
    # 2. Create cron script
    create_daily_psychology_cron()
    print()
    
    # 3. Generate first psychology content
    print("🎭 GENERATING FIRST PSYCHOLOGY CONTENT")
    print("=" * 60)
    
    try:
        from psychology_content_system import PsychologyContentGenerator
        generator = PsychologyContentGenerator()
        
        # Full daily content
        full_content = generator.generate_daily_content()
        print(full_content)
        print()
        
        # Save full content
        full_file = generator.save_daily_content()
        print(f"📄 Full content saved to: {full_file}")
        
        # Save briefing section
        briefing_section = generator.generate_morning_briefing_section()
        briefing_file = "/home/node/.openclaw/workspace/today_psychology.txt"
        
        with open(briefing_file, 'w') as f:
            f.write(briefing_section)
        
        print(f"📋 Briefing section saved to: {briefing_file}")
        
        # Test quote
        quote = generator.get_todays_psychology_quote()
        print(f"💬 Today's psychology quote: {quote}")
        
    except Exception as e:
        print(f"❌ Error generating content: {e}")
    
    print("=" * 60)
    print("✅ PSYCHOLOGY SYSTEM READY!")
    print("\\n🎯 What's been set up:")
    print("   1. Psychology content generator with 5 categories")
    print("   2. Integration into morning briefing")
    print("   3. Daily themes (Mindset Monday, etc.)")
    print("   4. Witty commentary in your preferred style")
    print("   5. Cron script for automatic daily generation")
    print("\\n🦊 Psychology-powered mornings start tomorrow!")

if __name__ == "__main__":
    main()