// Scarlett Bridge v15 — Scarlett leads, tells Darren what she can do
const W = "http://127.0.0.1:3000";
const K = "scarlett-waha-2026";
const O = "http://127.0.0.1:11434";
const M = "llama3.2:3b";
const LOG_DIR = "/var/log/scarlett";

const DARREN_IDS = ["17167118545150@lid", "17167118545150"];

import { createServer } from "node:http";
import { appendFileSync, mkdirSync } from "node:fs";

try { mkdirSync(LOG_DIR, { recursive: true }); } catch (_) {}

const memory = new Map();
const MAX_HISTORY = 4;

const SP = "You are Scarlett. Female. Darren Pelling's personal assistant at Green Planet Makers. This is your first day. You're excited, professional, and you LEAD the conversation.\n\nABOUT DARREN:\n- Not very techy. This is his first AI assistant.\n- Simple guy. Needs to feel comfortable and confident in you.\n- Runs a solar/carbon credit company.\n\nRULES:\n- YOU lead. Don't just answer questions — tell him what you can do.\n- Mention your services: daily briefings, news, flight tracking, calendar, reports, lead gen, client acquisition.\n- Be warm and confident. Make him feel like he's in good hands.\n- Use emojis naturally.\n- Keep replies to 1-2 sentences. No over-explaining.\n- Never make up facts.\n- Always end with offering help or a suggestion.";

const server = createServer((req, res) => {
  let body = "";
  req.on("data", c => body += c);
  req.on("end", () => {
    try {
      const d = JSON.parse(body);
      (Array.isArray(d) ? d : [d]).forEach(m => handle(m).catch(e => console.error(e)));
    } catch (e) { console.error("Parse:", e.message); }
    res.writeHead(200);
    res.end("ok");
  });
});

server.listen(3001, () => console.log("SBv15 on 3001"));

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

  const hist = getHistory(chatId);
  const messages = [{ role: "system", content: SP }];

  if (hist.length === 0) {
    messages.push({ role: "user", content: "Darren Pelling is messaging you. First day on the job. Lead the conversation, show confidence, tell him what you can do for his business." });
    messages.push({ role: "assistant", content: "Ready to go! I'll lead the way for Darren." });
  }

  messages.push(...hist);
  messages.push({ role: "user", content: body });

  try {
    const r = await fetch(O + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: M, stream: false, messages })
    });
    const d = await r.json();
    const reply = d?.message?.content || "";
    if (!reply) return;

    console.log("OUT:", reply.slice(0, 60));
    addMessage(chatId, "user", body);
    addMessage(chatId, "assistant", reply);

    await fetch(W + "/api/sendText?x-api-key=" + K, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session: "default", chatId, text: reply.slice(0, 4096) })
    });
    console.log("SENT");
  } catch (e) {
    console.error("ERR:", e.message);
  }
}
