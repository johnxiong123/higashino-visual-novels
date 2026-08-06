// 校验作品契约、剧情图、内容引用、文件资源，并模拟所有可选路线。
// 用法：node scripts/validate-story.mjs --book <slug>
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configureBook } from '../engine/book.js';
import { GameState } from '../engine/state.js';
import { evalCondition } from '../engine/conditions.js';
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
  console.error('用法：node scripts/validate-story.mjs --book <slug>');
  process.exit(2);
}

const base = join(root, 'books', bookId);
const read = (relative) => JSON.parse(readFileSync(join(base, relative), 'utf8'));
const errors = [];
const warns = [];

let book;
try {
  book = read('book.json');
  configureBook(book, `books/${bookId}/`);
} catch (error) {
  console.error(`✗ book.json 无效：${error.message}`);
  process.exit(1);
}

if (book.id !== bookId) errors.push(`book.id "${book.id}" 与参数 "${bookId}" 不一致`);
if (!existsSync(join(base, book.theme || 'theme.css'))) errors.push(`主题文件 "${book.theme || 'theme.css'}" 不存在`);
if (book.cover && !existsSync(join(base, book.cover))) errors.push(`封面文件 "${book.cover}" 不存在`);

const manifest = read('assets/manifest.json');
const assetIds = new Set(Object.keys(manifest.images || {}));
for (const [id, image] of Object.entries(manifest.images || {})) {
  if (image?.src && !existsSync(join(base, image.src))) errors.push(`资源 "${id}" 文件不存在：${image.src}`);
}

const audio = read('assets/audio.json');
for (const [id, track] of Object.entries(audio.tracks || {})) {
  if (track?.src && !existsSync(join(base, track.src))) errors.push(`音频 "${id}" 文件不存在：${track.src}`);
}
if (audio.sfx?.type && !existsSync(join(base, audio.sfx.type))) errors.push(`音效文件不存在：${audio.sfx.type}`);

const clues = read('data/clues.json');
const endings = read('data/endings.json');
const clueIds = new Set(clues.map((item) => item.id));
const endingIds = new Set(endings.map((item) => item.id));
const varKeys = new Set(book.vars.map((item) => item.key));
const chapterConfig = new Map(book.chapters.map((item) => [item.id, item]));

const chaptersDir = join(base, 'data/chapters');
const files = readdirSync(chaptersDir).filter((file) => file.endsWith('.json')).sort();
const chapters = {};
for (const file of files) {
  try {
    chapters[file.replace('.json', '')] = read(`data/chapters/${file}`);
  } catch (error) {
    errors.push(`${file}: JSON 解析失败 - ${error.message}`);
  }
}

for (const chapter of book.chapters) {
  if (!chapters[chapter.id]) errors.push(`book.json 章节 "${chapter.id}" 缺少数据文件`);
  if (!chapter.start) errors.push(`book.json 章节 "${chapter.id}" 缺少 start`);
}
for (const chapterId of Object.keys(chapters)) {
  if (!chapterConfig.has(chapterId)) warns.push(`章节文件 "${chapterId}" 未登记到 book.json`);
}

const nodes = new Map();
for (const [chapterId, chapter] of Object.entries(chapters)) {
  for (const [nodeId, node] of Object.entries(chapter.nodes || {})) {
    if (nodes.has(nodeId)) errors.push(`节点 id 重复：${nodeId}`);
    nodes.set(nodeId, { chapterId, node });
  }
}

function validateCondition(condition, where) {
  if (!condition) return;
  const allowed = new Set(['all', 'any', 'not', 'flags', 'notFlags', 'clues', 'vars']);
  for (const key of Object.keys(condition)) {
    if (!allowed.has(key)) errors.push(`${where}: 未知条件字段 "${key}"`);
  }
  for (const key of Object.keys(condition.vars || {})) {
    if (!varKeys.has(key)) errors.push(`${where}: 条件引用未定义状态变量 "${key}"`);
  }
  for (const child of condition.any || []) validateCondition(child, where);
  for (const child of condition.all || []) validateCondition(child, where);
  if (condition.not) validateCondition(condition.not, where);
}

function validateEffects(effects, where) {
  for (const key of Object.keys(effects?.state || {})) {
    if (!varKeys.has(key)) errors.push(`${where}: 效果引用未定义状态变量 "${key}"`);
  }
  for (const clue of effects?.clues || []) {
    if (!clueIds.has(clue)) errors.push(`${where}: 线索 "${clue}" 未定义`);
  }
}

for (const [chapterId, chapter] of Object.entries(chapters)) {
  if (chapter.meta?.id !== chapterId) warns.push(`${chapterId}: meta.id="${chapter.meta?.id}" 与文件名不一致`);
  if (!chapter.nodes?.[chapter.start]) errors.push(`${chapterId}: start 节点 "${chapter.start}" 不存在`);
  if (chapterConfig.get(chapterId)?.start !== chapter.start) {
    errors.push(`${chapterId}: book.json start 与章节 start 不一致`);
  }

  for (const [nodeId, node] of Object.entries(chapter.nodes || {})) {
    const where = `${chapterId}/${nodeId}`;
    if (!new RegExp(`^${chapterId}_`).test(nodeId)) errors.push(`${where}: 节点 id 必须以 "${chapterId}_" 开头`);
    if (node.bg && !assetIds.has(node.bg)) errors.push(`${where}: bg "${node.bg}" 不在 manifest`);
    if (node.cg && !assetIds.has(node.cg)) errors.push(`${where}: cg "${node.cg}" 不在 manifest`);
    validateEffects(node.onEnter, `${where}/onEnter`);

    const targets = [];
    if (node.next) targets.push(node.next);
    for (const choice of node.choices || []) {
      if (choice.goto) targets.push(choice.goto);
      else errors.push(`${where}: choice 缺少 goto`);
      validateCondition(choice.requires, `${where}/choice`);
      validateEffects(choice.effects, `${where}/choice`);
    }
    for (const branch of node.branches || []) {
      if (branch.goto) targets.push(branch.goto);
      else errors.push(`${where}: branch 缺少 goto`);
      validateCondition(branch.requires, `${where}/branch`);
    }
    for (const target of targets) {
      if (!nodes.has(target)) errors.push(`${where}: 跳转目标 "${target}" 不存在`);
    }

    if (node.ending && !endingIds.has(node.ending.id)) errors.push(`${where}: ending "${node.ending.id}" 不在 endings.json`);
    const exits = Number(Boolean(node.next))
      + Number(Boolean(node.choices?.length))
      + Number(Boolean(node.branches?.length))
      + Number(Boolean(node.ending))
      + Number(Boolean(node.chapterEnd));
    if (exits === 0) errors.push(`${where}: 节点没有任何出口`);
  }
}

function cloneState(state) {
  return GameState.fromJSON(state.toJSON());
}

const queue = [{ nodeId: book.start, state: new GameState() }];
const seen = new Set();
const reachableNodes = new Set();
const reachableChapters = new Set();
const reachableEndings = new Set();

while (queue.length) {
  const { nodeId, state } = queue.shift();
  const entry = nodes.get(nodeId);
  if (!entry) continue;

  const signature = JSON.stringify([nodeId, state.toJSON()]);
  if (seen.has(signature)) continue;
  seen.add(signature);
  reachableNodes.add(nodeId);
  reachableChapters.add(entry.chapterId);

  const { node } = entry;
  state.applyEffects(node.onEnter);
  if (node.ending) {
    reachableEndings.add(node.ending.id);
    continue;
  }
  if (node.branches?.length) {
    const branch = node.branches.find((item) => evalCondition(item.requires, state))
      || node.branches[node.branches.length - 1];
    queue.push({ nodeId: branch.goto, state });
    continue;
  }
  if (node.choices?.length) {
    for (const choice of node.choices.filter((item) => evalCondition(item.requires, state))) {
      const nextState = cloneState(state);
      nextState.applyEffects(choice.effects);
      queue.push({ nodeId: choice.goto, state: nextState });
    }
    continue;
  }
  if (node.next) queue.push({ nodeId: node.next, state });
}

for (const chapter of book.chapters) {
  if (!reachableChapters.has(chapter.id)) errors.push(`从 book.start 无法到达章节 "${chapter.id}"`);
}
for (const ending of endings) {
  if (!reachableEndings.has(ending.id)) errors.push(`从 book.start 无法实际到达结局 "${ending.id}"`);
}

console.log(`作品: ${book.title} (${book.id})`);
console.log(`章节: ${files.join(', ')}`);
console.log(`节点: ${nodes.size}（路线模拟覆盖 ${reachableNodes.size}） | 资源: ${assetIds.size} | 线索: ${clueIds.size}`);
console.log(`结局: ${[...reachableEndings].join(', ')}（${reachableEndings.size}/${endingIds.size}）`);
if (warns.length) console.log(`\n⚠ 警告:\n  ${warns.join('\n  ')}`);
if (errors.length) {
  console.error(`\n✗ 错误:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log('\n✓ 作品契约、引用、文件与可达路线全部有效');
