const { Client } = require("ssh2");
const fs = require("fs");

const apiScript = fs.readFileSync("status_check_api.py", "utf8");
const checkerScript = fs.readFileSync("add_universal_checker.py", "utf8");

const c = new Client();

function run(cmd) {
  return new Promise((resolve, reject) => {
    c.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = "";
      stream.on("data", d => out += d);
      stream.on("close", code => resolve({ out: out.trim(), code }));
    });
  });
}

c.on("ready", async () => {
  try {
    // 1. Deploy new API script
    const b64api = Buffer.from(apiScript, "utf8").toString("base64");
    let r = await run(`echo "${b64api}" | base64 -d > /opt/status_check_api.py`);
    console.log("API deployed:", r.out);

    // 2. Kill old API
    r = await run("pkill -f status_check_api 2>/dev/null; echo OK");
    console.log("Old API killed:", r.out);

    // 3. Run checker update
    const b64chk = Buffer.from(checkerScript, "utf8").toString("base64");
    r = await run(`echo "${b64chk}" | base64 -d | python3`);
    console.log("Checker update:\n" + r.out);

    // 4. Update nginx config
    const nginxCfg = await run("cat /etc/nginx/sites-enabled/isitdownrightnow.co.uk.conf");
    if (!nginxCfg.out.includes("/api/")) {
      r = await run(
        `sed -i 's|location /check {|location /api/ {\\n        proxy_pass http://127.0.0.1:5002/api/;\\n        proxy_set_header Host \\$host;\\n    }\\n\\n    location /check {|' /etc/nginx/sites-enabled/isitdownrightnow.co.uk.conf`
      );
      console.log("Nginx patched:", r.out || "OK");
    }

    // 5. Reload nginx
    r = await run("nginx -t 2>&1 && nginx -s reload; echo nginx_ok");
    console.log("Nginx:", r.out);

    // 6. Start API
    r = await run("nohup python3 /opt/status_check_api.py > /var/log/status_check_api.log 2>&1 & sleep 2 && echo started");
    console.log("API:", r.out);

    // 7. Test
    r = await run("curl -s --max-time 5 https://isitdownrightnow.co.uk/api/check?url=netflix.com");
    console.log("Test netflix:", r.out);

    r = await run("curl -s --max-time 5 https://isitdownrightnow.co.uk/api/check?url=reddit.com");
    console.log("Test reddit:", r.out);

    r = await run("curl -s --max-time 5 https://isitdownrightnow.co.uk/api/status | head -c 300");
    console.log("Status API:", r.out);

    c.end();
  } catch(e) {
    console.error("Error:", e);
    c.end();
  }
}).on("error", e => console.log("ERR:", e.message));

c.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
