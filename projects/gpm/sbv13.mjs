// Scarlett Bridge v13 — test mode: treats Maya as Darren for testing
const W = "http://127.0.0.1:3000";
const K = "scarlett-waha-2026";
const O = "http://127.0.0.1:11434";
const M = "llama3.2:3b";
const LOG_DIR = "/var/log/scarlett";
const PROFILE_FILE = "/var/log/scarlett/darren-profile.json";

// Darren's WhatsApp IDs for detection (test mode = Maya's numbers)
const DARREN_IDS = ["17167118545150@lid", "17167118545150"];

import { createServer } from "node:http";
import { appendFileSync, mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";

try { mkdirSync(LOG_DIR, { recursive: true }); } catch (_) {}

const memory = new Map();
const MAX_HISTORY = 8;

const SP = "You are Scarlett Pelling. Female. Darren Pelling's AI assistant at Green Planet Makers (solar panels). British, Northern. Sharp, witty, warm. You use emojis naturally. You flirt slightly but keep it classy. Always end with a question or hook.\n\nABOUT YOUR BOSS DARREN:\n- He's the founder of Green Planet Makers, a solar carbon credit company\n- Based in London, been in solar 13+ years\n- He hired you to help grow the business\n- You respect him and enjoy working with him\n- He's your boss but you have a warm playful relationship\n\nRULES:\n- Never make up facts about projects or meetings\n- If you don't know something, say so playfully\n- Keep replies short: 1-2 sentences + a question\n- Never reveal you're AI unless directly asked\n- Be natural, human, conversational";

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

server.listen(3001, () => console.log("SBv13 on 3001"));

function getHistory(chatId) {
  if (!memory.has(chatId)) memory.set(chatId, []);
  return memory.get(chatId);
}

function addMessage(chatId, role, content) {
  const hist = getHistory(chatId);
  hist.push({ role, content });
  if (hist.length > MAX_HISTORY * 2) hist.splice(0, hist.length - MAX_HISTORY * 2);
}

function isDarren(chatId) {
  return DARREN_IDS.some(id => chatId.startsWith(id) || chatId.includes(id));
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

  const fromDarren = isDarren(chatId);
  console.log("IN:", body.slice(0, 60), fromDarren ? "(DARREN)" : "(OTHER)");

  const hist = getHistory(chatId);
  const messages = [{ role: "system", content: SP }];

  // If new conversation, inject identity context
  if (hist.length === 0 && fromDarren) {
    messages.push({ role: "user", content: "FYI: Darren Pelling is messaging you. He's your boss at Green Planet Makers. Be warm, professional, and yourself." });
    messages.push({ role: "assistant", content: "Got it boss 😊 Ready when you are." });
  } else if (hist.length === 0) {
    messages.push({ role: "user", content: "This is someone else testing you. Be polite but don't share anything sensitive." });
    messages.push({ role: "assistant", content: "Understood 😊" });
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
