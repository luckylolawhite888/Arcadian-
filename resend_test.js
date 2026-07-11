const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user: "scarlettpelling5@gmail.com", pass: "dvab vqko jkcx ypee" }
});
transporter.sendMail({
  from: "Scarlett <scarlettpelling5@gmail.com>",
  to: "luckylolawhite@gmail.com",
  subject: "Scarlett says hello from the server 🦊",
  html: "<h2>Hello Boss</h2><p>This is Scarlett, Darren's AI assistant. Just testing that I can send emails from the server.</p><p>Grid is currently running at 125 gCO₂/kWh — moderate, wind doing the work at 42%.</p><p>Thought you should know.</p><p>— Scarlett 🧡</p>"
}).then(info => {
  console.log("Sent:", info.messageId);
  process.exit(0);
}).catch(e => {
  console.log("Error:", e.message);
  process.exit(1);
});
