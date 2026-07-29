// 导演：驱动当前节点 —— 渲染场景 → 逐行台词 → 处理分支/结局 → 跳转
import { loadChapter, getNode, chapterIdOf } from './story.js';
import { evalCondition } from './conditions.js';

export class Director {
  // ctx: { state, scene, dialogue, status, clues, flowchart,
  //        onChapterLoad?, onChapterEnd?, onEnding? }
  constructor(ctx) {
    this.ctx = ctx;
    this.chapter = null;
  }

  async start(nodeId) {
    await this.goto(nodeId);
  }

  async goto(nodeId) {
    const chId = chapterIdOf(nodeId);
    if (!chId) throw new Error(`非法节点 id：${nodeId}`);
    if (!this.chapter || this.chapter.meta.id !== chId) {
      this.chapter = await loadChapter(chId);
      this.ctx.onChapterLoad?.(this.chapter);
    }
    this.ctx.state.current = {
      chapter: chId, node: nodeId,
      bg: this.ctx.state.current?.bg || null,
      chapterTitle: this.chapter.meta.title,
    };
    await this.runNode(nodeId);
  }

  // 流程图回跳重玩
  jumpTo(nodeId) { return this.goto(nodeId); }

  async runNode(nodeId) {
    const { state } = this.ctx;
    const node = getNode(this.chapter, nodeId);

    state.markVisited(nodeId);
    const newClues = state.applyEffects(node.onEnter);
    this._refreshHud(newClues);

    this.ctx.scene.set(node.bg, node.cg, node.pov);
    if (node.bg) { state.locations.add(node.bg); state.current.bg = node.cg || node.bg; }
    this.ctx.flowchart?.update(this.chapter, state, this);
    this.ctx.onNode?.(nodeId, this.chapter);

    for (const line of node.lines || []) {
      await this.ctx.dialogue.showLine(line, node.pov);
    }

    if (node.ending) {
      state.recordEnding(node.ending.id);
      this.ctx.flowchart?.update(this.chapter, state, this);
      this.ctx.onEnding?.(node.ending, this.chapter);
      return;
    }
    if (node.chapterEnd) {
      this.ctx.onChapterEnd?.(this.chapter, node);
      return;
    }
    // 条件分支：按累积状态自动路由（用于终章多结局收束）。最后一项可省略 requires 作为默认。
    if (node.branches && node.branches.length) {
      const b = node.branches.find((br) => evalCondition(br.requires, state)) || node.branches[node.branches.length - 1];
      await this.goto(b.goto);
      return;
    }
    if (node.choices && node.choices.length) {
      const avail = node.choices.filter((c) => evalCondition(c.requires, state));
      const idx = await this.ctx.dialogue.showChoices(avail);
      const choice = avail[idx];
      const nc = state.applyEffects(choice.effects);
      this._refreshHud(nc);
      await this.goto(choice.goto);
      return;
    }
    if (node.next) {
      await this.goto(node.next);
      return;
    }
    // 无出口：当作章节结束兜底
    this.ctx.onChapterEnd?.(this.chapter, node);
  }

  _refreshHud(newClues) {
    this.ctx.status?.update(this.ctx.state.vars);
    this.ctx.clues?.refresh(this.ctx.state, newClues);
  }
}
