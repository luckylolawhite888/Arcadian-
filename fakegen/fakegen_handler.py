#!/usr/bin/env python3
"""
FakeGen Telegram Command Handler
Usage: /fakegen [count] [region]
  region: london (default), uk, us
  e.g. /fakegen, /fakegen 3, /fakegen 5 london, /fakegen 2 uk
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from fakegen import generate_identity, format_identity, save_identities, load_identities, clear_identities


def handle_fakegen(args=""):
    """Generate fake identities. Returns formatted message."""
    count = 1
    region = "london"
    
    parts = args.strip().split()
    if parts:
        try:
            count = int(parts[0])
            count = max(1, min(count, 10))
        except ValueError:
            pass
    
    # Check for region in remaining args
    for p in parts:
        if p.lower() in ("london", "uk", "us"):
            region = p.lower()
    
    identities = []
    for i in range(count):
        identities.append(generate_identity(region=region, age_min=18, age_max=40, include_email=True))
    
    save_identities(identities)
    
    region_emoji = {"london": "🇬🇧", "uk": "🇬🇧", "us": "🇺🇸"}
    emoji = region_emoji.get(region, "🌍")
    
    if count == 1:
        return format_identity(identities[0])
    
    parts_out = [f"🔢 **{count} {region.upper()} identities generated** {emoji}\n"]
    for idx, ident in enumerate(identities, 1):
        parts_out.append(f"**{idx}. {ident['name']}**")
        parts_out.append(f"📧 {ident['email']} | 🔑 `{ident['password']}`")
        parts_out.append(f"📞 {ident['phone']} | 📍 {ident['city']}, {ident.get('postcode','')}")
        parts_out.append("")
    
    return "\n".join(parts_out)


def handle_checkmail(args=""):
    """Check for verification emails on recent identities."""
    identities = load_identities()
    if not identities:
        return "No saved identities found. Generate some with `/fakegen` first."
    
    valid = [i for i in identities if i.get("_mailtm_token")]
    if not valid:
        return "No Mail.tm accounts in cache. Generate fresh identities."
    
    results = []
    for ident in valid[-3:]:
        name = ident["name"]
        email = ident["email"]
        token = ident["_mailtm_token"]
        
        from fakegen import check_mailtm_inbox, get_mailtm_message
        msgs = check_mailtm_inbox(token)
        
        if not msgs:
            results.append(f"📭 **{name}** ({email}) — no messages yet")
        else:
            results.append(f"📬 **{name}** ({email}) — {len(msgs)} message(s):")
            for msg in msgs[:3]:
                subject = msg.get("subject", "No subject")
                from_h = msg.get("from", {}).get("name", "Unknown")
                has_links = "🔗" if any(w in subject.lower() for w in ["verify","confirm","activate","welcome","code","otp"]) else ""
                results.append(f"   • From: {from_h} | {subject} {has_links}")
    
    return "\n".join(results)


def handle_fakegen_help():
    return """
🦊 **FakeGen — Identity Factory**

**Commands:**
`/fakegen` — 1 London identity
`/fakegen 5` — 5 identities
`/fakegen uk` — Any UK city
`/fakegen us` — US identity
`/fakegen 3 us` — 3 US identities

`/checkmail` — Check for verification emails
`/fakegen_help` — This help
"""


if __name__ == "__main__":
    import sys
    parts = sys.argv[1:] if len(sys.argv) > 1 else []
    cmd = parts[0] if parts else ""
    
    if cmd in ("checkmail", "--checkmail"):
        print(handle_checkmail())
    elif cmd in ("help", "--help"):
        print(handle_fakegen_help())
    else:
        print(handle_fakegen(" ".join(parts)))
