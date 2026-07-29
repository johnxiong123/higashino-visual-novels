// 菜单与弹层：标题 / 结局 / 章节末 / 存读档 / 设置 / 回想 / 结局画廊
import { el } from './dom.js';
import { asset } from '../engine/assets.js';
import { listSaves, saveGame, loadGame, getProgress } from '../engine/state.js';

const I = {
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 5l11 7-11 7z"/></svg>',
  cont: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12a8 8 0 1 1 2.4 5.6"/><path d="M4 19v-5h5"/></svg>',
  chapters: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>',
  gallery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l5-4 4 3 3-2 6 4"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.2 5.2l1.8 1.8M17 17l1.8 1.8M18.8 5.2L17 7M7 17l-1.8 1.8"/></svg>',
  power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v9"/><path d="M6.5 7a8 8 0 1 0 11 0"/></svg>',
};

export class Menus {
  constructor(root) { this.root = root; }

  closeAll() { this.root.innerHTML = ''; }

  _overlay(cls, children, { dismissable = false } = {}) {
    const card = el('div', { class: 'overlay-card ornate' }, [el('span', { class: 'frame' }), ...children]);
    const ov = el('div', { class: 'overlay ' + cls }, [card]);
    if (dismissable) ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
    this.root.appendChild(ov);
    return ov;
  }

  title(opts) {
    const {
      book, hasSave, save, progress, endings, slots, activeSlot,
      onStart, onContinue, onChapterSelect, onGallery, onSettings, onExit, onSlot,
    } = opts;
    this.closeAll();
    const ov = el('div', { class: 'overlay overlay-title' });
    if (book.coverUrl) ov.style.backgroundImage = `url("${book.coverUrl}")`;
    else ov.classList.add('overlay-title-ph');

    const item = (label, icon, handler, opt = {}) => {
      const primary = opt.cls === 'primary';
      const body = el('span', { class: 'title-item-body' }, [
        el('span', { class: 'title-item-label', text: label }),
        opt.sub ? el('span', { class: 'title-item-sub', text: opt.sub }) : null,
        opt.diamonds ? el('span', { class: 'title-progress' },
          Array.from({ length: opt.diamonds.total }, (_, k) => el('i', k < opt.diamonds.done ? { class: 'on' } : {}))) : null,
      ]);
      return el('button', {
        class: 'title-item' + (opt.cls ? ' ' + opt.cls : '') + (primary ? ' ornate' : ''), onclick: handler,
      }, [
        primary ? el('span', { class: 'frame' }) : null,
        el('span', { class: 'title-item-ic', html: icon }),
        body,
      ]);
    };

    const menu = el('div', { class: 'title-menu-right' }, [
      item('开始游戏', I.play, onStart, { cls: 'primary' }),
      hasSave ? item('继续游戏', I.cont, onContinue, { sub: save && save.sub }) : null,
      item('章节选择', I.chapters, onChapterSelect, { sub: progress && progress.sub, diamonds: progress && progress.diamonds }),
      onGallery ? item('结局画廊', I.gallery, onGallery, { sub: endings && endings.sub }) : null,
      item('设置', I.gear, onSettings),
      item('结束游戏', I.power, onExit),
      slots ? el('div', { class: 'title-slots' }, [
        el('span', { class: 'title-slots-label', text: '存档状态' }),
        ...['1', '2', '3'].map((s) => el('button', {
          class: 'slot-chip' + (String(activeSlot) === s ? ' active' : ''),
          text: '0' + s, onclick: () => onSlot && onSlot(s),
        })),
        el('span', { class: 'title-slots-arrow', text: '›' }),
      ]) : null,
    ]);

    ov.append(
      el('div', { class: 'title-headblock' }, [
        el('div', { class: 'title-brand', text: book.title }),
        el('div', { class: 'title-divider' }, [el('span', {})]),
        book.tagline ? el('div', { class: 'title-tagline', text: book.tagline }) : null,
      ]),
      menu,
      book.quote ? el('div', { class: 'title-quote ornate' }, [
        el('span', { class: 'frame' }),
        el('span', { text: book.quote }),
      ]) : null,
    );
    this.root.appendChild(ov);
  }

  chapterSelect(chapters, { onPick }) {
    const rows = chapters.map((c) => el('button', {
      class: 'chapter-row', onclick: () => { this.closeAll(); onPick(c.id); },
    }, [el('span', { class: 'chapter-row-title', text: c.title })]));
    this._overlay('overlay-chapters', [
      el('h3', { class: 'overlay-h', text: '章节选择' }),
      el('div', { class: 'chapter-list' }, rows),
      el('button', { class: 'menu-btn', text: '关闭', onclick: (e) => e.target.closest('.overlay')?.remove() }),
    ], { dismissable: true });
  }

  locations(state) {
    const names = [...(state.locations || [])].map((id) => asset(id)?.label || id);
    this._overlay('overlay-locations', [
      el('h3', { class: 'overlay-h', text: '已到访地点' }),
      el('div', { class: 'loc-list' }, names.length
        ? names.map((n) => el('div', { class: 'loc-row', text: n }))
        : [el('div', { class: 'clue-empty', text: '暂无' })]),
      el('button', { class: 'menu-btn', text: '关闭', onclick: (e) => e.target.closest('.overlay')?.remove() }),
    ], { dismissable: true });
  }

  exit() {
    this._overlay('overlay-exit', [
      el('h2', { class: 'end-title', text: '感谢游玩' }),
      el('p', { class: 'title-sub', text: '可以直接关闭此页面。' }),
      el('button', { class: 'menu-btn', text: '返回', onclick: (e) => e.target.closest('.overlay')?.remove() }),
    ], { dismissable: true });
  }

  ending(ending, { onTitle }) {
    const cg = ending.cg ? asset(ending.cg) : null;
    this._overlay('overlay-ending type-' + (ending.type || 'bad'), [
      cg ? (cg.src ? el('img', { class: 'end-visual', src: cg.src }) : el('div', { class: 'end-visual end-visual-ph', text: cg.label })) : null,
      el('div', { class: 'end-tag', text: ending.type === 'true' ? 'TRUE END' : ending.type === 'good' ? 'GOOD END' : ending.type === 'bad' ? 'BAD END' : 'END' }),
      el('h2', { class: 'end-title', text: ending.title }),
      el('div', { class: 'menu-btn primary', text: '返回标题', onclick: onTitle }),
    ]);
  }

  chapterEnd(chapter, { onTitle }) {
    this._overlay('overlay-chapter', [
      el('div', { class: 'chapter-mark', text: chapter.meta.title }),
      el('h2', { class: 'chapter-end-title', text: '—— 本章完 ——' }),
      el('div', { class: 'menu-btn primary', text: '返回标题', onclick: onTitle }),
    ]);
  }

  backlog(dialogue) {
    const rows = dialogue.backlog.map((l) =>
      el('div', { class: 'backlog-row' }, [
        el('span', { class: 'backlog-name', text: l.speaker || '' }),
        el('span', { class: 'backlog-text', text: l.text || '' }),
      ]));
    this._overlay('overlay-backlog', [
      el('h3', { class: 'overlay-h', text: '回想' }),
      el('div', { class: 'backlog-list' }, rows.length ? rows : [el('div', { class: 'clue-empty', text: '尚无对话' })]),
      el('button', { class: 'menu-btn', text: '关闭', onclick: (e) => e.target.closest('.overlay')?.remove() }),
    ], { dismissable: true });
  }

  // config: { get(): cfg, set(patch) }（main.js 注入，改动即持久化并整体重应用）
  // opts: { onSave?, onLoad?, onTitle? }（仅游戏内传入，标题画面不传）
  settings(config, opts = {}) {
    const c = config.get();
    const rangeIn = (min, max, value, step, onInput) => {
      const r = el('input', { type: 'range', min: String(min), max: String(max), value: String(value), step: String(step) });
      r.addEventListener('input', () => onInput(Number(r.value)));
      return r;
    };
    const checkIn = (checked, onChange) => {
      const cb = el('input', { type: 'checkbox' });
      cb.checked = !!checked;
      cb.addEventListener('change', () => onChange(cb.checked));
      return cb;
    };
    const row = (label, control) => el('label', { class: 'setting-row' }, [el('span', { text: label }), control]);
    const group = (title, rows) => el('div', { class: 'setting-group' }, [el('div', { class: 'setting-group-h', text: title }), ...rows]);

    const text = group('文本', [
      row('文字速度', rangeIn(4, 60, 70 - c.textSpeed, 2, (v) => config.set({ textSpeed: 70 - v }))),
      row('自动播放', checkIn(c.auto, (v) => config.set({ auto: v }))),
      row('自动播放速度', rangeIn(0, 100, c.autoSpeed, 5, (v) => config.set({ autoSpeed: v }))),
      row('快进（仅已读）', checkIn(c.skip, (v) => config.set({ skip: v }))),
    ]);
    const audio = group('音频', [
      row('背景音乐', rangeIn(0, 100, Math.round(c.bgmVol * 100), 5, (v) => config.set({ bgmVol: v / 100 }))),
      row('静音', checkIn(c.muted, (v) => config.set({ muted: v }))),
      row('文字音效音量', rangeIn(0, 100, Math.round(c.sfxVol * 100), 5, (v) => config.set({ sfxVol: v / 100 }))),
      row('文字音效', checkIn(c.sfxOn, (v) => config.set({ sfxOn: v }))),
    ]);

    const sys = [];
    if (opts.onSave) sys.push(el('button', { class: 'menu-btn sys-btn', text: '保存进度', onclick: opts.onSave }));
    if (opts.onLoad) sys.push(el('button', { class: 'menu-btn sys-btn', text: '读取进度', onclick: opts.onLoad }));
    if (opts.onTitle) sys.push(el('button', {
      class: 'menu-btn sys-btn danger', text: '返回标题',
      onclick: () => this.confirm('返回标题？未保存的进度将丢失。', { onYes: opts.onTitle, yesText: '返回标题' }),
    }));

    this._overlay('overlay-settings', [
      el('h3', { class: 'overlay-h', text: '设置' }),
      text,
      audio,
      sys.length ? group('系统', sys) : null,
      el('button', { class: 'menu-btn', text: '关闭', onclick: (e) => e.target.closest('.overlay')?.remove() }),
    ], { dismissable: true });
  }

  // 二次确认弹窗（返回标题/退出等破坏性操作）
  confirm(message, { onYes, yesText = '确定', noText = '取消' } = {}) {
    this._overlay('overlay-confirm', [
      el('div', { class: 'confirm-msg', text: message }),
      el('div', { class: 'confirm-actions' }, [
        el('button', { class: 'menu-btn', text: noText, onclick: (e) => e.target.closest('.overlay')?.remove() }),
        el('button', { class: 'menu-btn danger', text: yesText, onclick: (e) => { e.target.closest('.overlay')?.remove(); onYes && onYes(); } }),
      ]),
    ], { dismissable: true });
  }

  saveLoad(mode, { state, onLoaded }) {
    const slots = ['1', '2', '3'];
    const saves = Object.fromEntries(listSaves().map((s) => [s.slot, s]));
    const rows = slots.map((slot) => {
      const info = saves[slot];
      const thumbSrc = info && info.bg ? asset(info.bg)?.src : null;
      const thumb = thumbSrc
        ? el('div', { class: 'slot-thumb', style: `background-image:url("${thumbSrc}")` })
        : el('div', { class: 'slot-thumb empty', text: slot });
      const meta = el('div', { class: 'slot-meta' }, [
        el('div', { class: 'slot-name', text: '存档 ' + slot }),
        el('div', { class: 'slot-info', text: info ? (info.chapterTitle || info.node || '') : '（空档位）' }),
        el('div', { class: 'slot-time', text: info ? (info.at || '').slice(0, 16).replace('T', ' ') : '' }),
      ]);
      const canAct = mode === 'save' || !!info;
      return el('div', { class: 'slot-row' + (info ? '' : ' empty') }, [
        thumb, meta,
        canAct ? el('button', {
          class: 'menu-btn small',
          text: mode === 'save' ? '保存' : '读取',
          onclick: () => {
            if (mode === 'save') { saveGame(slot, state); this.saveLoad('save', { state, onLoaded }); }
            else { const s = loadGame(slot); if (s) { this.closeAll(); onLoaded(s); } }
          },
        }) : el('span', { class: 'slot-empty-tag', text: '空' }),
      ]);
    });
    this.root.querySelectorAll('.overlay-saveload').forEach((o) => o.remove());
    this._overlay('overlay-saveload', [
      el('h3', { class: 'overlay-h', text: mode === 'save' ? '保存进度' : '读取进度' }),
      el('div', { class: 'slot-list' }, rows),
      el('button', { class: 'menu-btn', text: '关闭', onclick: (e) => e.target.closest('.overlay')?.remove() }),
    ], { dismissable: true });
  }

  gallery(endingsData) {
    const unlocked = new Set(getProgress().endings);
    const cards = endingsData.map((e) => {
      const got = unlocked.has(e.id);
      return el('div', { class: 'gallery-card' + (got ? ' got' : '') }, [
        el('div', { class: 'gallery-tag', text: (e.type || '').toUpperCase() }),
        el('div', { class: 'gallery-title', text: got ? e.title : '？？？' }),
        el('div', { class: 'gallery-sum', text: got ? (e.summary || '') : '尚未解锁' }),
      ]);
    });
    this._overlay('overlay-gallery', [
      el('h3', { class: 'overlay-h', text: `结局画廊（${unlocked.size}/${endingsData.length}）` }),
      el('div', { class: 'gallery-grid' }, cards),
      el('button', { class: 'menu-btn', text: '关闭', onclick: (e) => e.target.closest('.overlay')?.remove() }),
    ], { dismissable: true });
  }
}
