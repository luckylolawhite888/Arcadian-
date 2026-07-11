const fs = require('fs');
const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  conn.exec('bash -s', (err, stream) => {
    if (err) { console.error('exec err:', err.message); conn.end(); return; }
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.stderr.on('data', d => out += d.toString());
    stream.on('close', () => { console.log(out); conn.end(); });
    
    stream.stdin.write(`ssh -o StrictHostKeyChecking=no -i /root/.ssh/scarlett_key root@212.227.39.41 bash -s << 'ENDSSH'
# Read the lead_engine.js insert section
grep -n "sbQuery\|insert\|company_name\|dedup\|unique\|duplicate\|company_number" /var/www/api/lead_engine.js | head -30
echo "=== SEPARATOR ==="
# Also check server.v2.js for the /leads/find handler
grep -n "leads/find\|leads.find\|company_name\|dedup\|duplicate" /var/www/api/server.v2.js | head -30
ENDSSH`);
    stream.stdin.end();
  });
}).connect({
  host: '212.227.93.74',
  port: 22,
  username: 'root',
  privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu', 'utf8')
});
