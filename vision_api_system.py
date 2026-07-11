#!/usr/bin/env python3
"""
Google Cloud Vision API System
Uses Maya's API key to analyze images with AI
"""

import json
import base64
import requests
import os
from pathlib import Path

class GoogleVisionAPI:
    def __init__(self, api_key=None):
        """Initialize with API key"""
        if api_key is None:
            # Try to load from credentials file
            creds_path = '/home/node/.openclaw/workspace/google_vision_credentials.json'
            if os.path.exists(creds_path):
                with open(creds_path, 'r') as f:
                    creds = json.load(f)
                self.api_key = creds['api_key']
            else:
                raise ValueError("API key not provided and credentials file not found")
        else:
            self.api_key = api_key
        
        self.endpoint = "https://vision.googleapis.com/v1/images:annotate"
    
    def encode_image(self, image_path):
        """Encode image to base64 for API"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def analyze_image(self, image_path, features=None):
        """
        Analyze an image with Google Vision API
        
        Args:
            image_path: Path to image file
            features: List of features to detect. If None, uses all common features.
        
        Returns: API response as dict
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Default features if none provided
        if features is None:
            features = [
                {"type": "LABEL_DETECTION", "maxResults": 10},
                {"type": "TEXT_DETECTION", "maxResults": 10},
                {"type": "FACE_DETECTION", "maxResults": 10},
                {"type": "LANDMARK_DETECTION", "maxResults": 10},
                {"type": "LOGO_DETECTION", "maxResults": 10},
                {"type": "SAFE_SEARCH_DETECTION"},
                {"type": "IMAGE_PROPERTIES"},
                {"type": "WEB_DETECTION", "maxResults": 10}
            ]
        
        # Encode image
        image_content = self.encode_image(image_path)
        
        # Build request
        request_body = {
            "requests": [{
                "image": {"content": image_content},
                "features": features
            }]
        }
        
        # Make API call
        params = {"key": self.api_key}
        response = requests.post(self.endpoint, params=params, json=request_body)
        
        if response.status_code != 200:
            raise Exception(f"API Error {response.status_code}: {response.text}")
        
        return response.json()
    
    def analyze_image_url(self, image_url, features=None):
        """Analyze image from URL"""
        # Default features if none provided
        if features is None:
            features = [
                {"type": "LABEL_DETECTION", "maxResults": 10},
                {"type": "TEXT_DETECTION", "maxResults": 10},
                {"type": "SAFE_SEARCH_DETECTION"}
            ]
        
        # Build request for URL
        request_body = {
            "requests": [{
                "image": {"source": {"imageUri": image_url}},
                "features": features
            }]
        }
        
        # Make API call
        params = {"key": self.api_key}
        response = requests.post(self.endpoint, params=params, json=request_body)
        
        if response.status_code != 200:
            raise Exception(f"API Error {response.status_code}: {response.text}")
        
        return response.json()
    
    def extract_text(self, image_path):
        """Extract text from image (OCR)"""
        features = [{"type": "TEXT_DETECTION", "maxResults": 50}]
        result = self.analyze_image(image_path, features)
        
        texts = []
        if 'textAnnotations' in result['responses'][0]:
            for annotation in result['responses'][0]['textAnnotations']:
                texts.append({
                    'text': annotation['description'],
                    'confidence': annotation.get('confidence', 0),
                    'bounding_box': annotation.get('boundingPoly', {})
                })
        
        return texts
    
    def detect_labels(self, image_path, max_results=10):
        """Detect objects and concepts in image"""
        features = [{"type": "LABEL_DETECTION", "maxResults": max_results}]
        result = self.analyze_image(image_path, features)
        
        labels = []
        if 'labelAnnotations' in result['responses'][0]:
            for label in result['responses'][0]['labelAnnotations']:
                labels.append({
                    'description': label['description'],
                    'score': label['score'],
                    'confidence': label.get('confidence', 0)
                })
        
        return labels
    
    def detect_faces(self, image_path):
        """Detect faces and emotions"""
        features = [{"type": "FACE_DETECTION", "maxResults": 20}]
        result = self.analyze_image(image_path, features)
        
        faces = []
        if 'faceAnnotations' in result['responses'][0]:
            for face in result['responses'][0]['faceAnnotations']:
                emotions = {
                    'joy': face.get('joyLikelihood', 'UNKNOWN'),
                    'sorrow': face.get('sorrowLikelihood', 'UNKNOWN'),
                    'anger': face.get('angerLikelihood', 'UNKNOWN'),
                    'surprise': face.get('surpriseLikelihood', 'UNKNOWN')
                }
                
                faces.append({
                    'bounding_box': face.get('boundingPoly', {}),
                    'landmarks': face.get('landmarks', []),
                    'emotions': emotions,
                    'confidence': face.get('detectionConfidence', 0),
                    'roll_angle': face.get('rollAngle', 0),
                    'pan_angle': face.get('panAngle', 0),
                    'tilt_angle': face.get('tiltAngle', 0)
                })
        
        return faces
    
    def safe_search(self, image_path):
        """Check for explicit content"""
        features = [{"type": "SAFE_SEARCH_DETECTION"}]
        result = self.analyze_image(image_path, features)
        
        if 'safeSearchAnnotation' in result['responses'][0]:
            safe = result['responses'][0]['safeSearchAnnotation']
            return {
                'adult': safe.get('adult', 'UNKNOWN'),
                'spoof': safe.get('spoof', 'UNKNOWN'),
                'medical': safe.get('medical', 'UNKNOWN'),
                'violence': safe.get('violence', 'UNKNOWN'),
                'racy': safe.get('racy', 'UNKNOWN')
            }
        
        return {}
    
    def web_detection(self, image_path):
        """Find similar images on the web"""
        features = [{"type": "WEB_DETECTION", "maxResults": 10}]
        result = self.analyze_image(image_path, features)
        
        web_info = {}
        if 'webDetection' in result['responses'][0]:
            web = result['responses'][0]['webDetection']
            
            web_info['best_guess'] = web.get('bestGuessLabels', [])
            web_info['pages'] = web.get('pagesWithMatchingImages', [])
            web_info['images'] = web.get('fullMatchingImages', [])
            web_info['partial_matches'] = web.get('partialMatchingImages', [])
            web_info['entities'] = web.get('webEntities', [])
        
        return web_info
    
    def pretty_print_results(self, result):
        """Format API results in a readable way"""
        if 'responses' not in result or not result['responses']:
            print("No results found")
            return
        
        response = result['responses'][0]
        
        print("=" * 60)
        print("GOOGLE VISION API ANALYSIS")
        print("=" * 60)
        
        # Labels
        if 'labelAnnotations' in response:
            print("\n🏷️  LABELS DETECTED:")
            for label in response['labelAnnotations'][:5]:  # Top 5
                print(f"  • {label['description']} ({label['score']:.2%})")
        
        # Text
        if 'textAnnotations' in response and response['textAnnotations']:
            print("\n📝 TEXT FOUND:")
            # First annotation is the full text
            full_text = response['textAnnotations'][0]['description']
            preview = full_text[:200] + ("..." if len(full_text) > 200 else "")
            print(f"  {preview}")
        
        # Faces
        if 'faceAnnotations' in response:
            print(f"\n😊 FACES DETECTED: {len(response['faceAnnotations'])}")
            for i, face in enumerate(response['faceAnnotations'][:3]):  # First 3 faces
                emotions = []
                for emotion in ['joy', 'sorrow', 'anger', 'surprise']:
                    likelihood = face.get(f'{emotion}Likelihood', 'UNKNOWN')
                    if likelihood in ['VERY_LIKELY', 'LIKELY']:
                        emotions.append(emotion)
                
                if emotions:
                    print(f"  Face {i+1}: {', '.join(emotions)}")
        
        # Landmarks
        if 'landmarkAnnotations' in response:
            print("\n🗺️  LANDMARKS:")
            for landmark in response['landmarkAnnotations'][:3]:
                print(f"  • {landmark['description']} ({landmark['score']:.2%})")
        
        # Logos
        if 'logoAnnotations' in response:
            print("\n🏢 LOGOS:")
            for logo in response['logoAnnotations'][:3]:
                print(f"  • {logo['description']} ({logo['score']:.2%})")
        
        # Safe Search
        if 'safeSearchAnnotation' in response:
            safe = response['safeSearchAnnotation']
            print("\n🛡️  SAFETY CHECK:")
            for category in ['adult', 'violence', 'racy']:
                level = safe.get(category, 'UNKNOWN')
                if level in ['LIKELY', 'VERY_LIKELY']:
                    print(f"  ⚠️  {category.upper()}: {level}")
        
        print("=" * 60)

def test_vision_api():
    """Test the Vision API with a sample image URL"""
    print("Testing Google Vision API...")
    
    # Initialize with Maya's API key
    vision = GoogleVisionAPI()
    
    print(f"✅ API initialized with key: {vision.api_key[:15]}...")
    
    # Test with a sample image URL (Wikipedia logo)
    sample_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png"
    
    print(f"\n🔍 Analyzing sample image: {sample_url}")
    
    try:
        result = vision.analyze_image_url(sample_url)
        vision.pretty_print_results(result)
        print("\n✅ Vision API test successful!")
        
        # Save sample result
        with open('/home/node/.openclaw/workspace/vision_sample_result.json', 'w') as f:
            json.dump(result, f, indent=2)
        print("📁 Sample result saved to 'vision_sample_result.json'")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

def quick_analyze(image_path_or_url):
    """Quick analysis of an image"""
    vision = GoogleVisionAPI()
    
    if image_path_or_url.startswith('http'):
        result = vision.analyze_image_url(image_path_or_url)
    else:
        result = vision.analyze_image(image_path_or_url)
    
    vision.pretty_print_results(result)
    return result

if __name__ == "__main__":
    print("Google Cloud Vision API System")
    print("=" * 60)
    
    # Test the API
    if test_vision_api():
        print("\n🎉 Vision API is ready to use!")
        print("\nUsage examples:")
        print("  python3 vision_api_system.py")
        print("  python3 -c \"from vision_api_system import GoogleVisionAPI; vision = GoogleVisionAPI()\"")
        print("  python3 -c \"from vision_api_system import quick_analyze; quick_analyze('image.jpg')\"")
    else:
        print("\n❌ Vision API test failed. Check your API key.")