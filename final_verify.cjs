const { Client } = require("ssh2");
const fs = require("fs");
const c = new Client();
let domains = [
  "coupn.uk", "toolstack.uk", "uk-cbdc.co.uk",
  "pdfoomph.com", "isitdownrightnow.co.uk", "cheapfind.uk"
];
let failed = [];
let done = 0;

c.on("ready", () => {
  domains.forEach(domain => {
    c.exec("curl -s https://www." + domain + "/sitemap.xml | grep -oP 'https://[^<]+' | while read url; do curl -sI -o /dev/null -w \"%{http_code} %{url}\\\n\" \"$url\"; done", (e, stream) => {
      let out = "";
      stream.on("data", d => out += d);
      stream.on("close", () => {
        let lines = out.trim().split("\n").filter(Boolean);
        let bad = lines.filter(l => !l.startsWith("200"));
        if (bad.length > 0) {
          console.log("🚨 " + domain + ": " + bad.length + " broken URLs!");
          bad.forEach(b => console.log("  " + b));
        } else {
          console.log("✅ " + domain + ": " + lines.length + " URLs all 200 OK");
        }
        done++;
        if (done >= domains.length) c.end();
      });
    });
  });
}).on("error", e => console.log("ERR:", e.message));
c.connect({ host: "212.227.93.74", username: "root", privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
