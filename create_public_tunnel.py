#!/usr/bin/env python3
"""
Create a public tunnel for the Arcadian Media Dashboard
"""

import subprocess
import time
import requests
import sys
import os

def try_localhost_run():
    """Try to use localhost.run tunnel service"""
    print("Trying localhost.run tunnel...")
    
    # Command to create tunnel
    cmd = "ssh -o StrictHostKeyChecking=no -R 80:localhost:5000 ssh.localhost.run"
    
    try:
        # Start the tunnel
        process = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a bit for connection
        time.sleep(3)
        
        # Check if process is still running
        if process.poll() is not None:
            stderr = process.stderr.read()
            print(f"Tunnel failed: {stderr}")
            return None
        
        # Try to read output
        stdout, stderr = process.communicate(timeout=2)
        
        # Look for URL in output
        for line in (stdout + stderr).split('\n'):
            if 'localhost.run' in line or 'http://' in line:
                print(f"Found URL: {line.strip()}")
                return line.strip()
        
        return None
        
    except Exception as e:
        print(f"Error with localhost.run: {e}")
        return None

def try_ngrok_web():
    """Try to use ngrok web version or alternative"""
    print("\nTrying alternative methods...")
    
    # Check if we can use serveo
    try:
        cmd = "ssh -o StrictHostKeyChecking=no -R 80:localhost:5000 serveo.net"
        process = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        time.sleep(3)
        
        if process.poll() is None:
            print("serveo.net tunnel started (check output for URL)")
            return "Check terminal for serveo.net URL"
        else:
            stderr = process.stderr.read()
            print(f"serveo.net failed: {stderr[:100]}")
    except Exception as e:
        print(f"serveo.net error: {e}")
    
    return None

def check_public_ip():
    """Check if server has public IP"""
    try:
        response = requests.get('https://api.ipify.org?format=json', timeout=5)
        if response.status_code == 200:
            ip_data = response.json()
            public_ip = ip_data.get('ip')
            print(f"\nServer public IP: {public_ip}")
            print(f"Try: http://{public_ip}:5000")
            return f"http://{public_ip}:5000"
    except Exception as e:
        print(f"Could not get public IP: {e}")
    
    return None

def main():
    print("🔗 Creating Public Tunnel for Arcadian Media Dashboard")
    print("=" * 60)
    
    # First check if dashboard is running
    try:
        response = requests.get('http://localhost:5000/health', timeout=2)
        if response.status_code == 200:
            print("✅ Dashboard is running on localhost:5000")
        else:
            print("❌ Dashboard not responding on localhost:5000")
            return
    except Exception as e:
        print(f"❌ Cannot connect to dashboard: {e}")
        print("Make sure the dashboard is running with: python3 simple_server.py")
        return
    
    # Try different methods
    url = None
    
    # Method 1: Check public IP
    print("\n1. Checking public IP...")
    url = check_public_ip()
    
    if url:
        print(f"\n🎉 Public URL: {url}")
        print("\nIf this doesn't work, the port may be blocked by firewall.")
        return
    
    # Method 2: Try localhost.run
    print("\n2. Trying localhost.run tunnel...")
    url = try_localhost_run()
    
    if url:
        print(f"\n🎉 Tunnel URL: {url}")
        return
    
    # Method 3: Try serveo
    print("\n3. Trying serveo.net tunnel...")
    url = try_ngrok_web()
    
    if url:
        print(f"\n🎉 Tunnel URL: {url}")
        return
    
    print("\n❌ Could not create public tunnel automatically.")
    print("\n📋 Manual Options:")
    print("1. Install ngrok: https://ngrok.com/download")
    print("2. Use Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/")
    print("3. Use localhost.run manually: ssh -R 80:localhost:5000 ssh.localhost.run")
    print("\n💡 For quick testing, you can:")
    print("   - Use VPN to connect to server network")
    print("   - Ask your hosting provider to open port 5000")
    print("   - Use a different port (e.g., 8080)")

if __name__ == '__main__':
    main()