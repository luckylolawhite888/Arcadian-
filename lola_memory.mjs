#!/usr/bin/env node
// lola_memory.mjs — Long-term memory database for Lola
// Uses Node 24's built-in node:sqlite (experimental)
// Usage: node lola_memory.mjs <command> [args]
// Commands: store, query, fact-get, fact-set, recent, stats

import { DatabaseSync } from 'node:sqlite';

const DB_PATH = process.env.HOME + '/.openclaw/workspace/data/lola_memory.db';
const db = new DatabaseSync(DB_PATH);

const cmd = process.argv[2];

switch (cmd) {
  case 'store': {
    // node lola_memory.mjs store <category> <content> [priority] [tags]
    const category = process.argv[3] || 'general';
    const content = process.argv[4];
    const priority = parseInt(process.argv[5]) || 0;
    const tags = process.argv[6] || '';
    const source = process.argv[7] || 'manual';

    if (!content) { console.error('Usage: store <category> <content> [priority] [tags]'); process.exit(1); }

    const stmt = db.prepare('INSERT INTO memories (category, content, priority, tags, source) VALUES (?, ?, ?, ?, ?)');
    stmt.run(category, content, priority, tags, source);
    console.log(`✅ Stored memory: [${category}] ${content.slice(0, 60)}...`);
    break;
  }

  case 'query': {
    // node lola_memory.mjs query <search> [category] [limit]
    const search = process.argv[3];
    const category = process.argv[4];
    const limit = parseInt(process.argv[5]) || 10;

    let sql = 'SELECT * FROM memories WHERE archived = 0 AND content LIKE ?';
    const params = [`%${search || ''}%`];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY priority DESC, created_at DESC LIMIT ?';
    params.push(limit);

    const rows = db.prepare(sql).all(...params);
    console.log(JSON.stringify(rows, null, 2));
    break;
  }

  case 'recent': {
    const limit = parseInt(process.argv[3]) || 10;
    const rows = db.prepare('SELECT * FROM memories WHERE archived = 0 ORDER BY id DESC LIMIT ?').all(limit);
    console.log(JSON.stringify(rows, null, 2));
    break;
  }

  case 'fact-get': {
    const key = process.argv[3];
    if (!key) { console.error('Usage: fact-get <key>'); process.exit(1); }
    const row = db.prepare('SELECT * FROM facts WHERE key = ?').get(key);
    console.log(JSON.stringify(row || { error: 'not found' }, null, 2));
    break;
  }

  case 'fact-set': {
    // node lola_memory.mjs fact-set <key> <value> [category] [confidence]
    const key = process.argv[3];
    const value = process.argv[4];
    const category = process.argv[5] || 'general';
    const confidence = parseFloat(process.argv[6]) || 1.0;

    if (!key || !value) { console.error('Usage: fact-set <key> <value> [category] [confidence]'); process.exit(1); }

    const stmt = db.prepare('INSERT OR REPLACE INTO facts (key, value, category, confidence, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'))');
    stmt.run(key, value, category, confidence);
    console.log(`✅ Fact stored: ${key} = ${value.slice(0, 60)}`);
    break;
  }

  case 'stats': {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_memories,
        COUNT(DISTINCT category) as categories,
        MAX(created_at) as latest,
        MIN(created_at) as earliest
      FROM memories WHERE archived = 0
    `).get();
    console.log(JSON.stringify(stats, null, 2));
    break;
  }

  case 'categories': {
    const rows = db.prepare('SELECT category, COUNT(*) as count FROM memories WHERE archived = 0 GROUP BY category ORDER BY count DESC').all();
    console.log('📂 Memory Categories:');
    rows.forEach(r => console.log(`  ${r.category}: ${r.count}`));
    break;
  }

  default:
    console.log(`
Lola Memory Database 📚

Usage: node lola_memory.mjs <command> [args]

Commands:
  store <category> <content> [priority] [tags]   Store a memory
  query [search] [category] [limit]               Search memories
  recent [limit]                                   Show recent memories
  fact-get <key>                                   Get a fact
  fact-set <key> <value> [category] [confidence]   Set a fact
  stats                                            Database statistics
  categories                                       List memory categories

Examples:
  node lola_memory.mjs store preference "Maya prefers orange themes" 3 ui,design
  node lola_memory.mjs query "server" all 5
  node lola_memory.mjs recent
  node lola_memory.mjs fact-set maya.name "Arcadian Maya" personal 1.0
    `);
}
