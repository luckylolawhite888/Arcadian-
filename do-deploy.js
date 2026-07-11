#!/usr/bin/env node
const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/ionos_key');
const genScript = fs.readFileSync('/home/node/.openclaw/workspace/gen_pages.py', 'utf8');

const conn = new Client();
conn.on('ready', () => {
  // Write the script to a temp file on the server
  const writeScript = `cat > /tmp/gen_pages.py << 'GENEOF'
${genScript}
GENEOF
echo "SCRIPT_WRITTEN"`;

  conn.exec(writeScript, (err, stream) => {
    if (err) { console.log('WRITE ERROR:', err.message); conn.end(); return; }
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', (code) => {
      console.log('Write exit:', code, out.trim());
      
      // Now run it
      conn.exec('cd / && python3 /tmp/gen_pages.py 2>&1', (e2, s2) => {
        let out2 = '';
        s2.on('data', d => out2 += d.toString());
        s2.on('close', (code2) => {
          console.log('Run exit:', code2);
          console.log(out2);
          conn.end();
        });
      });
    });
  });
});
conn.on('error', (err) => console.log('CONN ERROR:', err.message));
conn.connect({
  host: '212.227.93.74',
  port: 22,
  username: 'root',
  privateKey: key,
  readyTimeout: 10000,
});
