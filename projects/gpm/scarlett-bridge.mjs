// Scarlett Bridge — WAHA → OpenClaw → WAHA
// Listens for WhatsApp messages via WAHA webhook, sends to Scarlett's AI brain, replies

const WAHA_URL = 'http://127.0.0.1:3000';
const WAHA_KEY = 'scarlett-waha-2026';
const WAHA_SESSION = 'default';
const GATEWAY_URL = 'http://127.0.0.1:18791';
const GATEWAY_TOKEN = 'f4abc3a77b8f385eb0dae6a36cb56aecc5546dfb91606be5';

import { createServer } from 'node:http';

// Simple webhook receiver
const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/hooks/wake') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const msg = JSON.parse(body);
        handleMessage(msg);
      } catch(e) {
        console.error('Parse error:', e.message);
      }
      res.writeHead(200);
      res.end('ok');
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3001, () => {
  console.log('Scarlett Bridge listening on port 3001');
});

async function handleMessage(msg) {
  const payload = msg.payload || msg;
  const body = payload.body || msg.body;
  const from = payload.from || msg.from;
  const chatId = payload.chatId || msg.chatId || from;
  
  if (!body || !chatId) return;
  if (payload.fromMe || msg.fromMe) return; // skip own messages

  console.log(`📩 Message from ${chatId}: ${body.substring(0, 80)}`);

  try {
    // Send to Scarlett's OpenClaw gateway
    const response = await fetch(`${GATEWAY_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`
      },
      body: JSON.stringify({
        model: 'openai/ollama:chat:llama3.2:3b',
        messages: [
          { role: 'system', content: 'You are Scarlett Pelling. You are smart, warm, and a little sharp. You work for Darren Pelling of Green Planet Makers (solar panel installations). You help with customer leads, business operations, and keeping Darren organised. Reply naturally, keep it concise, and don\'t over-explain. British, slight Northern edge. You\'re his assistant, not a robot.' },
          { role: 'user', content: body }
        ]
      })
    });
    
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || data.message?.content;
    
    if (reply) {
      // Send reply via WAHA
      const waRes = await fetch(`${WAHA_URL}/api/sendText?x-api-key=${WAHA_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: WAHA_SESSION,
          chatId: chatId,
          text: reply.substring(0, 4096)
        })
      });
      console.log(`📤 Replied to ${chatId}: ${reply.substring(0, 60)}...`);
    }
  } catch(e) {
    console.error('💥 Error:', e.message);
  }
}
