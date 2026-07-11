const fs = require("fs");
const s = fs.readFileSync("/var/www/api/server.v2.js", "utf8");

// Find and fix the dedup block
const oldText = `        // Check duplicate
        const existing = await sbQuery("GET", "leads", { select: "id", company_name: "eq.\\"" + r.company_name + "\\"" }).catch(() => []);
        if (Array.isArray(existing) && existing.length > 0) {
          console.log("Skipping duplicate:", r.company_name);
          continue;
        }`;

const newText = `        // Check duplicate — websites first, then name
        if (r.website) {
          const domain = r.website.replace(/https?:\\\/\\\//, "").replace("www.", "").split("/")[0];
          const webExisting = await sbQuery("GET", "leads?website=like.*" + encodeURIComponent(domain) + "*", { select: "id" }).catch(() => []);
          if (Array.isArray(webExisting) && webExisting.length > 0) {
            console.log("Skipping (website match):", domain);
            continue;
          }
        }`;

if (s.includes(oldText)) {
  const patched = s.replace(oldText, newText);
  fs.writeFileSync("/var/www/api/server.v2.js", patched, "utf8");
  console.log("PATCHED OK");
} else {
  console.log("OLD TEXT NOT FOUND");
  // Dump the area around the dedup for debugging
  const idx = s.indexOf("// Check duplicate");
  if (idx >= 0) console.log("Block:", s.substring(idx, idx + 250));
}
