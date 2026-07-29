// 对话框：打字机 + 点击/空格推进 + 选项 + 回想(backlog)；支持自动/跳过
import { el } from './dom.js';
import { blip } from '../engine/sfx.js?v=2';

export class Dialogue {
  constructor(root, opts = {}) {
    this.root = root;
    this.speed = opts.speed ?? 22; // 每字毫秒
    this.auto = false;
    this.autoSpeed = opts.autoSpeed ?? 50; // 0..100，越大每句停顿越短
    this.skip = false;
    this.backlog = [];

    this.nameEl = el('div', { class: 'dlg-name' });
    this.textEl = el('div', { class: 'dlg-text' });
    this.indicator = el('div', { class: 'dlg-next', html: '下一句 <span class="arr">▶</span>' });
    this.box = el('div', { class: 'dlg-box ornate' }, [el('span', { class: 'frame' }), this.nameEl, this.textEl, this.indicator]);
    this.choiceEl = el('div', { class: 'dlg-choices' });
    this.root.append(this.choiceEl, this.box);
  }

  setSpeed(v) { this.speed = v; }
  setAuto(v) { this.auto = v; }
  setAutoSpeed(v) { this.autoSpeed = v; }
  setSkip(v) { this.skip = v; }

  showLine(line) {
    this.backlog.push(line);
    this.nameEl.textContent = line.speaker || '';
    this.nameEl.classList.toggle('empty', !line.speaker);
    const full = line.text || '';

    return new Promise((resolve) => {
      const stage = this.root.closest('.stage') || document;
      let typing = true;
      let i = 0;
      let resolved = false;
      let autoTimer = null;
      this.indicator.classList.remove('show');
      this.textEl.textContent = '';

      const finish = () => {
        if (!typing) return;
        typing = false;
        clearInterval(timer);
        this.textEl.textContent = full;
        this.indicator.classList.add('show');
        if (this.auto && !this.skip) {
          const f = (110 - this.autoSpeed) / 60; // autoSpeed 50→1.0, 100→0.17, 0→1.83
          autoTimer = setTimeout(done, Math.max(280, (400 + full.length * 16) * f));
        }
      };
      const done = () => {
        if (resolved) return;
        resolved = true;
        clearInterval(timer);
        clearTimeout(autoTimer);
        cleanup();
        resolve();
      };
      const advance = () => { if (typing) finish(); else done(); };
      const onClick = (e) => {
        if (e.target.closest('.dlg-choices, .topbar, .quickbar')) return;
        advance();
      };
      const onKey = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance(); } };
      const cleanup = () => {
        stage.removeEventListener('click', onClick);
        document.removeEventListener('keydown', onKey);
      };

      const interval = this.skip ? 4 : this.speed;
      const timer = setInterval(() => {
        i += 1;
        this.textEl.textContent = full.slice(0, i);
        const ch = full[i - 1];
        if (!this.skip && ch && !/\s/.test(ch)) blip();
        if (i >= full.length) finish();
      }, interval);
      stage.addEventListener('click', onClick);
      document.addEventListener('keydown', onKey);
      if (this.skip) { finish(); autoTimer = setTimeout(done, 40); }
    });
  }

  showChoices(choices) {
    return new Promise((resolve) => {
      this.choiceEl.innerHTML = '';
      this.choiceEl.classList.add('show');
      choices.forEach((c, idx) => {
        const branch = (c.tag || '').includes('分支');
        const btn = el('button', {
          class: 'choice' + (branch ? ' branch' : ''),
          onclick: () => { this.choiceEl.classList.remove('show'); this.choiceEl.innerHTML = ''; resolve(idx); },
        }, [
          el('span', { class: 'choice-text', text: c.text }),
          c.tag ? el('span', { class: 'choice-tag', text: c.tag }) : null,
        ]);
        this.choiceEl.appendChild(btn);
      });
    });
  }
}
