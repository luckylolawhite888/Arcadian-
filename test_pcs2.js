const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');
const conn = new Client();

conn.on('ready', () => {
  // Test a few postcodes to see if they return results via NHS form
  // We test 5: NW10 (known good), then NW/SW outer, then central
  conn.exec(`
curl -s -o /dev/null -w "%{http_code}" --proxy http://DAz7xCYHAy:YOuOgB3lMb_country-gb_state-england@geo.spyderproxy.com:12321 \\
  "https://api.postcodes.io/postcodes/NW10%208SB" 2>/dev/null
`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', () => {
      console.log('postcodes.io test:', out.trim());
      
      // Let me check what the GPREG runner does after the address lookup fails
      // by reading the full address lookup section
      conn.exec(`sed -n '1365,1400p' "${P.replace(/'/g, "'\\''")}"`, (e2, s2) => {
        let o2 = '';
        s2.on('data', d => o2 += d.toString());
        s2.on('close', () => {
          console.log('Address section:');
          console.log(o2);
          
          // Check what the NHS address search returns via the proxy
          conn.exec(`
curl -s --proxy http://DAz7xCYHAy:YOuOgB3lMb_country-gb_state-england@geo.spyderproxy.com:12321 \\
  "https://api.postcodes.io/postcodes/RM7%200XN" 2>/dev/null | head -5
`, (e3, s3) => {
            let o3 = '';
            s3.on('data', d => o3 += d.toString());
            s3.on('close', () => {
              console.log('RM7 test:', o3);
              conn.end();
            });
          });
        });
      });
    });
  });
});
conn.on('error', e => { console.log('ERR:', e.message); conn.end(); });
conn.connect({ host: '212.227.93.74', port: 22, username: 'root', privateKey: key, readyTimeout: 20000 });
