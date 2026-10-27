// Мінімальний статичний сервер для Railway: без сторонніх залежностей,
// із заголовками безпеки. Віддає зібраний застосунок з папки dist/.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('./dist', import.meta.url)));
const PORT = Number(process.env.PORT) || 3000;
// Адреса майбутнього API (якщо буде). Потрапляє в connect-src.
const API_ORIGIN = process.env.VITE_API_URL ? new URL(process.env.VITE_API_URL).origin : '';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://telegram.org",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // https: — для аватарки користувача Telegram і фото товарів з CDN у майбутньому
  "img-src 'self' data: blob: https:",
  `connect-src 'self'${API_ORIGIN ? ' ' + API_ORIGIN : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Вбудовувати сторінку дозволено лише вебверсіям Telegram
  "frame-ancestors https://web.telegram.org https://*.telegram.org",
].join('; ');

const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

async function fileFor(urlPath) {
  let rel;
  try {
    rel = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }
  // Захист від виходу за межі dist/ (../ тощо)
  const full = normalize(join(ROOT, rel));
  if (full !== ROOT && !full.startsWith(ROOT + sep)) return null;
  try {
    const s = await stat(full);
    if (s.isFile()) return full;
    if (s.isDirectory()) {
      const idx = join(full, 'index.html');
      if ((await stat(idx)).isFile()) return idx;
    }
  } catch {
    /* файл не знайдено */
  }
  return undefined;
}

const server = createServer(async (req, res) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let file = await fileFor(req.url || '/');
  if (file === null) {
    res.writeHead(400).end('Bad request');
    return;
  }
  // Застосунок односторінковий: невідомі шляхи без розширення ведуть на index.html
  if (file === undefined) {
    if (extname(req.url || '')) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Не знайдено');
      return;
    }
    file = join(ROOT, 'index.html');
  }

  try {
    const body = await readFile(file);
    const isAsset = file.includes(`${sep}assets${sep}`);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': body.length,
      // Файли з хешем у назві кешуються назавжди, index.html — завжди свіжий
      'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500).end();
  }
});

server.listen(PORT, '0.0.0.0', () => console.log(`КРАМ: http://0.0.0.0:${PORT}`));
