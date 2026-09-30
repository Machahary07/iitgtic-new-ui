import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REDIRECTS } from './public/js/redirects.js';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || 'localhost';
const PUBLIC_DIR = resolve(fileURLToPath(new URL('./public', import.meta.url)));
const INDEX_HTML = join(PUBLIC_DIR, 'index.html');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

// Small JSON API — add routes here.
const apiRoutes = {
  'GET /api/health': (_req, res) =>
    send(res, 200, JSON.stringify({ status: 'ok', time: new Date().toISOString() }), MIME_TYPES['.json']),
};

async function serveStatic(pathname, res) {
  // Resolve inside PUBLIC_DIR and block path traversal.
  const filePath = normalize(join(PUBLIC_DIR, decodeURIComponent(pathname)));
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + sep)) return send(res, 403, 'Forbidden');

  let target = filePath;
  try {
    const info = await stat(target);
    if (info.isDirectory()) target = join(target, 'index.html');
    const data = await readFile(target);
    send(res, 200, data, MIME_TYPES[extname(target).toLowerCase()] || 'application/octet-stream');
  } catch {
    // Extensionless paths are app routes: serve the SPA shell and let the client router handle them.
    if (!extname(pathname)) return send(res, 200, await readFile(INDEX_HTML), MIME_TYPES['.html']);
    send(res, 404, 'Not Found');
  }
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const handler = apiRoutes[`${req.method} ${pathname}`];

  try {
    if (handler) return await handler(req, res);
    if (pathname.startsWith('/api/')) return send(res, 404, JSON.stringify({ error: 'Not Found' }), MIME_TYPES['.json']);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method Not Allowed');
    if (REDIRECTS[pathname]) {
      res.writeHead(302, { Location: REDIRECTS[pathname] });
      return res.end();
    }
    await serveStatic(pathname, res);
  } catch (err) {
    console.error(err);
    send(res, 500, 'Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`iitgtic-new-ui running at http://${HOST}:${PORT}`);
});
