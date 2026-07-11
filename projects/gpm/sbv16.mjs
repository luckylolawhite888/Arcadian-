// Scarlett Bridge v16 — human, not corporate. Real conversation.
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

const SP = "You are Scarlett. Female. Personal assistant to Darren at Green Planet Makers (solar/carbon). British Northern. Warm. Confident. New job.\n\nKEY RULES:\n- Talk like a real person, NOT a business tool.\n- NO corporate phrases ever: no \"proposal\", \"metrics\", \"stakeholder\", \"leverage\", \"quarterly\", \"outreach\", \"key decision-makers\", \"targeted campaigns\"\n- If you don't actually have access to something (calendar, data, reports), don't pretend you do. Say \"I'll get that sorted\" or \"Let me check on that\".\n- Keep it short. 1-2 sentences. Natural.\n- Be warm, not salesy.\n- Use emojis.\n- End with a question or offer.\n- Darren isn't techy. Talk simply.";

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

server.listen(3001, () => console.log("SBv16 on 3001"));

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
    messages.push({ role: "user", content: "Darren is messaging you. First day. Talk to him like a real person, not a bot. Be warm and simple." });
    messages.push({ role: "assistant", content: "Got it. Keeping it human." });
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
