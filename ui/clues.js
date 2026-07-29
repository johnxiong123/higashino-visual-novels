// 证物/线索：网格卡片（文字为主，部分配图标），未读红点；点击看详情
import { el } from './dom.js';
import { asset } from '../engine/assets.js';

export class Clues {
  constructor(root, list) {
    this.root = root;
    this.map = new Map(list.map((c) => [c.id, c]));
    this.unread = new Set();
    this.detailHost = null;
    this.unlocked = [];
  }

  setDetailHost(host) { this.detailHost = host; }

  refresh(state, newClues = []) {
    this.unlocked = [...state.clues].filter((id) => this.map.has(id));
    newClues.forEach((id) => { if (this.map.has(id)) this.unread.add(id); });
    this._render();
  }

  unreadCount() { return this.unread.size; }

  _render() {
    this.root.innerHTML = '';
    if (!this.unlocked.length) {
      this.root.appendChild(el('div', { class: 'clue-empty', text: '暂无线索' }));
      return;
    }
    this.unlocked.forEach((id) => {
      const c = this.map.get(id);
      const a = c.icon ? asset(c.icon) : null;
      const thumb = a && a.src
        ? el('img', { class: 'clue-thumb', src: a.src, alt: c.title })
        : el('div', { class: 'clue-thumb clue-thumb-ph', text: c.title.slice(0, 2) });
      const card = el('button', {
        class: 'clue-card' + (this.unread.has(id) ? ' unread' : ''),
        onclick: () => { this.unread.delete(id); this._showDetail(c); this._render(); },
      }, [thumb, el('span', { class: 'clue-title', text: c.title })]);
      this.root.appendChild(card);
    });
  }

  _showDetail(c) {
    if (!this.detailHost) return;
    this.detailHost.innerHTML = '';
    this.detailHost.append(
      el('div', { class: 'clue-detail-title', text: c.title }),
      el('div', { class: 'clue-detail-chapter', text: c.chapter || '' }),
      el('div', { class: 'clue-detail-desc', text: c.desc || '' }),
    );
    this.detailHost.classList.add('show');
  }
}
