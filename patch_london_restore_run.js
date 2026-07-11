const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const P = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs';

const londonPcs = fs.readFileSync('/tmp/london_postcodes.txt', 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('Total'));

// Build a single Node.js patch script that does everything
// Using .cjs extension to force CommonJS
const patchContent = `const f = require('fs');
let c = f.readFileSync('${P}', 'utf8');

// 1. Remove Dr
c = c.replace(/'Dr'/g, '').replace(/, ,/g, ',');

// 2. Add ethnic surnames
c = c.replace(/surnames = \\[([^\\]]+)\\]/, (m, list) => {
  const items = list.replace(/\\n/g, ' ').trim().split(',').map(s => s.trim()).filter(Boolean);
  const add = ['Okonkwo','Okafor','Eze','Nwachukwu','Adepoju','Ogunlade','Obiora','Chibueze','Hussain','Rahman','Khan','Patel','Sharma','Desai','Kapoor','Al-Rashid','Abdullah','Al-Farsi'];
  for (const a of add) {
    if (!items.some(x => x.replace(/[\\'"]/g,'') === a)) items.push("'" + a + "'");
  }
  return 'surnames = [' + items.join(', ') + ']';
});

// 3. Add ethnic given names
c = c.replace(/given = \\[([^\\]]+)\\]/, (m, list) => {
  const items = list.replace(/\\n/g, ' ').trim().split(',').map(s => s.trim()).filter(Boolean);
  const add = ['Chinonso','Chiamaka','Oluwaseun','Folake','Ngozi','Kwame','Zainab','Fatima','Abdul','Aisha','Priya','Rahul','Ananya','Vikram','Layla','Amir','Hassan'];
  for (const a of add) {
    if (!items.some(x => x.replace(/[\\'"]/g,'') === a)) items.push("'" + a + "'");
  }
  return 'given = [' + items.join(', ') + ']';
});

// 4. Add London postcodes array
const pcs = ${JSON.stringify(londonPcs)};
c = c.replace('function makePerson(', 'const LONDON_PCS = ' + JSON.stringify(pcs, null, 2) + ';\\n\\nfunction makePerson(');

// 5. Replace postcode
c = c.replace("postcode: 'NW10 8SB'", 'postcode: LONDON_PCS[Math.floor(Math.random() * LONDON_PCS.length)]');

// 6. Add out-of-catchment warning handler
c = c.replace("await click(); // find",
  "await click(); // find\\n    try { await p.locator('button').filter({ hasText: /Yes|yes|Continue|continue/i }).first().click({ timeout: 2000 }).catch(()=>{}); } catch(e){} // out-of-catchment");

f.writeFileSync('${P}', c);
console.log('PATCH OK: ' + c.length);
`;

const conn = new Client();
conn.on('ready', () => {
  // Restore from backup
  conn.exec('cp ' + P + '.bak ' + P, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Restore:', out.trim() || 'ok');
      conn.end();
    });
  });
});
conn.on('error', e => { console.log('ERR:', e.message); conn.end(); });
conn.connect({ host: '212.227.93.74', port: 22, username: 'root', privateKey: key, readyTimeout: 15000 });
