#!/usr/bin/env python3
"""
LLMAPI.ai Test Script
Tests the LLMAPI.ai integration with multiple models
"""

import requests
import json
import time

# Your LLMAPI.ai API key
API_KEY = "llmapi_b54a3adc3b8a91b5056a530d16c6031b45baf3e74a765d18c7b993040c4396c7"
BASE_URL = "https://api.llmapi.ai/v1"

def test_model(model_name, prompt="Hello! This is a test from Lola. Please respond with a short greeting."):
    """Test a specific model with LLMAPI.ai"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model_name,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 100,
        "temperature": 0.7
    }
    
    try:
        print(f"\n🔍 Testing {model_name}...")
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            print(f"✅ Success! ({elapsed_time:.2f}s)")
            print(f"   Response: {content[:100]}...")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"   Error: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)[:100]}")
        return False

def list_available_models():
    """List available models from LLMAPI.ai"""
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    
    try:
        print("\n📋 Fetching available models...")
        response = requests.get(
            f"{BASE_URL}/models",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            models_data = response.json()
            models = models_data.get('data', [])
            print(f"✅ Found {len(models)} models")
            
            # Group by provider/family
            families = {}
            for model in models[:50]:  # Show first 50
                family = model.get('family', 'unknown')
                if family not in families:
                    families[family] = []
                families[family].append(model['id'])
            
            print("\n📊 Model Families (first 50 models):")
            for family, model_ids in families.items():
                print(f"  {family}: {len(model_ids)} models")
                for model_id in model_ids[:3]:  # Show first 3 per family
                    print(f"    - {model_id}")
                if len(model_ids) > 3:
                    print(f"    ... and {len(model_ids)-3} more")
            
            return True
        else:
            print(f"❌ Failed to fetch models: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("LLMAPI.ai Integration Test")
    print("=" * 60)
    
    # Test 1: List available models
    list_available_models()
    
    print("\n" + "=" * 60)
    print("Testing Specific Models")
    print("=" * 60)
    
    # Test 2: Test different model types
    test_models = [
        # Fast & Cheap
        "gpt-4o-mini",
        "claude-haiku-4-5",
        "gemini-2.5-flash-lite",
        
        # Balanced
        "gpt-4o",
        "claude-sonnet-4-6",
        "gemini-2.5-flash",
        
        # Powerful
        "gpt-5.4-mini",
        "claude-opus-4-6",
        "gemini-2.5-pro",
        
        # Specialized
        "qwen3-coder-plus",  # Coding
        "grok-4-fast-reasoning",  # Reasoning
        "mistral-large-2512",  # Multilingual
    ]
    
    results = {}
    for model in test_models:
        success = test_model(model)
        results[model] = success
        time.sleep(1)  # Rate limiting
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    successful = sum(1 for success in results.values() if success)
    total = len(results)
    
    print(f"✅ Successful: {successful}/{total}")
    print(f"❌ Failed: {total - successful}/{total}")
    
    if successful == total:
        print("\n🎉 All tests passed! LLMAPI.ai is fully functional.")
    else:
        print("\n⚠️ Some tests failed. Check API key or model availability.")
    
    print("\n" + "=" * 60)
    print("Quick Integration Example")
    print("=" * 60)
    
    print("""
# Simple integration code:
import requests

def llmapi_chat(model="gpt-4o-mini", prompt="Hello", max_tokens=1000):
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens
    }
    
    response = requests.post(
        "https://api.llmapi.ai/v1/chat/completions",
        headers=headers,
        json=data
    )
    return response.json()

# Usage:
result = llmapi_chat("gpt-5.4-mini", "Explain quantum computing")
print(result['choices'][0]['message']['content'])
    """)

if __name__ == "__main__":
    main()