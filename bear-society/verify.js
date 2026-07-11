const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`curl -s https://bear.thenewworldorder.io 2>&1 | head -20`, (err, stream) => {
    if (err) { console.log('ERR:', err.message); conn.end(); return; }
    let o = '';
    stream.on('data', d => o += d.toString());
    stream.stderr.on('data', d => o += d.toString());
    stream.on('close', () => { console.log(o); conn.end(); });
  });
});
conn.on('error', e => { console.log('CONN ERR:', e.message); process.exit(1); });
conn.connect({ host: '212.227.93.74', username: 'root', privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu') });
