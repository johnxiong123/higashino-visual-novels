// 当前作品的运行时契约。引擎只通过这里读取 book.json 与作品内资源路径。

let currentBook = null;
let currentBasePath = null;

function assertBook(book) {
  if (!book || typeof book !== 'object') throw new Error('book.json 必须是对象');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(book.id || '')) throw new Error('book.id 必须是安全的 slug');
  if (!book.title || !book.start) throw new Error('book.json 缺少 title 或 start');
  if (!Array.isArray(book.chapters) || !book.chapters.length) throw new Error('book.json 缺少 chapters');
  if (!Array.isArray(book.vars)) throw new Error('book.json 的 vars 必须是数组');

  const chapterIds = new Set();
  for (const chapter of book.chapters) {
    if (!chapter?.id || !chapter?.title || !chapter?.start) throw new Error('chapters 项缺少 id、title 或 start');
    if (chapterIds.has(chapter.id)) throw new Error(`章节 id 重复：${chapter.id}`);
    chapterIds.add(chapter.id);
  }

  const varKeys = new Set();
  for (const variable of book.vars) {
    if (!variable?.key || !variable?.label) throw new Error('vars 项缺少 key 或 label');
    if (varKeys.has(variable.key)) throw new Error(`状态变量 key 重复：${variable.key}`);
    varKeys.add(variable.key);
  }
}

export function configureBook(book, basePath = `books/${book?.id || ''}/`) {
  assertBook(book);
  currentBook = Object.freeze({
    ...book,
    features: {
      clues: true,
      flowchart: true,
      pov: true,
      ...(book.features || {}),
    },
  });
  currentBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return currentBook;
}

export async function loadBook(bookId) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(bookId || '')) throw new Error('URL 中缺少有效的 book 参数');
  const basePath = `books/${bookId}/`;
  const response = await fetch(`${basePath}book.json`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`无法加载作品 ${bookId}: ${response.status}`);
  const book = await response.json();
  if (book.id !== bookId) throw new Error(`book.id "${book.id}" 与 URL "${bookId}" 不一致`);
  return configureBook(book, basePath);
}

export function getBook() {
  if (!currentBook) throw new Error('作品尚未加载');
  return currentBook;
}

export function bookPath(path = '') {
  getBook();
  const relative = String(path).replace(/^\.?\//, '');
  return `${currentBasePath}${relative}`;
}
