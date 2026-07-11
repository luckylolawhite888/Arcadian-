#!/usr/bin/env python3
import os
import sys
import subprocess
import tempfile
import speech_recognition as sr

def extract_audio_from_video(video_path):
    """Extract audio from video using ffmpeg if available"""
    # First check if ffmpeg is available
    try:
        subprocess.run(['which', 'ffmpeg'], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("Error: ffmpeg is not installed. Please install ffmpeg first.")
        print("On Ubuntu/Debian: sudo apt-get install ffmpeg")
        print("On macOS: brew install ffmpeg")
        return None
    
    # Create a temporary audio file
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
        audio_path = temp_audio.name
    
    # Extract audio using ffmpeg
    cmd = [
        'ffmpeg', '-i', video_path,
        '-vn', '-acodec', 'pcm_s16le',
        '-ar', '16000', '-ac', '1',
        '-y', audio_path
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        return audio_path
    except subprocess.CalledProcessError as e:
        print(f"Error extracting audio: {e}")
        if os.path.exists(audio_path):
            os.unlink(audio_path)
        return None

def transcribe_audio(audio_path):
    """Transcribe audio using speech_recognition"""
    recognizer = sr.Recognizer()
    
    with sr.AudioFile(audio_path) as source:
        print("Loading audio file...")
        audio = recognizer.record(source)
    
    try:
        print("Transcribing using Google Speech Recognition...")
        text = recognizer.recognize_google(audio)
        return text
    except sr.UnknownValueError:
        return "Could not understand audio"
    except sr.RequestError as e:
        return f"Could not request results; {e}"

def main():
    if len(sys.argv) < 2:
        print("Usage: python transcribe_video.py <video_file>")
        sys.exit(1)
    
    video_path = sys.argv[1]
    
    if not os.path.exists(video_path):
        print(f"Error: File not found: {video_path}")
        sys.exit(1)
    
    print(f"Processing video: {video_path}")
    
    # Extract audio
    audio_path = extract_audio_from_video(video_path)
    if not audio_path:
        print("Failed to extract audio")
        sys.exit(1)
    
    try:
        # Transcribe audio
        transcription = transcribe_audio(audio_path)
        print("\n" + "="*50)
        print("TRANSCRIPTION:")
        print("="*50)
        print(transcription)
        print("="*50)
    finally:
        # Clean up temporary audio file
        if os.path.exists(audio_path):
            os.unlink(audio_path)

if __name__ == "__main__":
    main()