const { Client } = require("ssh2");
const fs = require("fs");
const conn = new Client();
conn.on("ready", () => {
  // 1. Create directory + upload game file
  conn.sftp((e, sftp) => {
    if (e) { console.log("SFTP Error:", e.message); conn.end(); return; }
    
    // Upload game file
    const gameHtml = fs.readFileSync("/home/node/.openclaw/workspace/fighter-poc.html");
    sftp.writeFile("/var/www/html/fight/index.html", gameHtml, (e2) => {
      if (e2) console.log("Write err:", e2.message);
      else console.log("✅ Game file uploaded");
      
      sftp.end();
      
      // 2. Add nginx config for fight subdomain
      conn.exec(`
cat > /etc/nginx/sites-enabled/fight.thenewworldorder.io << 'EOF'
server {
    listen 80;
    server_name fight.thenewworldorder.io;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name fight.thenewworldorder.io;
    ssl_certificate /etc/letsencrypt/live/scarlettpelling.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/scarlettpelling.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    root /var/www/html/fight;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF
nginx -t && nginx -s reload && echo "✅ nginx OK" || echo "❌ nginx FAILED"
`, (e3, s3) => {
        let o = "";
        s3.on("data", d => o += d.toString());
        s3.on("close", () => { console.log(o.trim()); conn.end(); });
      });
    });
  });
}).on("error", e => console.log("Err:", e.message))
  .connect({ host: "212.227.39.41", port: 22, username: "root", password: "WjoDZcB0Ryt47E" });
