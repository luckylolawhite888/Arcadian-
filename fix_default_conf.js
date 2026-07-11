const { Client } = require("ssh2");
const fs = require("fs");
const c = new Client();
c.on("ready", () => {
  c.exec(`
cat > /etc/nginx/sites-enabled/default.conf << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;
    return 404;
}
EOF
nginx -t 2>&1 | tail -1 && nginx -s reload && echo "RELOAD OK"
`, (e, s) => {
    let o = "";
    s.on("data", d => o += d.toString());
    s.on("close", () => {
      console.log(o.trim());
      c.exec(`curl -skI -H 'Host: fight.thenewworldorder.io' https://127.0.0.1/ 2>&1 | head -4`, (e2, s2) => {
        let o2 = "";
        s2.on("data", d => o2 += d.toString());
        s2.on("close", () => { console.log("Fight:", o2.trim()); c.end(); });
      });
    });
  });
}).on("error", e => console.log("Conn err:", e.message))
  .connect({ host: "212.227.93.74", port: 22, username: "root",
    privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
