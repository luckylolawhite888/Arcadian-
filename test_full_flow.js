const http = require("http");

const body = JSON.stringify({"query":"commercial energy consultants UK battery storage","sector":"Energy"});

const opts = {
  hostname: "127.0.0.1",
  port: 3100,
  path: "/api/scarlett/find-sector-leads",
  method: "POST",
  headers: {
    "x-access-code": "@DARREN2026",
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  }
};

const req = http.request(opts, res => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => {
    try {
      const d = JSON.parse(data);
      console.log("✅ Found:", d.found);
      console.log("✅ Inserted into Supabase:", d.inserted);
      console.log("");
      (d.results || []).forEach((r, i) => {
        console.log(`  ${i+1}. ${(r.company_name||"").substring(0,55)}`);
        console.log(`     ${r.website||"no website"}`);
        if (r.phone) console.log(`     📞 ${r.phone}`);
        if (r.contact_name) console.log(`     👤 ${r.contact_name} - ${r.contact_title||""}`);
        console.log("");
      });
    } catch(e) {
      console.log("Parse error:", e.message);
      console.log("Raw:", data.substring(0,300));
    }
    process.exit(0);
  });
});

req.on("error", e => { console.log("Req error:", e.message); process.exit(1); });
req.write(body);
req.end();

setTimeout(() => { process.exit(1); }, 35000);
