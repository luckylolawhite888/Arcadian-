#!/usr/bin/env python3
"""
Test briefing generation
"""

import sys
import os
from datetime import datetime

sys.path.append('/home/node/.openclaw/workspace')

try:
    from morning_briefing_generator import MorningBriefing
    print("✅ MorningBriefing import successful")
    
    # Create briefing instance
    briefing = MorningBriefing()
    print("✅ Briefing instance created")
    
    # Test basic methods
    briefing.add_greeting()
    briefing.add_date_info()
    
    print("✅ Basic briefing methods work")
    print(f"✅ Date: {datetime.now().strftime('%A, %B %d, %Y')}")
    print(f"✅ Time: {datetime.now().strftime('%H:%M')} BST")
    
    # Check for travel deal file
    travel_file = "/home/node/.openclaw/workspace/today_travel_deal.txt"
    if os.path.exists(travel_file):
        with open(travel_file, 'r') as f:
            travel_content = f.read()
        print(f"✅ Travel deal file exists ({len(travel_content)} chars)")
    else:
        print("⚠️  No travel deal file found (may need to generate)")
    
    # Check for previous briefing
    briefing_file = "/home/node/.openclaw/workspace/todays_briefing.md"
    if os.path.exists(briefing_file):
        print(f"✅ Previous briefing file exists")
    else:
        print("ℹ️  No previous briefing file (will create new)")
        
    print("\n✅ Briefing system test PASSED")
    print("✅ Ready to generate briefing for 11:00 AM BST")
    
except Exception as e:
    print(f"❌ Briefing test FAILED: {e}")
    import traceback
    traceback.print_exc()