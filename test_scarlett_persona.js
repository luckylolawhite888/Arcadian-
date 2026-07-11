const http = require("http");

// Test Scarlett's chat with her new persona
const body = JSON.stringify({ message: "Hi Scarlett, who built you?" });

const opts = {
  hostname: "127.0.0.1",
  port: 3100,
  path: "/api/chat",
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
      console.log("✅ Scarlett says:", d.reply);
    } catch(e) {
      console.log("Raw:", data.substring(0, 500));
    }
    process.exit(0);
  });
});

req.on("error", e => { console.log("Error:", e.message); process.exit(1); });
req.write(body);
req.end();
