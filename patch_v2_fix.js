const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const P = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs';
const londonPcs = fs.readFileSync('/tmp/london_all_postcodes.txt', 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('Total'));

const patchContent = `
const f = require("fs");
let c = f.readFileSync("${P}", "utf8");

// Remove Dr
c = c.replace(/'Dr'/g, "").replace(/, ,/g, ",");

// Ethnic surnames
c = c.replace(/(surnames: \\[)([^\\]]+)(\\])/, (m, o, x, cl) => {
  let items = x.replace(/\\n/g," ").split(",").map(s=>s.trim()).filter(Boolean);
  ["Okonkwo","Okafor","Eze","Nwachukwu","Adepoju","Ogunlade","Obiora","Chibueze","Hussain","Rahman","Khan","Patel","Sharma","Desai","Kapoor","Al-Rashid","Abdullah","Al-Farsi"].forEach(a => { if(!items.some(x=>x.replace(/[\\'"]/g,"")===a)) items.push("'" + a + "'"); });
  return o + items.join(", ") + cl;
});

// Ethnic given
c = c.replace(/(given: \\[)([^\\]]+)(\\])/, (m, o, x, cl) => {
  let items = x.replace(/\\n/g," ").split(",").map(s=>s.trim()).filter(Boolean);
  ["Chinonso","Chiamaka","Oluwaseun","Folake","Ngozi","Kwame","Zainab","Fatima","Abdul","Aisha","Priya","Rahul","Ananya","Vikram","Layla","Amir","Hassan"].forEach(a => { if(!items.some(x=>x.replace(/[\\'"]/g,"")===a)) items.push("'" + a + "'"); });
  return o + items.join(", ") + cl;
});

// London postcodes
const pcs = ${JSON.stringify(londonPcs)};
c = c.replace("function makePerson(", "const LONDON_PCS = " + JSON.stringify(pcs, null, 2) + ";\\n\\nfunction makePerson(");
c = c.replace("postcode: 'NW10 8SB'", "postcode: LONDON_PCS[Math.floor(Math.random() * LONDON_PCS.length)]");

// CRITICAL: Replace the address selection with a version that handles no-results
// Line 1368-1369 in current file: find click + r(0) click
// Need to replace the out-of-catchment + select lines with the fallback version
const oldSection = c.substring(
  c.indexOf("await click(); // find"),
  c.indexOf("await p.locator('input[name*=phone]')")
);

const newSection = \`await click(); // find
    try { await p.locator('button').filter({ hasText: /Yes|yes|Continue|continue/i }).first().click({ timeout: 2000 }).catch(()=>{}); } catch(e){} // out-of-catchment
    try {
      await p.locator('input[type=radio]').first().waitFor({ timeout: 5000 });
      await r(0); await click(); // select
    } catch(e) {
      try {
        await p.locator('a, button').filter({ hasText: /cannot find|cannot find my|enter manually/i }).first().click({ timeout: 3000 }).catch(()=>{});
        await p.locator('input[name*=addressLine1]').first().fill("123 High Street").catch(()=>{});
        await p.locator('input[name*=town]').first().fill("London").catch(()=>{});
      } catch(e2) {
        await p.locator('input[name*=addressLine1]').first().fill("123 London Road").catch(()=>{});
        await p.locator('input[name*=town]').first().fill("London").catch(()=>{});
      }
    }
    \`;

c = c.replace(oldSection, newSection);

f.writeFileSync("${P}", c);
console.log("PATCH OK: " + c.length);
`;

const conn = new Client();
conn.on('ready', () => {
  conn.exec('cp ' + P + '.bak ' + P, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.stderr.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('Restore:', out.trim() || 'ok');
      conn.sftp((e2, sftp) => {
        if (e2) { console.log('SFTP err:', e2.message); conn.end(); return; }
        const ws = sftp.createWriteStream('/tmp/patch_v2.cjs');
        ws.on('close', () => {
          sftp.end();
          conn.exec('node /tmp/patch_v2.cjs', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.stderr.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('Patch:', o3.trim());
              conn.exec("grep -n 'cannot find\\|waitFor.*5000\\|addressLine1\\|LONDON_PCS' " + P + " | head -8", (e4, s4) => {
                let o4 = '';
                s4.on('data', d => o4 += d.toString());
                s4.on('close', () => {
                  console.log('Verify:', o4);
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
