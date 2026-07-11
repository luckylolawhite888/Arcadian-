#!/usr/bin/env python3
"""
Google Vision API Examples
Show what's possible once API is enabled
"""

print("🔍 GOOGLE VISION API - EXAMPLE USES")
print("=" * 60)

examples = [
    {
        "name": "📸 Photo Analysis",
        "description": "Analyze vacation photos to identify locations, objects, and activities",
        "code": """
from vision_api_system import GoogleVisionAPI
vision = GoogleVisionAPI()

# Analyze a photo
result = vision.analyze_image("vacation_photo.jpg")

# Get labels (what's in the photo)
labels = vision.detect_labels("vacation_photo.jpg")
for label in labels[:5]:
    print(f"• {label['description']} ({label['score']:.0%})")
""",
        "output": "• beach (98%)\n• ocean (95%)\n• palm tree (92%)\n• sunset (88%)\n• vacation (85%)"
    },
    {
        "name": "📄 Document OCR",
        "description": "Extract text from scanned documents, receipts, or screenshots",
        "code": """
from vision_api_system import GoogleVisionAPI
vision = GoogleVisionAPI()

# Extract text from document
texts = vision.extract_text("receipt.jpg")

# Print all text found
if texts:
    print("📝 Text extracted:")
    print(texts[0]['text'][:500] + "...")
""",
        "output": "📝 Text extracted:\nSTARBUCKS COFFEE\n123 MAIN ST, LONDON\nDATE: 2026-03-25\nLATTE: £3.50\nCROISSANT: £2.50\nTOTAL: £6.00\n..."
    },
    {
        "name": "😊 Face & Emotion Detection",
        "description": "Detect faces in group photos and analyze emotions",
        "code": """
from vision_api_system import GoogleVisionAPI
vision = GoogleVisionAPI()

# Detect faces
faces = vision.detect_faces("group_photo.jpg")

print(f"😊 Found {len(faces)} faces")
for i, face in enumerate(faces[:3]):
    emotions = []
    for emotion, level in face['emotions'].items():
        if level in ['VERY_LIKELY', 'LIKELY']:
            emotions.append(emotion)
    
    if emotions:
        print(f"  Face {i+1}: {', '.join(emotions)}")
""",
        "output": "😊 Found 4 faces\n  Face 1: joy\n  Face 2: joy, surprise\n  Face 3: joy"
    },
    {
        "name": "🏛️ Landmark Recognition",
        "description": "Identify famous landmarks from travel photos",
        "code": """
from vision_api_system import GoogleVisionAPI
vision = GoogleVisionAPI()

# Analyze landmark photo
result = vision.analyze_image("landmark_photo.jpg", 
    features=[{"type": "LANDMARK_DETECTION", "maxResults": 3}])

# Check for landmarks
if 'landmarkAnnotations' in result['responses'][0]:
    landmarks = result['responses'][0]['landmarkAnnotations']
    for landmark in landmarks:
        print(f"🗺️  {landmark['description']} ({landmark['score']:.0%})")
""",
        "output": "🗺️  Eiffel Tower (96%)\n🗺️  Paris, France (92%)"
    },
    {
        "name": "🛒 Product Identification",
        "description": "Identify products in photos for shopping or price comparison",
        "code": """
from vision_api_system import GoogleVisionAPI
vision = GoogleVisionAPI()

# Analyze product photo
result = vision.analyze_image("product_photo.jpg")

# Check for labels (products)
labels = vision.detect_labels("product_photo.jpg", max_results=5)
print("🛍️  Possible products:")
for label in labels:
    if label['score'] > 0.7:  # High confidence
        print(f"  • {label['description']}")
""",
        "output": "🛍️  Possible products:\n  • iPhone\n  • smartphone\n  • mobile phone\n  • electronics"
    },
    {
        "name": "🔒 Safety Check",
        "description": "Check images for explicit content before sharing",
        "code": """
from vision_api_system import GoogleVisionAPI
vision = GoogleVisionAPI()

# Check image safety
safety = vision.safe_search("image_to_check.jpg")

print("🛡️  Safety Analysis:")
for category, level in safety.items():
    if level in ['LIKELY', 'VERY_LIKELY']:
        print(f"  ⚠️  {category.upper()}: {level}")
    elif level == 'POSSIBLE':
        print(f"  ℹ️  {category.upper()}: {level}")
    else:
        print(f"  ✓ {category.upper()}: {level}")
""",
        "output": "🛡️  Safety Analysis:\n  ✓ ADULT: VERY_UNLIKELY\n  ✓ SPOOF: UNLIKELY\n  ✓ MEDICAL: UNLIKELY\n  ✓ VIOLENCE: UNLIKELY\n  ✓ RACY: UNLIKELY"
    }
]

print("\n🎯 ONCE API IS ENABLED, YOU CAN:\n")

for i, example in enumerate(examples, 1):
    print(f"{i}. {example['name']}")
    print(f"   {example['description']}")
    print()

print("=" * 60)
print("🦊 QUICK START:")
print("1. Enable Vision API: https://console.cloud.google.com/apis/library/vision.googleapis.com")
print("2. Run: python3 test_vision.py")
print("3. Try any example above!")
print("=" * 60)

# Also show the actual API key check
print("\n🔑 YOUR API KEY STATUS:")
print(f"Key: AIzaSyBVzV_4pOUxqWq_DthDfW_dZq9jXCc0WjI")
print("Status: ❓ Not tested (API needs enabling)")
print("\n📋 To enable:")
print("1. Visit Google Cloud Console")
print("2. Search for 'Vision API'")
print("3. Click 'ENABLE'")
print("4. Wait 1-2 minutes")
print("5. Test with: python3 test_vision.py")