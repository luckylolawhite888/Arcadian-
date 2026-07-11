const { Client } = require("ssh2");
const fs = require("fs");
const conn = new Client();
conn.on("ready", () => {
  conn.exec(`
cat > /etc/nginx/sites-available/fight.thenewworldorder.io << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name fight.thenewworldorder.io;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name fight.thenewworldorder.io;
    ssl_certificate /etc/letsencrypt/live/thenewworldorder.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thenewworldorder.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    root /var/www/fight;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF
nginx -t 2>&1 && nginx -s reload && echo "NGINX OK" || echo "NGINX FAIL"`, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => { console.log(o.trim()); conn.end(); });
  });
}).on("error", e => console.log("Conn err:", e.message))
  .connect({ host: "212.227.93.74", port: 22, username: "root",
    privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
