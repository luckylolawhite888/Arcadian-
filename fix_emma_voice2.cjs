const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
const pwd = '3v3fUeTROhIl4n';
const key = 'sk_193ac6e1a42965dd4d329721c764ea7d84c06aec0ffc69c0';

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
  // SCP the remote server.js to IONOS
  let r = await run("sshpass -p " + pwd + " scp -o StrictHostKeyChecking=no root@212.227.38.78:/var/www/api/server.js /tmp/emma_srv.js 2>&1");
  console.log('SCP from remote:', r);
  
  // Read the file via SFTP, edit, write back
  conn.sftp((err, sftp) => {
    if (err) { console.log('SFTP err:', err.message); return conn.end(); }
    
    sftp.readFile('/tmp/emma_srv.js', 'utf8', (err, data) => {
      if (err) { console.log('Read err:', err.message); return conn.end(); }
      
      // The pattern: ELEVEN_API_KEY=process.env.ELEVEN_API_KEY||''
      data = data.replace(
        /ELEVEN_API_KEY=proces…EY\|\|''/,
        'ELEVEN_API_KEY=\\"' + key + '\\"'
      );
      console.log('Replaced key in file');
      
      sftp.writeFile('/tmp/emma_srv.js', data, 'utf8', (err) => {
        if (err) { console.log('Write err:', err.message); return conn.end(); }
        
        // SCP back to remote
        run("sshpass -p " + pwd + " scp -o StrictHostKeyChecking=no /tmp/emma_srv.js root@212.227.38.78:/var/www/api/server.js 2>&1").then(r => {
          console.log('SCP back:', r);
          
          return run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 'pm2 restart emma-api 2>&1; sleep 3; curl -s localhost:3100/api/voice/voices | head -5' 2>&1");
        }).then(r => {
          console.log('Voices:', r);
          conn.end();
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
