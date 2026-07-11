const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3847;

// Persistent sessions: sessionId -> { controller: ws, target: ws, name, created, lastSeen }
const sessions = new Map();

function createSession(name) {
  const id = crypto.randomBytes(4).toString('hex');
  sessions.set(id, { 
    controller: null, 
    target: null, 
    name: name || 'Device ' + id.slice(0, 4), 
    created: Date.now(), 
    lastSeen: Date.now()
  });
  return id;
}

function serveStatic(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API: APK status (returns whether APK exists for android)
  if (url.pathname === '/api/apk_status' && req.method === 'GET') {
    const apkPath = path.join(__dirname, 'remote-widget.apk');
    fs.access(apkPath, fs.constants.F_OK, (err) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        has_apk: !err,
        url: err ? null : '/remote-widget.apk'
      }));
    });
    return;
  }

  // API: List all sessions
  if (url.pathname === '/api/sessions' && req.method === 'GET') {
    const list = [];
    sessions.forEach((s, id) => {
      list.push({
        id,
        name: s.name,
        connected: !!s.target,
        controller: !!s.controller,
        created: s.created,
        lastSeen: s.lastSeen
      });
    });
    list.sort((a, b) => b.created - a.created);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ sessions: list }));
    return;
  }

  // API: Create new session
  if (url.pathname === '/api/create' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      let name = 'Device';
      try { const j = JSON.parse(body); if (j.name) name = j.name; } catch {}
      const sessionId = createSession(name);
      const host = req.headers.host || 'remote.thenewworldorder.io';
      const connectUrl = `https://${host}/connect/${sessionId}`;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ sessionId, connectUrl, name }));
    });
    return;
  }

  // API: Delete a session
  if (url.pathname.match(/^\/api\/sessions\//) && req.method === 'DELETE') {
    const sid = url.pathname.split('/api/sessions/')[1];
    if (sessions.has(sid)) {
      const s = sessions.get(sid);
      if (s.target) s.target.close();
      if (s.controller) s.controller.close();
      sessions.delete(sid);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ deleted: true }));
    return;
  }

  // API: Session status
  if (url.pathname === '/api/status') {
    const sid = url.searchParams.get('s');
    if (!sid || !sessions.has(sid)) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }
    const s = sessions.get(sid);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      connected: !!s.target,
      controller: !!s.controller,
      name: s.name,
      created: s.created,
      lastSeen: s.lastSeen
    }));
    return;
  }

  // Serve pages
  if (url.pathname === '/' || url.pathname === '/admin.html') {
    serveStatic(res, path.join(__dirname, 'admin.html'), 'text/html');
  } else if (url.pathname.match(/^\/connect\//)) {
    serveStatic(res, path.join(__dirname, 'target.html'), 'text/html');
  } else if (url.pathname.match(/^\/control\//)) {
    serveStatic(res, path.join(__dirname, 'control.html'), 'text/html');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// WebSocket
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = url.pathname.match(/^\/ws\/([a-f0-9]+)\/(controller|target)$/);
  if (!match) { ws.close(4000, 'Invalid path'); return; }

  const sessionId = match[1];
  const role = match[2];

  if (!sessions.has(sessionId)) { ws.close(4004, 'Session expired'); return; }

  const session = sessions.get(sessionId);

  if (role === 'controller') {
    if (session.controller) session.controller.close();
    session.controller = ws;
    console.log(`[${sessionId}] Controller connected`);

    ws.on('message', (data) => {
      session.lastSeen = Date.now();
      const msg = data.toString();
      // Forward commands to target
      if (session.target && session.target.readyState === ws.OPEN) {
        session.target.send(msg);
      }
    });

    ws.on('close', () => {
      session.controller = null;
      console.log(`[${sessionId}] Controller disconnected`);
    });

  } else if (role === 'target') {
    if (session.target) session.target.close();
    session.target = ws;
    session.lastSeen = Date.now();
    console.log(`[${sessionId}] Target connected`);

    ws.on('message', (data) => {
      session.lastSeen = Date.now();
      const msg = data.toString();
      // Forward to controller
      if (session.controller && session.controller.readyState === ws.OPEN) {
        session.controller.send(msg);
      }
    });

    ws.on('close', () => {
      session.target = null;
      console.log(`[${sessionId}] Target disconnected`);
    });
  }
});

server.listen(PORT, () => {
  console.log(`Remote Control running on port ${PORT}`);
});
