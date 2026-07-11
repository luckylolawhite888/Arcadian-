const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
systemctl restart nginx && echo "RESTARTED"

echo "=== Now test bear.thenewworldorder.io ==="
curl -sk https://bear.thenewworldorder.io 2>&1 | head -10

echo ""
echo "=== grep for bear in nginx -T ==="
nginx -T 2>&1 | grep "server_name bear"
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
