#!/usr/bin/env python3
import os
import sys
import requests
import time
import base64

# AssemblyAI API (free tier - 5 hours/month)
# We'll use a public demo key or try without auth first
API_KEY = "your_assemblyai_api_key_here"  # Would need to get one
BASE_URL = "https://api.assemblyai.com/v2"

def upload_file(file_path):
    """Upload file to AssemblyAI"""
    print(f"Uploading {file_path}...")
    
    headers = {
        "authorization": API_KEY if API_KEY != "your_assemblyai_api_key_here" else ""
    }
    
    with open(file_path, 'rb') as f:
        response = requests.post(
            f"{BASE_URL}/upload",
            headers=headers,
            data=f
        )
    
    if response.status_code == 200:
        upload_url = response.json()["upload_url"]
        print(f"Upload successful: {upload_url}")
        return upload_url
    else:
        print(f"Upload failed: {response.status_code} - {response.text}")
        return None

def transcribe_audio(upload_url):
    """Start transcription job"""
    print("Starting transcription...")
    
    headers = {
        "authorization": API_KEY if API_KEY != "your_assemblyai_api_key_here" else "",
        "content-type": "application/json"
    }
    
    data = {
        "audio_url": upload_url,
        "language_detection": True
    }
    
    response = requests.post(
        f"{BASE_URL}/transcript",
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        transcript_id = response.json()["id"]
        print(f"Transcription started. ID: {transcript_id}")
        return transcript_id
    else:
        print(f"Transcription request failed: {response.status_code} - {response.text}")
        return None

def get_transcription(transcript_id):
    """Poll for transcription results"""
    print("Waiting for transcription...")
    
    headers = {
        "authorization": API_KEY if API_KEY != "your_assemblyai_api_key_here" else ""
    }
    
    while True:
        response = requests.get(
            f"{BASE_URL}/transcript/{transcript_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            status = result["status"]
            
            if status == "completed":
                print("Transcription completed!")
                return result["text"]
            elif status == "error":
                print(f"Transcription error: {result.get('error', 'Unknown error')}")
                return None
            else:
                print(f"Status: {status}. Waiting...")
                time.sleep(3)
        else:
            print(f"Polling failed: {response.status_code} - {response.text}")
            return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python transcribe_assemblyai.py <video_file>")
        print("\nNote: You need an AssemblyAI API key for this to work.")
        print("Get a free key at: https://www.assemblyai.com/dashboard/signup")
        sys.exit(1)
    
    video_path = sys.argv[1]
    
    if not os.path.exists(video_path):
        print(f"Error: File not found: {video_path}")
        sys.exit(1)
    
    print(f"File size: {os.path.getsize(video_path) / 1024 / 1024:.2f} MB")
    
    if API_KEY == "your_assemblyai_api_key_here":
        print("\n" + "="*60)
        print("ERROR: No AssemblyAI API key configured.")
        print("="*60)
        print("To transcribe this video, you need to:")
        print("1. Get a free API key from https://www.assemblyai.com")
        print("2. Replace 'your_assemblyai_api_key_here' in the script")
        print("3. Run the script again")
        print("\nAlternatively, you can:")
        print("- Use an online service like Otter.ai or Rev.com")
        print("- Search for the clip online (it might already be transcribed)")
        print("="*60)
        sys.exit(1)
    
    # Upload file
    upload_url = upload_file(video_path)
    if not upload_url:
        sys.exit(1)
    
    # Start transcription
    transcript_id = transcribe_audio(upload_url)
    if not transcript_id:
        sys.exit(1)
    
    # Get results
    transcription = get_transcription(transcript_id)
    
    if transcription:
        print("\n" + "="*60)
        print("TRANSCRIPTION:")
        print("="*60)
        print(transcription)
        print("="*60)
        
        # Save to file
        output_file = video_path.replace('.mp4', '_transcript.txt')
        with open(output_file, 'w') as f:
            f.write(transcription)
        print(f"\nTranscript saved to: {output_file}")
    else:
        print("Failed to get transcription")

if __name__ == "__main__":
    main()