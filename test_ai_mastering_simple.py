#!/usr/bin/env python3
"""
Simple AI Mastering API Test
"""

import json
import os

print("🔊 AI Mastering API - Quick Setup Check")
print("=" * 60)

# Check credentials file
creds_path = '/home/node/.openclaw/workspace/ai_mastering_credentials.json'
if os.path.exists(creds_path):
    with open(creds_path, 'r') as f:
        creds = json.load(f)
    
    api_key = creds['api_key']
    print(f"✅ API Key loaded: {api_key[:20]}...")
    print(f"   Service: {creds.get('service', 'AI Mastering')}")
    print(f"   Base URL: {creds.get('base_url', 'https://api.bakuage.com:443')}")
else:
    print("❌ Credentials file not found")
    api_key = "guest_hd7mrkofk84pufkig0jlc35ed55f9ees3c4c3nopi7c"
    print(f"   Using provided key: {api_key[:20]}...")

print("\n🎯 What You Can Do with AI Mastering:")

examples = [
    "1. 🎵 Master music tracks to streaming quality",
    "2. 🎤 Enhance podcast audio for clarity",
    "3. 📱 Improve voice recordings from your phone",
    "4. 🎥 Fix audio in videos for better quality",
    "5. 🎮 Enhance game audio or sound effects"
]

for example in examples:
    print(f"   {example}")

print("\n📋 Required for Testing:")
print("   1. An audio file (MP3, WAV, etc.)")
print("   2. Python requests library installed")
print("   3. Internet connection")

print("\n🛠️ To Install Dependencies:")
print("   pip install requests")

print("\n🚀 Quick Start Command:")
print("   python3 ai_mastering_system.py")

print("\n📁 Files Created for You:")
files = [
    ("ai_mastering_credentials.json", "Your API key storage"),
    ("ai_mastering_system.py", "Complete mastering system"),
    ("AI_MASTERING_SETUP.md", "Setup guide and documentation")
]

for filename, description in files:
    if os.path.exists(f"/home/node/.openclaw/workspace/{filename}"):
        print(f"   ✅ {filename:30} - {description}")
    else:
        print(f"   ❌ {filename:30} - Missing")

print("\n" + "=" * 60)
print("🎯 NEXT STEPS:")
print("1. Install: pip install requests")
print("2. Test: python3 ai_mastering_system.py")
print("3. Try with a test audio file")
print("4. Or download desktop version for offline use")
print("=" * 60)

print("\n💡 Desktop Version (Offline):")
print("   GitHub: https://github.com/ai-mastering/phaselimiter-gui")
print("   No API key needed")
print("   Works completely offline")

print("\n🦊 Your audio mastering power-up is ready!")
print("   Just needs the requests library to start. ✨")