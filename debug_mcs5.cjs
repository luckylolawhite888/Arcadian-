const { Client } = require("ssh2");
const fs = require("fs");

const conn = new Client();
function run(c) {
  return new Promise((r, j) => {
    conn.exec(c, (e, s) => {
      if (e) return j(e);
      let o = "";
      s.on("data", d => o += d.toString());
      s.stderr.on("data", d => o += d.toString());
      s.on("close", () => r(o));
    });
  });
}

conn.on("ready", async () => {
  const pwd = "3v3fUeTROhIl4n";

  // Test the scraper logic directly on the VPS
  let test = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"node -e \\\"(async()=>{let r=await fetch('https://mcscertified.com/find-an-installer/?page=1&search=Solar');let h=await r.text();let cards=h.split('<h3 class=\\\\\\\\\\"h4\\\\\\\\\\\\\"');console.log('Cards:',cards.length-1);for(let i=1;i<Math.min(cards.length,3);i++){let c=cards[i];let n=c.match(/<h3[^>]*class=\\\\\\\\\\"h4\\\\\\\\\\\\\"[^>]*>([^<]+)<\\\\/h3>/i);console.log('Card',i,':',n?n[1].trim():'NO NAME',c.substring(0,200))}})()\\\" 2>&1\"");
  console.log("Test:", test.substring(0, 1000));

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
