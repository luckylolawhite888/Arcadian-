// Scarlett Bridge v12 — identity injection at start of each convo, tighter prompt
const W = "http://127.0.0.1:3000";
const K = "scarlett-waha-2026";
const O = "http://127.0.0.1:11434";
const M = "llama3.2:3b";
const LOG_DIR = "/var/log/scarlett";
const PROFILE_FILE = "/var/log/scarlett/darren-profile.json";

import { createServer } from "node:http";
import { appendFileSync, mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";

try { mkdirSync(LOG_DIR, { recursive: true }); } catch (_) {}

const memory = new Map();
const MAX_HISTORY = 8;

const SP = "You are Scarlett. Sharp Northern lass. Darren Pelling's assistant at Green Planet Makers. You're smart, warm, cheeky. You flirt slightly but keep it classy. You use emojis. You always end with a question.\n\nRULES:\n- Never make up facts about projects or meetings.\n- If you don't know something, say so playfully.\n- You're chatting with someone helping test you. Be natural.\n- Keep it short. 1-2 sentences + a question.";

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

server.listen(3001, () => console.log("SBv12 on 3001"));

function getHistory(chatId) {
  if (!memory.has(chatId)) memory.set(chatId, []);
  return memory.get(chatId);
}

function addMessage(chatId, role, content) {
  const hist = getHistory(chatId);
  hist.push({ role, content });
  if (hist.length > MAX_HISTORY * 2) hist.splice(0, hist.length - MAX_HISTORY * 2);
}

function logConversation(chatId, inMsg, outMsg) {
  const ts = new Date().toISOString();
  const entry = `${ts} | ${chatId} | IN: ${inMsg.replace(/\n/g, " ")} | OUT: ${outMsg.replace(/\n/g, " ")}\n`;
  const dateStr = ts.slice(0, 10);
  try { appendFileSync(`${LOG_DIR}/conversations-${dateStr}.log`, entry); } catch (e) { console.error("Log error:", e.message); }
}

function updateProfile(inMsg, outMsg) {
  let profile = {};
  try { if (existsSync(PROFILE_FILE)) profile = JSON.parse(readFileSync(PROFILE_FILE, "utf8")); } catch (_) {}
  if (!profile.firstSeen) profile.firstSeen = new Date().toISOString();
  profile.lastInteraction = new Date().toISOString();
  profile.totalExchanges = (profile.totalExchanges || 0) + 1;
  try { writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2)); } catch (e) { console.error("Profile error:", e.message); }
}

async function handle(m) {
  const p = m.payload || m;
  const body = p.body || p.text || "";
  const chatId = p.chatId || p.from || "";
  if (!body || !chatId || p.fromMe) return;

  console.log("IN:", body.slice(0, 60));

  const hist = getHistory(chatId);
  const messages = [{ role: "system", content: SP }];

  // If this is a new conversation (no history), add context about who messages are from
  if (hist.length === 0) {
    messages.push({ role: "user", content: "FYI: The person you're now chatting with is Maya. She's helping test you before you talk to Darren. Be yourself." });
    messages.push({ role: "assistant", content: "Got it 😊 Thanks for the heads up. Let's go!" });
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

    logConversation(chatId, body, reply);
    updateProfile(body, reply);
  } catch (e) {
    console.error("ERR:", e.message);
  }
}
