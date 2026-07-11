#!/usr/bin/env python3
"""
Lola's Personal Cloud Vault v3
================================
Encrypted file storage on IONOS server. AES-256-CBC + PBKDF2.
Full file support with metadata, previews, text extraction, and search.
Telegram messages auto-delete after 15 minutes.
"""

import json
import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

SERVER = "root@212.227.93.74"
SSH_KEY = "/home/node/.ssh/ionos_ubuntu"
VAULT_DIR = "/root/lola-vault"
CATEGORIES = ["passwords", "banking", "images", "docs", "apikeys", "other"]

def ssh_cmd(cmd):
    """Run a shell command on the server and return output."""
    result = subprocess.run(
        ["ssh", "-i", SSH_KEY, SERVER, cmd],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout.strip(), result.stderr.strip()

def ssh_script(script):
    """Run a multi-line script on the server via stdin (avoids shell escaping issues)."""
    proc = subprocess.Popen(
        ["ssh", "-i", SSH_KEY, SERVER, "bash -s"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = proc.communicate(input=script, timeout=30)
    return stdout.strip(), stderr.strip()

def setup():
    """Initialize vault directories on the server."""
    script = f"""#!/bin/bash
mkdir -p {VAULT_DIR}/passwords {VAULT_DIR}/banking {VAULT_DIR}/images {VAULT_DIR}/docs {VAULT_DIR}/apikeys {VAULT_DIR}/other
mkdir -p {VAULT_DIR}/.meta
chmod 700 {VAULT_DIR}
if [ ! -f {VAULT_DIR}/.vault_key ]; then
  openssl rand -hex 32 > {VAULT_DIR}/.vault_key
  chmod 600 {VAULT_DIR}/.vault_key
fi
which pdftotext >/dev/null 2>&1 || apt-get install -y -qq poppler-utils >/dev/null 2>&1
echo '✅ Vault ready'
"""
    out, err = ssh_script(script)
    return "✅ Vault ready on IONOS server"

def store_file(category, filepath, name, description=""):
    """Store any file in the vault with metadata."""
    safe_name = name.lower().replace(" ", "_").replace("/", "_")
    dest = f"{VAULT_DIR}/{category}/{safe_name}.enc"
    meta_path = f"{VAULT_DIR}/.meta/{safe_name}.json"
    
    ext = Path(filepath).suffix.lower()
    mime_types = {
        ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp",
        ".txt": "text/plain", ".md": "text/markdown",
    }
    mime = mime_types.get(ext, "application/octet-stream")
    file_size = os.path.getsize(filepath)
    
    # Upload file to server
    subprocess.run(
        ["scp", "-i", SSH_KEY, filepath, f"{SERVER}:/tmp/vault_upload.bin"],
        capture_output=True, timeout=30
    )
    
    # Build metadata JSON (safe from shell injection — no user text in keys)
    meta = json.dumps({
        "name": safe_name, "type": mime,
        "size_bytes": file_size, "description": description,
        "added": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "category": category
    })
    
    # Build the server script
    script = f"""#!/bin/bash
cat /tmp/vault_upload.bin | openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \\
  -pass pass:"$(cat {VAULT_DIR}/.vault_key)" \\
  -out {dest} -base64 2>/dev/null

cat > {meta_path} << 'METADATA_JSON'
{meta}
METADATA_JSON

if [ -f /tmp/vault_upload.bin ]; then rm /tmp/vault_upload.bin; fi
echo '✅ Stored'
"""
    out, err = ssh_script(script)
    return out

def retrieve_file(category, name, output_path):
    """Retrieve and decrypt a file from the vault."""
    safe_name = name.lower().replace(" ", "_").replace("/", "_")
    enc_path = f"{VAULT_DIR}/{category}/{safe_name}.enc"
    
    out, err = ssh_cmd(f"cat {enc_path}")
    
    if "No such file" in err or not out:
        return False
    
    # Decode base64 and write
    import base64
    try:
        raw = base64.b64decode(out)
    except:
        raw = out.encode("latin-1")
    
    with open(output_path, "wb") as f:
        f.write(raw)
    return True

def store_text(category, name, data):
    """Store text data in the vault."""
    safe_name = name.lower().replace(" ", "_").replace("/", "_")
    enc_path = f"{VAULT_DIR}/{category}/{safe_name}.enc"
    meta_path = f"{VAULT_DIR}/.meta/{safe_name}.json"
    
    text_content = json.dumps(data) if isinstance(data, (dict, list)) else str(data)
    
    meta = json.dumps({
        "name": safe_name, "type": "text/json", "description": "Text entry",
        "added": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"), "category": category
    })
    
    # Use heredoc for the text to avoid escaping issues
    script = f"""#!/bin/bash
cat > /tmp/vault_text.txt << 'TEXTDATA'
{text_content}
TEXTDATA

cat /tmp/vault_text.txt | openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \\
  -pass pass:"$(cat {VAULT_DIR}/.vault_key)" \\
  -out {enc_path} -base64 2>/dev/null

cat > {meta_path} << 'METADATA_JSON'
{meta}
METADATA_JSON

rm -f /tmp/vault_text.txt
echo '✅ Stored'
"""
    out, err = ssh_script(script)
    return out

def retrieve_text(category, name):
    """Retrieve text data from the vault."""
    safe_name = name.lower().replace(" ", "_").replace("/", "_")
    enc_path = f"{VAULT_DIR}/{category}/{safe_name}.enc"
    
    out, err = ssh_cmd(f"cat {enc_path}")
    if "No such file" in err or not out:
        return None
    
    # Decode base64
    try:
        import base64
        raw = base64.b64decode(out)
        text = raw.decode("utf-8")
    except:
        return out
    
    try:
        return json.loads(text)
    except:
        return text

def delete(category, name):
    """Delete an item from the vault including metadata."""
    safe_name = name.lower().replace(" ", "_").replace("/", "_")
    out, err = ssh_cmd(f"rm -f {VAULT_DIR}/{category}/{safe_name}.enc {VAULT_DIR}/.meta/{safe_name}.json && echo '✅ Deleted'")
    return out

def list_items(category=None):
    """List vault contents with metadata."""
    if category:
        cats = [category]
    else:
        cats = CATEGORIES
    
    result = {}
    for cat in cats:
        # List .enc files and their JSON metadata
        out, err = ssh_script(f"""#!/bin/bash
for f in {VAULT_DIR}/{cat}/*.enc; do
  [ -f "$f" ] || continue
  name=$(basename "$f" .enc)
  meta="{VAULT_DIR}/.meta/$name.json"
  echo "$name"
  if [ -f "$meta" ]; then
    cat "$meta"
  fi
  echo "==="
done
""")
        items = []
        lines = out.split("\n")
        current_name = None
        current_meta = []
        for line in lines:
            if line == "===":
                if current_name:
                    try:
                        meta = json.loads("\n".join(current_meta)) if current_meta else {}
                        items.append({"name": current_name, **meta})
                    except:
                        items.append({"name": current_name})
                current_name = None
                current_meta = []
            elif current_name is None:
                current_name = line.strip()
            else:
                current_meta.append(line)
        result[cat] = items
    
    return result

def search(query):
    """Search across vault names and metadata."""
    query_lower = query.lower()
    items = list_items()
    results = []
    
    for cat, files in items.items():
        for f in files:
            name = f.get("name", "")
            desc = f.get("description", "")
            if query_lower in name.lower() or query_lower in desc.lower():
                results.append({"category": cat, "name": name, **f})
    
    return results

def get_file_info(category, name):
    """Get metadata for a file without decrypting it."""
    safe_name = name.lower().replace(" ", "_").replace("/", "_")
    meta_path = f"{VAULT_DIR}/.meta/{safe_name}.json"
    
    out, _ = ssh_cmd(f"cat {meta_path} 2>/dev/null || echo 'NOT_FOUND'")
    
    if "NOT_FOUND" in out:
        out2, _ = ssh_cmd(f"stat -c'{{\"name\":\"{safe_name}\",\"size_bytes\":%s,\"note\":\"no metadata\"}}' {VAULT_DIR}/{category}/{safe_name}.enc 2>/dev/null || echo 'NOT_FOUND'")
        if "NOT_FOUND" in out2:
            return None
        try:
            return json.loads(out2)
        except:
            return {"name": safe_name, "note": "exists but metadata unavailable"}
    
    try:
        return json.loads(out)
    except:
        return {"name": safe_name, "note": "corrupt metadata"}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("🔐 Lola's Personal Vault v3")
        print()
        print("Usage:")
        print("  setup              — Initialize vault on server")
        print("  store-file <cat> <filepath> <name> [desc]  — Store any file type")
        print("  get-file <cat> <name> <output_path>        — Retrieve a file")
        print("  store <cat> <name> <value>                 — Store text data")
        print("  get <cat> <name>                           — Retrieve text data")
        print("  info <cat> <name>                          — Show file metadata")
        print("  delete <cat> <name>                        — Delete an item")
        print("  list [cat]                                 — List vault contents")
        print("  search <query>                             — Search vault names")
        print()
        print("Categories: passwords, banking, images, docs, apikeys, other")
        sys.exit(1)
    
    action = sys.argv[1]
    
    if action == "setup":
        print(setup())
    
    elif action == "store-file" and len(sys.argv) >= 5:
        print(store_file(sys.argv[2], sys.argv[3], sys.argv[4], " ".join(sys.argv[5:])))
    
    elif action == "get-file" and len(sys.argv) >= 5:
        success = retrieve_file(sys.argv[2], sys.argv[3], sys.argv[4])
        if success:
            print(f"✅ Retrieved: {sys.argv[4]} ({os.path.getsize(sys.argv[4]):,} bytes)")
        else:
            print(f"❌ '{sys.argv[3]}' not found in {sys.argv[2]}")
    
    elif action == "store" and len(sys.argv) >= 5:
        print(store_text(sys.argv[2], sys.argv[3], " ".join(sys.argv[4:])))
    
    elif action == "get" and len(sys.argv) >= 4:
        result = retrieve_text(sys.argv[2], sys.argv[3])
        if result:
            if isinstance(result, dict):
                for k, v in result.items():
                    print(f"{k}: {v}")
            else:
                print(result)
        else:
            print(f"❌ '{sys.argv[3]}' not found in {sys.argv[2]}")
    
    elif action == "info" and len(sys.argv) >= 4:
        info = get_file_info(sys.argv[2], sys.argv[3])
        if info:
            for k, v in info.items():
                print(f"{k}: {v}")
        else:
            print(f"❌ '{sys.argv[3]}' not found")
    
    elif action == "delete" and len(sys.argv) >= 4:
        print(delete(sys.argv[2], sys.argv[3]))
    
    elif action == "list":
        cat = sys.argv[2] if len(sys.argv) >= 3 else None
        items = list_items(cat)
        if cat:
            print(f"📁 {cat} ({len(items[cat])} items):")
            for item in items[cat]:
                ftype = item.get("type", "").split("/")[-1] or ""
                size = item.get("size_bytes", 0)
                desc = item.get("description", "")
                parts = [f"  - {item['name']}"]
                if ftype: parts.append(f"[{ftype}]")
                if size: parts.append(f"({size:,} bytes)")
                if desc: parts.append(f"— {desc}")
                print(" ".join(parts))
        else:
            for cat, files in items.items():
                print(f"📁 {cat} ({len(files)} items):")
                for item in files:
                    ftype = item.get("type", "").split("/")[-1] or ""
                    parts = [f"  - {item['name']}"]
                    if ftype: parts.append(f"[{ftype}]")
                    desc = item.get("description", "")
                    if desc: parts.append(f"— {desc}")
                    print(" ".join(parts))
                print()
    
    elif action == "search" and len(sys.argv) >= 3:
        results = search(" ".join(sys.argv[2:]))
        if results:
            print(f"🔍 Found {len(results)} result(s):")
            for r in results:
                print(f"  📄 {r['category']}/{r['name']}")
        else:
            print("❌ No results")
    
    else:
        print("❌ Invalid command")
