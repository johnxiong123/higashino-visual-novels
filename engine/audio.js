// 背景音乐播放器：按曲目 id 循环播放，音量/静音控制。
// 每首曲子各持有一个 <audio preload="auto">，首次手势后全部预热，
// 之后切换只是 play/pause 已就绪的元素，基本瞬时。
// 音频文件缺失时静默（不报错）。曲目清单由作品资源包提供。
import { bookPath } from './book.js';

let manifest = { tracks: {} };
const els = {};        // id -> HTMLAudioElement（仅对有 src 的曲目创建）
let current = null;
let volume = 0.6;
let muted = false;
let warmed = false;

export async function loadAudioManifest() {
  try {
    const r = await fetch(bookPath('assets/audio.json'), { cache: 'no-store' });
    if (r.ok) {
      manifest = await r.json();
      for (const track of Object.values(manifest.tracks || {})) {
        if (track?.src) track.src = bookPath(track.src);
      }
      if (manifest.sfx?.type) manifest.sfx.type = bookPath(manifest.sfx.type);
    }
  } catch { /* 无清单则静默 */ }
  if (!manifest.tracks) manifest.tracks = {};
  return manifest;
}

function getEl(id) {
  const track = manifest.tracks[id];
  if (!track || !track.src) return null;
  let a = els[id];
  if (!a) {
    a = new Audio();
    a.loop = true;
    a.preload = 'auto';
    a.src = track.src;
    a.volume = muted ? 0 : volume;
    els[id] = a;
  }
  return a;
}

// 首次用户手势后调用：把所有有 src 的曲目预缓冲，消除切换时的现下载延迟
export function prewarm() {
  if (warmed) return;
  warmed = true;
  for (const id of Object.keys(manifest.tracks)) {
    const a = getEl(id);
    if (a && id !== current) { try { a.load(); } catch { /* 忽略 */ } }
  }
}

// 切换并播放曲目；曲目无 src 时停止（静默）
export function playTrack(id) {
  if (current && current !== id && els[current]) els[current].pause();
  current = id;
  const a = getEl(id);
  if (!a) return;
  a.volume = muted ? 0 : volume;
  if (a.paused) a.play().catch(() => { /* 自动播放被拦截，待用户手势后 resume() */ });
}

export function stop() { if (current && els[current]) els[current].pause(); }

// 用户首次交互后调用：补放被浏览器拦截的自动播放，并预热其余曲目
export function resume() {
  const a = current && els[current];
  if (a && a.paused) a.play().catch(() => {});
  prewarm();
}

export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  for (const id of Object.keys(els)) els[id].volume = muted ? 0 : volume;
}
export function getVolume() { return volume; }
export function setMuted(m) {
  muted = !!m;
  for (const id of Object.keys(els)) els[id].volume = muted ? 0 : volume;
}
export function isMuted() { return muted; }
