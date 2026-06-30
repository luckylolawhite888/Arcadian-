---
name: google-vision
description: Google Vision API for image analysis, OCR, and content detection
version: 1.0
author: Lola
created: 2026-05-16
---

# Google Vision API

## Status
- **Setup:** Complete
- **Credentials:** `google_vision_credentials.json` in workspace
- **Tested:** ✅ Working

## Capabilities
- **Label detection** — Identify objects, places, activities in images
- **OCR (text detection)** — Extract text from images
- **Face detection** — Detect faces and expressions
- **Landmark detection** — Identify famous locations
- **Logo detection** — Identify brand logos
- **Safe search** — Content moderation

## Scripts
- `vision_api_system.py` — Full Vision API wrapper
- `vision_examples.py` — Example usage
- `test_vision.py` — Test script
- `test_vision_curl.sh` — Direct curl test
- `analyze_image.sh` — Analysis helper

## Commands
```bash
# Test from command line
python3 test_vision.py <image_path>
# Or via curl
./test_vision_curl.sh <image_url>
```

## Usage Ideas
- Analyze product images for Out & About
- OCR text from screenshots
- Label detection for content categorization
