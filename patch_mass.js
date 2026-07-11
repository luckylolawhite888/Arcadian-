const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const P = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs';

const londonPcs = fs.readFileSync('/tmp/london_all_postcodes.txt', 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('Total'));

console.log(`Postcodes: ${londonPcs.length}`);

const patchContent = `
const f = require("fs");
let c = f.readFileSync("${P}", "utf8");

// 1. Remove Dr
c = c.replace(/'Dr'/g, "").replace(/, ,/g, ",");

// 2. Add ethnic surnames
c = c.replace(/(surnames: \\[)([^\\]]+)(\\])/, (m, open, content, close) => {
  let items = content.replace(/\\n/g, " ").split(",").map(s => s.trim()).filter(Boolean);
  const add = ["Okonkwo","Okafor","Eze","Nwachukwu","Adepoju","Ogunlade","Obiora","Chibueze","Hussain","Rahman","Khan","Patel","Sharma","Desai","Kapoor","Al-Rashid","Abdullah","Al-Farsi"];
  for (const a of add)
    if (!items.some(x => x.replace(/[\\'"]/g, "") === a)) items.push("'" + a + "'");
  return open + items.join(", ") + close;
});

// 3. Add ethnic given
c = c.replace(/(given: \\[)([^\\]]+)(\\])/, (m, open, content, close) => {
  let items = content.replace(/\\n/g, " ").split(",").map(s => s.trim()).filter(Boolean);
  const add = ["Chinonso","Chiamaka","Oluwaseun","Folake","Ngozi","Kwame","Zainab","Fatima","Abdul","Aisha","Priya","Rahul","Ananya","Vikram","Layla","Amir","Hassan"];
  for (const a of add)
    if (!items.some(x => x.replace(/[\\'"]/g, "") === a)) items.push("'" + a + "'");
  return open + items.join(", ") + close;
});

// 4. Add London postcodes array
const pcs = ${JSON.stringify(londonPcs)};
c = c.replace("function makePerson(", "const LONDON_PCS = " + JSON.stringify(pcs, null, 2) + ";\\n\\nfunction makePerson(");

// 5. Replace postcode
c = c.replace("postcode: 'NW10 8SB'", "postcode: LONDON_PCS[Math.floor(Math.random() * LONDON_PCS.length)]");

// 6. Out-of-catchment handler
c = c.replace("await click(); // find",
  "await click(); // find\\n    try { await p.locator('button').filter({ hasText: /Yes|yes|Continue|continue/i }).first().click({ timeout: 2000 }).catch(()=>{}); } catch(e){} // out-of-catchment");

f.writeFileSync("${P}", c);
console.log("PATCH OK: " + c.length);
`;

const conn = new Client();
conn.on('ready', () => {
  // Restore backup
  conn.exec('cp ' + P + '.bak ' + P, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.stderr.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('Restore:', out.trim() || 'ok');
      
      // SFTP upload the patch file
      conn.sftp((e2, sftp) => {
        if (e2) { console.log('SFTP err:', e2.message); conn.end(); return; }
        const ws = sftp.createWriteStream('/tmp/patch_full.cjs');
        ws.on('close', () => {
          sftp.end();
          
          conn.exec('node /tmp/patch_full.cjs', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.stderr.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('Patch:', o3.trim());
              
              // Verify key elements
              conn.exec("head -34 " + P + " | tail -3", (e4, s4) => {
                let o4 = '';
                s4.on('data', d => o4 += d.toString());
                s4.stderr.on('data', d => o4 += d.toString());
                s4.on('close', () => {
                  console.log('LONDON_PCS line:', o4.trim());
                  
                  conn.exec("grep -c 'Okonkwo\\|Chinonso\\|out-of-catchment\\|LONDON_PCS' " + P, (e5, s5) => {
                    let o5 = '';
                    s5.on('data', d => o5 += d.toString());
                    s5.stderr.on('data', d => o5 += d.toString());
                    s5.on('close', () => {
                      console.log('All features present:', o5.trim());
                      conn.end();
                    });
                  });
                });
              });
            });
          });
        });
        ws.end(Buffer.from(patchContent, 'utf8'));
      });
    });
  });
});
conn.on('error', e => { console.log('ERR:', e.message); conn.end(); });
conn.connect({ host: '212.227.93.74', port: 22, username: 'root', privateKey: key, readyTimeout: 15000 });
