#!/usr/bin/env python3
"""Add a working "Check Now" button to all isitdownrightnow.co.uk status pages."""
import os, re, glob

ROOT = "/var/www/isitdownrightnow.co.uk/public"

CHECKER_HTML = """
    <!-- Live Status Checker -->
    <div style="margin:24px 0;padding:20px;background:#fff;border:2px solid #e5e7eb;border-radius:12px;text-align:center;">
      <p style="font-size:1.1em;margin-bottom:12px;color:#374151;"><strong>🔍 Check Live Status</strong></p>
      <div id="statusResult" style="margin-bottom:12px;padding:12px;border-radius:8px;display:none;font-weight:bold;"></div>
      <button onclick="checkSite('SERVICE_HOST')" style="background:#2563eb;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:1em;cursor:pointer;font-weight:bold;">Check Now</button>
      <p style="margin-top:8px;font-size:0.85em;color:#888;">Click to see if this service is reachable right now</p>
    </div>
    <script>
    async function checkSite(host) {
      const btn = event.target;
      const resultDiv = document.getElementById("statusResult");
      btn.disabled = true;
      btn.textContent = "Checking...";
      resultDiv.style.display = "block";
      resultDiv.innerHTML = "⏳ Checking " + host + "...";
      resultDiv.style.color = "#6b7280";
      try {
        const resp = await fetch("/check?host=" + encodeURIComponent(host));
        const data = await resp.json();
        if (data.status === "up") {
          resultDiv.innerHTML = "✅ <strong>" + host + "</strong> is UP and running!";
          resultDiv.style.color = "#059669";
          resultDiv.style.background = "#ecfdf5";
        } else {
          resultDiv.innerHTML = "❌ <strong>" + host + "</strong> appears to be DOWN!";
          resultDiv.style.color = "#dc2626";
          resultDiv.style.background = "#fef2f2";
        }
      } catch(e) {
        resultDiv.innerHTML = "⚠️ Error checking site. Please try again.";
        resultDiv.style.color = "#d97706";
        resultDiv.style.background = "#fffbeb";
      }
      btn.disabled = false;
      btn.textContent = "Check Now";
    }
    </script>
    <!-- End Checker -->
    </body>"""

# Map each page to the real service hostname
SERVICE_HOSTS = {
    "netflix": "netflix.com",
    "youtube": "youtube.com",
    "youtube-down": "youtube.com",
    "chatgpt": "chatgpt.com",
    "spotify": "spotify.com",
    "instagram": "instagram.com",
    "steam": "steampowered.com",
    "steam-down": "steampowered.com",
    "twitter": "twitter.com",
    "twitter-x-down": "x.com",
    "xbox": "xbox.com",
    "xbox-live-down": "xbox.com",
    "google": "google.com",
    "google-down": "google.com",
    "gmail": "gmail.com",
    "gmail-down": "gmail.com",
    "teams": "teams.microsoft.com",
    "teams-down": "teams.microsoft.com",
    "reddit": "reddit.com",
    "reddit-down": "reddit.com",
    "facebook": "facebook.com",
    "zoom": "zoom.us",
    "zoom-down": "zoom.us",
    "roblox": "roblox.com",
    "roblox-down": "roblox.com",
    "twitch": "twitch.tv",
    "twitch-down": "twitch.tv",
    "discord": "discord.com",
    "discord-down": "discord.com",
    "netflix-down": "netflix.com",
    "whatsapp": "whatsapp.com",
    "whatsapp-down": "whatsapp.com",
    "bbc-iplayer": "bbc.co.uk/iplayer",
    "bbc-iplayer-down": "bbc.co.uk",
    "epic-games": "epicgames.com",
    "epic-games-down": "epicgames.com",
}

updated = 0
for html_path in glob.glob(f"{ROOT}/*.html"):
    fname = os.path.basename(html_path)
    name = fname.replace(".html", "").lower()
    
    # Find matching host
    host = None
    for key, val in SERVICE_HOSTS.items():
        if key in name or name in key:
            host = val
            break
    if not host:
        print(f"  ⏭️  {fname}: no host mapping")
        continue
    
    with open(html_path) as f:
        content = f.read()
    
    if "checkSite" in content:
        print(f"  ⏭️  {fname}: already has checker")
        continue
    
    checker = CHECKER_HTML.replace("SERVICE_HOST", host)
    new_content = content.replace("</body>", checker)
    with open(html_path, "w") as f:
        f.write(new_content)
    updated += 1
    print(f"  ✅ {fname} → {host}")

print(f"\nDone! {updated} pages updated with live checker.")

# Also create the /check endpoint on the server
print("\nNow need to add the backend /check API endpoint...")
