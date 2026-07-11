#!/usr/bin/env python3
"""
Transcripts Manager - Handles saving, queuing, and preparing "From the Feed" content.
Also handles Ghost blog posting for approved transcripts.
"""

import json
import os
import sys
import hashlib
from datetime import datetime

TRANSCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "transcripts")
PENDING_FILE = os.path.join(TRANSCRIPTS_DIR, "pending.json")

def ensure_dirs():
    os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)

def load_pending():
    if not os.path.exists(PENDING_FILE):
        return {"pending": [], "approved": [], "rejected": []}
    with open(PENDING_FILE) as f:
        return json.load(f)

def save_pending(data):
    with open(PENDING_FILE, "w") as f:
        json.dump(data, f, indent=2)

def save_transcript(source_url, author, title, transcript_text):
    """Save a transcript to disk and add to pending queue."""
    ensure_dirs()
    
    now = datetime.now()
    timestamp = now.strftime("%Y-%m-%d_%H%M")
    safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in title.lower())
    safe_title = safe_title[:60].strip().replace(" ", "_")
    filename = f"{timestamp}_{safe_title}.md"
    filepath = os.path.join(TRANSCRIPTS_DIR, filename)
    
    content = f"""# {title}

**Source:** {author}
**Link:** {source_url}
**Date:** {now.strftime("%Y-%m-%d")}
**Status:** pending

---

{transcript_text}
"""
    
    with open(filepath, "w") as f:
        f.write(content)
    
    # Add to pending queue
    data = load_pending()
    entry_id = filename.replace(".md", "")
    data["pending"].append({
        "id": entry_id,
        "title": title,
        "source": author,
        "url": source_url,
        "added": now.isoformat(),
        "shown_in_briefing": 0
    })
    save_pending(data)
    
    return entry_id, filepath

def get_pending_for_briefing():
    """Get one pending transcript to feature in the morning briefing."""
    data = load_pending()
    
    # Filter to ones shown less than 3 times
    available = [t for t in data["pending"] if t.get("shown_in_briefing", 0) < 3]
    
    if not available:
        return None
    
    # Pick the oldest one first
    item = sorted(available, key=lambda x: x["added"])[0]
    item["shown_in_briefing"] = item.get("shown_in_briefing", 0) + 1
    
    # Update in data
    for t in data["pending"]:
        if t["id"] == item["id"]:
            t["shown_in_briefing"] = item["shown_in_briefing"]
            break
    
    save_pending(data)
    
    # Load the transcript content
    filepath = os.path.join(TRANSCRIPTS_DIR, f"{item['id']}.md")
    transcript_text = ""
    if os.path.exists(filepath):
        with open(filepath) as f:
            content = f.read()
            # Extract the transcript (after the ---)
            parts = content.split("---\n", 1)
            if len(parts) > 1:
                transcript_text = parts[1].strip()
            else:
                transcript_text = content
    
    # Get a pull quote (first substantial paragraph)
    lines = transcript_text.split("\n\n")
    pull_quote = ""
    for line in lines:
        line = line.strip()
        if len(line) > 40:
            pull_quote = line[:200]
            break
    
    return {
        "id": item["id"],
        "title": item["title"],
        "source": item["source"],
        "url": item["url"],
        "pull_quote": pull_quote,
        "shown": item["shown_in_briefing"]
    }

def approve_transcript(entry_id):
    """Move transcript from pending to approved."""
    data = load_pending()
    entry = None
    
    for t in data["pending"]:
        if t["id"] == entry_id:
            entry = t
            break
    
    if not entry:
        return False, "Not found in pending"
    
    data["pending"].remove(entry)
    entry["approved_at"] = datetime.now().isoformat()
    data["approved"].append(entry)
    save_pending(data)
    
    return True, entry

def reject_transcript(entry_id):
    """Move transcript to rejected."""
    data = load_pending()
    entry = None
    
    for t in data["pending"]:
        if t["id"] == entry_id:
            entry = t
            break
    
    if not entry:
        return False, "Not found in pending"
    
    data["pending"].remove(entry)
    entry["rejected_at"] = datetime.now().isoformat()
    data["rejected"].append(entry)
    save_pending(data)
    
    return True, entry

def defer_transcript(entry_id):
    """Reset the counter so it shows up again."""
    data = load_pending()
    for t in data["pending"]:
        if t["id"] == entry_id:
            t["shown_in_briefing"] = 0
            break
    save_pending(data)
    return True

def format_for_ghost(entry_id):
    """Format a transcript as a Ghost blog post."""
    data = load_pending()
    
    # Check approved
    entry = None
    for t in data["approved"]:
        if t["id"] == entry_id:
            entry = t
            break
    
    if not entry:
        return None
    
    filepath = os.path.join(TRANSCRIPTS_DIR, f"{entry['id']}.md")
    if not os.path.exists(filepath):
        return None
    
    with open(filepath) as f:
        content = f.read()
    
    parts = content.split("---\n", 1)
    transcript = parts[1].strip() if len(parts) > 1 else content
    
    # Build Ghost-compatible HTML
    html_parts = []
    html_parts.append(f'<p><em>Originally from {entry["source"]}</em></p>')
    html_parts.append('<hr>')
    
    for para in transcript.split("\n\n"):
        para = para.strip()
        if para:
            html_parts.append(f'<p>{para}</p>')
    
    html_parts.append('<hr>')
    html_parts.append(f'<p><em>Source: <a href="{entry["url"]}">{entry["url"]}</a></em></p>')
    
    return {
        "title": entry["title"],
        "html": "\n".join(html_parts),
        "tags": ["Mind Fuel", "Video Transcript"],
        "source_url": entry["url"]
    }

def count_pending():
    data = load_pending()
    return len(data["pending"])

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    
    if cmd == "status":
        data = load_pending()
        print(f"📥 Pending: {len(data['pending'])}")
        print(f"✅ Approved: {len(data['approved'])}")
        print(f"❌ Rejected: {len(data['rejected'])}")
        print()
        for t in data["pending"]:
            shown = t.get("shown_in_briefing", 0)
            print(f"  ⏳ {t['id']} — shown {shown}x — {t['title'][:50]}")
        for t in data["approved"]:
            print(f"  ✅ {t['id']} — {t['title'][:50]}")
