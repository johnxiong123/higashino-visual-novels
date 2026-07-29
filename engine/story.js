// 章节加载与节点查找（数据驱动；章节即数据文件）
import { bookPath, getBook } from './book.js';

const cache = new Map();

export function chapterIdOf(nodeId) {
  const m = /^(ch\d+)_/.exec(nodeId || '');
  return m ? m[1] : null;
}

export async function loadChapter(id) {
  const cacheKey = `${getBook().id}:${id}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const res = await fetch(bookPath(`data/chapters/${id}.json`), { cache: 'no-store' });
  if (!res.ok) throw new Error(`无法加载章节 ${id}: ${res.status}`);
  const data = await res.json();
  cache.set(cacheKey, data);
  return data;
}

export function getNode(chapter, nodeId) {
  const node = chapter.nodes[nodeId];
  if (!node) throw new Error(`节点不存在: ${nodeId}`);
  return node;
}

// 章节内节点的作者顺序（流程图时间线用）
export function nodeOrder(chapter) {
  return Object.keys(chapter.nodes);
}
