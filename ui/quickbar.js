// 对话时的常驻快捷条（VN 标准）：自动 / 快进 / 存档 / 读取。
// 自动·快进为开关，点亮表示当前已开启。
import { el } from './dom.js';

const IC = {
  auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg>',
  skip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l7 7-7 7z" fill="currentColor" stroke="none"/><path d="M13 5l7 7-7 7z" fill="currentColor" stroke="none"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h7V3"/><rect x="8" y="13" width="8" height="5"/></svg>',
  load: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h6l2 2h10v10H3z"/><path d="M12 16v-5M9.5 13.5L12 11l2.5 2.5"/></svg>',
};
const ITEMS = [
  ['auto', '自动', true],
  ['skip', '快进', true],
  ['save', '存档', false],
  ['load', '读取', false],
];

export class QuickBar {
  constructor(root, handlers = {}) {
    this.root = root;
    this.h = handlers;
    this.btns = {};
    ITEMS.forEach(([key, label, toggle]) => {
      const b = el('button', {
        class: 'qm-btn' + (toggle ? ' qm-toggle' : ''), 'data-key': key, title: label,
        onclick: () => this.h[key] && this.h[key](),
      }, [
        el('span', { class: 'qm-ic', html: IC[key] || '' }),
        el('span', { class: 'qm-label', text: label }),
      ]);
      this.btns[key] = b;
      this.root.appendChild(b);
    });
  }
  setActive(key, on) { this.btns[key]?.classList.toggle('on', !!on); }
  setVisible(v) { this.root.style.display = v ? '' : 'none'; }
}
