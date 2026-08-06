// 扫描指定作品的 assets/images/（含子文件夹），把对应资产的 src 回填进清单。
// 用法：node scripts/sync-manifest.mjs --book <slug>
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, extname, basename } from 'node:path';
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
  console.error('用法：node scripts/sync-manifest.mjs --book <slug>');
  process.exit(2);
}

const bookRoot = join(root, 'books', bookId);
const manifestPath = join(bookRoot, 'assets/manifest.json');
const imagesDir = join(bookRoot, 'assets/images');
const EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (EXTS.has(extname(name).toLowerCase())) out.push(path);
  }
  return out;
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error(`✗ 无法读取 ${bookId} 的 assets/manifest.json：${error.message}`);
  process.exit(1);
}

const files = walk(imagesDir);
const byId = new Map();
for (const path of files) {
  const id = basename(path, extname(path));
  const src = relative(bookRoot, path).split(/[\\/]/).join('/');
  byId.set(id, src);
}

let updated = 0;
let matched = 0;
const missing = [];
for (const id of Object.keys(manifest.images || {})) {
  const src = byId.get(id);
  if (src) {
    matched += 1;
    if (manifest.images[id].src !== src) {
      manifest.images[id].src = src;
      updated += 1;
    }
  } else {
    missing.push(id);
  }
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`匹配 ${matched} / ${Object.keys(manifest.images || {}).length} 项，更新 ${updated} 个 src（扫描到 ${files.length} 个图片，含子文件夹）`);
if (missing.length) console.log(`未找到图片的资产（仍用占位）：${missing.join(', ')}`);
