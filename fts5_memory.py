#!/usr/bin/env python3
"""
FTS5 Memory Index — Lola's permanent searchable memory.
Survives restarts. Written to memory/memory_store.db

Usage:
  python3 fts5_memory.py store <text>   — index a memory
  python3 fts5_memory.py search <query>  — search memories (ranked)
  python3 fts5_memory.py recall <topic>  — get timeline for a topic
"""

import sqlite3, sys, os, json, datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'memory', 'memory_store.db')

def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init():
    conn = get_db()
    c = conn.cursor()
    # FTS5 full-text table — the actual memory
    c.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS memories USING fts5(
            content,
            source,          -- 'conversation', 'file', 'manual'
            topic,           -- broad topic label
            session_id,      -- which session it came from
            tokenize='porter unicode61'
        )
    """)
    # Timeline table — chronological index
    c.execute("""
        CREATE TABLE IF NOT EXISTS timeline (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rowid_ref INTEGER,
            timestamp TEXT,
            topic TEXT,
            keywords TEXT,
            importance INTEGER DEFAULT 1
        )
    """)
    conn.commit()
    conn.close()

def store(content, source='conversation', topic='general', session_id='', importance=1, keywords=''):
    conn = get_db()
    c = conn.cursor()
    timestamp = datetime.datetime.utcnow().isoformat() + 'Z'
    
    # Extract keywords from content if not provided
    if not keywords:
        # Simple keyword extraction: unique words over 3 chars
        words = [w.lower().strip('.,!?;:()[]{}"\'') for w in content.split()
                 if len(w) > 3 and w.isalpha()]
        keywords = ' '.join(sorted(set(words))[:20])
    
    c.execute(
        "INSERT INTO memories(content, source, topic, session_id) VALUES (?, ?, ?, ?)",
        (content, source, topic, session_id)
    )
    rowid = c.lastrowid
    
    c.execute(
        "INSERT INTO timeline(rowid_ref, timestamp, topic, keywords, importance) VALUES (?, ?, ?, ?, ?)",
        (rowid, timestamp, topic, keywords, importance)
    )
    
    conn.commit()
    count = c.execute("SELECT COUNT(*) FROM memories").fetchone()[0]
    conn.close()
    print(f"📝 Stored [{topic}] (memory #{rowid}, total: {count})")
    return rowid

def search(query, limit=5):
    conn = get_db()
    c = conn.cursor()
    
    # FTS5 search with ranking
    c.execute("""
        SELECT rowid, content, source, topic, rank
        FROM memories
        WHERE memories MATCH ?
        ORDER BY rank
        LIMIT ?
    """, (query, limit))
    
    results = [dict(r) for r in c.fetchall()]
    conn.close()
    return results

def recall(topic, limit=20):
    conn = get_db()
    c = conn.cursor()
    
    c.execute("""
        SELECT m.rowid, m.content, m.topic, t.timestamp, t.importance
        FROM memories m
        JOIN timeline t ON m.rowid = t.rowid_ref
        WHERE m.topic LIKE ? OR m.content LIKE ?
        ORDER BY t.timestamp DESC
        LIMIT ?
    """, (f'%{topic}%', f'%{topic}%', limit))
    
    results = [dict(r) for r in c.fetchall()]
    conn.close()
    return results

def list_topics():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT topic, COUNT(*) as count, MAX(timestamp) as last
        FROM timeline
        GROUP BY topic
        ORDER BY count DESC
    """)
    results = [dict(r) for r in c.fetchall()]
    conn.close()
    return results

def count():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM memories")
    count = c.fetchone()[0]
    conn.close()
    return count

if __name__ == '__main__':
    init()
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  store <text> [--topic <topic>] [--source <source>]")
        print("  search <query>")
        print("  recall <topic>")
        print("  topics")
        print("  stats")
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == 'store':
        if len(sys.argv) < 3:
            print("Usage: store <text> [--topic <topic>]")
            sys.exit(1)
        text = sys.argv[2]
        topic = 'general'
        source = 'conversation'
        
        if '--topic' in sys.argv:
            idx = sys.argv.index('--topic')
            topic = sys.argv[idx + 1]
        if '--source' in sys.argv:
            idx = sys.argv.index('--source')
            source = sys.argv[idx + 1]
        
        store(text, source=source, topic=topic)
    
    elif cmd == 'search':
        if len(sys.argv) < 3:
            print("Usage: search <query>")
            sys.exit(1)
        query = sys.argv[2]
        results = search(query)
        if results:
            print(f"🔍 Found {len(results)} results for '{query}':\n")
            for r in results:
                print(f"  [{r['topic']}] (score: {r['rank']:.2f})")
                print(f"  {r['content'][:200]}")
                print()
        else:
            print(f"No results for '{query}'")
    
    elif cmd == 'recall':
        if len(sys.argv) < 3:
            print("Usage: recall <topic>")
            sys.exit(1)
        topic = sys.argv[2]
        results = recall(topic)
        if results:
            print(f"📋 {len(results)} memories about '{topic}':\n")
            for r in results:
                print(f"  [{r['timestamp']}] (importance: {r['importance']})")
                print(f"  {r['content'][:200]}")
                print()
        else:
            print(f"No memories about '{topic}'")
    
    elif cmd == 'topics':
        topics = list_topics()
        if topics:
            print("📊 Topics by frequency:\n")
            for t in topics:
                print(f"  {t['topic']:25s} {t['count']:3d} memories (last: {t['last'][:10]})")
        else:
            print("No memories yet")
    
    elif cmd == 'stats':
        print(f"🧠 Total memories: {count()}")

    else:
        print(f"Unknown command: {cmd}")
