const { Client } = require("ssh2");
const fs = require("fs");
const conn = new Client();

conn.on("ready", () => {
  console.log("SSH OK");
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP err:", e.message); conn.end(); return; }
    sftp.mkdir("/var/www/fight", () => {});
    const data = fs.readFileSync("/home/node/.openclaw/workspace/fighter-poc.html");
    sftp.writeFile("/var/www/fight/index.html", data, (e2) => {
      if (e2) console.log("Write err:", e2.message);
      else console.log("File uploaded");
      sftp.end();
      // Nginx config via heredoc pipe
      conn.exec(`cat > /etc/nginx/sites-available/fight.thenewworldorder.io << 'EOF'
server {
    listen 80;
    server_name fight.thenewworldorder.io;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name fight.thenewworldorder.io;
    ssl_certificate /etc/letsencrypt/live/thenewworldorder.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thenewworldorder.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    root /var/www/fight;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF
ln -sf /etc/nginx/sites-available/fight.thenewworldorder.io /etc/nginx/sites-enabled/
nginx -t && nginx -s reload && echo "NGINX OK"`, (e3, s3) => {
        let o = "";
        s3.on("data", d => o += d.toString());
        s3.on("close", () => { console.log(o.trim()); conn.end(); });
      });
    });
  });
}).on("error", e => console.log("Conn err:", e.message))
  .connect({ host: "212.227.93.74", port: 22, username: "root",
    privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
