// 零依赖静态服务器，所有响应带 Cache-Control: no-store（开发期永远加载最新代码）。
// 用法：node scripts/serve.mjs --book <slug> [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertBookExists, parseBookArg } from './book-arg.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
let bookId;

try {
  bookId = parseBookArg(args);
  if (!bookId) throw new Error('缺少 --book');
  assertBookExists(root, bookId);
} catch (error) {
  console.error(`✗ ${error.message}`);
  console.error('用法：node scripts/serve.mjs --book <slug> [port]');
  process.exit(2);
}

const positional = args.filter((arg, index) => {
  if (arg === '--book') return false;
  if (index > 0 && args[index - 1] === '--book') return false;
  return !arg.startsWith('--book=');
});
const port = positional.length ? Number(positional[0]) : 8099;
if (positional.length > 1 || !Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('✗ 端口必须是 1–65535 的整数');
  console.error('用法：node scripts/serve.mjs --book <slug> [port]');
  process.exit(2);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
};

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p === '/') {
      res.writeHead(302, {
        'Location': `/play.html?book=${encodeURIComponent(bookId)}`,
        'Cache-Control': 'no-store',
      });
      return res.end();
    }
    if (p.endsWith('/')) p += 'index.html';
    const fp = join(root, normalize(p));
    if (!fp.startsWith(root)) { res.writeHead(403); return res.end('forbidden'); }
    const data = await readFile(fp);
    res.writeHead(200, {
      'Content-Type': MIME[extname(fp).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store, must-revalidate',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Cache-Control': 'no-store' });
    res.end('not found');
  }
}).listen(port, () => {
  console.log(`serving ${root}`);
  console.log(`→ http://localhost:${port}/play.html?book=${bookId}  (no-store, 永远最新)`);
});
