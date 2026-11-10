# 归属与来源

## 金手指 / 变量管理器

- 原作者：**络络**（GitHub [@lolodesu_](https://github.com/lolodesu_)，展示名 lolo-desu）
- 原始仓库：<https://github.com/lolo-desu/lolocard>
- 原始入口：`dist/变量管理器/index.js`
- 原协议：以原作者仓库声明为准；本仓库未修改其源码，仅在运行时加载

本仓库做的是**外壳与主题**：把原版挂载出来的节点搬进浮层、加一个悬浮球、提供可换的 CSS 变量皮肤。原版功能一行未改。

## 骰子脚本（由本仓库的宿主卡引用，不在本仓库内）

- 原作者：**怀雪**（@huai_xue）
- 用途：迷宫饭角色卡的骰池与判定
- 改造：判定数学（D100 下滚）由 azoth8010 调整

## 本仓库

- 外壳、加载器、主题：azoth8010（[@azoth8010](https://github.com/azoth8010)）
- 协议：MIT（见 `LICENSE`）

## 二次使用

- 可以直接 `import` 本仓库的 `dist/index.js`
- 可以照 `dist/themes/manfan.css` 写自己的主题，放在 `dist/themes/` 下
- **不要**把原版 `变量管理器` 的打包产物复制进本仓库再发布——保持远程加载，原作者更新时才跟得上
