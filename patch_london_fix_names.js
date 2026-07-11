const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const P = '/home/lola/.openclaw/workspace-lola/home/lola/.openclaw/workspace/gpreg_go.mjs';

const patchFix = `
const f = require("fs");
let c = f.readFileSync("${P}", "utf8");

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

f.writeFileSync("${P}", c);
console.log("PATCH FIX OK: " + c.length);
`;

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) { console.log('SFTP err:', err.message); conn.end(); return; }
    const ws = sftp.createWriteStream('/tmp/patch_fix.cjs');
    ws.on('close', () => {
      console.log('Written');
      sftp.end();
      conn.exec('node /tmp/patch_fix.cjs', (e2, s2) => {
        let o2 = '';
        s2.on('data', d => o2 += d.toString());
        s2.stderr.on('data', d => o2 += d.toString());
        s2.on('close', () => {
          console.log('Result:', o2.trim());
          conn.exec("grep 'Okonkwo\\|Chinonso' " + P, (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.stderr.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('Ethnic names added:', o3.includes('Okonkwo') && o3.includes('Chinonso'));
              console.log(o3);
              conn.end();
            });
          });
        });
      });
    });
    ws.end(Buffer.from(patchFix, 'utf8'));
  });
});
conn.on('error', e => { console.log('ERR:', e.message); conn.end(); });
conn.connect({ host: '212.227.93.74', port: 22, username: 'root', privateKey: key, readyTimeout: 15000 });
