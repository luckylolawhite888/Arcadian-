const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const P = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs';

const londonPcs = fs.readFileSync('/tmp/london_postcodes.txt', 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('Total'));

const patchJS = `
const f = require('fs');
let c = f.readFileSync('${P}', 'utf8');

// Remove Dr
c = c.replace(/'Dr'/g, '').replace(/, ,/g, ',').replace(/,]/g, ']');

// Add ethnic surnames
c = c.replace(/surnames = \\[([^\\]]+)\\]/g, (m, list) => {
  const items = list.replace(/\\n/g, ' ').trim().split(',').map(s => s.trim());
  const add = ['Okonkwo','Okafor','Eze','Nwachukwu','Adepoju','Ogunlade','Obiora','Chibueze','Hussain','Rahman','Khan','Patel','Sharma','Desai','Kapoor','Al-Rashid','Abdullah','Al-Farsi'];
  for (const a of add) if (!items.some(x => x.replace(/['"]/g,'') === a)) items.push("'" + a + "'");
  return 'surnames = [' + items.join(', ') + ']';
});
c = c.replace(/given = \\[([^\\]]+)\\]/g, (m, list) => {
  const items = list.replace(/\\n/g, ' ').trim().split(',').map(s => s.trim());
  const add = ['Chinonso','Chiamaka','Oluwaseun','Folake','Ngozi','Kwame','Zainab','Fatima','Abdul','Aisha','Priya','Rahul','Ananya','Vikram','Layla','Amir','Hassan'];
  for (const a of add) if (!items.some(x => x.replace(/['"]/g,'') === a)) items.push("'" + a + "'");
  return 'given = [' + items.join(', ') + ']';
});

// Add out-of-catchment handler
c = c.replace('await click(); // find', 'await click(); // find\\n    try { await p.locator(\\'button\\').filter({ hasText: /Yes|yes|Continue|continue/i }).first().click({ timeout: 2000 }).catch(()=>{}); } catch(e){} // out-of-catchment');

f.writeFileSync('${P}', c);
console.log('PATCH 1 OK: ' + c.length);
`;
const patchJS2 = `
const f = require('fs');
let c = f.readFileSync('${P}', 'utf8');

const pcs = ${JSON.stringify(londonPcs)};

c = c.replace('function makePerson(', 'const LONDON_PCS = ' + JSON.stringify(pcs, null, 2) + ';\\n\\nfunction makePerson(');
c = c.replace("postcode: 'NW10 8SB'", 'postcode: LONDON_PCS[Math.floor(Math.random() * LONDON_PCS.length)]');

f.writeFileSync('${P}', c);
console.log('PATCH 2 OK: ' + c.length);
`;

const conn = new Client();
conn.on('ready', () => {
  conn.exec('cp ' + P + '.bak ' + P, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Restore:', out.trim() || 'ok');
      
      // Write and run patch 1 (names + handler)
      conn.exec("cat > /tmp/p1.mjs << 'EOF'\n" + patchJS + "\nEOF", (e2, s2) => {
        let o2 = '';
        s2.on('data', d => o2 += d);
        s2.stderr.on('data', d => o2 += d);
        s2.on('close', () => {
          console.log('Write p1:', o2.trim() || 'ok');
          conn.exec('node /tmp/p1.mjs', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d);
            s3.stderr.on('data', d => o3 += d);
            s3.on('close', () => {
              console.log('P1:', o3.trim());
              
              // Write and run patch 2 (postcodes)
              conn.exec("cat > /tmp/p2.mjs << 'EOF'\n" + patchJS2 + "\nEOF", (e4, s4) => {
                let o4 = '';
                s4.on('data', d => o4 += d);
                s4.stderr.on('data', d => o4 += d);
                s4.on('close', () => {
                  console.log('Write p2:', o4.trim() || 'ok');
                  conn.exec('node /tmp/p2.mjs', (e5, s5) => {
                    let o5 = '';
                    s5.on('data', d => o5 += d);
                    s5.stderr.on('data', d => o5 += d);
                    s5.on('close', () => {
                      console.log('P2:', o5.trim());
                      
                      // Verify
                      conn.exec("grep -n 'LONDON_PCS\\|Okonkwo\\|out-of-catchment' " + P + " | head -5", (e6, s6) => {
                        let o6 = '';
                        s6.on('data', d => o6 += d);
                        s6.stderr.on('data', d => o6 += d);
                        s6.on('close', () => {
                          console.log('Verify:', o6);
                          conn.end();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
conn.on('error', e => { console.log('ERR:', e.message); conn.end(); });
conn.connect({ host: '212.227.93.74', port: 22, username: 'root', privateKey: key, readyTimeout: 15000 });
