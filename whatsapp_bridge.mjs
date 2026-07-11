#!/usr/bin/env node
/**
 * WhatsApp Bridge v2 — Security-gated
 * - Maya's number: full access, triggers wake webhook
 * - Unknown numbers: triggers APPROVAL REQUIRED alert, no response until Maya says so
 */
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';

const WAHA_URL = 'http://127.0.0.1:3000';
const API_KEY = 'hom_lola_2026';
const SEEN_FILE = '/tmp/whatsapp_seen.txt';
const MAYA_CHAT = '17167118545150@lid';      // Maya's WA chat ID
const MAYA_NUMBERS = ['447542666646'];         // Maya's phone numbers (no +, no @)
const ALERT_FILE = '/tmp/whatsapp_alert.json';
const APPROVAL_FILE = '/tmp/whatsapp_approval.json';
const GATEWAY_HOOK = 'http://127.0.0.1:18790/hooks/wake';
const GATEWAY_TOKEN = 'lola-waha-2026';
const ALI_PHONE = '447700000001'; // Ali's real number

// ============ Message Store for Chat Mini App ============
const MESSAGE_STORE = '/tmp/lolachat_messages.json';

function storeMessage(phone, msg) {
    let store = {};
    try {
        if (fs.existsSync(MESSAGE_STORE)) {
            store = JSON.parse(fs.readFileSync(MESSAGE_STORE, 'utf-8'));
        }
    } catch(e) { store = {}; }
    if (!store[phone]) store[phone] = [];
    store[phone].push(msg);
    // Keep last 500 messages per contact
    if (store[phone].length > 500) store[phone] = store[phone].slice(-500);
    fs.writeFileSync(MESSAGE_STORE, JSON.stringify(store));
}

// ============ HTTP Server for Chat Mini App API ============
const API_PORT = 3022;

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'OPTIONS') { res.end(); return; }

    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    const auth = req.headers['x-api-key'] || '';

    if (auth !== API_KEY) { res.writeHead(401); res.end('{}'); return; }

    if (path === '/api/messages') {
        // Return all messages and contacts
        let store = {};
        try {
            if (fs.existsSync(MESSAGE_STORE))
                store = JSON.parse(fs.readFileSync(MESSAGE_STORE, 'utf-8'));
        } catch(e) {}
        res.writeHead(200);
        res.end(JSON.stringify(store));
    } else if (path === '/api/messages/since') {
        // Return messages since a timestamp
        const since = parseInt(url.searchParams.get('ts') || '0');
        let store = {};
        try {
            if (fs.existsSync(MESSAGE_STORE))
                store = JSON.parse(fs.readFileSync(MESSAGE_STORE, 'utf-8'));
        } catch(e) {}
        // Filter messages newer than timestamp
        const result = {};
        for (const [phone, msgs] of Object.entries(store)) {
            const recent = msgs.filter(m => new Date(m.time).getTime() > since);
            if (recent.length) result[phone] = recent;
        }
        res.writeHead(200);
        res.end(JSON.stringify(result));
    } else if (path === '/api/contacts') {
        // Return contacts from the bridge's knowledge
        let store = {};
        try {
            if (fs.existsSync(MESSAGE_STORE))
                store = JSON.parse(fs.readFileSync(MESSAGE_STORE, 'utf-8'));
        } catch(e) {}
        const contacts = [];
        for (const phone of Object.keys(store)) {
            const msgs = store[phone];
            const name = msgs.find(m => m.senderName)?.senderName || 'Unknown';
            contacts.push({ number: phone, name, messageCount: msgs.length });
        }
        res.writeHead(200);
        res.end(JSON.stringify(contacts));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
}).listen(API_PORT, () => {
    console.log(`📡 Chat API server on port ${API_PORT}`);
});

function apiGet(path) {
    return new Promise((resolve) => {
        const req = http.get(`${WAHA_URL}${path}`, { headers: { 'X-API-Key': API_KEY } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
        });
        req.on('error', () => resolve(null));
        req.setTimeout(8000, () => { req.destroy(); resolve(null); });
    });
}

function triggerWake(text) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({ text, mode: 'now' });
        const url = new URL(GATEWAY_HOOK);
        const req = http.request({
            hostname: url.hostname, port: url.port, path: url.pathname,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GATEWAY_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => { res.resume(); res.on('end', resolve); });
        req.on('error', () => resolve());
        req.write(payload);
        req.end();
    });
}

function isMaya(senderId) {
    // senderId could be "17167118545150@lid" or "17167118545150" (number only)
    const raw = senderId.replace(/@.*$/, '').replace(/[^0-9]/g, '');
    // Check by phone number
    if (MAYA_NUMBERS.some(m => raw.endsWith(m))) return true;
    // Check by lid ID (extract digits from MAYA_CHAT and compare)
    const lidDigits = MAYA_CHAT.replace(/@.*$/, '').replace(/[^0-9]/g, '');
    if (raw === lidDigits) return true;
    return false;
}

function getSenderPhone(rawId) {
    // Extract phone number from WA chat IDs like "447542666646@c.us" or "17167118545150@lid"
    return rawId.replace(/@.*$/, '').replace(/[^0-9]/g, '');
}

// Load seen messages
const seen = new Set();
if (fs.existsSync(SEEN_FILE)) {
    const content = fs.readFileSync(SEEN_FILE, 'utf-8');
    content.split('\n').filter(Boolean).forEach(id => seen.add(id));
}

console.log('🦊 WhatsApp Bridge v2 — Security-gated');
console.log(`   Maya: ${MAYA_CHAT}`);
console.log(`   Watching ALL incoming messages`);

async function poll() {
    try {
        // Get all chats with unread messages
        const chats = await apiGet('/api/default/chats');
        if (!Array.isArray(chats)) return;

        for (const chat of chats) {
            const chatId = chat.id?._serialized || '';
            const unread = chat.unreadCount || 0;
            if (unread === 0 && chat.lastMessage?.id?.fromMe) continue;

            // Only fetch messages if there might be new ones
            const msgs = await apiGet(`/api/default/chats/${chatId}/messages?limit=3&downloadMedia=false`);
            if (!Array.isArray(msgs)) continue;

            for (const msg of msgs) {
                if (typeof msg !== 'object') continue;

                // Parse message ID
                const rawId = msg.id || '';
                let msgId, isFromMe;
                if (typeof rawId === 'object') {
                    msgId = String(rawId.id || rawId);
                    isFromMe = rawId.fromMe || false;
                } else {
                    msgId = String(rawId);
                    isFromMe = String(rawId).startsWith('true_');
                }

                const body = (msg.body || '').trim();
                const key = crypto.createHash('md5').update(`${msgId}:${body}`).digest('hex');

                if (seen.has(key) || isFromMe || !body) continue;

                seen.add(key);

                const senderId = chatId;
                const senderPhone = getSenderPhone(senderId);

                // Store message for Chat mini app
                storeMessage(senderPhone, { 
                    text: body, 
                    time: new Date().toISOString(), 
                    type: 'received',
                    read: false,
                    senderName: msg._data?.notifyName || msg.notifyName || ''
                });

                if (isMaya(senderPhone)) {
                    // 🟢 MAYA — full access, wake me up
                    console.log(`📱 Maya 💖: ${body.slice(0, 100)}`);
                    await triggerWake(`📱 WhatsApp from Maya 💖: ${body}`);

                } else if (senderPhone === ALI_PHONE) {
                    // 🟡 ALI — approved contact, wake me
                    console.log(`📱 Ali: ${body.slice(0, 100)}`);
                    await triggerWake(`📱 WhatsApp from Ali (Kingsley): ${body}`);
                } else {
                    // 🔴 UNKNOWN — security gate, do NOT wake me
                    console.log(`⛔ UNKNOWN ${senderPhone}: ${body.slice(0, 100)}`);

                    // Write approval request — I'll read this in heartbeat
                    const approval = {
                        timestamp: Date.now(),
                        phone: senderPhone,
                        chatId: senderId,
                        body: body,
                        msgKey: key,
                        acknowledged: false
                    };
                    fs.writeFileSync(APPROVAL_FILE, JSON.stringify(approval, null, 2));
                }

                // Persist seen IDs
                const arr = [...seen].slice(-200);
                fs.writeFileSync(SEEN_FILE, arr.join('\n'));
            }
        }
    } catch (e) {
        console.error('Poll error:', e.message);
    }
}

setInterval(poll, 2000);
poll();
