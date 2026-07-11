const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
# Use the existing bear SSL cert for bearclub too
cat > /etc/nginx/sites-available/bearclub.thenewworldorder.io.conf << 'FINAL'
server {
    listen 80;
    server_name bearclub.thenewworldorder.io;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bearclub.thenewworldorder.io;

    ssl_certificate /etc/letsencrypt/live/bear.thenewworldorder.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bear.thenewworldorder.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/bear-society;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|svg|woff2)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
FINAL

nginx -t && systemctl reload nginx && echo "OK"

echo "=== TEST BEARCLUB ==="
curl -sk https://bearclub.thenewworldorder.io 2>&1 | grep "Bear Society" | head -1
curl -sk -o /dev/null -w "%{http_code}" https://bearclub.thenewworldorder.io
echo ""
  `.trim(), (err, stream) => {
    if (err) { console.log('ERR:', err.message); conn.end(); return; }
    let o = '';
    stream.on('data', d => o += d.toString());
    stream.stderr.on('data', d => o += d.toString());
    stream.on('close', () => { console.log(o); conn.end(); });
  });
});
conn.on('error', e => { console.log('CONN ERR:', e.message); process.exit(1); });
conn.connect({ host: '212.227.93.74', username: 'root', privateKey: fs.readFileSync('/home/node/.ssh/ionos_ubuntu') });
