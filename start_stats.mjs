import { Client } from 'ssh2';
import fs from 'fs';

const c = new Client();
c.on('ready', () => {
  c.exec('pkill -f adfarm_stats.py 2>/dev/null; nohup python3 /opt/adfarm_stats.py > /tmp/adfarm_stats.log 2>&1 & sleep 2; cat /tmp/adfarm_stats.log; echo "---"; curl -s http://127.0.0.1:5001/ | head -c 500; echo', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => { console.log(out); c.end(); });
  });
}).on('error', e => console.log('ERR:', e.message));
c.connect({ host: '212.227.93.74', username: 'root', privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu') });
