const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const cmds = `
set -x

# 1. Check what's actually listening on port 80/443
ss -tlnp | grep -E ':(80|443)\\s'

# 2. Check if docker is proxying port 80/443
docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null | grep -E ':80|:443'

# 3. Check iptables
iptables -t nat -L DOCKER 2>/dev/null | head -20

# 4. Test nginx serves the site locally
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://127.0.0.1 -H "Host: bear.thenewworldorder.io"

echo ""
echo "---"

# 5. Check what docker containers are running
docker ps --format '{{.Names}} {{.Image}} {{.Ports}}' 2>/dev/null

# 6. Check nginx port bindings at host level
cat /proc/net/tcp | awk '{print $2}' | grep -E ':0050|:01BB'
  `.trim();

  conn.exec(cmds, (err, stream) => {
    if (err) { console.log('ERR:', err.message); conn.end(); return; }
    let o = '';
    stream.on('data', d => o += d.toString());
    stream.stderr.on('data', d => o += d.toString());
    stream.on('close', () => { console.log(o); conn.end(); });
  });
});
conn.on('error', e => { console.log('CONN ERR:', e.message); process.exit(1); });
conn.connect({ host: '212.227.93.74', username: 'root', privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu') });
