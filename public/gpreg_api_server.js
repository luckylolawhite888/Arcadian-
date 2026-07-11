const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 18023;
const DATA_FILE = path.join(__dirname, 'gpreg_data.json');

// Initialize with embedded data
const defaultData = [
  {"name":"James Jones","dob":"09/04/1986","postcode":"NW10 8SB","gpreg":"GPREG-763194-00000810","status":"done","date":"2026-05-07"},
  {"name":"William Roberts","dob":"14/10/1993","postcode":"NW10 8SB","gpreg":"GPREG-763194-00000811","status":"done","date":"2026-05-07"},
  {"name":"Maria Martinez","dob":"14/03/1987","postcode":"NW10 8SB","gpreg":"GPREG-763194-00000812","status":"done","date":"2026-05-07"},
  {"name":"Grace Wright","dob":"21/11/1980","postcode":"NW10 8SB","gpreg":"GPREG-763194-00000813","status":"done","date":"2026-05-07"},
  {"name":"Charlie Baker","dob":"—","postcode":"NW10 8SB","gpreg":"GPREG-763194-00000814","status":"done","date":"2026-05-10"},
  {"name":"Mrs Poppy Wood","dob":"10/04/1974","postcode":"NW10 8SB","gpreg":"GPREG-763194-00000832","status":"done","date":"2026-05-22"}
];

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
}

function serveJSON(res, data, status=200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  if (req.method === 'OPTIONS') {
    serveJSON(res, {ok: true});
    return;
  }
  
  if (req.method === 'GET' && url.pathname === '/entries') {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    serveJSON(res, data);
    return;
  }
  
  if (req.method === 'POST' && url.pathname === '/entries') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const entry = JSON.parse(body);
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      entry.id = data.length + 1;
      entry.created_at = new Date().toISOString();
      data.push(entry);
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      serveJSON(res, {ok: true, id: entry.id}, 201);
    });
    return;
  }
  
  if (req.method === 'DELETE' && url.pathname.startsWith('/entries/')) {
    const id = parseInt(url.pathname.split('/')[2]);
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data = data.filter(d => d.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    serveJSON(res, {ok: true});
    return;
  }
  
  serveJSON(res, {error: 'not found'}, 404);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`GPREG API running on port ${PORT}`);
});
