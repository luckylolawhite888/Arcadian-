#!/usr/bin/env python3
"""
AI Mastering API System
Audio mastering and enhancement using AI Mastering API
"""

import json
import os
import time
import requests
from pathlib import Path

class AIMasteringAPI:
    def __init__(self, api_key=None):
        """Initialize with API key"""
        if api_key is None:
            # Try to load from credentials file
            creds_path = '/home/node/.openclaw/workspace/ai_mastering_credentials.json'
            if os.path.exists(creds_path):
                with open(creds_path, 'r') as f:
                    creds = json.load(f)
                self.api_key = creds['api_key']
            else:
                raise ValueError("API key not provided and credentials file not found")
        else:
            self.api_key = api_key
        
        self.base_url = "https://api.bakuage.com:443"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def test_api(self):
        """Test if API key is valid"""
        print("🔊 Testing AI Mastering API...")
        print(f"Key: {self.api_key[:20]}...")
        
        # Try to get API status or make a simple request
        try:
            # Check if we can connect
            response = requests.get(
                f"{self.base_url}/",
                headers=self.headers,
                timeout=10
            )
            
            print(f"📡 Connection status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ API connection successful!")
                return True
            else:
                print(f"⚠️  Unexpected status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False
    
    def upload_audio(self, audio_file_path):
        """Upload audio file for mastering"""
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
        
        print(f"📤 Uploading audio: {os.path.basename(audio_file_path)}")
        
        # Note: Actual upload would use multipart/form-data
        # This is a simplified version
        files = {'file': open(audio_file_path, 'rb')}
        
        try:
            response = requests.post(
                f"{self.base_url}/v1/audios",
                headers={"Authorization": f"Bearer {self.api_key}"},
                files=files,
                timeout=30
            )
            
            if response.status_code == 201:
                audio_data = response.json()
                print(f"✅ Audio uploaded (ID: {audio_data.get('id', 'N/A')})")
                return audio_data
            else:
                print(f"❌ Upload failed: {response.status_code} - {response.text[:200]}")
                return None
                
        except Exception as e:
            print(f"❌ Upload error: {e}")
            return None
        finally:
            files['file'].close()
    
    def master_audio(self, audio_id, mode="default", target_loudness=-14.0):
        """Start mastering process on uploaded audio"""
        print(f"🎛️  Starting mastering (mode: {mode}, loudness: {target_loudness} LUFS)")
        
        data = {
            "mode": mode,
            "target_loudness": target_loudness
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/v1/masterings",
                headers=self.headers,
                json=data,
                params={"audio_id": audio_id},
                timeout=30
            )
            
            if response.status_code == 201:
                mastering_data = response.json()
                print(f"✅ Mastering started (ID: {mastering_data.get('id', 'N/A')})")
                return mastering_data
            else:
                print(f"❌ Mastering start failed: {response.status_code} - {response.text[:200]}")
                return None
                
        except Exception as e:
            print(f"❌ Mastering error: {e}")
            return None
    
    def check_mastering_status(self, mastering_id):
        """Check status of mastering process"""
        try:
            response = requests.get(
                f"{self.base_url}/v1/masterings/{mastering_id}",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Status check failed: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Status check error: {e}")
            return None
    
    def wait_for_mastering(self, mastering_id, check_interval=5):
        """Wait for mastering to complete"""
        print("⏳ Waiting for mastering to complete...")
        
        while True:
            status_data = self.check_mastering_status(mastering_id)
            
            if not status_data:
                print("❌ Failed to get status")
                return None
            
            status = status_data.get('status', 'unknown')
            progression = status_data.get('progression', 0)
            
            print(f"  Progress: {progression*100:.0f}% - Status: {status}")
            
            if status == 'completed':
                print("✅ Mastering completed!")
                return status_data
            elif status in ['failed', 'error']:
                print(f"❌ Mastering failed with status: {status}")
                return None
            elif status in ['waiting', 'processing']:
                time.sleep(check_interval)
            else:
                print(f"⚠️  Unknown status: {status}")
                time.sleep(check_interval)
    
    def download_audio(self, audio_id, output_path):
        """Download mastered audio file"""
        print(f"📥 Downloading audio (ID: {audio_id}) to {output_path}")
        
        try:
            response = requests.get(
                f"{self.base_url}/v1/audios/{audio_id}/download",
                headers={"Authorization": f"Bearer {self.api_key}"},
                stream=True,
                timeout=30
            )
            
            if response.status_code == 200:
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                file_size = os.path.getsize(output_path)
                print(f"✅ Audio downloaded: {output_path} ({file_size:,} bytes)")
                return True
            else:
                print(f"❌ Download failed: {response.status_code} - {response.text[:200]}")
                return False
                
        except Exception as e:
            print(f"❌ Download error: {e}")
            return False
    
    def master_audio_file(self, input_path, output_path=None, mode="default"):
        """Complete mastering workflow for a file"""
        if output_path is None:
            output_path = f"mastered_{os.path.basename(input_path)}"
        
        print("=" * 60)
        print("🎵 AI MASTERING WORKFLOW")
        print("=" * 60)
        
        # 1. Upload audio
        audio_data = self.upload_audio(input_path)
        if not audio_data:
            return False
        
        # 2. Start mastering
        mastering_data = self.master_audio(audio_data['id'], mode=mode)
        if not mastering_data:
            return False
        
        # 3. Wait for completion
        completed_data = self.wait_for_mastering(mastering_data['id'])
        if not completed_data:
            return False
        
        # 4. Download result
        if self.download_audio(completed_data['output_audio_id'], output_path):
            print("=" * 60)
            print(f"🎉 Mastering complete! Output: {output_path}")
            print("=" * 60)
            return True
        else:
            return False
    
    def get_audio_info(self):
        """Get information about uploaded audios"""
        try:
            response = requests.get(
                f"{self.base_url}/v1/audios",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Failed to get audio info: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Audio info error: {e}")
            return None
    
    def get_mastering_presets(self):
        """Get available mastering presets/modes"""
        # Based on documentation, common modes are:
        presets = {
            "default": "Standard mastering for most music",
            "podcast": "Optimized for speech/podcasts",
            "loud": "Maximum loudness (competitive loudness)",
            "dynamic": "Preserve dynamic range",
            "warm": "Warm analog-style mastering",
            "bright": "Bright and clear mastering"
        }
        
        return presets

def test_ai_mastering():
    """Test the AI Mastering API"""
    print("🔊 AI Mastering API Test")
    print("=" * 60)
    
    # Initialize with Maya's API key
    mastering = AIMasteringAPI()
    
    # Test API connection
    if mastering.test_api():
        print("\n✅ API is accessible!")
        
        # Show available presets
        presets = mastering.get_mastering_presets()
        print("\n🎛️  Available Mastering Presets:")
        for mode, description in presets.items():
            print(f"  • {mode}: {description}")
        
        # Show how to use
        print("\n📋 Usage Example:")
        print("""
# Master an audio file
mastering.master_audio_file("input.mp3", "output_mastered.mp3")

# Or step by step:
# 1. audio_data = mastering.upload_audio("input.mp3")
# 2. mastering_data = mastering.master_audio(audio_data['id'])
# 3. mastering.wait_for_mastering(mastering_data['id'])
# 4. mastering.download_audio(mastering_data['output_audio_id'], "output.mp3")
""")
        
        return True
    else:
        print("\n❌ API test failed")
        return False

if __name__ == "__main__":
    if test_ai_mastering():
        print("\n🎉 AI Mastering system is ready!")
        print("\nNext steps:")
        print("1. Try with a test audio file")
        print("2. Check the desktop version for offline use")
        print("3. Integrate with your audio projects")
    else:
        print("\n⚠️  Check your API key and internet connection")