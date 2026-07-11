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
c = c.replace(/'Dr'/g, '').replace(/, ,/g, ',');

// Add ethnic surnames
c = c.replace(/surnames = \\[([^\\]]+)\\]/, (m, list) => {
  const items = list.replace(/\\n/g, ' ').trim().split(',').map(s => s.trim()).filter(Boolean);
  ['Okonkwo','Okafor','Eze','Nwachukwu','Adepoju','Ogunlade','Obiora','Chibueze','Hussain','Rahman','Khan','Patel','Sharma','Desai','Kapoor','Al-Rashid','Abdullah','Al-Farsi'].forEach(a => {
    if (!items.some(x => x.replace(/[\\'"]/g,'') === a)) items.push("'" + a + "'");
  });
  return 'surnames = [' + items.join(', ') + ']';
});

// Add ethnic given
c = c.replace(/given = \\[([^\\]]+)\\]/, (m, list) => {
  const items = list.replace(/\\n/g, ' ').trim().split(',').map(s => s.trim()).filter(Boolean);
  ['Chinonso','Chiamaka','Oluwaseun','Folake','Ngozi','Kwame','Zainab','Fatima','Abdul','Aisha','Priya','Rahul','Ananya','Vikram','Layla','Amir','Hassan'].forEach(a => {
    if (!items.some(x => x.replace(/[\\'"]/g,'') === a)) items.push("'" + a + "'");
  });
  return 'given = [' + items.join(', ') + ']';
});

// Add London postcodes
const pcs = ${JSON.stringify(londonPcs)};
c = c.replace('function makePerson(', 'const LONDON_PCS = ' + JSON.stringify(pcs, null, 2) + ';\\\\n\\\\nfunction makePerson(');

// Replace postcode
c = c.replace("postcode: 'NW10 8SB'", 'postcode: LONDON_PCS[Math.floor(Math.random() * LONDON_PCS.length)]');

// Out-of-catchment handler  
c = c.replace("await click(); // find",
  "await click(); // find\\\\n    try { await p.locator('button').filter({ hasText: /Yes|yes|Continue|continue/i }).first().click({ timeout: 2000 }).catch(()=>{}); } catch(e){} // out-of-catchment");

f.writeFileSync('${P}', c);
console.log('PATCH OK: ' + c.length);
`;

const conn = new Client();
conn.on('ready', () => {
  // Write patch file via SFTP
  conn.sftp((err, sftp) => {
    if (err) { console.log('SFTP err:', err.message); conn.end(); return; }
    const writeStream = sftp.createWriteStream('/tmp/patch_final.cjs');
    writeStream.on('close', () => {
      console.log('Written to server');
      sftp.end();
      
      // Execute
      conn.exec('node /tmp/patch_final.cjs', (e2, s2) => {
        let o2 = '';
        s2.on('data', d => o2 += d.toString());
        s2.stderr.on('data', d => o2 += d.toString());
        s2.on('close', () => {
          console.log('Patch:', o2.trim());
          
          // Verify
          conn.exec("grep -n 'LONDON_PCS\\|Okonkwo\\|out-of-catchment' " + P + ' | head -5', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.stderr.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('Verify:', o3);
              conn.end();
            });
          });
        });
      });
    });
    writeStream.on('error', (e) => { console.log('Write err:', e.message); });
    writeStream.end(Buffer.from(patchJS, 'utf8'));
  });
});
conn.on('error', e => { console.log('ERR:', e.message); conn.end(); });
conn.connect({ host: '212.227.93.74', port: 22, username: 'root', privateKey: key, readyTimeout: 15000 });
