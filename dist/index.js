/**
 * 金手指悬浮球 · 入口
 *
 * 原作者：络络（@lolodesu_）· lolo-desu/lolocard
 * 悬浮球外壳与主题：azoth8010
 * 协议：MIT
 *
 * 做的事只有三件：搬进浮层、套主题、加一个球。
 * 功能一行没改——原版是打包产物，重写不如搬节点。
 */

/* 原版路径已失效（404），改为随仓库分发；文件见 dist/core/ */
const CORE_PATH = 'core/variable-manager.js';

const HOST_ID = 'mz-jsz-host';
const MOUNT_WAIT_MS = 8000;
const STORE_KEY = 'mz-jsz-open';

/* 酒馆助手脚本跑在 iframe 里：document 是脚本自己的，界面在父窗口 */
const HOST_DOC = (function () {
  try { return window.parent.document; } catch (e) { return document; }
})();

const here = import.meta.url;
const theme = (new URL(here).searchParams.get('theme') || 'manfan').replace(/[^\w-]/g, '');
const base = new URL('./', here);

/* ---------- 单例 ---------- */
if (window.__mzJinshouzhi) {
  console.info('[金手指] 已经跑过了，跳过。');
} else {
  window.__mzJinshouzhi = { theme, at: Date.now() };
  boot();
}

/* ---------- 主题 ---------- */
function loadTheme(name) {
  const head = HOST_DOC.head || HOST_DOC.documentElement;
  ['_base', name].forEach((n) => {
    if (!n) return;
    const id = 'mz-jsz-css-' + n;
    if (HOST_DOC.getElementById(id)) return;
    const link = HOST_DOC.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = new URL(`themes/${n}.css`, base).href;
    link.onerror = () => console.warn('[金手指] 主题加载失败：', n);
    head.appendChild(link);
  });
}

/* ---------- 找原版挂载出来的节点 ---------- */
function findCoreNode() {
  // 核心用 TH 的 $，可能落在父文档，也可能落在脚本自己的 iframe 里，两处都看
  const docs = [HOST_DOC];
  if (document !== HOST_DOC) docs.push(document);
  for (const d of docs) {
    const found = findInDoc(d);
    if (found) return found;
  }
  return null;
}

function findInDoc(d) {
  const box = d.getElementById && d.getElementById('extensions_settings2');
  if (!box) return null;
  // 原版会 append 一个带 script_id 的 div；取最后一个没被搬走的就是它
  const nodes = box.querySelectorAll(':scope > div[script_id]');
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    if (n.dataset.mzMoved === '1') continue;
    if (n.querySelector('.th-variable-manager')) return n;
  }
  // 有些版本根节点自己就带 .th-variable-manager
  const inner = box.querySelector('.th-variable-manager');
  return inner ? inner.closest('div[script_id]') || inner.parentElement : null;
}

function waitForCore() {
  return new Promise((resolve) => {
    const t0 = Date.now();
    (function tick() {
      const node = findCoreNode();
      if (node) return resolve(node);
      if (Date.now() - t0 > MOUNT_WAIT_MS) return resolve(null);
      requestAnimationFrame(tick);
    })();
  });
}

/* ---------- 外壳 ---------- */
function buildShell() {
  if (HOST_DOC.getElementById(HOST_ID)) return HOST_DOC.getElementById(HOST_ID);

  const host = HOST_DOC.createElement('div');
  host.id = HOST_ID;
  host.innerHTML = `
    <style>
      #${HOST_ID}{position:fixed;z-index:2147483000;right:calc(16px + env(safe-area-inset-right));
        bottom:calc(16px + env(safe-area-inset-bottom));display:flex;flex-direction:column;
        align-items:flex-end;gap:10px;pointer-events:none;
        font-family:var(--mz-jsz-font,-apple-system,"Noto Sans SC",sans-serif)}
      #${HOST_ID} *{box-sizing:border-box}
      #${HOST_ID} .mz-jsz-ball{pointer-events:auto;width:44px;height:44px;border-radius:50%;
        border:1px solid var(--mz-jsz-line,#ba8e4a);cursor:pointer;padding:0;
        background:var(--mz-jsz-ball,#8c5a2b);color:var(--mz-jsz-ball-ink,#f9f1df);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 6px 18px -8px rgba(0,0,0,.55);transition:transform .16s ease,background .16s ease}
      #${HOST_ID} .mz-jsz-ball:hover{transform:translateY(-1px)}
      #${HOST_ID} .mz-jsz-ball:focus-visible{outline:2px solid var(--mz-jsz-line,#ba8e4a);outline-offset:3px}
      #${HOST_ID} .mz-jsz-ball svg{width:20px;height:20px;display:block}
      #${HOST_ID} .mz-jsz-panel{pointer-events:auto;display:none;width:min(420px,calc(100vw - 32px));
        max-height:min(70vh,640px);overflow:auto;overscroll-behavior:contain;
        background:var(--mz-jsz-surface,#f9f1df);color:var(--mz-jsz-ink,#352722);
        border:1px solid var(--mz-jsz-line,#c8c3b1);border-radius:4px;
        padding:10px 12px;box-shadow:0 18px 40px -24px rgba(0,0,0,.6)}
      #${HOST_ID}[data-open="1"] .mz-jsz-panel{display:block}
      @media (max-width:480px){
        #${HOST_ID} .mz-jsz-panel{width:calc(100vw - 24px);max-height:72vh}
      }
    </style>
    <div class="mz-jsz-panel" role="dialog" aria-label="变量管理器"></div>
    <button class="mz-jsz-ball" type="button" aria-label="打开变量管理器" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 7h16M4 12h10M4 17h13"/>
        <circle cx="18" cy="16.5" r="3.2"/>
      </svg>
    </button>
  `;
  (HOST_DOC.body || HOST_DOC.documentElement).appendChild(host);

  const ball = host.querySelector('.mz-jsz-ball');
  const panel = host.querySelector('.mz-jsz-panel');

  const setOpen = (open) => {
    host.dataset.open = open ? '1' : '0';
    ball.setAttribute('aria-expanded', open ? 'true' : 'false');
    try { localStorage.setItem(STORE_KEY, open ? '1' : '0'); } catch (e) {}
  };

  ball.addEventListener('click', () => setOpen(host.dataset.open !== '1'));
  HOST_DOC.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && host.dataset.open === '1') setOpen(false);
  });

  let remembered = '1';
  try { remembered = localStorage.getItem(STORE_KEY) || '1'; } catch (e) {}
  setOpen(remembered === '1');

  return { host, panel };
}

/* ---------- 主流程 ---------- */
async function boot() {
  console.log('[金手指] v0.2.0 · theme=' + theme);

  loadTheme(theme);

  // 先把球挂出来：核心挂了也能看见东西，不至于白等
  const shell = buildShell();
  const note = (html) => {
    shell.panel.innerHTML =
      '<div style="padding:14px 8px;font-size:12px;line-height:1.9;color:#625349">' + html + '</div>';
  };
  note('正在加载变量管理器…');

  try {
    await import(new URL(CORE_PATH, base).href);
  } catch (e) {
    console.error('[金手指] 原版核心加载失败', e);
    note('变量管理器加载失败。<br>多半是网络拿不到 jsdelivr，或原版改了路径。<br>'
      + '<span style="opacity:.7">' + String(e && e.message || e) + '</span>');
    return;
  }

  const node = await waitForCore();

  if (!node) {
    console.warn('[金手指] 没找到原版挂载节点，降级为「只套主题」。');
    note('原版加载了，但没找到它的挂载点。<br>它挂在「扩展设置」面板里，可能是面板还没打开过。<br>'
      + '打开一次「扩展」，再刷新页面。');
    paintTheme(HOST_DOC);
    return;
  }

  node.dataset.mzMoved = '1';
  shell.panel.innerHTML = '';
  shell.panel.appendChild(node);
  paintTheme(node);
  console.log('[金手指] 已搬进浮层');
}

function paintTheme(scope) {
  if (!scope) return;
  if (scope.classList && scope.classList.contains('th-variable-manager')) {
    scope.setAttribute('data-mz-theme', theme);
  }
  const roots = scope.querySelectorAll ? scope.querySelectorAll('.th-variable-manager') : [];
  roots.forEach((el) => el.setAttribute('data-mz-theme', theme));
}
