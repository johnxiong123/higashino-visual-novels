// 右侧面板：tabs（档案/人物）+ 证物网格 + 详情 + 底部流程图
import { el } from './dom.js';

export class Panel {
  constructor(root, features = {}) {
    this.root = root;
    this.features = { clues: true, flowchart: true, ...features };
    this.tabsEl = el('div', { class: 'panel-tabs' });
    this.clueLabel = el('div', { class: 'panel-section-label clue-section', text: '关键证物' });
    this.cluesHost = el('div', { class: 'clue-grid' });
    this.charHost = el('div', { class: 'char-list', style: 'display:none' });
    this.detailHost = el('div', { class: 'clue-detail' });
    this.flowHost = el('div', { class: 'flowchart' });

    const top = el('div', { class: 'panel-top' }, [this.tabsEl, this.clueLabel, this.cluesHost, this.charHost, this.detailHost]);
    const bottom = el('div', { class: 'panel-bottom' }, [
      el('div', { class: 'panel-section-label', text: '路线图' }),
      this.flowHost,
    ]);
    if (!this.features.flowchart) bottom.style.display = 'none';
    this.root.append(top, bottom);
    this._buildTabs();
    if (!this.features.clues) this.switchTab('characters');
  }

  _buildTabs() {
    this.tabBtns = {};
    const tabs = [
      this.features.clues ? ['clues', '档案'] : null,
      ['characters', '人物'],
    ].filter(Boolean);
    tabs.forEach(([k, l], i) => {
      const b = el('button', { class: 'panel-tab' + (i === 0 ? ' active' : ''), text: l, onclick: () => this.switchTab(k) });
      this.tabBtns[k] = b;
      this.tabsEl.appendChild(b);
    });
  }

  switchTab(k) {
    Object.entries(this.tabBtns).forEach(([key, b]) => b.classList.toggle('active', key === k));
    this.clueLabel.style.display = this.features.clues && k === 'clues' ? '' : 'none';
    this.cluesHost.style.display = this.features.clues && k === 'clues' ? '' : 'none';
    this.charHost.style.display = k === 'characters' ? '' : 'none';
    this.detailHost.classList.remove('show');
  }

  setCharacters(list) {
    this.charHost.innerHTML = '';
    list.forEach((c) => {
      this.charHost.appendChild(el('div', { class: 'char-card' }, [
        el('div', { class: 'char-avatar', text: (c.name || '?').slice(0, 1) }),
        el('div', { class: 'char-meta' }, [
          el('div', { class: 'char-name', text: c.name }),
          el('div', { class: 'char-role', text: c.role || '' }),
          el('div', { class: 'char-bio', text: c.bio || '' }),
        ]),
      ]));
    });
  }
  showCharacters(list) { this.setCharacters(list); this.switchTab('characters'); }

  focusFlow() { this.root.classList.remove('collapsed'); this.flowHost.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}
