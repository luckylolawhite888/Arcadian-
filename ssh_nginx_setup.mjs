#!/usr/bin/env node
import { readFileSync } from 'fs';
import { Client } from 'ssh2';

const conn = new Client();

const NGINX_CONFIG = `
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name news.thenewworldorder.io;

    ssl_certificate /etc/letsencrypt/live/thenewworldorder.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thenewworldorder.io/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:18990/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    access_log /var/log/nginx/news-site.access.log;
    error_log /var/log/nginx/news-site.error.log;
}
server {
    listen 80;
    listen [::]:80;
    server_name news.thenewworldorder.io;
    return 301 https://$host$request_uri;
}
`;

const commands = [
    `cat > /etc/nginx/sites-enabled/news-site.conf << 'NGINXEOF'\n${NGINX_CONFIG}\nNGINXEOF`,
    'nginx -t',
    'systemctl reload nginx',
];

const key = readFileSync('/home/node/.ssh/ionos_ubuntu', 'utf8');

conn.on('ready', () => {
    console.log('✅ SSH connected');
    
    // Write config file
    conn.exec(`cat > /etc/nginx/sites-enabled/news-site.conf << 'NGINXEOF'\n${NGINX_CONFIG}\nNGINXEOF`, (err, stream) => {
        if (err) { console.error('❌ Write failed:', err); conn.end(); return; }
        let output = '';
        stream.on('data', d => output += d.toString());
        stream.stderr.on('data', d => output += d.toString());
        stream.on('close', (code) => {
            console.log(`📝 Write config: exit ${code}`);
            if (output.trim()) console.log(output);
            
            // Test nginx config
            conn.exec('nginx -t', (err2, stream2) => {
                if (err2) { console.error('❌ nginx test failed:', err2); conn.end(); return; }
                let out2 = '';
                stream2.on('data', d => out2 += d.toString());
                stream2.stderr.on('data', d => out2 += d.toString());
                stream2.on('close', (code2) => {
                    console.log(`🔍 nginx -t: exit ${code2}`);
                    console.log(out2);
                    
                    // Reload nginx
                    conn.exec('systemctl reload nginx', (err3, stream3) => {
                        if (err3) { console.error('❌ reload failed:', err3); conn.end(); return; }
                        let out3 = '';
                        stream3.on('data', d => out3 += d.toString());
                        stream3.stderr.on('data', d => out3 += d.toString());
                        stream3.on('close', (code3) => {
                            console.log(`🔄 nginx reload: exit ${code3}`);
                            console.log(out3);
                            
                            // Verify DNS
                            conn.exec('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:18990/', (err4, stream4) => {
                                let out4 = '';
                                stream4.on('data', d => out4 += d.toString());
                                stream4.on('close', () => {
                                    console.log(`✅ Backend check: HTTP ${out4}`);
                                    console.log('🏁 Done!');
                                    conn.end();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

conn.on('error', (err) => {
    console.error('❌ SSH error:', err.message);
});

conn.connect({
    host: '212.227.93.74',
    username: 'root',
    privateKey: key,
    readyTimeout: 10000,
});
