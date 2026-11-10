# jinshouzhi · 金手指悬浮球

把「变量管理器」装进一个悬浮球里，并且可以换皮。

- **原作者**：络络（[@lolodesu_](https://github.com/lolodesu_)），仓库 [`lolo-desu/lolocard`](https://github.com/lolo-desu/lolocard)
- **悬浮球外壳与主题**：azoth8010（[@azoth8010](https://github.com/azoth8010)）
- **协议**：MIT（见 `LICENSE`），原始归属见 `NOTICE.md`

原版挂在「扩展设置面板」里，得先打开扩展才看得见。这个仓库不改它的功能，只做三件事：**搬进浮层、套主题、加一个球**。

## 用法

角色卡的 Tavern Helper 脚本里只写一行：

```js
// 表单模式：卡里给一份字段配置，面板变成表单
import 'https://cdn.jsdelivr.net/gh/azoth8010/jinshouzhi@v0.7.2/dist/index.js?theme=manfan&fields=manfan'

// 树模式：什么都不给，退回原版变量树
import 'https://cdn.jsdelivr.net/gh/azoth8010/jinshouzhi@v0.7.2/dist/index.js?theme=manfan'
```

两个参数都可省：

| 参数 | 作用 | 省略时 |
|---|---|---|
| `theme` | 主题名，对应 `dist/themes/<名>.css` | `manfan` |
| `fields` | 字段配置名（`dist/fields/<名>.json`），或完整 URL | 走变量树 |

**建议锁版本**，避免 jsdelivr 缓存：

```js
import 'https://cdn.jsdelivr.net/gh/azoth8010/jinshouzhi@main/dist/index.js?theme=manfan'
```

## 主题

| 主题 | 说明 |
|---|---|
| `manfan` | 迷宫饭 · 羊皮纸，与 `st-frontend` 同一套色 |
| `_base` | 变量骨架，写新主题时先继承它 |

写新主题：复制 `dist/themes/manfan.css`，改开头那组变量，文件放 `dist/themes/` 下，用 `?theme=你的名字`。

主题只覆盖 CSS 变量，不覆盖类名——原版所有组件读的都是 `--SmartTheme*` 这几个变量，改一处就够：

```css
.th-variable-manager[data-mz-theme="manfan"]{
  --SmartThemeBorderColor:#c8c3b1;
  --SmartThemeBodyColor:#352722;
  --SmartThemeEmColor:#8c5a2b;
  --SmartThemeQuoteColor:#756342;
  --SmartThemeBlurTintColor:#f3e8d2;
}
```

## 它是怎么工作的

```
import dist/index.js
  ├─ 先建球（核心挂了也能看见）
  ├─ 注入主题 CSS
  ├─ import 本仓库内的核心 dist/core/variable-manager.js
  ├─ 等它挂进 #extensions_settings2（父文档与 iframe 都查）
  ├─ 把那个节点搬进浮层
  └─ 套主题
```

**核心是内嵌的。** 原仓库路径已 404，且原作者已授权二改与再分发，所以副本随本仓库走。

**搬节点，不重写。** 原版是打包产物，逻辑十二万字符；搬 DOM 能把「面板」变成「浮层」，功能一行不改。

## 换源（加载失败时）

jsdelivr 有三个入口，中国大陆走 `testingcf` 最快，但它会出现「同一版本里 A 文件能取、B 文件 404」的脏缓存。稳妥的写法是逐个降级：

```js
const V = 'v0.7.2';
const P = `azoth8010/jinshouzhi@${V}/dist/index.js?theme=manfan&fields=manfan`;
const HOSTS = [
  'https://testingcf.jsdelivr.net/gh/',
  'https://cdn.jsdelivr.net/gh/',
  'https://fastly.jsdelivr.net/gh/',
];
(async () => {
  for (const h of HOSTS) {
    try { await import(h + P); return; } catch (e) { console.warn('[金手指] 换源', h); }
  }
  console.error('[金手指] 三个源都没拿到');
})();
```

**注意**：`import()` 动态导入才能 try/catch，静态 `import` 做不到。

## 排错

球没出来时，先确认加载的是哪一版——控制台应出现：

```
[金手指] v0.7.2 · theme=manfan · fields=manfan
```

如果还是 v0.1.x，说明 jsdelivr 缓存了旧文件，换带版本号的地址。

- **没有这行** → 脚本根本没跑。检查酒馆助手是否启用、卡的脚本里 import 地址是否被改过。
- **有这行，但球没出来** → 多半是 DOM 挂在了 iframe 里。v0.1.1 已改用 `window.parent.document`，如果仍然没有，说明父窗口访问被拦，控制台会有报错。
- **球出来了，点开是空的** → 看面板里的提示：要么核心加载失败（网络），要么没找到挂载点。
- **没找到挂载点** → 先手动打开一次「扩展设置」面板，让原版完成挂载，再刷新页面。

## 字段配置（表单模式）

给一份 JSON，面板就从「变量树」变成「表单」：每个字段有中文标签、合适的控件、示例提示，超出范围当场夹回。

```json
{
  "版本": 1,
  "卡": "迷宫饭 · 变量",
  "分组": [
    {
      "名": "时间与地点",
      "字段": [
        { "路径": "世界.时刻.年", "标签": "年", "类型": "number", "min": 1, "max": 9999 },
        { "路径": "世界.位置.大区域", "标签": "大区域", "类型": "text", "提示": "岛 / 东方大陆" },
        { "路径": "玩家.身份.种族", "标签": "种族", "类型": "select", "选项": ["长身人", "矮人"] },
        { "路径": "玩家.状态.体虚", "标签": "体虚", "类型": "bool" }
      ]
    }
  ]
}
```

- 控件五种：`text` / `number` / `select` / `bool` / `map`（记录型，可增删条目）
- `select` 的选项可以是字符串，也可以是 `{ "标签": "...", "值": ... }`，值允许 `true` / `"changed"` 这类非字符串（剧情节点的状态就是这样）
- 分页：配置用 `页` 而不是 `分组`，每个页一个 tab
- 两列：分组加 `"列": 2`，紧凑排列（六属性、里程碑用这个）
- 只动配置里点名的路径，其它字段一律不碰
- 保存前会重新读一次楼层，避免用旧快照覆盖
- 面板顶部可换楼层号，改历史楼的变量也行

现成的配置：`dist/fields/manfan.json` —— 四页 **44 个字段**

| 页 | 内容 |
|---|---|
| 概览 | 时间地点 10、玩家 10、六属性 6（两列）、状态进程 3 |
| 人物 | 在场（可增删）、人物关系（身份/好感/关系/欲念/同行） |
| 背包 | 物品（类型/数量/品质/说明，可增删）、武器防具饰品 |
| 委托 | 委托人 / 目标 / 报酬 / 期限 / 状态（可增删） |
| 进度 | 里程碑 M01–M07、剧情节点、账本 |

**数量归零自动清条**：背包字段写了 `"清空": {"键":"qty","小于等于":0}`，保存时把数量为 0 的条目删掉，不留空壳。

## 悬浮球

- **可拖动**：按住球拖到任意位置，松手停在原地（不吸附，只做视口夹取）
- **位置记忆**：存在 `localStorage`，刷新和换楼层都不跑
- **面板跟随**：优先开在球上方，上方不够就开在下方；左右不会越界
- **双端**：`pointer` 事件统一鼠标与触摸；球上 `touch-action:none`，拖动不会带着页面滚
- **无障碍**：球是 `<button>`，Enter / 空格开合，Esc 关闭，焦点有描边
- **窄屏**：宽度 <480px 时面板自动铺到 `calc(100vw - 12px)`

## 已知限制

1. **依赖原版挂载点**。如果上游改了 `#extensions_settings2` 这个位置，搬不动。此时会自动降级：不搬，仍留在扩展面板里，只套主题。
2. **原版的卸载逻辑会失效**。它靠 `#extensions_settings2 > div[script_id]` 找自己，搬走后找不到。刷新页面即可恢复。
3. **同一页面只跑一份**。脚本自带单例锁，重复 import 会直接返回。
4. **移动端未充分验证**。浮层用了 `env(safe-area-inset-*)`，窄屏下按钮贴边。
