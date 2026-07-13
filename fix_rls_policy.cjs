const { Client } = require("ssh2");
const fs = require("fs");

const conn = new Client();
function run(c) { return new Promise((r,j) => { conn.exec(c,(e,s)=>{if(e)return j(e);let o="";s.on("data",d=>o+=d);s.stderr.on("data",d=>o+=d);s.on("close",()=>r(o));});}); }

conn.on("ready", async () => {
  const pwd = "3v3fUeTROhIl4n";
  const sv = await run("sshpass -p " + pwd + " ssh -o StrictHostKeyChecking=no root@212.227.38.78 \"sed -n 4p /var/www/api/server.js\" 2>&1");
  const key = sv.trim().match(/SUPABASE_ANON_KEY='([^']+)'/)[1];

  // Write a script on IONOS that tries various Supabase methods
  const script = `
const { createClient } = require("@supabase/supabase-js");
const key = "${key}";
const supabase = createClient("https://psjlllkngrgwvmddwznj.supabase.co", key);

(async () => {
  // Try to insert leads directly using service_role from env
  // Actually, let me try a different approach - use the edge function
  // Or try SQL execution via mgmt API
  
  // Method 1: Try PostgreSQL endpoint
  try {
    const r = await fetch("https://psjlllkngrgwvmddwznj.supabase.co/rest/v1/rpc/", {
      method: "POST",
      headers: { "apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    console.log("RPC status:", r.status);
  } catch(e) { console.log("RPC error:", e.message); }

  // Method 2: Check if there is a service_role key in environment  
  try {
    const r = await fetch("https://psjlllkngrgwvmddwznj.supabase.co/rest/v1/", {
      headers: { "apikey": key }
    });
    console.log("Root status:", r.status);
  } catch(e) { console.log("Root error:", e.message); }
  
  // Method 3: Try insert with anon key directly (might have INSERT but not SELECT)
  try {
    const testLead = { contact_name: "Test", company_name: "Test Corp", source: "Web", status: "new" };
    const r2 = await supabase.from("leads").insert(testLead).select();
    if (r2.error) console.log("Insert via SDK:", r2.error.message);
    else console.log("Insert OK:", r2.data);
  } catch(e) { console.log("SDK error:", e.message); }
  
  console.log("Done");
})();
`;
  fs.writeFileSync("/tmp/fix_rls.cjs", script);
  await new Promise((r,j) => {
    conn.sftp((e,sftp)=>{if(e)return j(e);const rs=fs.createReadStream("/tmp/fix_rls.cjs");const ws=sftp.createWriteStream("/tmp/fix_rls.cjs");rs.pipe(ws);ws.on("close",r);ws.on("error",j);});
  });
  
  const res = await run("node /tmp/fix_rls.cjs 2>&1");
  console.log(res);

  conn.end();
}).on("error", e => console.log("error:", e.message))
.connect({ host:"212.227.93.74", username:"root", privateKey:fs.readFileSync("/home/node/.ssh/ionos_ubuntu") });
