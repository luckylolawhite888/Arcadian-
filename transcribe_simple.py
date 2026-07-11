#!/usr/bin/env python3
import os
import sys
import subprocess
import tempfile
import requests
import json
import base64

def transcribe_with_whisper_api(video_path):
    """
    Try to transcribe using OpenAI Whisper API (if we have an API key)
    or a free alternative
    """
    print(f"Attempting to transcribe: {video_path}")
    
    # First, extract audio using ffmpeg if available
    try:
        # Check if ffmpeg is available
        result = subprocess.run(['which', 'ffmpeg'], capture_output=True, text=True)
        if result.returncode != 0:
            print("ffmpeg not found. Trying alternative approach...")
            return None
            
        # Create temporary audio file
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
            audio_path = tmp.name
            
        # Extract audio from video
        cmd = [
            'ffmpeg', '-i', video_path,
            '-vn', '-acodec', 'libmp3lame',
            '-q:a', '2',
            '-y', audio_path
        ]
        
        print("Extracting audio from video...")
        subprocess.run(cmd, capture_output=True, check=True)
        
        # Read audio file
        with open(audio_path, 'rb') as f:
            audio_data = f.read()
        
        # Clean up
        os.unlink(audio_path)
        
        print(f"Audio extracted: {len(audio_data)} bytes")
        
        # Try to use a free transcription service
        # Note: This would require an API key for production use
        print("\nFor actual transcription, you would need:")
        print("1. An OpenAI API key for Whisper API")
        print("2. Or another transcription service API key")
        print("\nThe audio has been extracted successfully.")
        print("File size suggests this is a short clip (~6MB video).")
        
        return "Audio extracted successfully. Need API key for transcription."
        
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python transcribe_simple.py <video_file>")
        sys.exit(1)
    
    video_path = sys.argv[1]
    
    if not os.path.exists(video_path):
        print(f"Error: File not found: {video_path}")
        sys.exit(1)
    
    print(f"Video file: {video_path}")
    print(f"Size: {os.path.getsize(video_path) / 1024 / 1024:.2f} MB")
    
    result = transcribe_with_whisper_api(video_path)
    
    if result:
        print("\n" + "="*60)
        print("RESULT:")
        print("="*60)
        print(result)
        print("="*60)
    else:
        print("Failed to process video")

if __name__ == "__main__":
    main()