import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configureBook } from '../engine/book.js';
import { evalCondition } from '../engine/conditions.js';
import { GameState } from '../engine/state.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;

function run(name, command, args, check) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  try {
    check(result);
    passed += 1;
    console.log('  ✓', name);
  } catch (error) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw error;
  }
}

run('validate-story 校验 suspect-x', 'node', [
  'scripts/validate-story.mjs',
  '--book',
  'suspect-x',
], (result) => {
  assert.equal(result.status, 0);
  assert.match(result.stdout, /作品: 嫌疑犯X的献身 \(suspect-x\)/);
  assert.match(result.stdout, /✓ 作品契约、引用、文件与可达路线全部有效/);
});

run('validate-story 校验 akui 并覆盖全部结局', 'node', [
  'scripts/validate-story.mjs',
  '--book',
  'akui',
], (result) => {
  assert.equal(result.status, 0);
  assert.match(result.stdout, /作品: 恶意 \(akui\)/);
  assert.match(result.stdout, /结局: .*TE_akui/);
  assert.match(result.stdout, /结局: .*ME_naibottom/);
  assert.match(result.stdout, /结局: .*BE_script/);
  assert.match(result.stdout, /（3\/3）/);
  assert.match(result.stdout, /✓ 作品契约、引用、文件与可达路线全部有效/);
});

function playAkui(choiceIndexes = {}) {
  const base = join(root, 'books/akui');
  const book = JSON.parse(readFileSync(join(base, 'book.json'), 'utf8'));
  configureBook(book, 'books/akui/');
  const chapters = Object.fromEntries(book.chapters.map(({ id }) => [
    id,
    JSON.parse(readFileSync(join(base, `data/chapters/${id}.json`), 'utf8')),
  ]));
  const nodes = new Map(Object.values(chapters).flatMap(({ nodes: chapterNodes }) => Object.entries(chapterNodes)));
  const state = new GameState();
  const visited = [];
  let nodeId = book.start;

  while (nodeId) {
    const node = nodes.get(nodeId);
    assert.ok(node, `路线节点存在：${nodeId}`);
    visited.push(nodeId);
    state.applyEffects(node.onEnter);
    if (node.ending) return { ending: node.ending.id, visited };
    if (node.branches?.length) {
      nodeId = (node.branches.find((branch) => evalCondition(branch.requires, state))
        || node.branches.at(-1)).goto;
      continue;
    }
    if (node.choices?.length) {
      const choice = node.choices[choiceIndexes[nodeId] ?? 0];
      state.applyEffects(choice.effects);
      nodeId = choice.goto;
      continue;
    }
    nodeId = node.next;
  }
  throw new Error('路线未抵达结局');
}

const beRoute = playAkui();
assert.equal(beRoute.ending, 'BE_script');
assert.ok(!beRoute.visited.includes('ch07_003'), 'BE 不应提前拆穿代笔剧本');

const meRoute = playAkui({
  ch02_003: 1,
  ch03_004: 1,
  ch04_009: 1,
  ch05_003: 1,
  ch06_003: 1,
  ch06_007: 1,
  ch06_009: 1,
  ch06_012: 1,
});
assert.equal(meRoute.ending, 'ME_naibottom');
assert.ok(meRoute.visited.includes('ch07_003'), 'ME 应拆穿代笔剧本');
assert.ok(!meRoute.visited.includes('ch07_008'), 'ME 不应进入真正动机陈述');
assert.ok(!meRoute.visited.includes('ch07_005'), 'ME 即使高执念也不应进入 TE 教鞭间章');

const teRoute = playAkui({ ch02_003: 1, ch04_009: 1, ch05_003: 1 });
assert.equal(teRoute.ending, 'TE_akui');
assert.ok(teRoute.visited.includes('ch07_008'), 'TE 应进入真正动机陈述');
assert.ok(teRoute.visited.includes('ch07_005'), 'TE 高执念路线应解锁教鞭间章');
passed += 3;
console.log('  ✓ akui 的 BE / ME / TE 保持三层真相边界');

run('sync-manifest 对 suspect-x 幂等', 'node', [
  'scripts/sync-manifest.mjs',
  '--book=suspect-x',
], (result) => {
  assert.equal(result.status, 0);
  assert.equal(
    result.stdout,
    '匹配 29 / 29 项，更新 0 个 src（扫描到 29 个图片，含子文件夹）\n',
  );
});

for (const script of ['validate-story.mjs', 'sync-manifest.mjs', 'serve.mjs']) {
  run(`${script} 拒绝越界 book slug`, 'node', [
    `scripts/${script}`,
    '--book',
    '../suspect-x',
  ], (result) => {
    assert.equal(result.status, 2);
    assert.match(result.stderr, /--book 必须是由小写字母、数字和连字符组成的 slug/);
  });
}

async function freePort() {
  const probe = createServer();
  await new Promise((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', resolve);
  });
  const { port } = probe.address();
  await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
  return port;
}

const port = await freePort();
const server = spawn('node', [
  'scripts/serve.mjs',
  '--book',
  'suspect-x',
  String(port),
], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });

let serverOutput = '';
server.stdout.setEncoding('utf8');
server.stderr.setEncoding('utf8');
server.stdout.on('data', (chunk) => { serverOutput += chunk; });
server.stderr.on('data', (chunk) => { serverOutput += chunk; });

try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`serve 启动超时\n${serverOutput}`)), 5000);
    server.stdout.on('data', () => {
      if (serverOutput.includes(`localhost:${port}`)) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`serve 提前退出 (${code})\n${serverOutput}`));
    });
  });

  const redirect = await fetch(`http://127.0.0.1:${port}/`, { redirect: 'manual' });
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get('location'), '/play.html?book=suspect-x');

  const player = await fetch(`http://127.0.0.1:${port}/play.html?book=suspect-x`);
  assert.equal(player.status, 200);
  assert.match(await player.text(), /<script type="module" src="main\.js"><\/script>/);
  passed += 1;
  console.log('  ✓ serve 为 suspect-x 提供可打开的播放器 URL');
} finally {
  if (server.exitCode === null) {
    server.kill('SIGTERM');
    await new Promise((resolve) => server.once('exit', resolve));
  }
}

console.log(`\n${passed} passed`);
