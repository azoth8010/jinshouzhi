/**
 * 字段表单渲染器
 *
 * 给一份 fields 配置，把 stat_data 渲染成表单。
 * 没有配置时不会走到这里——那是原版变量树的地盘。
 *
 * 设计原则：
 * 1. 只动配置里点名的路径，其它一律不碰
 * 2. 读到的数先过一遍配置的类型与范围，不合法的就地纠正
 * 3. 保存时重新读一次楼层数据，再把改过的路径合并进去
 */

export function mountForm(ctx) {
  const { panel, hostDoc, config, toast } = ctx;
  const W = hostDoc.defaultView || window;

  /* ---------- 样式 ---------- */
  const STYLE_ID = 'mz-jsz-form-css';
  if (!hostDoc.getElementById(STYLE_ID)) {
    const st = hostDoc.createElement('style');
    st.id = STYLE_ID;
    st.textContent = `
      .mz-f{display:flex;flex-direction:column;gap:10px;font-size:12px;color:var(--mz-jsz-ink,#352722)}
      .mz-f-bar,.mz-f-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .mz-f-bar{padding-bottom:8px;border-bottom:1px dashed var(--mz-jsz-line,#c8c3b1)}
      .mz-f-foot{padding-top:8px;border-top:1px dashed var(--mz-jsz-line,#c8c3b1)}
      .mz-f-t{font-weight:600;letter-spacing:.04em;margin-right:auto}
      .mz-f label{font-size:11px;color:#756342}
      .mz-f input[type=number]{width:70px}
      .mz-f input,.mz-f select,.mz-f textarea{
        font:12px/1.5 inherit;padding:4px 7px;border-radius:2px;
        border:1px solid var(--mz-jsz-line,#c8c3b1);
        background:var(--mz-jsz-surface,#f9f1df);color:var(--mz-jsz-ink,#352722)}
      .mz-f input:focus,.mz-f select:focus,.mz-f textarea:focus{
        outline:2px solid #d8be79;outline-offset:1px}
      .mz-f-btn{
        font:12px inherit;padding:5px 12px;border-radius:2px;cursor:pointer;
        border:1px solid var(--mz-jsz-line,#c8c3b1);background:transparent;
        color:var(--mz-jsz-ink,#352722)}
      .mz-f-btn:hover{border-color:#ba8e4a;color:#743e1d}
      .mz-f-btn[data-main]{background:#8c5a2b;border-color:#743e1d;color:#f9f1df;font-weight:600}
      .mz-f-btn[data-main]:hover{background:#743e1d;color:#fff}
      .mz-f-btn:disabled{opacity:.45;cursor:not-allowed}
      .mz-g>h3{
        font:600 12px/1.6 inherit;letter-spacing:.08em;color:#743e1d;
        margin:10px 0 6px;padding-bottom:3px;border-bottom:1px solid var(--mz-jsz-line,#c8c3b1)}
      .mz-r{display:grid;grid-template-columns:88px 1fr;gap:6px 10px;align-items:center;margin:5px 0}
      .mz-r>span{font-size:11.5px;color:#625349;line-height:1.4;word-break:break-all}
      .mz-r>div{display:flex;align-items:center;gap:6px;min-width:0}
      .mz-r input[type=text],.mz-r select{width:100%}
      .mz-r input[type=checkbox]{width:15px;height:15px;accent-color:#8c5a2b}
      .mz-hint{grid-column:2;font-size:10.5px;color:#8f8270;margin-top:-2px}
      .mz-msg{margin-left:auto;font-size:11px;color:#4a6b3a}
      .mz-msg[data-err]{color:#a33a2a}
    `;
    (hostDoc.head || hostDoc.documentElement).appendChild(st);
  }

  /* ---------- 工具 ---------- */
  const clone = (o) => JSON.parse(JSON.stringify(o === undefined ? null : o));
  function getPath(obj, path) {
    return path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), obj);
  }
  function setPath(obj, path, val) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = val;
  }
  const lastId = () => {
    try {
      if (typeof getLastMessageId === 'function') return getLastMessageId();
    } catch (e) {}
    return -1;
  };
  function readData(msgId) {
    try {
      if (typeof Mvu !== 'undefined' && Mvu.getMvuData) {
        const d = Mvu.getMvuData({ type: 'message', message_id: msgId });
        const sd = getPath(d, 'stat_data');
        if (sd) return { ok: true, all: d, sd };
      }
    } catch (e) {}
    try {
      if (typeof getVariables === 'function') {
        const v = getVariables({ type: 'message', message_id: msgId });
        const sd = v && v.stat_data ? v.stat_data : v;
        if (sd) return { ok: true, all: v, sd };
      }
    } catch (e) {}
    return { ok: false };
  }

  /* ---------- 状态 ---------- */
  let msgId = lastId();
  let draft = null;
  let dirty = false;
  let src = null;

  /* ---------- 渲染 ---------- */
  panel.innerHTML = '';
  const root = hostDoc.createElement('div');
  root.className = 'mz-f';

  const bar = hostDoc.createElement('div');
  bar.className = 'mz-f-bar';
  bar.innerHTML =
    '<span class="mz-f-t">' + (config.卡 || '变量表单') + '</span>' +
    '<label>楼层</label><input type="number" data-f="floor" value="' + msgId + '">' +
    '<button class="mz-f-btn" data-f="reload">重读</button>' +
    '<span class="mz-msg" data-f="msg"></span>';

  const groups = hostDoc.createElement('div');
  const foot = hostDoc.createElement('div');
  foot.className = 'mz-f-foot';
  foot.innerHTML =
    '<button class="mz-f-btn" data-f="reset">还原</button>' +
    '<button class="mz-f-btn" data-main data-f="save">保存修改</button>';

  root.appendChild(bar);
  root.appendChild(groups);
  root.appendChild(foot);
  panel.appendChild(root);

  const msgEl = bar.querySelector('[data-f="msg"]');
  function say(text, isErr) {
    msgEl.textContent = text || '';
    if (isErr) msgEl.setAttribute('data-err', '1'); else msgEl.removeAttribute('data-err');
    if (text) setTimeout(() => { if (msgEl.textContent === text) msgEl.textContent = ''; }, 3200);
  }

  function markDirty() {
    dirty = true;
    const b = foot.querySelector('[data-f="save"]');
    if (b) { b.disabled = false; b.textContent = '保存修改 ●'; }
  }

  function clearDirty() {
    dirty = false;
    const b = foot.querySelector('[data-f="save"]');
    if (b) { b.disabled = true; b.textContent = '保存修改'; }
  }

  function buildControls() {
    groups.innerHTML = '';
    (config.分组 || []).forEach((g) => {
      const sec = hostDoc.createElement('section');
      sec.className = 'mz-g';
      const h = hostDoc.createElement('h3');
      h.textContent = g.名 || '';
      sec.appendChild(h);

      (g.字段 || []).forEach((f) => {
        const row = hostDoc.createElement('div');
        row.className = 'mz-r';

        const lab = hostDoc.createElement('span');
        lab.textContent = f.标签 || f.路径;
        row.appendChild(lab);

        const box = hostDoc.createElement('div');
        const cur = getPath(draft, f.路径);
        let el;

        if (f.类型 === 'select') {
          el = hostDoc.createElement('select');
          (f.选项 || []).forEach((o) => {
            const op = hostDoc.createElement('option');
            op.value = String(o); op.textContent = String(o);
            el.appendChild(op);
          });
          el.value = cur == null ? '' : String(cur);
        } else if (f.类型 === 'bool') {
          el = hostDoc.createElement('input');
          el.type = 'checkbox';
          el.checked = !!cur;
        } else if (f.类型 === 'number') {
          el = hostDoc.createElement('input');
          el.type = 'number';
          if (f.min != null) el.min = f.min;
          if (f.max != null) el.max = f.max;
          el.value = cur == null ? '' : cur;
        } else {
          el = hostDoc.createElement('input');
          el.type = 'text';
          el.value = cur == null ? '' : String(cur);
        }

        el.setAttribute('aria-label', f.标签 || f.路径);
        el.addEventListener('change', () => {
          let v;
          if (f.类型 === 'bool') v = el.checked;
          else if (f.类型 === 'number') {
            let n = Number(el.value);
            if (!isFinite(n)) n = f.min != null ? f.min : 0;
            if (f.min != null) n = Math.max(f.min, n);
            if (f.max != null) n = Math.min(f.max, n);
            el.value = n;
            v = n;
          } else v = el.value;
          setPath(draft, f.路径, v);
          markDirty();
        });
        box.appendChild(el);
        row.appendChild(box);

        if (f.提示) {
          const hint = hostDoc.createElement('div');
          hint.className = 'mz-hint';
          hint.textContent = f.提示;
          row.appendChild(hint);
        }
        sec.appendChild(row);
      });

      groups.appendChild(sec);
    });
  }

  function reload() {
    const r = readData(msgId);
    if (!r.ok) {
      draft = null;
      groups.innerHTML = '<div style="padding:10px 0;color:#a33a2a">这个楼层没有变量。'
        + '换一个楼层号，或先让 AI 跑一轮。</div>';
      clearDirty();
      say('没读到变量', true);
      return;
    }
    src = r;
    draft = clone(r.sd);
    buildControls();
    clearDirty();
    say('已读取楼层 #' + msgId);
  }

  /* ---------- 保存 ---------- */
  foot.querySelector('[data-f="save"]').addEventListener('click', async () => {
    if (!dirty || !draft) return;
    // 保存前重读一次，避免用旧快照覆盖这期间的变化
    const now = readData(msgId);
    if (!now.ok) { say('这个楼层已经没有变量了', true); return; }
    const updated = clone(now.all);
    if (typeof Mvu !== 'undefined' && Mvu.replaceMvuData) {
      setPath(updated, 'stat_data', draft);
      try {
        await Mvu.replaceMvuData(updated, { type: 'message', message_id: msgId });
        clearDirty();
        say('已保存到楼层 #' + msgId);
      } catch (e) {
        console.error('[金手指] 保存失败', e);
        say('保存失败：' + (e && e.message || e), true);
      }
    } else if (typeof setVariables === 'function') {
      try {
        setVariables({ type: 'message', message_id: msgId }, updated, { refresh: 'none' });
        clearDirty();
        say('已保存（getVariables 通道）');
      } catch (e) {
        say('保存失败', true);
      }
    } else {
      say('没有可用的写入接口', true);
    }
  });

  foot.querySelector('[data-f="reset"]').addEventListener('click', () => {
    reload();
  });

  bar.querySelector('[data-f="reload"]').addEventListener('click', () => {
    const v = Number(bar.querySelector('[data-f="floor"]').value);
    if (isFinite(v) && v >= 0) msgId = v;
    reload();
  });

  reload();
  if (typeof toast === 'function') toast('', false);
}
