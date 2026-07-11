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
  // Write .env with the key
  const envContent = `ELEVEN_API_KEY=sk_193ac6e1a42965dd4d329721c764ea7d84c06aec0ffc69c0
`;
  const b64 = Buffer.from(envContent).toString('base64');
  
  // Write to IONOS, SCP to Emma VPS, restart
  let r = await run('echo ' + b64 + ' | base64 -d > /tmp/emma_env && sshpass -p ' + pwd + ' scp -o StrictHostKeyChecking=no /tmp/emma_env root@212.227.38.78:/var/www/api/.env 2>&1');
  console.log('Copy .env:', r);
  
  // Now the key might be picked up via dotenv (require dotenv).config())
  // But the file is a single-line concatenation, dotenv wont parse it.
  // Lets also inject the key directly using sed
  // Pattern: ELEVEN_API_KEY=***EN||''
  // We need to replace the '' after || with the actual key between quotes
  
  r = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 sed -i 's/process.env.ELEVEN_API_KEY||\\\\x27\\\\x27/\\\"sk_193ac6e1a42965dd4d329721c764ea7d84c06aec0ffc69c0\\\"/g' /var/www/api/server.js 2>&1");
  console.log('sed:', r);
  
  r = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 grep ELEVEN_API_KEY /var/www/api/server.js 2>&1");
  console.log('After sed:', r.substring(0, 120));
  
  r = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 'pm2 restart emma-api 2>&1; sleep 3; curl -s localhost:3100/api/voice/voices | head -3' 2>&1");
  console.log('Voices:', r.substring(0, 300));
  
  conn.end();
}).on('error', e => console.log('error:', e.message))
.connect({
  host: '212.227.93.74',
  username: 'root',
  privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu')
});
