const { Client } = require('ssh2');
const fs = require('fs');
const key = fs.readFileSync('/home/node/.ssh/ionos_ubuntu');

const subdomain = 'remote.thenewworldorder.io';
const dir = '/var/www/' + subdomain;
const port = 3847;

const nginxConf = `
server {
    listen 80;
    listen [::]:80;
    server_name ${subdomain};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${subdomain};

    ssl_certificate /etc/nginx/ssl/${subdomain}.crt;
    ssl_certificate_key /etc/nginx/ssl/${subdomain}.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    location /ws/ {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
`;

const conn = new Client();
conn.on('ready', () => {
  const setup = 'mkdir -p ' + dir + ' && cd ' + dir + ' && npm init -y 2>/dev/null && npm install ws 2>&1 | tail -1';
  conn.exec(setup, (err, stream) => {
    let out = '';
    stream.on('data', d => { out += d; });
    stream.on('close', () => {
      console.log('Setup:', out.trim());
      conn.sftp((err, sftp) => {
        if (err) { console.error('SFTP error:', err); conn.end(); return; }
        let count = 0;
        const done = () => {
          count++;
          if (count < 3) return;
          // Write nginx config
          const configPath = '/etc/nginx/sites-enabled/' + subdomain + '.conf';
          sftp.write(Buffer.from(nginxConf, 'utf8'), 0, Buffer.byteLength(nginxConf), configPath, (err2) => {
            if (err2) { console.error('Write config:', err2); conn.end(); return; }
            // Copy SSL certs
            const sslCmds = 'cp /etc/nginx/ssl/watch.thenewworldorder.io.crt /etc/nginx/ssl/' + subdomain + '.crt && cp /etc/nginx/ssl/watch.thenewworldorder.io.key /etc/nginx/ssl/' + subdomain + '.key && nginx -t';
            conn.exec(sslCmds, (err3, stream3) => {
              let out3 = '';
              stream3.on('data', d => { out3 += d; });
              stream3.on('close', () => {
                console.log('Nginx test:', out3.trim());
                if (out3.includes('successful')) {
                  conn.exec('systemctl reload nginx', (err4, stream4) => {
                    let out4 = '';
                    stream4.on('data', d => { out4 += d; });
                    stream4.on('close', () => {
                      console.log('Reload:', out4.trim() || 'OK');
                      // Start server
                      const startCmd = 'cd ' + dir + ' && nohup node server.js > server.log 2>&1 & echo "PID: $!"';
                      conn.exec(startCmd, (err5, stream5) => {
                        let out5 = '';
                        stream5.on('data', d => { out5 += d; });
                        stream5.on('close', () => {
                          console.log('Started:', out5.trim());
                          console.log('Deploy complete!');
                          conn.end();
                        });
                      });
                    });
                  });
                } else {
                  conn.end();
                }
              });
            });
          });
        };
        sftp.fastPut('/home/node/.openclaw/workspace/remote-control/admin.html', dir + '/admin.html', done);
        sftp.fastPut('/home/node/.openclaw/workspace/remote-control/target.html', dir + '/target.html', done);
        sftp.fastPut('/home/node/.openclaw/workspace/remote-control/server.js', dir + '/server.js', done);
      });
    });
  });
});
conn.on('error', e => console.error('SSH error:', e));
conn.connect({ host: '212.227.93.74', port: 22, username: 'root', privateKey: key, readyTimeout: 30000 });
