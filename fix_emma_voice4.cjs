const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
const pwd = '3v3fUeTROhIl4n';

function run(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', d => out += d.toString());
      stream.stderr.on('data', d => out += d.toString());
      stream.on('close', () => resolve(out));
    });
  });
}

conn.on('ready', async () => {
  const key = 'sk_193ac6e1a42965dd4d329721c764ea7d84c06aec0ffc69c0';
  
  // Step 1: Copy server.js from Emma VPS to IONOS
  let r = await run("sshpass -p " + pwd + " scp -o StrictHostKeyChecking=no root@212.227.38.78:/var/www/api/server.js /tmp/emma_srv_current.js 2>&1");
  console.log('SCP from Emma:', r);
  
  // Step 2: Read via SFTP, edit, write
  conn.sftp((err, sftp) => {
    if (err) { console.log('SFTP err:', err.message); return conn.end(); }
    
    sftp.readFile('/tmp/emma_srv_current.js', 'utf8', (err, data) => {
      if (err) { console.log('Read err:', err.message); return conn.end(); }
      
      // Simple string replacement
      const oldStr = "ELEVEN_API_KEY=process.env.ELEVEN_API_KEY||''";
      const newStr = "ELEVEN_API_KEY='" + key + "';"
      
      if (data.includes(oldStr)) {
        data = data.replace(oldStr, newStr);
        console.log('Replaced successfully');
      } else {
        console.log('Pattern not found! Checking actual content...');
        // Find what the pattern actually is
        const idx = data.indexOf('ELEVEN_API_KEY');
        if (idx >= 0) {
          console.log('Found at', idx, ':', data.substring(idx, idx + 60));
        }
        conn.end();
        return;
      }
      
      // Write back to IONOS
      sftp.writeFile('/tmp/emma_srv_current.js', data, 'utf8', (err) => {
        if (err) { console.log('Write err:', err.message); return conn.end(); }
        
        // SCP back to Emma VPS
        run("sshpass -p " + pwd + " scp -o StrictHostKeyChecking=no /tmp/emma_srv_current.js root@212.227.38.78:/var/www/api/server.js 2>&1").then(r => {
          console.log('SCP back:', r);
          
          // Verify  
          return run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 grep -oF 'ELEVEN_API_KEY=' /var/www/api/server.js 2>&1");
        }).then(r => {
          console.log('Verify Key:', r);
          
          return run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 pm2 restart emma-api 2>&1");
        }).then(r => {
          console.log('Restart:', r.substring(0, 100));
          
          // Wait for restart
          setTimeout(async () => {
            const t = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 curl -s localhost:3100/api/voice/voices 2>&1");
            console.log('Voices:', t.substring(0, 300));
            conn.end();
          }, 4000);
        });
      });
    });
  });
}).on('error', e => console.log('error:', e.message))
.connect({
  host: '212.227.93.74',
  username: 'root',
  privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu')
});
