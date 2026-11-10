/**
 * 字段表单渲染器 v2
 *
 * 支持：分页（tab）、分组、两列布局、记录型字段（map）。
 * 只动配置里点名的路径；保存前重读楼层再合并。
 */

export function mountForm(ctx) {
  const { panel, hostDoc, config } = ctx;
  const clone = (o) => JSON.parse(JSON.stringify(o === undefined ? null : o));

  /* ---------- 样式 ---------- */
  const STYLE_ID = 'mz-jsz-form-css';
  if (!hostDoc.getElementById(STYLE_ID)) {
    const st = hostDoc.createElement('style');
    st.id = STYLE_ID;
    st.textContent = `
      .mz-f{display:flex;flex-direction:column;gap:8px;font-size:12px;color:var(--mz-jsz-ink,#352722)}
      .mz-f-t{font:600 12.5px/1.6 inherit;letter-spacing:.06em;color:#743e1d}
      .mz-f-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;
        padding-bottom:7px;border-bottom:1px dashed var(--mz-jsz-line,#c8c3b1)}
      .mz-f-bar label{font-size:11px;color:#756342}
      .mz-f-bar input[type=number]{width:64px}
      .mz-tabs{display:flex;gap:4px;flex-wrap:wrap;padding:2px 0 6px;
        border-bottom:1px solid var(--mz-jsz-line,#c8c3b1)}
      .mz-tab{font:12px inherit;padding:4px 11px;border-radius:2px;cursor:pointer;
        border:1px solid transparent;background:transparent;color:#796a5c}
      .mz-tab:hover{color:#743e1d}
      .mz-tab[aria-selected="true"]{border-color:var(--mz-jsz-line,#c8c3b1);
        background:var(--mz-jsz-surface,#f9f1df);color:#5c250f;font-weight:600;
        box-shadow:inset 0 -2px 0 #8c5a2b}
      .mz-page{display:none;flex-direction:column;gap:2px}
      .mz-page[data-on="1"]{display:flex}
      .mz-f input,.mz-f select,.mz-f textarea{
        font:12px/1.5 inherit;padding:4px 7px;border-radius:2px;
        border:1px solid var(--mz-jsz-line,#c8c3b1);
        background:var(--mz-jsz-surface,#f9f1df);color:var(--mz-jsz-ink,#352722)}
      .mz-f input:focus,.mz-f select:focus,.mz-f textarea:focus{outline:2px solid #d8be79;outline-offset:1px}
      .mz-f-btn{font:12px inherit;padding:5px 12px;border-radius:2px;cursor:pointer;
        border:1px solid var(--mz-jsz-line,#c8c3b1);background:transparent;color:var(--mz-jsz-ink,#352722)}
      .mz-f-btn:hover{border-color:#ba8e4a;color:#743e1d}
      .mz-f-btn[data-main]{background:#8c5a2b;border-color:#743e1d;color:#f9f1df;font-weight:600}
      .mz-f-btn[data-main]:hover{background:#743e1d;color:#fff}
      .mz-f-btn:disabled{opacity:.45;cursor:not-allowed}
      .mz-f-btn[data-mini]{padding:2px 7px;font-size:11px}
      .mz-f-btn[data-del]{border-color:#ca754a;color:#a33a2a;background:#fff4eb}
      .mz-g>h3{font:600 12px/1.6 inherit;letter-spacing:.08em;color:#743e1d;
        margin:9px 0 5px;padding-bottom:3px;border-bottom:1px solid var(--mz-jsz-line,#c8c3b1)}
      .mz-r{display:grid;grid-template-columns:88px 1fr;gap:5px 10px;align-items:center;margin:5px 0}
      .mz-r>span{font-size:11.5px;color:#625349;line-height:1.4;word-break:break-all}
      .mz-r>div{display:flex;align-items:center;gap:6px;min-width:0}
      .mz-r input[type=text],.mz-r select{width:100%}
      .mz-r input[type=checkbox]{width:15px;height:15px;accent-color:#8c5a2b}
      .mz-hint{grid-column:2;font-size:10.5px;color:#8f8270;margin-top:-2px}

      .mz-c2{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;margin:6px 0}
      .mz-mini{display:flex;flex-direction:column;gap:3px;min-width:0}
      .mz-mini>label{font-size:11px;color:#625349}
      .mz-mini input,.mz-mini select{width:100%}
      .mz-mini input[type=checkbox]{width:14px;height:14px;flex:0 0 auto}
      .mz-ck{display:flex;align-items:flex-start;gap:6px;font-size:11.5px;line-height:1.5;
        color:#8f8270;cursor:pointer;padding:2px 0}
      .mz-ck span{min-width:0;word-break:break-word}
      /* 自绘勾选框：系统默认框在深色主题下几乎看不出勾没勾 */
      .mz-cb{appearance:none;-webkit-appearance:none;width:15px;height:15px;flex:0 0 15px;
        margin:1px 0 0;border:1px solid #ba8e4a;border-radius:2px;background:#fffbeb;
        position:relative;cursor:pointer;transition:background .12s,border-color .12s}
      .mz-cb:hover{border-color:#8c5a2b}
      .mz-cb:checked{background:#8c5a2b;border-color:#743e1d}
      .mz-cb:checked::after{content:"";position:absolute;left:4px;top:1px;width:4px;height:8px;
        border:solid #f9f1df;border-width:0 2px 2px 0;transform:rotate(45deg)}
      .mz-cb:focus-visible{outline:2px solid #d8be79;outline-offset:2px}
      .mz-ck:has(.mz-cb:checked){color:#352722}
      .mz-ck:has(.mz-cb:checked) span{font-weight:600}
      .mz-g>h3 .mz-count{float:right;font-weight:400;color:#8f8270;letter-spacing:0}

      .mz-map{display:flex;flex-direction:column;gap:7px;margin:6px 0}
      .mz-item{border:1px solid var(--mz-jsz-line,#c8c3b1);border-left:2px solid #d8be79;
        border-radius:2px;padding:7px 9px;background:rgba(255,251,235,.5)}
      .mz-item-h{display:flex;align-items:center;gap:6px;margin-bottom:5px}
      .mz-item-h b{font:600 12px inherit;color:#5c250f}
      .mz-item-h .mz-sp{margin-left:auto}
      .mz-sub{display:grid;grid-template-columns:58px 1fr;gap:5px 8px;align-items:center;margin:3px 0}
      .mz-sub>span{font-size:11px;color:#756342}
      .mz-add{display:flex;gap:6px;margin-top:2px}
      .mz-add input{flex:1;min-width:0}
      .mz-empty{font-size:11.5px;color:#8f8270;padding:6px 0}

      .mz-f-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;
        padding-top:8px;border-top:1px dashed var(--mz-jsz-line,#c8c3b1)}
      .mz-msg{margin-left:auto;font-size:11px;color:#4a6b3a}
      .mz-msg[data-err]{color:#a33a2a}
      @media (max-width:400px){
        .mz-r{grid-template-columns:74px 1fr}
        .mz-c2{grid-template-columns:1fr}
      }
    `;
    (hostDoc.head || hostDoc.documentElement).appendChild(st);
  }

  /* ---------- 工具 ---------- */
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
    try { if (typeof getLastMessageId === 'function') return getLastMessageId(); } catch (e) {}
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
  const pages = config.页 || [{ 名: '', 分组: config.分组 || [] }];
  let msgId = lastId();
  let draft = null;
  let dirty = false;
  let curPage = 0;

  /* ---------- 骨架 ---------- */
  panel.innerHTML = '';
  const root = hostDoc.createElement('div');
  root.className = 'mz-f';
  root.innerHTML =
    '<div class="mz-f-bar">' +
      '<span class="mz-f-t">' + (config.卡 || '变量') + '</span>' +
      '<label>楼层</label><input type="number" data-f="floor" value="' + msgId + '">' +
      '<button class="mz-f-btn" data-mini data-f="reload">重读</button>' +
      '<span class="mz-msg" data-f="msg"></span>' +
    '</div>' +
    '<div class="mz-tabs" role="tablist"></div>' +
    '<div data-f="pages"></div>' +
    '<div class="mz-f-foot">' +
      '<button class="mz-f-btn" data-f="reset">还原</button>' +
      '<button class="mz-f-btn" data-main data-f="save" disabled>保存修改</button>' +
    '</div>';
  panel.appendChild(root);

  const tabsEl = root.querySelector('.mz-tabs');
  const pagesEl = root.querySelector('[data-f="pages"]');
  const msgEl = root.querySelector('[data-f="msg"]');
  const saveBtn = root.querySelector('[data-f="save"]');

  function say(t, err) {
    msgEl.textContent = t || '';
    if (err) msgEl.setAttribute('data-err', '1'); else msgEl.removeAttribute('data-err');
    if (t) setTimeout(() => { if (msgEl.textContent === t) msgEl.textContent = ''; }, 3000);
  }
  function markDirty() {
    dirty = true; saveBtn.disabled = false; saveBtn.textContent = '保存修改 ●';
  }
  function clearDirty() {
    dirty = false; saveBtn.disabled = true; saveBtn.textContent = '保存修改';
  }

  /* ---------- 渲染单个字段 ---------- */
  function control(f, value, onSet) {
    let el;
    if (f.类型 === 'select') {
      // 选项可以是字符串，也可以是 {标签, 值}——值允许是 true / "changed" 这类非字符串
      const opts = (f.选项 || []).map((o) => (o && typeof o === 'object')
        ? { 标签: String(o.标签), 值: o.值 }
        : { 标签: String(o), 值: o });
      el = hostDoc.createElement('select');
      opts.forEach((o, i) => {
        const op = hostDoc.createElement('option');
        op.value = String(i); op.textContent = o.标签;
        el.appendChild(op);
      });
      const same = (a, b) => (typeof a === 'boolean' || typeof b === 'boolean')
        ? a === b
        : String(a) === String(b);
      let idx = opts.findIndex((o) => same(o.值, value));
      if (idx < 0) idx = 0;
      el.selectedIndex = idx;
      el.addEventListener('change', () => {
        onSet(opts[el.selectedIndex].值);
        markDirty();
      });
      return el;
    } else if (f.类型 === 'bool') {
      el = hostDoc.createElement('input');
      el.type = 'checkbox';
      el.className = 'mz-cb';
      // 变量里可能是 true / "true" / 1 / "1"，一律当勾上
      el.checked = value === true || value === 1 || value === 'true' || value === '1';
    } else if (f.类型 === 'number') {
      el = hostDoc.createElement('input');
      el.type = 'number';
      if (f.min != null) el.min = f.min;
      if (f.max != null) el.max = f.max;
      el.value = value == null ? '' : value;
    } else {
      el = hostDoc.createElement('input');
      el.type = 'text';
      el.value = value == null ? '' : String(value);
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
        el.value = n; v = n;
      } else {
        v = el.value;
        if (f.空为null && String(v).trim() === '') v = null;
      }
      onSet(v);
      markDirty();
    });
    return el;
  }

  /* ---------- 记录型字段 ---------- */
  function mapBlock(f) {
    const wrap = hostDoc.createElement('div');
    wrap.className = 'mz-map';
    const obj = getPath(draft, f.路径);
    const keys = obj && typeof obj === 'object' ? Object.keys(obj) : [];

    if (!keys.length) {
      const e = hostDoc.createElement('div');
      e.className = 'mz-empty';
      e.textContent = f.空提示 || '这里还是空的。';
      wrap.appendChild(e);
    }

    keys.forEach((k) => {
      const item = hostDoc.createElement('div');
      item.className = 'mz-item';

      const hd = hostDoc.createElement('div');
      hd.className = 'mz-item-h';
      const nm = hostDoc.createElement('b');
      nm.textContent = k;
      hd.appendChild(nm);

      if (f.可删) {
        const sp = hostDoc.createElement('span');
        sp.className = 'mz-sp';
        const del = hostDoc.createElement('button');
        del.className = 'mz-f-btn';
        del.setAttribute('data-mini', '');
        del.setAttribute('data-del', '');
        del.textContent = '移出';
        del.addEventListener('click', () => {
          const o = getPath(draft, f.路径);
          if (o && o[k] !== undefined) { delete o[k]; markDirty(); build(); }
        });
        sp.appendChild(del);
        hd.appendChild(sp);
      }
      item.appendChild(hd);

      (f.子字段 || []).forEach((sf) => {
        const row = hostDoc.createElement('div');
        row.className = 'mz-sub';
        const lab = hostDoc.createElement('span');
        lab.textContent = sf.键;
        row.appendChild(lab);
        const box = hostDoc.createElement('div');
        const cur = getPath(draft, f.路径 + '.' + k + '.' + sf.键);
        box.appendChild(control({ ...sf, 路径: f.路径 + '.' + k + '.' + sf.键, 标签: sf.键 },
          cur, (v) => setPath(draft, f.路径 + '.' + k + '.' + sf.键, v)));
        row.appendChild(box);
        item.appendChild(row);
      });

      wrap.appendChild(item);
    });

    if (f.可增) {
      const add = hostDoc.createElement('div');
      add.className = 'mz-add';
      const inp = hostDoc.createElement('input');
      inp.type = 'text';
      inp.placeholder = f.增提示 || '输入名字后添加';
      const btn = hostDoc.createElement('button');
      btn.className = 'mz-f-btn';
      btn.setAttribute('data-mini', '');
      btn.textContent = '＋ 添加';
      btn.addEventListener('click', () => {
        const k = inp.value.trim();
        if (!k) return;
        const path = f.路径;
        if (!getPath(draft, path)) setPath(draft, path, {});
        const o = getPath(draft, path);
        if (o[k] === undefined) {
          const seed = {};
          (f.子字段 || []).forEach((sf) => {
            if (sf.类型 === 'bool') seed[sf.键] = false;
            else if (sf.类型 === 'number') seed[sf.键] = sf.min || 0;
            else if (sf.类型 === 'select') {
              const first = (sf.选项 || [])[0];
              seed[sf.键] = (first && typeof first === 'object') ? first.值 : (first == null ? '' : first);
            } else seed[sf.键] = '';
          });
          o[k] = seed;
          markDirty(); build();
        }
      });
      add.appendChild(inp);
      add.appendChild(btn);
      wrap.appendChild(add);
    }
    return wrap;
  }

  /* ---------- 渲染分组 ---------- */
  function groupBlock(g) {
    const sec = hostDoc.createElement('section');
    sec.className = 'mz-g';
    if (g.名) {
      const h = hostDoc.createElement('h3');
      h.textContent = g.名;
      const fs = g.字段 || [];
      if (fs.length > 1 && fs.every((x) => x.类型 === 'bool')) {
        const done = fs.filter((x) => {
          const v = getPath(draft, x.路径);
          return v === true || v === 1 || v === 'true' || v === '1';
        }).length;
        const c = hostDoc.createElement('span');
        c.className = 'mz-count';
        c.textContent = '已达成 ' + done + ' / ' + fs.length;
        h.appendChild(c);
      }
      sec.appendChild(h);
    }

    if (g.列 === 2) {
      const grid = hostDoc.createElement('div');
      grid.className = 'mz-c2';
      (g.字段 || []).forEach((f) => {
        const cell = hostDoc.createElement('div');
        cell.className = 'mz-mini';
        if (f.类型 === 'bool') {
          // 勾选框 + 全名一行，避免 100% 宽的假输入框
          const ck = hostDoc.createElement('label');
          ck.className = 'mz-ck';
          ck.appendChild(control(f, getPath(draft, f.路径),
            (v) => setPath(draft, f.路径, v)));
          const tx = hostDoc.createElement('span');
          tx.textContent = f.标签 || f.路径;
          ck.appendChild(tx);
          cell.appendChild(ck);
        } else {
          const lb = hostDoc.createElement('label');
          lb.textContent = f.标签 || f.路径;
          cell.appendChild(lb);
          cell.appendChild(control(f, getPath(draft, f.路径),
            (v) => setPath(draft, f.路径, v)));
        }
        grid.appendChild(cell);
      });
      sec.appendChild(grid);
      return sec;
    }

    (g.字段 || []).forEach((f) => {
      if (f.类型 === 'map') { sec.appendChild(mapBlock(f)); return; }
      const row = hostDoc.createElement('div');
      row.className = 'mz-r';
      const lab = hostDoc.createElement('span');
      lab.textContent = f.标签 || f.路径;
      row.appendChild(lab);
      const box = hostDoc.createElement('div');
      box.appendChild(control(f, getPath(draft, f.路径), (v) => setPath(draft, f.路径, v)));
      row.appendChild(box);
      if (f.提示) {
        const hint = hostDoc.createElement('div');
        hint.className = 'mz-hint';
        hint.textContent = f.提示;
        row.appendChild(hint);
      }
      sec.appendChild(row);
    });
    return sec;
  }

  /* ---------- 渲染整页 ---------- */
  function build() {
    tabsEl.innerHTML = '';
    pagesEl.innerHTML = '';

    pages.forEach((pg, i) => {
      if (pages.length > 1) {
        const b = hostDoc.createElement('button');
        b.className = 'mz-tab';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', i === curPage ? 'true' : 'false');
        b.textContent = pg.名 || ('页' + (i + 1));
        b.addEventListener('click', () => {
          curPage = i;
          tabsEl.querySelectorAll('.mz-tab').forEach((x, j) =>
            x.setAttribute('aria-selected', j === i ? 'true' : 'false'));
          pagesEl.querySelectorAll('.mz-page').forEach((x, j) =>
            x.setAttribute('data-on', j === i ? '1' : '0'));
        });
        tabsEl.appendChild(b);
      }

      const box = hostDoc.createElement('div');
      box.className = 'mz-page';
      box.setAttribute('data-on', i === curPage ? '1' : '0');
      (pg.分组 || []).forEach((g) => box.appendChild(groupBlock(g)));
      pagesEl.appendChild(box);
    });
  }

  function reload() {
    const r = readData(msgId);
    if (!r.ok) {
      draft = null;
      pagesEl.innerHTML = '<div style="padding:10px 0;color:#a33a2a">这个楼层没有变量。'
        + '换一个楼层号，或先让 AI 跑一轮。</div>';
      tabsEl.innerHTML = '';
      clearDirty();
      say('没读到变量', true);
      return;
    }
    draft = clone(r.sd);
    build();
    clearDirty();
    say('已读取楼层 #' + msgId);
  }

  /* ---------- 保存前的清理 ---------- */
  function applyCleanup() {
    pages.forEach((pg) => (pg.分组 || []).forEach((g) => (g.字段 || []).forEach((f) => {
      if (f.类型 !== 'map' || !f.清空) return;
      const o = getPath(draft, f.路径);
      if (!o || typeof o !== 'object') return;
      const key = f.清空.键, lim = Number(f.清空.小于等于);
      Object.keys(o).forEach((k) => {
        const v = Number(getPath(o, k + '.' + key));
        if (isFinite(v) && v <= lim) delete o[k];
      });
    })));
  }

  /* ---------- 保存 ---------- */
  saveBtn.addEventListener('click', async () => {
    if (!dirty || !draft) return;
    applyCleanup();
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
      } catch (e) { say('保存失败', true); }
    } else {
      say('没有可用的写入接口', true);
    }
  });

  root.querySelector('[data-f="reset"]').addEventListener('click', reload);
  root.querySelector('[data-f="reload"]').addEventListener('click', () => {
    const v = Number(root.querySelector('[data-f="floor"]').value);
    if (isFinite(v) && v >= 0) msgId = v;
    reload();
  });

  reload();
}
