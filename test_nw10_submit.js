const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const P = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs';

// Force NW10 only for this test to confirm base script works
const patchNW10 = `
const f = require("fs");
let c = f.readFileSync("${P}", "utf8");
// Restore the hardcoded NW10 postcode
c = c.replace("postcode: LONDON_PCS[Math.floor(Math.random() * LONDON_PCS.length)]", "postcode: 'NW10 8SB'");
f.writeFileSync("${P}", c);
console.log("Reverted to NW10");
`;

const conn = new Client();
conn.on('ready', () => {
  // First restore to clean .bak
  conn.exec('cp ' + P + '.bak ' + P, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.stderr.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('Restore:', out.trim() || 'ok');
      
      // Upload minimal patch (just ethnic names + NW10)
      conn.sftp((e2, sftp) => {
        if (e2) { console.log('SFTP err:', e2.message); conn.end(); return; }
        const patchMin = `
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
f.writeFileSync("${P}", c);
console.log("MIN PATCH OK: " + c.length);
`;
        const ws = sftp.createWriteStream('/tmp/patch_min.cjs');
        ws.on('close', () => {
          sftp.end();
          conn.exec('node /tmp/patch_min.cjs', (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.stderr.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('Min patch:', o3.trim());
              
              // Verify NW10
              conn.exec("grep \"postcode:\" " + P + " | head -1", (e4, s4) => {
                let o4 = '';
                s4.on('data', d => o4 += d.toString());
                s4.on('close', () => {
                  console.log('Postcode line:', o4);
                  
                  // NOW RUN with NW10 (the known-working config)
                  console.log('--- RUNNING NW10 TEST ---');
                  conn.exec("cd /home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace && PROXY_URL=\"http://geo.spyderproxy.com:12321\" PROXY_AUTH=\"DAz7xCYHAy:YOuOgB3lMb_country-gb_state-england\" timeout 240 node gpreg_go.mjs 2>&1", (e5, s5) => {
                    let o5 = '';
                    s5.on('data', d => o5 += d.toString());
                    s5.stderr.on('data', d => o5 += d.toString());
                    s5.on('close', () => {
                      console.log('NW10 TEST RESULT:');
                      console.log(o5);
                      conn.end();
                    });
                  });
                });
              });
            });
          });
        });
        ws.end(Buffer.from(patchMin, 'utf8'));
      });
    });
  });
});
conn.on('error', e => { console.log('ERR:', e.message); conn.end(); });
conn.connect({ host: '212.227.93.74', port: 22, username: 'root', privateKey: key, readyTimeout: 15000 });
