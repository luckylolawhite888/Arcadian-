const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const P = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs';

const patchContent = `
const f = require("fs");
let c = f.readFileSync("${P}", "utf8");

// Remove Dr
c = c.replace(/'Dr'/g, "").replace(/, ,/g, ",");

// Ethnic surnames
c = c.replace(/(surnames: \\[)([^\\]]+)(\\])/, (m, o, x, cl) => {
  let items = x.replace(/\\n/g," ").split(",").map(s=>s.trim()).filter(Boolean);
  ["Okonkwo","Okafor","Eze","Nwachukwu","Adepoju","Ogunlade","Obiora","Chibueze","Hussain","Rahman","Khan","Patel","Sharma","Desai","Kapoor","Al-Rashid","Abdullah","Al-Farsi"].forEach(a => {
    let cleanA = a.replace(/[\\'"]/g, "");
    if (!items.some(x => x.replace(/[\\'"]/g, "").trim() === cleanA)) items.push("'" + a + "'");
  });
  return o + items.join(", ") + cl;
});

// Ethnic given
c = c.replace(/(given: \\[)([^\\]]+)(\\])/, (m, o, x, cl) => {
  let items = x.replace(/\\n/g," ").split(",").map(s=>s.trim()).filter(Boolean);
  ["Chinonso","Chiamaka","Oluwaseun","Folake","Ngozi","Kwame","Zainab","Fatima","Abdul","Aisha","Priya","Rahul","Ananya","Vikram","Layla","Amir","Hassan"].forEach(a => {
    let cleanA = a.replace(/[\\'"]/g, "");
    if (!items.some(x => x.replace(/[\\'"]/g, "").trim() === cleanA)) items.push("'" + a + "'");
  });
  return o + items.join(", ") + cl;
});

// Keep NW10 for now - will test London postcodes after verifying base works

// Add address fallback: after "find" + "select", if select fails because no results
// Check if "I cannot find my address" link exists
const oldAddr = c.substring(
  c.indexOf("await click(); // find"),
  c.indexOf("await p.locator('input[name*=phone]')")
);

const newAddr = oldAddr + \`
    try {
      const addressFound = await p.locator('input[type=radio]').count();
      if (addressFound === 0) {
        // Try clicking "I cannot find my address"
        await p.locator('a:has-text(\"cannot find\"), a:has-text(\"enter manually\"), a:has-text(\"I can\\'t find\")').first().click({ timeout: 3000 }).catch(()=>{});
        // Try filling manual address fields
        await p.locator('input[name*=addressLine1], input[name*=street], input[name*=building]').first().fill("123 High Street").catch(()=>{});
        await p.locator('input[name*=addressLine2]').first().fill("Willesden").catch(()=>{});
        await p.locator('input[name*=town], input[name*=city]').first().fill("London").catch(()=>{});
        await p.locator('input[name*=postalCode], input[name*=postcode]').first().fill(person.postcode).catch(()=>{});
      }
    } catch(e) {}\`;

c = c.replace(oldAddr, newAddr);

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
        const ws = sftp.createWriteStream('/tmp/patch_addr_fallback.cjs');
        ws.on('close', () => {
          sftp.end();
          conn.exec('node /tmp/patch_addr_fallback.cjs', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.stderr.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('Patch:', o3.trim());
              
              // Check the patch looks right
              conn.exec("grep -n 'cannot find\\|addressLine\\|town\\|postalCode\\|Okonkwo\\|Chinonso' " + P + " | head -8", (e4, s4) => {
                let o4 = '';
                s4.on('data', d => o4 += d.toString());
                s4.on('close', () => {
                  console.log('Verify:', o4);
                  
                  // Now test with NW10 first (known good)
                  conn.exec("cd /home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace && PROXY_URL=\"http://geo.spyderproxy.com:12321\" PROXY_AUTH=\"DAz7xCYHAy:YOuOgB3lMb_country-gb_state-england\" timeout 240 node gpreg_go.mjs 2>&1", (e5, s5) => {
                    let o5 = '';
                    s5.on('data', d => o5 += d.toString());
                    s5.stderr.on('data', d => o5 += d.toString());
                    s5.on('close', () => {
                      console.log('TEST RUN:');
                      console.log(o5);
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
