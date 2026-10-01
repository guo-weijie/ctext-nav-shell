# ctext-nav-shell · 古籍导航

[中国哲学书电子化计划（ctext.org）](https://ctext.org) 的浏览前端：收录 **49,638** 种古籍书目，可按**朝代**与**经史子集四部**两级分类检索，点击书目卡片一键跳转原站阅读正文。

## 特性

- **左侧目录树 + 右侧书目卡片流**：树支持「按朝代」「按四部（部 → 类）」两级展开，仅叶子节点加载书单；树占满一屏、内部滚动。
- **变高行虚拟滚动**：5 万本书全量渲染只画可视区 + 缓冲行，滚动流畅；卡片宽度随书名自适应，书名单行完整显示（不截断、不换行）。
- **全量繁简互通搜索**：基于 OpenCC 将查询词与书名统一归一为简体后匹配——简体「论语」可命中繁体「論語」，反之亦然。OpenCC 词典按需分包，仅首次搜索加载，首屏体积不受影响。
- **三语界面**（简体 / 繁体 / English）与 **浅色 / 深色主题**，跟随系统并可手动切换。
- **零运行时外部请求**：目录数据落盘为静态 JSON，同源读取，彻底规避 api.ctext.org 慢/断流问题。

## 技术栈

Vite 5 · Vue 3（`<script setup>` + TS）· Pinia · Vue Router · vue-i18n · UnoCSS · opencc-js

## 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 开发服务器 http://localhost:5173
npm run build      # 生产构建（输出 dist/）
npm run preview    # 预览生产构建 http://localhost:4173
npm run typecheck  # vue-tsc 类型检查
```

## 项目结构

```
public/data/catalog.json   # 全部书目数据（books + dynastyOrder + sikuOrder）
src/
├── api/                   # （已清理）原 ctext API 适配层，见 git 历史
├── components/
│   ├── AppShell.vue       # 应用壳：顶栏（搜索/主题/语言）+ 路由出口 + 页脚
│   ├── CategoryTree.vue   # 左侧目录树（朝代 / 四部两级 / 未分类）
│   ├── VirtualBookList.vue# 右侧书目卡片流（行虚拟化 + 自适应宽度）
│   ├── SearchBar.vue      # 顶部搜索框（写入 search store，原地过滤）
│   ├── ThemeSwitcher.vue / LanguageSwitcher.vue
│   └── AttributionFooter.vue
├── stores/
│   ├── catalog.ts         # 目录数据、分类索引（dynastyCategories / sikuTree / booksIn）
│   ├── search.ts          # 搜索（OpenCC 繁简归一 + 缓存）
│   ├── theme.ts / locale.ts
├── utils/url.ts           # URN → 原站阅读页 URL（混合规则）
├── utils/normalize.ts     # OpenCC 繁→简转换器（动态加载）
├── views/HomeView.vue     # 主视图：树 + 书单 / intro 面板 / 全量搜索结果
└── i18n/                  # 三语文案
```

## 数据说明

- `catalog.json` 每条记录：`{ title, urn, dynasty, siku }`；未分类书 `dynasty`/`siku` 均为 `null`（左侧树「未分类」桶，约 7,599 本，多为单字/残篇）。
- `dynastyOrder`（19 键）与 `sikuOrder`（42 键，`经部·春秋类` 格式）保留源分类文件的维度顺序。
- **URN 跳转规则**（`src/utils/url.ts`）：知名经典（如 `ctp:analects`）直达 `https://ctext.org/<name>/zh`；其余（`ctp:wbXXXXXX`）走官方解析器 `https://ctext.org/library?urn=<...>`，避免被重定向回首页。

## 已知限制

- 书单互斥单桶：每本书只归属一个分类，不双重归属。
- 本站仅提供书目导航与跳转，正文内容版权归 ctext.org 所有。
