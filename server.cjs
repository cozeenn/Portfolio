const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 5500;

// Load local development variables without adding a dependency.
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (!match || match[1].startsWith('#')) return;
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
    if (!process.env[match[1]]) process.env[match[1]] = value;
  });
}

const chatHandler = require('./api/chat.js');
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
  '.json': 'application/json; charset=utf-8'
};

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 20_000) request.destroy();
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === '/api/chat') {
    try {
      request.body = request.method === 'POST' ? JSON.parse((await readBody(request)) || '{}') : {};
      await chatHandler(request, response);
    } catch {
      response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: 'Invalid request.' }));
    }
    return;
  }

  const relativePath = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);
  if (!(filePath === root || filePath.startsWith(`${root}${path.sep}`)) || filePath.includes(`${path.sep}.env`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    const status = error ? (error.code === 'ENOENT' ? 404 : 500) : 200;
    if (error) {
      response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    } else {
      response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
      response.end(data);
    }
    console.log(`[${new Date().toLocaleTimeString()}] ${request.method} ${url.pathname} -> ${status}`);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Portfolio + Groq chat LIVE at http://localhost:${port}`);
  console.log(`Groq status: ${process.env.GROQ_API_KEY ? 'configured' : 'missing GROQ_API_KEY'}`);
});
