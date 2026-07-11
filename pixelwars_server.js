// PixelWars MVP — Full Backend
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3456;
const DATA_DIR = '/root/pixelwars-server/data';
const CANVAS_SIZE = 500; // 500x500 grid for MVP
const DECAY_DAYS = 3;
const DECAY_PIXELS_PER_DAY = 2;
const FREE_TOKENS_ON_SIGNUP = 3;
const DAILY_BONUS_TOKENS = 3;
const EXPAND_COST = 1;
const ATTACK_COST = 2;
const ATTACK_CHANCE = 0.50;
const DEFEND_COST = 1;
const PROTECTION_HOURS = 24;
const SPEED_PLACE_COST = 1;
const SPEED_PLACE_COUNT = 5;
const REFERRAL_BONUS = 1;

// Ensure data dir
fs.mkdirSync(DATA_DIR, { recursive: true });

// In-memory state (persisted to disk periodically)
let state = { users: {}, canvas: {} };

// Load saved state
function loadState() {
  try {
    if (fs.existsSync(`${DATA_DIR}/state.json`)) {
      state = JSON.parse(fs.readFileSync(`${DATA_DIR}/state.json`, 'utf-8'));
      console.log('State loaded:', Object.keys(state.users).length, 'users');
    }
  } catch(e) { console.error('Load error:', e.message); }
}
loadState();

function saveState() {
  fs.writeFileSync(`${DATA_DIR}/state.json`, JSON.stringify(state), 'utf-8');
}

// Save every 30s
setInterval(saveState, 30000);

// Helper: get canvas for user (creates if not exists)
function getUserCanvas(username) {
  if (!state.canvas[username]) {
    state.canvas[username] = {};
  }
  return state.canvas[username];
}

// Auth token
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

// MIME types
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// Serve static frontend
const FRONTEND_DIR = path.join(__dirname, 'frontend');
fs.mkdirSync(FRONTEND_DIR, { recursive: true });

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// Parse JSON body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch(e) { resolve({}); }
    });
  });
}

// API Router
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const params = url.searchParams;

  // CORS for frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // API Routes
  if (pathname === '/api/register' && req.method === 'POST') {
    const body = await parseBody(req);
    const { username, password, logo } = body;
    if (!username || !password) {
      res.writeHead(400); res.end(JSON.stringify({ error: 'Username and password required' }));
      return;
    }
    if (state.users[username]) {
      res.writeHead(409); res.end(JSON.stringify({ error: 'Username taken' }));
      return;
    }

    const token = generateToken();
    state.users[username] = {
      username,
      password, // plaintext for MVP - hash later
      token,
      level: 1,
      xp: 0,
      tokens: FREE_TOKENS_ON_SIGNUP,
      lifetime_tokens: FREE_TOKENS_ON_SIGNUP,
      territory_size: 100, // 10x10 block in pixels
      canvas: getUserCanvas(username),
      logo: logo || null,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      streak_days: 1,
      pixels_owned: 100,
    };

    // Place initial territory (random position)
    const startX = Math.floor(Math.random() * (CANVAS_SIZE - 20)) + 5;
    const startY = Math.floor(Math.random() * (CANVAS_SIZE - 20)) + 5;
    const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
    state.users[username].color = color;
    state.users[username].startX = startX;
    state.users[username].startY = startY;

    // Claim initial pixels
    for (let x = startX; x < startX + 10 && x < CANVAS_SIZE; x++) {
      for (let y = startY; y < startY + 10 && y < CANVAS_SIZE; y++) {
        const key = `${x},${y}`;
        if (!state.canvas.__all__) state.canvas.__all__ = {};
        state.canvas.__all__[key] = { owner: username, color, updated: Date.now() };
      }
    }

    res.writeHead(201);
    res.end(JSON.stringify({ token, username, tokens: FREE_TOKENS_ON_SIGNUP, level: 1 }));
    saveState();
    return;
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const { username, password } = body;
    const user = state.users[username];
    if (!user || user.password !== password) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Invalid credentials' }));
      return;
    }
    // Streak check
    const lastLogin = new Date(user.last_login);
    const now = new Date();
    const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    if (daysDiff >= 1) {
      user.streak_days += 1;
      if (daysDiff >= DECAY_DAYS) {
        // Territory decay
        user.streak_days = 0;
        // Remove outer pixels
        let pixelsToRemove = DECAY_PIXELS_PER_DAY * (daysDiff - DECAY_DAYS + 1);
        const owned = Object.entries(state.canvas.__all__ || {})
          .filter(([k, v]) => v.owner === username);
        for (let i = 0; i < Math.min(pixelsToRemove, owned.length); i++) {
          const [key] = owned[i];
          delete state.canvas.__all__[key];
        }
        user.pixels_owned = Math.max(0, user.pixels_owned - pixelsToRemove);
      }
      // Daily bonus
      user.tokens += DAILY_BONUS_TOKENS;
      user.lifetime_tokens += DAILY_BONUS_TOKENS;
    }
    user.last_login = now.toISOString();
    user.token = generateToken();

    res.writeHead(200);
    res.end(JSON.stringify({
      token: user.token,
      username: user.username,
      tokens: user.tokens,
      level: user.level,
      xp: user.xp,
      streak: user.streak_days,
      pixels_owned: user.pixels_owned,
      startX: user.startX,
      startY: user.startY,
      color: user.color
    }));
    saveState();
    return;
  }

  if (pathname === '/api/canvas' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      canvas: state.canvas.__all__ || {},
      size: CANVAS_SIZE
    }));
    return;
  }

  if (pathname === '/api/watch-ad' && req.method === 'POST') {
    const body = await parseBody(req);
    const user = state.users[body.username];
    if (!user || user.token !== body.token) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    user.tokens += 1;
    user.lifetime_tokens += 1;
    user.xp += 1;
    if (user.xp >= user.level * 10) {
      user.level += 1;
      user.xp = 0;
    }
    res.writeHead(200);
    res.end(JSON.stringify({ tokens: user.tokens, level: user.level, xp: user.xp }));
    saveState();
    return;
  }

  if (pathname === '/api/expand' && req.method === 'POST') {
    const body = await parseBody(req);
    const user = state.users[body.username];
    if (!user || user.token !== body.token) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    if (user.tokens < EXPAND_COST) {
      res.writeHead(400); res.end(JSON.stringify({ error: 'Not enough tokens' }));
      return;
    }
    user.tokens -= EXPAND_COST;

    // Find a pixel adjacent to user's territory to claim
    const ownedPixels = Object.entries(state.canvas.__all__ || {})
      .filter(([k, v]) => v.owner === user.username);
    const claimed = new Set(Object.keys(state.canvas.__all__ || {}));

    let expanded = false;
    for (const [key] of ownedPixels) {
      const [x, y] = key.split(',').map(Number);
      const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        const nk = `${nx},${ny}`;
        if (nx >= 0 && nx < CANVAS_SIZE && ny >= 0 && ny < CANVAS_SIZE && !claimed.has(nk)) {
          state.canvas.__all__[nk] = { owner: user.username, color: user.color, updated: Date.now() };
          user.pixels_owned += 1;
          expanded = true;
          break;
        }
      }
      if (expanded) break;
    }

    res.writeHead(200);
    res.end(JSON.stringify({
      tokens: user.tokens,
      pixels_owned: user.pixels_owned,
      expanded,
      pixel: expanded ? { x: Object.keys(state.canvas.__all__).length } : null
    }));
    saveState();
    return;
  }

  if (pathname === '/api/attack' && req.method === 'POST') {
    const body = await parseBody(req);
    const user = state.users[body.username];
    if (!user || user.token !== body.token) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    if (user.tokens < ATTACK_COST) {
      res.writeHead(400); res.end(JSON.stringify({ error: 'Not enough tokens' }));
      return;
    }

    const { targetX, targetY } = body;
    const key = `${targetX},${targetY}`;
    const targetPixel = (state.canvas.__all__ || {})[key];
    if (!targetPixel || targetPixel.owner === user.username) {
      res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid target' }));
      return;
    }

    // Check protection
    if (targetPixel.protectedUntil && targetPixel.protectedUntil > Date.now()) {
      res.writeHead(400); res.end(JSON.stringify({ error: 'Pixel is protected' }));
      return;
    }

    user.tokens -= ATTACK_COST;
    const won = Math.random() < ATTACK_CHANCE;

    if (won) {
      targetPixel.owner = user.username;
      targetPixel.color = user.color;
      targetPixel.updated = Date.now();
      user.pixels_owned += 1;
      const oldOwner = state.users[targetPixel.owner];
      if (oldOwner) oldOwner.pixels_owned = Math.max(0, (oldOwner.pixels_owned || 1) - 1);
    }

    res.writeHead(200);
    res.end(JSON.stringify({ won, tokens: user.tokens, pixels_owned: user.pixels_owned }));
    saveState();
    return;
  }

  if (pathname === '/api/defend' && req.method === 'POST') {
    const body = await parseBody(req);
    const user = state.users[body.username];
    if (!user || user.token !== body.token) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    if (user.tokens < DEFEND_COST) {
      res.writeHead(400); res.end(JSON.stringify({ error: 'Not enough tokens' }));
      return;
    }
    user.tokens -= DEFEND_COST;
    const { pixelX, pixelY } = body;
    const key = `${pixelX},${pixelY}`;
    const pixel = (state.canvas.__all__ || {})[key];
    if (pixel && pixel.owner === user.username) {
      pixel.protectedUntil = Date.now() + PROTECTION_HOURS * 60 * 60 * 1000;
    }

    res.writeHead(200);
    res.end(JSON.stringify({ tokens: user.tokens }));
    saveState();
    return;
  }

  if (pathname === '/api/user' && req.method === 'GET') {
    const username = params.get('username');
    const token = params.get('token');
    const user = state.users[username];
    if (!user || user.token !== token) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    res.writeHead(200);
    res.end(JSON.stringify({
      username: user.username,
      tokens: user.tokens,
      level: user.level,
      xp: user.xp,
      streak: user.streak_days,
      pixels_owned: user.pixels_owned,
      startX: user.startX,
      startY: user.startY,
      color: user.color,
      logo: user.logo
    }));
    return;
  }

  if (pathname === '/api/leaderboard' && req.method === 'GET') {
    const sorted = Object.values(state.users)
      .sort((a, b) => (b.pixels_owned || 0) - (a.pixels_owned || 0))
      .slice(0, 20)
      .map(u => ({ username: u.username, pixels: u.pixels_owned, level: u.level }));
    res.writeHead(200);
    res.end(JSON.stringify(sorted));
    return;
  }

  if (pathname === '/api/stats' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      users: Object.keys(state.users).length,
      total_pixels: Object.keys(state.canvas.__all__ || {}).length,
      canvas_size: CANVAS_SIZE,
    }));
    return;
  }

  // Serve frontend
  let filePath = path.join(FRONTEND_DIR, pathname === '/' ? 'index.html' : pathname);
  if (fs.existsSync(filePath)) {
    serveFile(res, filePath);
  } else {
    // SPA fallback
    const indexPath = path.join(FRONTEND_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      serveFile(res, indexPath);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('PixelWars API server running');
    }
  }
});

server.listen(PORT, () => {
  console.log(`PixelWars MVP server running on port ${PORT}`);
  console.log(`Frontend dir: ${FRONTEND_DIR}`);
});
