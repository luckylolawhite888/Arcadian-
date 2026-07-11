const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
const pwd = '3v3fUeTROhIl4n';
const key = 'sk_19369c09cbb1cb7ea2673677300e8d8f11f2b15e9ac609f1a952984e43e6e9c06b6cfa8d00e6';

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
  // Use Python on Emma VPS (which handles strings sanely) to do the sed
  let r = await run('sshpass -p ' + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 'python3 -c \"'\"'import re,sys;d=open(\\\"/var/www/api/server.js\\\",\\\"r\\\").read();d=re.sub(r\\\"ELEVEN_API_KEY=.*?\\\\x27\\\\x27\\\",\\\"ELEVEN_API_KEY=\\\\\\\"SK_KEY\\\\\\\\\\\\\"\\\",d);open(\\\"/var/www/api/server.js\\\",\\\"w\\\").write(d);print(\\\"done\\\")\"'\"'\" 2>&1");
  console.log('Python sed:', r);
  
  r = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 'grep -o ELEVEN_API_KEY /var/www/api/server.js 2>&1'");
  console.log("Verify:", r);
  
  r = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 'pm2 restart emma-api 2>&1'");
  console.log("Restart:", r.substring(0, 200));
  
  setTimeout(async () => {
    const t = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 'curl -s localhost:3100/api/voice/voices | head -5' 2>&1");
    console.log("Voices:", t.substring(0, 200));
    conn.end();
  }, 3000);
}).on('error', e => console.log('error:', e.message))
.connect({
  host: '212.227.93.74',
  username: 'root',
  privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu')
});
