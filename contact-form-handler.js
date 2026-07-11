const http = require('http');
const nodemailer = require('nodemailer');

// Simple contact form handler that receives POST and sends email
const PORT = 8025;

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 25,
  secure: false,
  tls: { rejectUnauthorized: false }
});

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/send') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const { name, business, email, phone, message, plan } = data;

      const mailText = `New Lola AI Contact Form Submission\n\n`
        + `Name: ${name || 'Not provided'}\n`
        + `Business: ${business || 'Not provided'}\n`
        + `Email: ${email || 'Not provided'}\n`
        + `Phone: ${phone || 'Not provided'}\n`
        + `Plan: ${plan || 'Not specified'}\n\n`
        + `Message:\n${message || 'No message'}`;

      await transporter.sendMail({
        from: 'ai-bots@thenewworldorder.io',
        to: 'luckylolawhite@gmail.com',
        subject: `New AI Bot Enquiry from ${name || 'Anonymous'}`,
        text: mailText
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      console.error('Contact form error:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to send' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Contact form handler running on port ${PORT}`);
});
