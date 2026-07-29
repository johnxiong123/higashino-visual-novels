// 通用播放器装配：URL 选择作品，book.json 提供所有内容契约。
import { loadBook, bookPath } from './engine/book.js';
import { GameState, saveGame, loadGame, listSaves, getProgress } from './engine/state.js';
import { Director } from './engine/director.js';
import { loadManifest, prewarmImages } from './engine/assets.js';
import { loadConfig, getConfig, setConfig } from './engine/config.js';
import { Scene } from './ui/scene.js';
import { Dialogue } from './ui/dialogue.js';
import { Status } from './ui/status.js';
import { Clues } from './ui/clues.js';
import { Flowchart } from './ui/flowchart.js';
import { NavRail } from './ui/navrail.js';
import { Panel } from './ui/panel.js';
import { QuickBar } from './ui/quickbar.js';
import { Menus } from './ui/menus.js';
import { loadAudioManifest, playTrack, resume, setVolume, setMuted } from './engine/audio.js';
import { unlock as unlockSfx, loadType as loadTypeSfx, setEnabled as setSfxEnabled, setTypeVolume } from './engine/sfx.js';

const AUTO = 'auto';

async function getBookJSON(path) {
  const response = await fetch(bookPath(path), { cache: 'no-store' });
  if (!response.ok) throw new Error(`加载失败: ${path}`);
  return response.json();
}

async function boot() {
  const bookId = new URLSearchParams(window.location.search).get('book');
  const book = await loadBook(bookId);
  document.title = `${book.title} · 互动小说`;
  document.getElementById('book-theme').href = bookPath(book.theme || 'theme.css');
  document.getElementById('book-mark').textContent = book.mark || '';

  await loadManifest();
  const cfg = loadConfig();
  const audioManifest = await loadAudioManifest();
  loadTypeSfx(audioManifest.sfx?.type);

  const [cluesData, charData, endingsData] = await Promise.all([
    book.features.clues ? getBookJSON('data/clues.json') : [],
    getBookJSON('data/characters.json'),
    getBookJSON('data/endings.json'),
  ]);

  const scene = new Scene(document.getElementById('scene'), { pov: book.features.pov });
  const dialogue = new Dialogue(document.getElementById('dialogue'), { speed: cfg.textSpeed, autoSpeed: cfg.autoSpeed });
  const status = new Status(document.getElementById('status'), book.vars);
  const panel = new Panel(document.getElementById('panel'), book.features);
  const clues = new Clues(panel.cluesHost, cluesData);
  clues.setDetailHost(panel.detailHost);
  const flowchart = book.features.flowchart ? new Flowchart(panel.flowHost) : null;
  panel.setCharacters(charData);
  const menus = new Menus(document.getElementById('overlays'));
  const chapterLabel = document.getElementById('chapter-label');

  const quickbar = new QuickBar(document.getElementById('quickbar'), {
    auto: () => configApi.set({ auto: !getConfig().auto }),
    skip: () => configApi.set({ skip: !getConfig().skip }),
    save: () => menus.saveLoad('save', { state, onLoaded: resumeFrom }),
    load: () => menus.saveLoad('load', { state, onLoaded: resumeFrom }),
  });

  function applyConfig() {
    const current = getConfig();
    dialogue.setSpeed(current.textSpeed);
    dialogue.setAuto(current.auto);
    dialogue.setAutoSpeed(current.autoSpeed);
    dialogue.setSkip(current.skip);
    setVolume(current.bgmVol);
    setMuted(current.muted);
    setTypeVolume(current.sfxVol);
    setSfxEnabled(current.sfxOn);
    quickbar.setActive('auto', current.auto);
    quickbar.setActive('skip', current.skip);
  }
  const configApi = { get: getConfig, set: (patch) => { setConfig(patch); applyConfig(); } };
  applyConfig();

  let state;
  let director;

  function buildDirector() {
    director = new Director({
      state,
      scene,
      dialogue,
      status,
      clues: book.features.clues ? clues : null,
      flowchart,
      onChapterLoad: (chapter) => {
        chapterLabel.textContent = chapter.meta.title;
        const chapterConfig = book.chapters.find((item) => item.id === chapter.meta.id);
        playTrack(chapter.meta.bgm || chapterConfig?.bgm || 'main');
      },
      onNode: () => saveGame(AUTO, state),
      onEnding: (ending) => {
        saveGame(AUTO, state);
        menus.ending(ending, { onTitle: showTitle });
      },
      onChapterEnd: (chapter) => {
        saveGame(AUTO, state);
        menus.chapterEnd(chapter, { onTitle: showTitle });
      },
    });
  }

  function syncHud() {
    status.update(state.vars);
    if (book.features.clues) clues.refresh(state);
  }

  function startNew() {
    state = new GameState();
    buildDirector();
    menus.closeAll();
    quickbar.setVisible(true);
    syncHud();
    director.start(book.start);
  }

  function resumeFrom(savedState) {
    state = savedState;
    buildDirector();
    menus.closeAll();
    quickbar.setVisible(true);
    syncHud();
    director.goto(state.current.node || book.start);
  }

  function continueAuto() {
    resumeFrom(loadGame(AUTO) || new GameState());
  }

  function startChapter(chapterId) {
    const chapter = book.chapters.find((item) => item.id === chapterId);
    if (!chapter) throw new Error(`未知章节：${chapterId}`);
    state = new GameState();
    buildDirector();
    menus.closeAll();
    quickbar.setVisible(true);
    syncHud();
    director.start(chapter.start);
  }

  const chapterTitleOf = (id) => book.chapters.find((chapter) => chapter.id === id)?.title || '';

  function showTitle() {
    quickbar.setVisible(false);
    playTrack('title');
    const autoState = loadGame(AUTO);
    const autoInfo = listSaves().find((save) => save.slot === AUTO);
    const currentChapter = autoState?.current?.chapter;
    const progress = getProgress();
    const firstChapter = book.chapters[0];
    const chapterIndex = book.chapters.findIndex((chapter) => chapter.id === currentChapter);

    menus.title({
      book: {
        ...book,
        coverUrl: book.cover ? bookPath(book.cover) : null,
      },
      hasSave: !!autoState,
      save: autoInfo ? {
        sub: `${(autoInfo.at || '').slice(0, 16).replace('T', ' ')} · ${chapterTitleOf(currentChapter) || firstChapter.title}`,
      } : null,
      progress: {
        sub: `当前进度 ${chapterTitleOf(currentChapter) || firstChapter.title}`,
        diamonds: { done: Math.max(1, chapterIndex + 1), total: book.chapters.length },
      },
      endings: { sub: `已解锁 ${progress.endings.length} / ${endingsData.length}` },
      slots: true,
      activeSlot: null,
      onStart: startNew,
      onContinue: continueAuto,
      onChapterSelect: () => menus.chapterSelect(book.chapters, { onPick: startChapter }),
      onGallery: () => menus.gallery(endingsData),
      onSettings: () => menus.settings(configApi),
      onExit: () => menus.exit(),
      onSlot: (slot) => {
        const saved = loadGame(slot);
        if (saved) resumeFrom(saved);
      },
    });
  }

  new NavRail(document.getElementById('navrail'), (key) => {
    if (key === 'settings') {
      menus.settings(configApi, {
        onSave: () => menus.saveLoad('save', { state, onLoaded: resumeFrom }),
        onLoad: () => menus.saveLoad('load', { state, onLoaded: resumeFrom }),
        onTitle: showTitle,
      });
    } else if (key === 'log') {
      menus.backlog(dialogue);
    } else if (key === 'map' && state) {
      menus.locations(state);
    }
  });

  const unlock = () => {
    resume();
    unlockSfx();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  showTitle();
  setTimeout(prewarmImages, 600);
}

boot().catch((error) => {
  const message = document.createElement('pre');
  message.className = 'boot-error';
  message.textContent = `启动失败：${error.message}\n\n${error.stack || ''}`;
  document.body.replaceChildren(message);
  console.error(error);
});
