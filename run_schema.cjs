const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:@Superlola888@db.mdleurcenwmmenvkwjhl.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL!');

    const sql = fs.readFileSync('/home/node/.openclaw/workspace/oa_schema.sql', 'utf8');

    // Remove comment lines
    const cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let success = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i] + ';');
        success++;
        if (i % 5 === 0) process.stdout.write('.');
      } catch (err) {
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          errors.push(`#${i + 1}: ${err.message.substring(0, 150)}`);
          failed++;
        } else {
          success++;
        }
      }
    }
    console.log('\n');
    console.log(`📊 Results: ${success} ok, ${failed} failed`);
    if (errors.length > 0) {
      console.log('\n⚠️ Errors:');
      errors.forEach(e => console.log(`  ${e}`));
    }
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

main();
