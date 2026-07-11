const http = require("http");

const names = ["Test Solar Ltd", "SolarTech UK", "Green Planet Makers Ltd"];

async function main() {
  // Get all leads, find matching ones
  const leads = await apiGet("/api/leads");
  const targets = leads.filter(l => names.includes(l.company_name));
  console.log("Found", targets.length, "test leads to delete");
  
  for (const t of targets) {
    const res = await apiDel("/api/leads/" + t.id);
    console.log("Deleted:", t.company_name, t.id);
  }
  
  const remaining = await apiGet("/api/leads");
  console.log("Remaining leads:", remaining.length);
  console.log("Scarlett web search leads:", remaining.filter(l => l.source === "scarlett_web_search").length);
}

function apiGet(path) {
  return new Promise((resolve, reject) => {
    http.get("http://127.0.0.1:3100" + path, { headers: { "x-access-code": "@DARREN2026" } }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } });
    }).on("error", reject);
  });
}

function apiDel(path) {
  return new Promise((resolve, reject) => {
    const req = http.request("http://127.0.0.1:3100" + path, { method: "DELETE", headers: { "x-access-code": "@DARREN2026" } }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve(d));
    });
    req.on("error", reject);
    req.end();
  });
}

main().catch(e => { console.log("Error:", e.message); process.exit(1); });
