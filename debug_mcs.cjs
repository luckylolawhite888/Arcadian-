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

  // Test MCS admin-ajax DIRECTLY on the server
  let mcsTest = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s -X POST -d \\"action=mcs_installer_search&search=SK74RP\\" \\"https://mcscertified.com/wp-admin/admin-ajax.php\\" 2>&1 | head -c 1000"');
  console.log("MCS admin-ajax:", mcsTest.substring(0, 500));

  // Test their page to see the JS they use
  let mcsPage = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s \\"https://mcscertified.com/find-an-installer/\\" 2>&1 | grep -o \\"admin-ajax[^\\"]*\\" | head -5"');
  console.log("MCS ajax refs:", mcsPage.substring(0, 500));

  // Try the search page POST form
  let mcsForm = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s \\"https://mcscertified.com/find-an-installer/\\" 2>&1 | grep -oP \\"action=\\\\\\"[^\\"]+\\\\\\"\\" | head -5"');
  console.log("MCS form actions:", mcsForm.substring(0, 500));

  // Check the WP REST API route
  let mcsRest = await run('sshpass -p ' + pwd + ' ssh -o StrictHostKeyChecking=no root@212.227.38.78 "curl -s \\"https://mcscertified.com/wp-json/\\" 2>&1 | head -c 500"');
  console.log("WP REST root:", mcsRest.substring(0, 300));

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({
  host: "212.227.93.74",
  username: "root",
  privateKey: fs.readFileSync("/home/node/.ssh/ionos_ubuntu")
});
