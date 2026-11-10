# jinshouzhi · 金手指悬浮球

把「变量管理器」装进一个悬浮球里，并且可以换皮。

- **原作者**：络络（[@lolodesu_](https://github.com/lolodesu_)），仓库 [`lolo-desu/lolocard`](https://github.com/lolo-desu/lolocard)
- **悬浮球外壳与主题**：azoth8010（[@azoth8010](https://github.com/azoth8010)）
- **协议**：MIT（见 `LICENSE`），原始归属见 `NOTICE.md`

原版挂在「扩展设置面板」里，得先打开扩展才看得见。这个仓库不改它的功能，只做三件事：**搬进浮层、套主题、加一个球**。

## 用法

角色卡的 Tavern Helper 脚本里只写一行：

```js
import 'https://cdn.jsdelivr.net/gh/azoth8010/jinshouzhi@main/dist/index.js?theme=manfan'
```

换主题改 `theme=` 即可。不写就是 `manfan`。

**建议锁版本**，避免 jsdelivr 缓存：

```js
import 'https://cdn.jsdelivr.net/gh/azoth8010/jinshouzhi@1.0.0/dist/index.js?theme=manfan'
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
  ├─ 注入主题 CSS
  ├─ import 原版核心（远程）
  ├─ 等它挂进 #extensions_settings2
  ├─ 把那个节点搬进浮层
  └─ 建悬浮球，点击开合
```

**搬节点，不重写。** 原版是打包产物，逻辑十二万字符；搬 DOM 能把「面板」变成「浮层」，功能一行不改。

## 已知限制

1. **依赖原版挂载点**。如果上游改了 `#extensions_settings2` 这个位置，搬不动。此时会自动降级：不搬，仍留在扩展面板里，只套主题。
2. **原版的卸载逻辑会失效**。它靠 `#extensions_settings2 > div[script_id]` 找自己，搬走后找不到。刷新页面即可恢复。
3. **同一页面只跑一份**。脚本自带单例锁，重复 import 会直接返回。
4. **移动端未充分验证**。浮层用了 `env(safe-area-inset-*)`，窄屏下按钮贴边。
