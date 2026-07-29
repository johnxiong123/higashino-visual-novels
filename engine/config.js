// 全局偏好配置：持久化到 localStorage（私密模式/Node 下退回内存）。
// 与单局存档（state.js）分离——这些是跨周目、跨会话的播放器偏好。

const KEY = 'vn:config';
const DEFAULTS = {
  textSpeed: 22,   // 每字毫秒（越小越快）
  auto: false,     // 自动播放
  autoSpeed: 50,   // 自动播放速度 0..100（越大停顿越短）
  skip: false,     // 快进（仅已读）
  bgmVol: 0.6,     // 背景音乐音量 0..1
  sfxVol: 0.5,     // 文字音效音量 0..1
  muted: false,    // BGM 静音
  sfxOn: true,     // 文字音效开关
};

let mem = null;
let cfg = { ...DEFAULTS };

function readRaw() {
  try { return window.localStorage.getItem(KEY); } catch { return mem; }
}
function writeRaw(v) {
  try { window.localStorage.setItem(KEY, v); } catch { mem = v; }
}

// 启动时调用一次：从存储读取并合并默认值
export function loadConfig() {
  const raw = readRaw();
  if (raw) { try { cfg = { ...DEFAULTS, ...JSON.parse(raw) }; } catch { /* 损坏则用默认 */ } }
  return cfg;
}

export function getConfig() { return cfg; }

// 局部更新并立即持久化
export function setConfig(patch) {
  cfg = { ...cfg, ...patch };
  writeRaw(JSON.stringify(cfg));
  return cfg;
}
