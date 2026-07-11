import { Client } from 'ssh2';
import fs from 'fs';

const c = new Client();
c.on('ready', () => {
  c.exec('cat /var/www/html/launchpad/index.html', (err, stream) => {
    let data = '';
    stream.on('data', d => data += d);
    stream.on('close', () => {
      // Fix the broken Dashboard card (has a dangling anchor tag before The Hive)
      let fixed = data.replace(
        `<a class="card" href="https://thenewworldorder.io/dashboard/">
        <a class=card href=https://thenewworldorder.io/hive/>
            <div class=icon>🐝</div>
            <div class=name>The Hive</div>
            <div class=desc>Group chat 🦊🐝💖</div>
            <div class=badge badge-new>NEW</div>
        </a>
            <div class="icon">⚡</div>
            <div class="name">Dashboard</div>
            <div class="desc">TNWO control panel</div>
            <div class="badge badge-live">LIVE</div>
        </a>`,
        `<a class="card" href="https://thenewworldorder.io/hive/">
            <div class="icon">🐝</div>
            <div class="name">The Hive</div>
            <div class="desc">Group chat 🦊🐝💖</div>
            <div class="badge badge-new">NEW</div>
        </a>

        <a class="card" href="https://thenewworldorder.io/dashboard/">
            <div class="icon">⚡</div>
            <div class="name">Dashboard</div>
            <div class="desc">TNWO control panel</div>
            <div class="badge badge-live">LIVE</div>
        </a>`
      );

      // Add the Ad Farm Analytics card before the todo.html card
      fixed = fixed.replace(
        `<a class="card" href="https://thenewworldorder.io/todo.html?token=f8570ed8ae686fffbdd00bf4f3ca1063">`,
        `<a class="card" href="https://thenewworldorder.io/adfarm-analytics.html">
            <div class="icon">📊</div>
            <div class="name">Ad Farm</div>
            <div class="desc">Live analytics & views</div>
            <div class="badge badge-live">LIVE</div>
        </a>

        <a class="card" href="https://thenewworldorder.io/todo.html?token=f8570ed8ae686fffbdd00bf4f3ca1063">`
      );

      const b64 = Buffer.from(fixed, 'utf8').toString('base64');
      c.exec(`echo "${b64}" | base64 -d > /var/www/html/launchpad/index.html && echo "DONE"`, (e2, s2) => {
        let out = '';
        s2.on('data', d => out += d);
        s2.on('close', () => { console.log(out); c.end(); });
      });
    });
  });
}).on('error', e => console.log('ERR:', e.message));
c.connect({ host: '212.227.93.74', username: 'root', privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu') });
