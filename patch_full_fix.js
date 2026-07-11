const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const P = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs';

// Read London postcodes
const londonPcs = fs.readFileSync('/tmp/london_all_postcodes.txt', 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('Total'));

// Build a comprehensive patch that handles the "no address found" case
const patchContent = `
const f = require("fs");
let c = f.readFileSync("${P}", "utf8");

// Remove Dr (may already be done, but ensure)
c = c.replace(/'Dr'/g, "").replace(/, ,/g, ",");

// Add ethnic surnames  
c = c.replace(/(surnames: \\[)([^\\]]+)(\\])/, (m, open, content, close) => {
  let items = content.replace(/\\n/g, " ").split(",").map(s => s.trim()).filter(Boolean);
  const add = ["Okonkwo","Okafor","Eze","Nwachukwu","Adepoju","Ogunlade","Obiora","Chibueze","Hussain","Rahman","Khan","Patel","Sharma","Desai","Kapoor","Al-Rashid","Abdullah","Al-Farsi"];
  for (const a of add)
    if (!items.some(x => x.replace(/[\\'"]/g, "") === a)) items.push("'" + a + "'");
  return open + items.join(", ") + close;
});

// Add ethnic given
c = c.replace(/(given: \\[)([^\\]]+)(\\])/, (m, open, content, close) => {
  let items = content.replace(/\\n/g, " ").split(",").map(s => s.trim()).filter(Boolean);
  const add = ["Chinonso","Chiamaka","Oluwaseun","Folake","Ngozi","Kwame","Zainab","Fatima","Abdul","Aisha","Priya","Rahul","Ananya","Vikram","Layla","Amir","Hassan"];
  for (const a of add)
    if (!items.some(x => x.replace(/[\\'"]/g, "") === a)) items.push("'" + a + "'");
  return open + items.join(", ") + close;
});

// Add London postcodes
const pcs = ${JSON.stringify(londonPcs)};
c = c.replace("function makePerson(", "const LONDON_PCS = " + JSON.stringify(pcs, null, 2) + ";\\n\\nfunction makePerson(");
c = c.replace("postcode: 'NW10 8SB'", "postcode: LONDON_PCS[Math.floor(Math.random() * LONDON_PCS.length)]");

// Replace the address section: after "find" click, wait briefly for results
// If no radio button appears within 5s, try "I cannot find my address" link
// If that fails too, try manual address fields
const oldAddr = \`await click(); // find
    try { await p.locator('button').filter({ hasText: /Yes|yes|Continue|continue/i }).first().click({ timeout: 2000 }).catch(()=>{}); } catch(e){} // out-of-catchment
    await r(0); await click(); // select\`;

const newAddr = \`await click(); // find
    // Handle out-of-catchment warning
    try { await p.locator('button').filter({ hasText: /Yes|yes|Continue|continue/i }).first().click({ timeout: 2000 }).catch(()=>{}); } catch(e){}
    // Try to select address; if none found within 5s, try "cannot find" then manual entry
    try {
      await p.locator('input[type=radio]').first().waitFor({ timeout: 5000 });
      await r(0); await click(); // select
    } catch(e) {
      // Address not found - try "I cannot find my address" link
      try {
        await p.locator('a, button').filter({ hasText: /I cannot find|cannot find my|enter manually|enter address manually/i }).first().click({ timeout: 3000 }).catch(()=>{});
        await p.locator('input[name*=addressLine1]').first().fill("123 High Street").catch(()=>{});
        await p.locator('input[name*=town]').first().fill("London").catch(()=>{});
      } catch(e2) {
        // Last resort: try address line fields directly
        await p.locator('input[name*=addressLine1]').first().fill("123 London Road").catch(()=>{});
        await p.locator('input[name*=town]').first().fill("London").catch(()=>{});
      }
    }\`;

c = c.replace(oldAddr, newAddr);

f.writeFileSync("${P}", c);
console.log("PATCH OK: " + c.length);
`;

const conn = new Client();
conn.on('ready', () => {
  // Restore from backup
  conn.exec('cp ' + P + '.bak ' + P, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.stderr.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('Restore:', out.trim() || 'ok');
      
      // SFTP upload
      conn.sftp((e2, sftp) => {
        if (e2) { console.log('SFTP err:', e2.message); conn.end(); return; }
        const ws = sftp.createWriteStream('/tmp/patch_final.cjs');
        ws.on('close', () => {
          sftp.end();
          conn.exec('node /tmp/patch_final.cjs', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.stderr.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('Patch result:', o3.trim());
              
              // Verify
              conn.exec("grep -c 'LONDON_PCS\\|Okonkwo\\|cannot find' " + P, (e4, s4) => {
                let o4 = '';
                s4.on('data', d => o4 += d.toString());
                s4.on('close', () => {
                  console.log('Features present:', o4.trim());
                  conn.end();
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
