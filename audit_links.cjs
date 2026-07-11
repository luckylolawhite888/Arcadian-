const { Client } = require("ssh2");
const fs = require("fs");
const c = new Client();
c.on("ready", () => {
  c.exec('grep -l "More Useful Sites" /var/www/toolstack.uk/public/*.html 2>/dev/null | wc -l', (err, stream) => {
    let out = "";
    stream.on("data", d => out += d);
    stream.on("close", () => { console.log("toolstack crosslinks: " + out.trim()); });
  });
  c.exec('grep -l "More Useful Sites" /var/www/coupn.uk/public/*.html 2>/dev/null | wc -l', (e, s) => {
    let o = "";
    s.on("data", d => o += d);
    s.on("close", () => { console.log("coupn crosslinks: " + o.trim()); });
  });
  c.exec('grep -l "More Useful Sites" /var/www/pdfoomph.com/public/*.html 2>/dev/null | wc -l', (e, s) => {
    let o = "";
    s.on("data", d => o += d);
    s.on("close", () => { console.log("pdfoomph crosslinks: " + o.trim()); });
  });
  c.exec('grep -l "More Useful Sites" /var/www/cheapfind.uk/public/*.html 2>/dev/null | wc -l', (e, s) => {
    let o = "";
    s.on("data", d => o += d);
    s.on("close", () => { console.log("cheapfind crosslinks: " + o.trim()); });
  });
  c.exec('grep -l "More Useful Sites" /var/www/uk-cbdc.co.uk/public/*.html 2>/dev/null | wc -l', (e, s) => {
    let o = "";
    s.on("data", d => o += d);
    s.on("close", () => { console.log("uk-cbdc crosslinks: " + o.trim()); });
  });
  c.exec('grep -l "More Useful Sites" /var/www/isitdownrightnow.co.uk/public/*.html 2>/dev/null | wc -l', (e, s) => {
    let o = "";
    s.on("data", d => o += d);
    s.on("close", () => { console.log("isitdownrightnow crosslinks: " + o.trim()); c.end(); });
  });
}).on("error", e => console.log("ERR:", e.message));
c.connect({ host: "212.227.93.74", username: "root", privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
