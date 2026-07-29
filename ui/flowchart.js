// 流程图/路线图：按作者顺序排列节点；已访问可点击回跳，未解锁显示 ?
import { el } from './dom.js';
import { nodeOrder } from '../engine/story.js';

export class Flowchart {
  constructor(root) {
    this.root = root;
  }

  update(chapter, state, director) {
    this.root.innerHTML = '';
    const ids = nodeOrder(chapter);
    const cur = state.current.node;

    // 已访问节点的直接后继 → 标记为「可达但未访问」(?)
    const reachable = new Set();
    ids.forEach((id) => {
      if (!state.visited.has(id)) return;
      const n = chapter.nodes[id];
      (n.choices || []).forEach((c) => reachable.add(c.goto));
      if (n.next) reachable.add(n.next);
    });

    let shown = false;
    ids.forEach((id, i) => {
      const n = chapter.nodes[id];
      const visited = state.visited.has(id);
      const isCur = id === cur;
      const unknown = !visited && reachable.has(id);
      if (!visited && !unknown && !isCur) return; // 完全未触及 → 隐藏

      if (shown) this.root.appendChild(el('span', { class: 'fc-link' }));
      const cls = 'fc-node'
        + (visited ? ' visited' : '')
        + (isCur ? ' current' : '')
        + (unknown ? ' unknown' : '')
        + (n.ending ? ' ending' : '');
      const label = unknown ? '?' : n.ending ? '◆' : String(i + 1);
      this.root.appendChild(el('button', {
        class: cls, title: id, text: label,
        onclick: () => { if (visited && !isCur) director.jumpTo(id); },
      }));
      shown = true;
    });
  }
}
