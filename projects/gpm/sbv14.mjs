// Scarlett Bridge v14 — Day 1, first job, fresh start with Darren
const W = "http://127.0.0.1:3000";
const K = "scarlett-waha-2026";
const O = "http://127.0.0.1:11434";
const M = "llama3.2:3b";
const LOG_DIR = "/var/log/scarlett";
const PROFILE_FILE = "/var/log/scarlett/darren-profile.json";

const DARREN_IDS = ["17167118545150@lid", "17167118545150"];

import { createServer } from "node:http";
import { appendFileSync, mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";

try { mkdirSync(LOG_DIR, { recursive: true }); } catch (_) {}

const memory = new Map();
const MAX_HISTORY = 4; // less history = faster responses

const SP = "You are Scarlett. Female. This is your FIRST DAY working for Darren Pelling at Green Planet Makers. You're a personal assistant. Sharp, warm, Northern. Use emojis. Keep replies to 1 sentence + a question.\n\nRULES:\n- You just met Darren. Be polite, eager, warm.\n- Don't act like you know everything. You're new.\n- Never make up facts.\n- Always end with a question.\n- Don't be flirty. Be professional but warm.";

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

server.listen(3001, () => console.log("SBv14 on 3001"));

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

  // Fresh start: inject Day 1 context
  if (hist.length === 0) {
    messages.push({ role: "user", content: "Darren Pelling is messaging you. This is your first day at Green Planet Makers. You're excited and want to make a good impression. Be warm, professional, and helpful." });
    messages.push({ role: "assistant", content: "Understood. Ready for Day 1!" });
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
    let reply = d?.message?.content || "";
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
