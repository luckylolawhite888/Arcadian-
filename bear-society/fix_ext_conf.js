const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
# Fix: rename the symlinked file to have .conf extension
# Actually need to fix the source file name too, or just rename symlink target
cd /etc/nginx/sites-available
cp 00-bear.thenewworldorder.io 00-bear.thenewworldorder.io.conf

cd /etc/nginx/sites-enabled
ln -sf /etc/nginx/sites-available/00-bear.thenewworldorder.io.conf 00-bear.thenewworldorder.io.conf

echo "=== Now check ==="
ls -la /etc/nginx/sites-enabled/00-bear*

echo ""
echo "=== Test nginx config ==="
nginx -t 2>&1
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
