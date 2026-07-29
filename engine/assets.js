// 资源清单：图片 id → { label, src }。src 为 null 时由 UI 渲染暗调占位。
import { bookPath } from './book.js';

let manifest = { images: {} };

export async function loadManifest() {
  try {
    const res = await fetch(bookPath('assets/manifest.json'), { cache: 'no-store' });
    if (res.ok) {
      manifest = await res.json();
      for (const image of Object.values(manifest.images || {})) {
        if (image?.src) image.src = bookPath(image.src);
      }
    }
  } catch {
    manifest = { images: {} };
  }
  if (!manifest.images) manifest.images = {};
  return manifest;
}

export function asset(id) {
  if (!id) return null;
  return manifest.images[id] || { id, label: id, src: null };
}

// 后台预热所有图片（背景优先），让进场/切场即时显示，避免网络加载途中的黑屏。
let prewarmed = false;
export function prewarmImages() {
  if (prewarmed) return;
  prewarmed = true;
  const srcs = Object.values(manifest.images).map((im) => im && im.src).filter(Boolean);
  const bg = srcs.filter((s) => /bg_/.test(s));
  const rest = srcs.filter((s) => !/bg_/.test(s));
  for (const src of [...bg, ...rest]) { const img = new Image(); img.src = src; }
}
