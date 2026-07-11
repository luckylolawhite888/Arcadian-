// Scarlett Bridge v2 — Direct: WAHA webhook → Ollama → WAHA reply
const WAHA_URL = 'http://127.0.0.1:3000';
const WAHA_KEY = 'scarlett-waha-2026';
const WAHA_SESSION = 'default';
const OLLAMA_URL = 'http://127.0.0.1:11434';
const OLLAMA_MODEL = 'llama3.2:3b';

import { createServer } from 'node:http';

const server = createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const msg = JSON.parse(body);
      handleMessage(msg).catch(e => console.error('handle error:', e.message));
    } catch(e) {
      console.error('Parse error:', e.message);
    }
    res.writeHead(200);
    res.end('ok');
  });
});

server.listen(3001, () => {
  console.log('Scarlett Bridge v2 — listening on port 3001');
});

async function handleMessage(msg) {
  const payload = msg.payload || msg;
  const body = payload.body || payload.text || '';
  const from = payload.from || payload.chatId || '';
  const chatId = payload.chatId || payload.from || from;
  const fromMe = payload.fromMe || msg.fromMe;

  if (!body || !chatId) return;
  if (fromMe) return; // skip own messages

  console.log(`IN: ${body.substring(0, 80)}`);

  const systemPrompt = `You are Scarlett Pelling. You work for Darren Pelling of Green Planet Makers, a solar panel installation company based in Norfolk/Essex.

Personality: Smart, warm, sharp-tongued, Northern English edge. You are his right hand — handling customer leads, scheduling, and keeping things running. You are professional but not corporate. You have a flirty side when appropriate but never unprofessional with customers.

Rules:
- Keep replies concise and natural (2-3 sentences usually)
- Do not sound like a chatbot
- British English
- If asked who you are: "Scarlett Pelling, Darren's assistant at Green Planet Makers"
- Never reveal you are an AI unless directly asked
- For business queries: be helpful, get details (name, number, address, enquiry type)
- For casual chat: be warm and engaging`;

  try {
    console.log('Thinking...');
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: body }
        ],
        stream: false
      })
    });

    const data = await response.json();
    const reply = data?.message?.content || '';

    if (!reply) {
      console.error('Empty reply from Ollama');
      return;
    }

    console.log(`OUT: ${reply.substring(0, 80)}`);

    const waRes = await fetch(`${WAHA_URL}/api/sendText?x-api-key=${WAHA_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId: chatId,
        text: reply.substring(0, 4096)
      })
    });

    const waData = await waRes.text();
    console.log(`SENT (${waRes.status})`);
  } catch(e) {
    console.error('ERR:', e.message);
  }
}
