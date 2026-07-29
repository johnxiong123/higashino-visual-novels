// 状态变量条：由 book.json 的 vars 契约生成
import { el } from './dom.js';

export class Status {
  constructor(root, definitions = []) {
    this.root = root;
    this.bars = {};
    this.definitions = definitions;
    definitions.forEach(({ key, label, color }) => {
      const fill = el('div', { class: 'meter-fill' });
      if (color) fill.style.background = color;
      const wrap = el('div', { class: 'meter' }, [
        el('span', { class: 'meter-label', text: label }),
        el('div', { class: 'meter-bar' }, [fill]),
      ]);
      this.root.appendChild(wrap);
      this.bars[key] = fill;
    });
  }

  update(vars) {
    this.definitions.forEach(({ key, max = 10 }) => {
      const v = Math.max(0, Math.min(max, vars[key] ?? 0));
      this.bars[key].style.width = `${max > 0 ? (v / max) * 100 : 0}%`;
    });
  }
}
