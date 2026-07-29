// 场景渲染：背景层 + CG 层，交叉淡入；无图时渲染暗调占位。
// 图片在「解码完成」后才切入——避免网络加载途中出现黑屏/半截闪烁；
// 旧画面保留到新图就绪。序号守卫防止快速连切时旧图覆盖新图。
import { asset } from '../engine/assets.js';
import { el } from './dom.js';

export class Scene {
  constructor(root, { pov = true } = {}) {
    this.root = root;
    this.povEnabled = pov;
    this.bgLayer = el('div', { class: 'scene-layer scene-bg' });
    this.cgLayer = el('div', { class: 'scene-layer scene-cg' });
    this.root.append(this.bgLayer, this.cgLayer);
    this._seq = 0;
  }

  set(bgId, cgId, pov) {
    this.root.dataset.pov = this.povEnabled ? (pov || '') : '';
    const token = ++this._seq;
    this._render(this.bgLayer, bgId, false, token);
    this._render(this.cgLayer, cgId, true, token);
  }

  _swap(layer, node) {
    layer.innerHTML = '';
    layer.appendChild(node);
    layer.classList.remove('fade');
    void layer.offsetWidth; // 重排以重放动画
    layer.classList.add('fade', 'visible');
  }

  _render(layer, id, isCg, token) {
    if (isCg && !id) {
      layer.classList.remove('visible');
      layer.innerHTML = '';
      return;
    }
    const a = asset(id);
    if (a && a.src) {
      const img = el('img', { class: 'scene-img', alt: a.label || '' });
      const reveal = () => { if (token === this._seq) this._swap(layer, img); };
      img.src = a.src;
      // 解码完成再显示；旧画面保留到此刻，避免黑屏/半截。失败也照常切入（退化为原行为）
      if (img.decode) img.decode().then(reveal).catch(reveal);
      else { img.onload = reveal; img.onerror = reveal; }
    } else {
      if (token !== this._seq) return;
      this._swap(layer, el('div', { class: 'scene-ph' + (isCg ? ' scene-ph-cg' : ''), 'data-id': id || '' }, [
        el('span', { class: 'scene-ph-tag', text: isCg ? 'CG' : 'SCENE' }),
        el('span', { class: 'scene-ph-label', text: a ? a.label : id || '' }),
      ]));
    }
  }
}
