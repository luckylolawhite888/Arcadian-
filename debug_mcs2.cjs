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

  // Use the API to POST directly — the action name might be different
  let mcs1 = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s -X POST -d 'action=mcs_installer_search&search=SK74RP' 'https://mcscertified.com/wp-admin/admin-ajax.php' 2>&1 | head -c 500\"");
  console.log("test1:", mcs1.substring(0, 200));

  let mcs2 = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s -X POST -d 'action=find_installer&search=SK74RP' 'https://mcscertified.com/wp-admin/admin-ajax.php' 2>&1 | head -c 500\"");
  console.log("test2:", mcs2.substring(0, 200));

  let mcs3 = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s 'https://mcscertified.com/wp-json/custom/v1/installers?search=SK74RP' 2>&1 | head -c 500\"");
  console.log("test3 (custom/v1):", mcs3.substring(0, 300));

  let mcs4 = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s 'https://mcscertified.com/wp-json/mcs/v1/installers?search=SK74RP' 2>&1 | head -c 500\"");
  console.log("test4 (mcs/v1):", mcs4.substring(0, 300));

  // Check what namespaces are available
  let mcsNS = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"curl -s 'https://mcscertified.com/wp-json/' 2>&1 | python3 -c 'import sys,json;d=json.load(sys.stdin);print(\" \".join(d.get(\"namespaces\",[])))'\"");
  console.log("WP namespaces:", mcsNS.substring(0, 500));

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
