// Scarlett Bridge v9 — with conversation logging to file + profile extraction
const W = "http://127.0.0.1:3000";
const K = "scarlett-waha-2026";
const O = "http://127.0.0.1:11434";
const M = "llama3.2:3b";
const LOG_DIR = "/var/log/scarlett";
const PROFILE_FILE = "/var/log/scarlett/darren-profile.json";

import { createServer } from "node:http";
import { appendFileSync, mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";

// Ensure log directory exists
try { mkdirSync(LOG_DIR, { recursive: true }); } catch (_) {}

// Conversation memory
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

server.listen(3001, () => console.log("SBv9 on 3001"));

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
  try {
    appendFileSync(`${LOG_DIR}/conversations-${dateStr}.log`, entry);
  } catch (e) {
    console.error("Log write error:", e.message);
  }
}

function updateProfile(inMsg, outMsg) {
  let profile = {};
  try {
    if (existsSync(PROFILE_FILE)) {
      profile = JSON.parse(readFileSync(PROFILE_FILE, "utf8"));
    }
  } catch (_) {}

  // Basic profile extraction from conversation
  if (!profile.firstSeen) profile.firstSeen = new Date().toISOString();
  profile.lastInteraction = new Date().toISOString();
  profile.totalExchanges = (profile.totalExchanges || 0) + 1;

  // Track topics mentioned
  if (!profile.topics) profile.topics = [];
  const keywords = ["solar", "lead", "business", "gpm", "meeting", "call", "installer", "carbon", "money", "deal", "customer", "sales"];
  const combined = (inMsg + " " + outMsg).toLowerCase();
  keywords.forEach(kw => {
    if (combined.includes(kw) && !profile.topics.includes(kw)) {
      profile.topics.push(kw);
    }
  });

  try {
    writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2));
  } catch (e) {
    console.error("Profile write error:", e.message);
  }
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
    const r = await fetch(O + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: M, stream: false, messages })
    });
    const d = await r.json();
    const reply = d?.message?.content || "";
    if (!reply) return;

    console.log("OUT:", reply.slice(0, 60));

    // Save to history
    addMessage(chatId, "user", body);
    addMessage(chatId, "assistant", reply);

    // Send reply via WAHA
    await fetch(W + "/api/sendText?x-api-key=" + K, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session: "default", chatId, text: reply.slice(0, 4096) })
    });
    console.log("SENT");

    // Log conversation + update profile
    logConversation(chatId, body, reply);
    updateProfile(body, reply);
    console.log("LOGGED");

  } catch (e) {
    console.error("ERR:", e.message);
  }
}
