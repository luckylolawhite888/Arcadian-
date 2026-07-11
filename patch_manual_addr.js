const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const P = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs';
const londonPcs = fs.readFileSync('/tmp/london_all_postcodes.txt', 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('Total'));

console.log(`London postcodes: ${londonPcs.length}`);

const patchContent = `
const f = require("fs");
let c = f.readFileSync("${P}", "utf8");

// 1. Remove Dr
c = c.replace(/'Dr'/g, "").replace(/, ,/g, ",").replace(/,]/g, "]").replace(/, \\]/g, "]");

// 2. Ethnic surnames
c = c.replace(/(surnames: \\[)([^\\]]+)(\\])/, (m, o, x, cl) => {
  let items = x.replace(/\\n/g," ").split(",").map(s=>s.trim()).filter(Boolean);
  ["Okonkwo","Okafor","Eze","Nwachukwu","Adepoju","Ogunlade","Obiora","Chibueze","Hussain","Rahman","Khan","Patel","Sharma","Desai","Kapoor","Al-Rashid","Abdullah","Al-Farsi"].forEach(a => {
    let cl = a.replace(/[\\'"]/g,"");
    if(!items.some(x=>x.replace(/[\\'"]/g,"").trim()===cl)) items.push("'" + a + "'");
  });
  return o + items.join(", ") + cl;
});

// 3. Ethnic given
c = c.replace(/(given: \\[)([^\\]]+)(\\])/, (m, o, x, cl) => {
  let items = x.replace(/\\n/g," ").split(",").map(s=>s.trim()).filter(Boolean);
  ["Chinonso","Chiamaka","Oluwaseun","Folake","Ngozi","Kwame","Zainab","Fatima","Abdul","Aisha","Priya","Rahul","Ananya","Vikram","Layla","Amir","Hassan"].forEach(a => {
    let cl = a.replace(/[\\'"]/g,"");
    if(!items.some(x=>x.replace(/[\\'"]/g,"").trim()===cl)) items.push("'" + a + "'");
  });
  return o + items.join(", ") + cl;
});

// 4. Add London postcodes
const pcs = ${JSON.stringify(londonPcs)};
c = c.replace("function makePerson(", "const LONDON_PCS = " + JSON.stringify(pcs, null, 2) + ";\\n\\nfunction makePerson(");
c = c.replace("postcode: 'NW10 8SB'", "postcode: LONDON_PCS[Math.floor(Math.random() * LONDON_PCS.length)]");

// 5. Replace the address section: after find, handle "no addresses found" -> manual entry
function findAddrBlock(text, marker, endMarker) {
  // Find the first address section (current address, not previous)
  let firstFind = text.indexOf("currentPostcode");
  if (firstFind < 0) return null;
  let afterPostcode = text.indexOf("await click(); // find", firstFind);
  if (afterPostcode < 0) return null;
  let nextPhone = text.indexOf("input[name*=phone]", afterPostcode);
  if (nextPhone < 0) return null;
  // Get block from find click to phone input
  // Find the first phone input after this address section (there's also one in emergency contact)
  let phoneIndex = text.indexOf("await p.locator('input[name*=phone]').first().fill(P.phone);", afterPostcode);
  if (phoneIndex < 0) return null;
  return { start: afterPostcode, end: phoneIndex };
}

let block = findAddrBlock(c);
// If we can't find it precisely, use the string approach
if (!block) {
  const findSection = "await click(); // find\\n    await r(0); await click(); // select";
  const idx = c.indexOf(findSection);
  if (idx >= 0) {
    const replacement = "await click(); // find\\n" +
      "    try {\\n" +
      "      await p.locator('input[type=radio]').first().waitFor({ timeout: 3000 });\\n" +
      "      await r(0); await click(); // select\\n" +
      "    } catch(e) {\\n" +
      "      // No addresses found - enter manually\\n" +
      "      await p.locator('a').filter({ hasText: /enter address manually/i }).first().click({ timeout: 3000 }).catch(()=>{});\\n" +
      "      await sleep(400);\\n" +
      "      await p.locator('[name*=addressLine1]').first().fill('123 High Street');\\n" +
      "      await p.locator('[name*=addressLine2]').first().fill('London').catch(()=>{});\\n" +
      "      await p.locator('[name*=townOrCity], [name*=town], [name*=city]').first().fill('London');\\n" +
      "      await p.locator('[name*=country]').first().selectOption('England').catch(()=>{\\n" +
      "        try { await p.locator('[name*=country] option').first().selectOption({ index: 1 }).catch(()=>{}); } catch(e2){}\\n" +
      "      });\\n" +
      "    }";
    c = c.replace(findSection, replacement);
  }
} else {
  // Use block-based replacement
  const findBlock = c.substring(block.start, block.end);
  const replacement = "await click(); // find\\n" +
    "    try {\\n" +
    "      await p.locator('input[type=radio]').first().waitFor({ timeout: 3000 });\\n" +
    "      await r(0); await click(); // select\\n" +
    "    } catch(e) {\\n" +
    "      await p.locator('a').filter({ hasText: /enter address manually/i }).first().click({ timeout: 3000 }).catch(()=>{});\\n" +
    "      await sleep(400);\\n" +
    "      await p.locator('[name*=addressLine1]').first().fill('123 High Street');\\n" +
    "      await p.locator('[name*=addressLine2]').first().fill('London').catch(()=>{});\\n" +
    "      await p.locator('[name*=townOrCity], [name*=town], [name*=city]').first().fill('London');\\n" +
    "      await p.locator('[name*=country]').first().selectOption('England').catch(()=>{\\n" +
    "        try { await p.locator('[name*=country] option').first().selectOption({ index: 1 }).catch(()=>{}); } catch(e2){}\\n" +
    "      });\\n" +
    "    }\\n" +
    "    await p.locator('input[name*=phone]').first().fill(P.phone);";
  c = c.replace(findBlock, replacement);
}

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
        const ws = sftp.createWriteStream('/tmp/patch_final_v3.cjs');
        ws.on('close', () => {
          sftp.end();
          conn.exec('node /tmp/patch_final_v3.cjs', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.stderr.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('Patch:', o3.trim());
              conn.exec("grep -n 'enter address manually\\|addressLine1\\|townOrCity\\|Okonkwo\\|LONDON_PCS\\|High Street' " + P + " | head -10", (e4, s4) => {
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
