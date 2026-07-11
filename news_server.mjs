import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const PORT = 18990;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  let path = req.url.split('?')[0];
  
  if (path === '/' || path === '/index.html') {
    // Serve v2 of the news site
    try {
      const data = await readFile(join(__dirname, 'news_site_v2.html'));
      res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(data);
    } catch (e) {
      res.writeHead(500);
      res.end('Error loading page');
    }
    return;
  }
  
  // Static files
  try {
    const filePath = join(__dirname, path);
    const data = await readFile(filePath);
    const ext = extname(path);
    res.writeHead(200, { 
      'Content-Type': MIME[ext] || 'text/plain',
      'Cache-Control': 'max-age=3600',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🦊 The Rundown server running on http://0.0.0.0:${PORT}`);
});
