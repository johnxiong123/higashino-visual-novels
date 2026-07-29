// 引擎单测（零依赖，node 直接运行）：条件求值 / 状态增量 / 存读档 round-trip
import assert from 'node:assert';
import { evalCondition } from '../engine/conditions.js';
import { GameState, saveGame, loadGame } from '../engine/state.js';
import { configureBook, bookPath } from '../engine/book.js';
import { loadManifest, asset } from '../engine/assets.js';
import { loadAudioManifest } from '../engine/audio.js';
import { loadChapter } from '../engine/story.js';

const BOOK = {
  id: 'test-book',
  title: '测试作品',
  start: 'ch01_001',
  chapters: [{ id: 'ch01', title: '第一章', start: 'ch01_001' }],
  vars: [
    { key: 'suspicion', label: 'A', init: 0, max: 10 },
    { key: 'resolve', label: 'B', init: 0, max: 10 },
    { key: 'trust', label: 'C', init: 0, max: 10 },
    { key: 'guilt', label: 'D', init: 0, max: 10 },
  ],
  initialState: { povUnlocked: ['pov-a'] },
};
configureBook(BOOK, 'books/test-book/');

let pass = 0;
let fail = 0;
function test(name, fn) {
  try { fn(); pass += 1; console.log('  ✓', name); }
  catch (e) { fail += 1; console.error('  ✗', name, '\n      ', e.message); }
}
async function testAsync(name, fn) {
  try { await fn(); pass += 1; console.log('  ✓', name); }
  catch (e) { fail += 1; console.error('  ✗', name, '\n      ', e.message); }
}

// ---- 条件求值 ----
test('空条件视为通过', () => {
  assert.equal(evalCondition(null, new GameState()), true);
});
test('flags 需全满足', () => {
  const s = new GameState(); s.setFlag('a');
  assert.equal(evalCondition({ flags: ['a'] }, s), true);
  assert.equal(evalCondition({ flags: ['a', 'b'] }, s), false);
});
test('notFlags 排除', () => {
  const s = new GameState();
  assert.equal(evalCondition({ notFlags: ['x'] }, s), true);
  s.setFlag('x');
  assert.equal(evalCondition({ notFlags: ['x'] }, s), false);
});
test('clues 需持有', () => {
  const s = new GameState(); s.unlockClue('k');
  assert.equal(evalCondition({ clues: ['k'] }, s), true);
  assert.equal(evalCondition({ clues: ['nope'] }, s), false);
});
test('vars 比较运算', () => {
  const s = new GameState(); s.setVar('suspicion', 3);
  assert.equal(evalCondition({ vars: { suspicion: { gte: 3 } } }, s), true);
  assert.equal(evalCondition({ vars: { suspicion: { lt: 3 } } }, s), false);
  assert.equal(evalCondition({ vars: { suspicion: 3 } }, s), true);
});
test('any / all / not 组合', () => {
  const s = new GameState(); s.setFlag('a');
  assert.equal(evalCondition({ any: [{ flags: ['a'] }, { flags: ['z'] }] }, s), true);
  assert.equal(evalCondition({ all: [{ flags: ['a'] }, { flags: ['z'] }] }, s), false);
  assert.equal(evalCondition({ not: { flags: ['z'] } }, s), true);
});

// ---- 效果应用 ----
test('applyEffects：状态增量 + 旗标 + 新线索', () => {
  const s = new GameState();
  const nc = s.applyEffects({ state: { suspicion: 2, guilt: 1 }, flags: ['murder_done'], clues: ['kotatsu_cord'] });
  assert.equal(s.getVar('suspicion'), 2);
  assert.equal(s.getVar('guilt'), 1);
  assert.equal(s.hasFlag('murder_done'), true);
  assert.equal(s.hasClue('kotatsu_cord'), true);
  assert.deepEqual(nc, ['kotatsu_cord']);
});
test('线索去重：已解锁不再计入新线索', () => {
  const s = new GameState();
  s.applyEffects({ clues: ['c1'] });
  const nc = s.applyEffects({ clues: ['c1', 'c2'] });
  assert.deepEqual(nc, ['c2']);
});
test('状态增量可叠加', () => {
  const s = new GameState();
  s.applyEffects({ state: { trust: 1 } });
  s.applyEffects({ state: { trust: 2 } });
  assert.equal(s.getVar('trust'), 3);
});
test('状态默认值来自 book.json', () => {
  configureBook({ ...BOOK, vars: [{ key: 'score', label: '分数', init: 3, max: 20 }] }, 'books/test-book/');
  const s = new GameState();
  assert.deepEqual(s.vars, { score: 3 });
  assert.deepEqual([...s.povUnlocked], ['pov-a']);
  configureBook(BOOK, 'books/test-book/');
});
test('作品资源路径统一使用书籍 base path', () => {
  assert.equal(bookPath('data/chapters/ch01.json'), 'books/test-book/data/chapters/ch01.json');
  assert.equal(bookPath('./assets/manifest.json'), 'books/test-book/assets/manifest.json');
});

// ---- 存读档 round-trip ----
test('存读档 round-trip 一致', () => {
  const s = new GameState();
  s.applyEffects({ state: { trust: 2 }, flags: ['ishigami_plan'], clues: ['movie_tickets'] });
  s.markVisited('ch01_001');
  s.markVisited('ch01_021');
  s.current = { chapter: 'ch01', node: 'ch01_030' };
  saveGame('t_unit', s);
  const r = loadGame('t_unit');
  assert.equal(r.getVar('trust'), 2);
  assert.equal(r.hasFlag('ishigami_plan'), true);
  assert.equal(r.hasClue('movie_tickets'), true);
  assert.equal(r.current.node, 'ch01_030');
  assert.equal(r.visited.has('ch01_001'), true);
  assert.equal(r.visited.has('ch01_021'), true);
});
test('读取不存在的存档返回 null', () => {
  assert.equal(loadGame('nonexistent_slot_zzz'), null);
});
test('不同作品的存档命名空间互不覆盖', () => {
  const first = new GameState();
  first.setVar('trust', 4);
  saveGame('shared', first);

  configureBook({ ...BOOK, id: 'another-book' }, 'books/another-book/');
  assert.equal(loadGame('shared'), null);
  const second = new GameState();
  second.setVar('trust', 1);
  saveGame('shared', second);
  assert.equal(loadGame('shared').getVar('trust'), 1);

  configureBook(BOOK, 'books/test-book/');
  assert.equal(loadGame('shared').getVar('trust'), 4);
});

await testAsync('清单、音频与章节加载都经作品 base path', async () => {
  const requested = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    requested.push(url);
    if (url.endsWith('assets/manifest.json')) {
      return { ok: true, json: async () => ({ images: { cover: { src: 'assets/images/cover.png' } } }) };
    }
    if (url.endsWith('assets/audio.json')) {
      return {
        ok: true,
        json: async () => ({
          tracks: { title: { src: 'assets/audio/title.mp3' } },
          sfx: { type: 'assets/audio/type.mp3' },
        }),
      };
    }
    if (url.endsWith('data/chapters/ch01.json')) {
      return { ok: true, json: async () => ({ meta: { id: 'ch01' }, nodes: {} }) };
    }
    return { ok: false, status: 404 };
  };

  try {
    await loadManifest();
    const audio = await loadAudioManifest();
    await loadChapter('ch01');
    assert.equal(asset('cover').src, 'books/test-book/assets/images/cover.png');
    assert.equal(audio.tracks.title.src, 'books/test-book/assets/audio/title.mp3');
    assert.equal(audio.sfx.type, 'books/test-book/assets/audio/type.mp3');
    assert.deepEqual(requested, [
      'books/test-book/assets/manifest.json',
      'books/test-book/assets/audio.json',
      'books/test-book/data/chapters/ch01.json',
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
