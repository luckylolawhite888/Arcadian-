const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  // Force nginx full reload
  conn.exec(`systemctl daemon-reload && systemctl restart nginx && echo "NGINX_RESTARTED_OK" 2>&1`, (err, stream) => {
    if (err) { console.log('ERR:', err.message); conn.end(); return; }
    let o = '';
    stream.on('data', d => o += d.toString());
    stream.stderr.on('data', d => o += d.toString());
    stream.on('close', () => { 
      console.log(o);
      // Now test
      conn.exec(`echo | timeout 3 openssl s_client -connect 127.0.0.1:443 -servername bear.thenewworldorder.io 2>&1 | grep "CN ="`, (err2, stream2) => {
        let o2 = '';
        stream2.on('data', d => o2 += d.toString());
        stream2.stderr.on('data', d => o2 += d.toString());
        stream2.on('close', () => { 
          console.log('SSL AFTER RESTART:', o2);
          conn.exec(`curl -skI --connect-timeout 5 https://bear.thenewworldorder.io 2>&1 | head -5`, (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.stderr.on('data', d => o3 += d.toString());
            s3.on('close', () => { console.log('CURL:', o3); conn.end(); });
          });
        });
      });
    });
  });
});
conn.on('error', e => { console.log('CONN ERR:', e.message); process.exit(1); });
conn.connect({ host: '212.227.93.74', username: 'root', privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu') });
