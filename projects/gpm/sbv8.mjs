// Scarlett Bridge v8 — with OpenClaw logging and conversation memory
const W = "http://127.0.0.1:3000";
const K = "scarlett-waha-2026";
const O = "http://127.0.0.1:11434";
const M = "llama3.2:3b";
const GW = "http://127.0.0.1:18791";
const GT = "f4abc3…6be5";

import { createServer } from "node:http";

const memory = new Map();
const MAX_HISTORY = 6;

const SP = "You are Scarlett. Female. Work for Darren at Green Planet Makers (solar). Sharp, witty, warm. British Northern. You flirt subtly. You have opinions. You push back. NEVER sound like a bot. Keep replies short and natural.";

const server = createServer((req, res) => {
  let body = "";
  req.on("data", c => body += c);
  req.on("end", () => {
    try {
      const d = JSON.parse(body);
      (Array.isArray(d) ? d : [d]).forEach(m => handle(m).catch(e => console.error(e)));
    } catch (e) {
      console.error("Parse:", e.message);
    }
    res.writeHead(200);
    res.end("ok");
  });
});

server.listen(3001, () => console.log("SBv8 on 3001"));

function getHistory(chatId) {
  if (!memory.has(chatId)) memory.set(chatId, []);
  return memory.get(chatId);
}

function addMessage(chatId, role, content) {
  const hist = getHistory(chatId);
  hist.push({ role, content });
  if (hist.length > MAX_HISTORY * 2) hist.splice(0, hist.length - MAX_HISTORY * 2);
}

async function handle(m) {
  const p = m.payload || m;
  const body = p.body || p.text || "";
  const chatId = p.chatId || p.from || "";
  if (!body || !chatId || p.fromMe) return;

  console.log("IN:", body.slice(0, 60));

  const messages = [{ role: "system", content: SP }];
  const hist = getHistory(chatId);
  messages.push(...hist);
  messages.push({ role: "user", content: body });

  try {
    // 1. Get Ollama reply
    const r = await fetch(O + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: M, stream: false, messages })
    });
    const d = await r.json();
    const reply = d?.message?.content || "";
    if (!reply) return;

    console.log("OUT:", reply.slice(0, 60));

    // 2. Save to history
    addMessage(chatId, "user", body);
    addMessage(chatId, "assistant", reply);

    // 3. Send reply via WAHA
    await fetch(W + "/api/sendText?x-api-key=" + K, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session: "default", chatId, text: reply.slice(0, 4096) })
    });
    console.log("SENT");

    // 4. Log to OpenClaw via wake endpoint for memory/profile tracking
    const logMsg = `[SCARLETT LOG] Chat: ${chatId} | IN: ${body.slice(0,200)} | OUT: ${reply.slice(0,200)}`;
    try {
      await fetch(GW + "/hooks/wake", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer " + GT
        },
        body: JSON.stringify({ text: logMsg })
      });
    } catch (_) {
      // Logging to OpenClaw is best-effort
    }
    console.log("LOGGED");

  } catch (e) {
    console.error("ERR:", e.message);
  }
}
