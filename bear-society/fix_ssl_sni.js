const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  // The issue: 00-gpm-proposal.conf loads before 00-bear and becomes the 
  // implicit default_server on port 443 for unmatched SNI names.
  // But bear SHOULD match via SNI... Let me check what nginx actually sees
  
  conn.exec(`
echo "=== nginx -T dump for 443 ==="
nginx -T 2>&1 | grep -A5 "server_name bear" | head -10

echo ""
echo "=== Test with explicit SNI ==="
curl -sk --resolve bear.thenewworldorder.io:443:127.0.0.1 https://bear.thenewworldorder.io 2>&1 | head -5

echo ""
echo "=== Test with direct IP && Host header ==="
curl -sk -H "Host: bear.thenewworldorder.io" https://212.227.93.74 2>&1 | head -5
  `.trim(), (err, stream) => {
    if (err) { console.log('ERR:', err.message); conn.end(); return; }
    let o = '';
    stream.on('data', d => o += d.toString());
    stream.stderr.on('data', d => o += d.toString());
    stream.on('close', () => { console.log(o); conn.end(); });
  });
});
conn.on('error', e => { console.log('CONN ERR:', e.message); process.exit(1); });
conn.connect({ host: '212.227.93.74', username: 'root', privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu') });
