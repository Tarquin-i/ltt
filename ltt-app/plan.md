# LTT App 开发计划

> 本文档记录项目的改造历程、当前状态和后续计划。
> 新对话时读取此文档即可恢复完整上下文。

## 项目概述

- **项目路径**：`/Users/trq/Desktop/ttn/ltt/ltt-app`
- **前端**：`client/` — uni-app + Vue 3（HBuilderX 开发）
- **后端**：`server/` — Express + PostgreSQL（保留，暂未改动）
- **Git 分支**：main

### 改造背景

原项目是"信码产品激活系统"（uni-app + Vue 2），只有一个扫码激活页面。
现改造为**电子书阅读器 App**，展示 Project Gutenberg 的
《The Art of Perfumery》by G.W. Septimus Piesse。
后续还会添加其他零散功能，因此采用可扩展的 Tab 导航架构。

### 电子书来源

原始文件保存在 `client/.doc/` 目录：
- HTML 文件：`The Project Gutenberg eBook of The Art of Perfumery, by G.W. Septimus Piesse..html`（约 11222 行）
- 图片目录：同名 `_files/` 文件夹，含 29 张 PNG 插图
- 书的结构：Preface + 16 个 Section + Appendix = 18 个章节

---

## 技术决策

| 项目 | 方案 | 说明 |
|------|------|------|
| 框架 | uni-app + Vue 3 | `manifest.json` 中 `vueVersion: "3"` |
| UI 库 | uview-plus | 图标组件 `u-icon`，easycom 按需引入 |
| 导航 | 底部 Tab 栏 | 阅读 Tab + 更多 Tab（预留扩展） |
| 内容提取 | Node.js + cheerio | `scripts/parseBook.js` 按 h2 拆分章节 |
| 富文本渲染 | mp-html 组件 | 通过 `pages.json` easycom 注册 |
| 目录导航 | 自定义左侧抽屉 | `ChapterDrawer.vue`，遮罩 + 侧滑面板 |
| 进度记忆 | uni.setStorageSync | composable 封装，记录章节 ID + 滚动位置 |
| 字体调节 | mp-html tag-style | 动态注入 font-size 到各 HTML 标签 |
| 深色模式 | mp-html tag-style + CSS class | 动态切换背景/文字颜色 |
| 章节加载 | 静态 import（非动态） | uni-app IIFE 输出不支持 code-splitting |
| 状态栏适配 | JS `uni.getWindowInfo().statusBarHeight` | CSS `var(--status-bar-height)` 在 APP 端不可靠 |
| APP 端图片 | 条件编译 `#ifdef APP-PLUS` + `file://` 路径 | `plus.io.convertLocalFileSystemURL` 转换本地路径 |

### 关键约束

- uni-app 编译到 App 端使用 IIFE 格式，**不能用动态 `import()`**
- mp-html 通过 easycom 自动注册，不需要手动 import
- uview-plus 通过 easycom 按需引入，模板中直接写 `<u-icon>` 即可
- 图片路径使用 `/static/images/book/xxx.png`，APP 端需通过条件编译转为 `file://` 本地路径
- tabBar 图标只能用本地 PNG 文件（uni-app 框架限制），不能用字体图标
- APP 端自定义导航栏不能依赖 CSS `var(--status-bar-height)`，需用 JS API 获取

---

## 已完成的修改

### ✅ 第 1 步：Vue 3 升级 + 项目骨架

**修改的文件：**
- `client/manifest.json` — `vueVersion: "3"`，应用名 → "LTT Reader"
- `client/main.js` — 精简为 Vue 3 `createSSRApp`（7 行）
- `client/App.vue` — `<script setup>` + Composition API，移除 iconfont CDN
- `client/pages.json` — 新路由 + tabBar + easycom 配置
- `client/styles/common.scss` — 清理旧样式，基础 reset + CSS 变量
- `client/package.json` — 移除 axios，添加 mp-html

**删除的文件/目录：**
- `client/pages/index/` — 旧扫码激活页面
- `client/services/` — 旧激活 API（appService.js）
- `client/utils/` — 未使用的通用 API（apiService.js）
- `client/uni.promisify.adaptor.js` — Vue 2 专用
- `client/styles/fonts.css` — iconfont 字体

**新建的文件：**
- `client/pages/book/index.vue` — 阅读主页面（290 行）
- `client/pages/more/index.vue` — "更多"占位页
- `client/static/tab/*.png` — 4 个 Tab 占位图标（81x81 纯色方块）

### ✅ 第 2 步：内容提取脚本

**新建：** `client/scripts/parseBook.js`

脚本逻辑：
1. cheerio 加载原始 HTML
2. 移除 `#pg-header` 和 `#pg-footer`
3. 按 `<h2>` 的 anchor id 拆分为 18 个章节
4. 清理：移除 pagenum span、修复图片路径、简化 Gutenberg 内链
5. 遇到 `<pre>`/`<section>`/`<style>`/`<script>` 标签停止（过滤浏览器插件注入内容）
6. 输出章节 JS 文件（export default 模板字符串）

**生成的文件：**
- `client/data/bookMeta.js` — 书籍元数据（标题、作者、18 章目录）
- `client/data/chapters/preface.js` ~ `appendix.js` — 18 个章节 HTML
- `client/static/images/book/` — 29 张 PNG 插图

章节大小参考：preface 4.8KB, section-03 最大 136KB, appendix 111KB

### ✅ 第 3 步：电子书阅读核心功能

**依赖：**
- `mp-html@^2.5.2`（dependencies）
- `uview-plus@^3.7.0`（dependencies）
- `cheerio@^1.1.0`（devDependencies）

**新建的文件：**

| 文件 | 职责 |
|------|------|
| `data/chapterLoader.js` | 静态 import 所有章节，同步返回 HTML 字符串 |
| `components/ChapterDrawer.vue` | 目录侧边栏：遮罩 + 左侧 560rpx 面板，显示章节列表 |
| `components/ReaderToolbar.vue` | 底部工具栏：目录按钮、A-/A+ 字体调节、深色模式切换 |
| `composables/useReadingProgress.js` | 阅读进度：currentChapterId + scrollTop，自动 watch 保存 |
| `composables/useReaderSettings.js` | 阅读设置：fontSize(14-24)、isDark，提供 tagStyle computed |

**阅读页面核心逻辑**（`pages/book/index.vue`）：
- 顶部自定义导航栏：☰ 目录按钮 + 章节标题 + 进度 (n/18)
- scroll-view 包裹 mp-html 渲染章节内容
- 底部章节切换按钮（← 上一章 / 下一章 →）
- 底部固定工具栏（ReaderToolbar）
- 目录抽屉（ChapterDrawer）
- onMounted 时恢复设置和进度，自动加载对应章节

### ✅ 第 4 步：样式细节

- 深色模式下章节切换按钮样式（border-color + text color）
- 导航栏深色模式适配

### 🔧 已修复的问题

1. **IIFE code-splitting 错误**
   - 现象：HBuilderX 编译报 `Invalid value "iife" for option "output.format" – UMD and IIFE output formats are not supported for code-splitting builds`
   - 原因：`chapterLoader.js` 使用了动态 `import()`
   - 修复：改为静态 `import` + 同步 `loadChapter()` 函数

2. **uview-plus SCSS 变量未定义**
   - 现象：编译报 `Undefined variable: $u-border-color`
   - 原因：`App.vue` 中 `@import "uview-plus/index.scss"` 引入的外部 SCSS 在编译时，`uni.scss` 的变量还未注入
   - 修复：在 `App.vue` 的 `<style>` 中先引入 `uview-plus/theme.scss`，再引入 `uview-plus/index.scss`

3. **APP 端 CSS `var(--status-bar-height)` 不生效**
   - 现象：打包 Android APP 后，阅读器顶部导航栏与系统状态栏重叠
   - 原因：自定义导航栏页面中 CSS 变量未被正确注入
   - 修复：改用 JS `uni.getWindowInfo().statusBarHeight` + 内联 style 动态绑定

4. **APP 端 mp-html 图片路径无法解析**
   - 现象：打包后章节内所有图片不显示
   - 原因：`plus.io.convertLocalFileSystemURL` 返回路径缺少 `file://` 前缀
   - 修复：增加前缀保障 + try/catch 防护

5. **章节模板字符串格式不安全**
   - 现象：部分章节从目录跳转后内容为空
   - 修复：`parseBook.js` 输出改用 `JSON.stringify`（双引号字符串），并增加 `isSwitching` 竞态防护

---

## 当前状态

Bug 3（部分章节内容为空）的深层根因已定位并实施了第一轮修复，但 mp-html 组件在 Vue 3 模式下仍有兼容性问题（`TypeError: Cannot read properties of undefined (reading 'style')`），正在排查中。**考虑将 Vue 版本从 3 降回 2 来彻底规避 mp-html 的 Vue 3 兼容性问题。**

### 已实现功能

- ✅ 书架页面（书籍卡片 + 阅读进度显示）
- ✅ 底部 Tab 导航（阅读 + 更多，带图案图标）
- ✅ 电子书内容渲染（mp-html 富文本，含 29 张图片）
- ✅ 目录侧边栏导航（18 个章节）
- ✅ 章节切换（上一章/下一章按钮）
- ✅ 字体大小调节（14px ~ 24px，watch + 强制重渲染）
- ✅ 深色模式切换（高对比度文字颜色）
- ✅ 阅读进度记忆（章节 + 滚动位置，localStorage）
- ✅ uview-plus UI 库集成（图标组件，后续可用更多组件）

---

## ✅ 已修复：4 个 UI 问题

### ✅ 问题 1：字体大小调节无效

**修复**：在 `reader/index.vue` 中添加 `watch` 监听 `fontSize` 和 `isDark`，变化时清空 `chapterHtml` → `nextTick` → 重新赋值，强制 mp-html 重新解析。

### ✅ 问题 2：Tab 图标显示方框

**修复**：用 ImageMagick 生成 81x81 PNG 图标（书本图案 + 三点图案），替换占位图。后续可从 iconfont.cn 下载更精致的图标覆盖。

### ✅ 问题 3：暗黑模式文字颜色太浅

**修复**：提高 4 个文件中的暗黑模式文字颜色亮度：
- `useReaderSettings.js`：body `#ccc`→`#e0e0e0`, h2 `#eee`→`#f0f0f0`, h3/h4 `#ddd`→`#e8e8e8`
- `ChapterDrawer.vue`：标题 `#f0f0f0`, 章节 `#e8e8e8`, 副标题 `#aaa`
- `ReaderToolbar.vue`：文字 `#e0e0e0`
- `reader/index.vue`：导航栏 `#e0e0e0`, 章节按钮 `#bbb`

### ✅ 问题 4：阅读页应先显示书架

**修复**：
- `pages/book/index.vue` → 重写为书架页（书籍卡片 + 进度 + 封面图）
- 新建 `pages/reader/index.vue` → 阅读页（迁移全部阅读逻辑 + 返回按钮）
- `pages.json` → 添加 reader 路由，book 页面标题改为"书架"

---

## ✅ 已修复：3 个 UI 反馈

用户在 HBuilderX 编译测试后反馈，已全部修复。

### ✅ 反馈 1：暗黑模式文字还是太淡

颜色再提亮一档，接近白色：
- `useReaderSettings.js`：body `#e0e0e0`→`#f0f0f0`, h2→`#ffffff`, h3/h4→`#f5f5f5`
- `ChapterDrawer.vue`：标题→`#ffffff`, 章节→`#f0f0f0`, 副标题→`#bbb`
- `ReaderToolbar.vue`：文字→`#f0f0f0`
- `reader/index.vue`：导航栏→`#f0f0f0`, 章节按钮→`#ddd`, u-icon color 同步

### ✅ 反馈 2：字体调节只有标题变化，正文不变

**根因**：mp-html 中各标签不继承 `body` 的 `font-size` 和 `color`，需要每个标签显式设置。

**修复**：`useReaderSettings.js` 的 `tagStyle` 中给 `p`、`div`、`span`、`a`、`td` 都加上 `font-size` 和 `color`。

**关键教训**：mp-html 的 tag-style 不支持 CSS 继承，每个标签必须独立设置所有样式属性。章节 HTML 中除了 `<p>` 还有 `<div class="poem">`、`<span>` 等标签包裹的诗歌/引用内容。

### ✅ 反馈 3：Tab 图标用 uview-plus 现成图标代替

下载 uview-plus 字体 TTF（`https://at.alicdn.com/t/font_2225171_8kdcwk4po24.ttf`），用 ImageMagick 渲染为 81x81 PNG：
- 阅读 Tab：`bookmark-fill`（Unicode `\ue63b`）— 书签实心图标
- 更多 Tab：`more-circle`（Unicode `\ue63e`）— 更多圆形图标
- 各生成灰色 #999（未选中）和深色 #333（选中）两个版本

---

## 待优化 / 后续计划

### 短期（当前迭代）
- [ ] **决策：Vue 3 → Vue 2 降级**：mp-html 在 Vue 3 下有多处兼容性问题（$set、条件编译、空节点 TypeError），降回 Vue 2 可彻底规避
- [ ] 编译验证：重新打包 Android APP 验证所有修复效果
- [ ] 图片路径兼容性：确认 `file://` 前缀修复后 App 端图片正常加载

### 中期
- [ ] "更多"页面添加实际功能（根据用户后续需求）
- [ ] 书签功能
- [ ] 搜索功能（全文搜索）

### 长期
- [ ] 后端 API 对接（用户系统、书签同步等）
- [ ] 多本书支持（书架功能）

---

## 目录结构

```
ltt-app/
├── plan.md                        # 本文档
├── client/                        # 前端（uni-app + Vue 3）
│   ├── .doc/                      # 原始电子书 HTML + 图片（参考用）
│   ├── .hbuilderx/launch.json     # HBuilderX 启动配置
│   ├── App.vue                    # 应用根组件
│   ├── main.js                    # 入口（createSSRApp + uview-plus）
│   ├── manifest.json              # uni-app 配置（vueVersion: "3"）
│   ├── pages.json                 # 路由 + tabBar + easycom
│   ├── index.html                 # SPA 入口
│   ├── package.json               # 依赖：mp-html, uview-plus, cheerio(dev)
│   ├── uni.scss                   # uni-app SCSS 变量 + uview-plus 主题
│   ├── pages/
│   │   ├── book/index.vue         # 书架页面（书籍卡片列表）
│   │   ├── reader/index.vue       # 电子书阅读页面
│   │   └── more/index.vue         # "更多"占位页
│   ├── components/
│   │   ├── ChapterDrawer.vue      # 目录侧边栏
│   │   └── ReaderToolbar.vue      # 底部工具栏
│   ├── composables/
│   │   ├── useReadingProgress.js  # 阅读进度记忆
│   │   └── useReaderSettings.js   # 字体 + 深色模式设置
│   ├── data/
│   │   ├── bookMeta.js            # 书籍元数据
│   │   ├── chapterLoader.js       # 章节加载器（静态 import）
│   │   └── chapters/              # 18 个章节 HTML 片段
│   ├── scripts/
│   │   └── parseBook.js           # 构建脚本：HTML → 章节数据
│   ├── static/
│   │   ├── images/book/           # 29 张书中插图
│   │   ├── tab/                   # Tab 图标（uview-plus 字体渲染）
│   │   └── logo.png
│   └── styles/
│       └── common.scss            # 全局样式
├── server/                        # 后端（Express + PostgreSQL，暂未改动）
│   ├── index.js                   # 单文件服务，POST /api/activate
│   ├── .env                       # DATABASE_URL
│   └── package.json
└── .gitignore
```

---

## 变更日志

### 2025-02-07 — 初始改造

- 将"信码产品激活系统"完全改造为电子书阅读器 App
- Vue 2 → Vue 3 升级
- 新建阅读页面、目录组件、工具栏组件、composables
- 编写 parseBook.js 脚本提取 18 个章节 + 29 张图片
- 修复 IIFE code-splitting 编译错误

### 2026-02-07 — 修复 4 个 UI 问题

- 拆分书架页 + 阅读页（book/index.vue → 书架，新建 reader/index.vue）
- 修复字体调节无效（watch + 强制 mp-html 重渲染）
- 修复暗黑模式文字对比度不足（4 个文件颜色提亮）
- 替换 Tab 占位图标为带图案的 PNG（ImageMagick 生成）
- 阅读页添加返回按钮

### 2026-02-07 — 集成 uview-plus

- 安装 uview-plus UI 库（`npm install uview-plus`）
- 配置 4 个文件：`main.js`（app.use）、`pages.json`（easycom）、`App.vue`（全局样式）、`uni.scss`（主题变量）
- 用 `u-icon` 组件替换阅读页导航栏和工具栏中的 Unicode 字符图标（← → `arrow-left`，☰ → `list`）
- A+/A- 和 ☀/☾ 保留 Unicode 字符（uview-plus 无对应内置图标）
- 修复 SCSS 变量未定义报错：`App.vue` 中需先引入 `theme.scss` 再引入 `index.scss`

### 2026-02-07 — 修复 3 个 UI 反馈

- 暗黑模式文字颜色再提亮（`#e0e0e0`→`#f0f0f0`，标题→`#ffffff`）
- 修复字体调节只影响标题：`p`/`div`/`span`/`a`/`td` 标签都加上 `font-size` 和 `color`
- mp-html tag-style 关键教训：不支持 CSS 继承，每个标签必须独立设置
- Tab 图标改用 uview-plus 字体渲染（bookmark-fill + more-circle）

### 2026-02-07 — 阅读器排版优化

- 去掉 `<p>` 标签的 `text-align: justify`（两端对齐），改为默认左对齐，解决单词间距不一致问题
- 添加 `text-indent: 2em` 实现首行缩进
- 修改文件：`composables/useReaderSettings.js` tagStyle 中的 `p` 标签样式

### 2026-02-07 — 段落级阅读进度

- 实现阅读进度精确到段落级别，恢复时直接定位到上次阅读的段落
- 技术方案：mp-html `use-anchor` + `navigateTo(id)` 锚点跳转 + `in()` 绑定 scroll-view
- `data/chapterLoader.js`：运行时用正则给 `<p>` 标签注入递增 id（`p-0`, `p-1`, ...），返回 `{ html, paragraphCount }`
- `composables/useReadingProgress.js`：新增 `paragraphId` 字段，向后兼容旧数据
- `pages/reader/index.vue`：
  - mp-html 启用 `use-anchor`，监听 `@load` 事件
  - `@load` 后通过 `createSelectorQuery` 批量查询段落位置并缓存
  - 滚动时二分查找 O(log n) 确定当前段落 id
  - 恢复时调用 `navigateTo(paragraphId)` 定位（基于实时 DOM 位置，不受字体大小影响）
  - 字体/暗黑模式切换时暂存 paragraphId，重渲染后自动恢复

### 2026-02-07 — 修复 App 端图片不显示

- **根因**：章节 HTML 中图片路径为 `/static/images/book/xxx.png`（根路径），H5 端正常，但 App 端没有 web server，根路径无法解析
- **修复**：`data/chapterLoader.js` 中通过 `#ifdef APP-PLUS` 条件编译，用 `plus.io.convertLocalFileSystemURL('_www/')` 获取本地文件系统路径，将 `/static/` 替换为 `file:///...` 绝对路径

### 2026-02-07 — 重新整理章节元数据

- 修正 3 个 Section 的 subtitle：section-02（Expression, Distillation, Maceration, Absorption）、section-05（Smelling Salts and Acetic Acid）、section-07（Sachets, Pastils and Fumigation）
- 为每个章节添加 `description` 字段（从原书目录提取的详细内容摘要），仅存储不显示
- 附录（Appendix）添加 `subChapters` 数组，包含 29 个子章节的 `{ title, anchor }` 信息
- `ChapterDrawer.vue` 支持附录子章节缩进展开显示，点击后跳转到对应锚点位置
- `reader/index.vue` 的 `onSelectChapter` 支持 anchor 参数，通过 mp-html `navigateTo(anchor)` 实现锚点跳转
- 修改文件：`scripts/parseBook.js`、`data/bookMeta.js`（重新生成）、`components/ChapterDrawer.vue`、`pages/reader/index.vue`

### 2026-02-07 — 更换 App 图标

- 使用用户提供的插画图片（482x482 正方形）作为 App 图标
- 用 macOS `sips` 工具生成 17 种尺寸的 PNG 图标（20x20 ~ 1024x1024）
- 输出到 `unpackage/res/icons/` 目录，与 `manifest.json` 中的图标路径配置一致
- 覆盖 Android（hdpi/xhdpi/xxhdpi/xxxhdpi）和 iOS（iPhone/iPad/AppStore）全部尺寸

### 2026-02-07 — 修复 App 打包后三个 Bug

打包成 Android APP 后出现三个问题（H5 开发模式正常），逐一修复：

**Bug 1：导航栏与系统状态栏重叠**
- 根因：CSS `var(--status-bar-height)` 在 APP 端自定义导航栏页面中未被正确注入
- 修复：改用 JS `uni.getWindowInfo().statusBarHeight` 获取实际高度，通过内联 `:style` 动态绑定
- 导航栏高度从 `88rpx` 改为固定 `44px`，paddingTop 由 JS 动态计算
- ChapterDrawer 的 drawer-header 同步改为动态 paddingTop（新增 `statusBarHeight` prop）
- 修改文件：`pages/reader/index.vue`、`components/ChapterDrawer.vue`

**Bug 2：章节内图片全部加载失败**
- 根因：`plus.io.convertLocalFileSystemURL('_www/')` 返回的路径可能缺少 `file://` 前缀
- 修复：增加 `file://` 前缀保障逻辑，并用 try/catch 包裹防止异常导致章节加载失败
- 修改文件：`data/chapterLoader.js`

**Bug 3：部分章节从目录跳转后内容为空**
- 修复措施（多管齐下）：
  1. `scripts/parseBook.js` 章节输出格式从模板字符串 `` export default `...` `` 改为 `export default JSON.stringify(...)`（双引号字符串），更安全可靠
  2. 重新运行 `parseBook.js` 生成所有 18 个章节文件
  3. `pages/reader/index.vue` 增加 `isSwitching` 标志位，防止 `switchChapter` 与 settings watch 回调之间的竞态条件（watch 中 `chapterHtml=''` → `nextTick` → 恢复，可能与章节切换交错执行）
- 修改文件：`scripts/parseBook.js`、`data/chapters/*.js`（重新生成）、`pages/reader/index.vue`

### 2026-02-07 — 深入排查 Bug 3：mp-html 渲染管线分析

用户反馈 Bug 3（部分章节内容为空）仍未修复，进行了深入的 mp-html 源码分析。

**根因定位**：`use-anchor` + 大量 `id` 属性导致 mp-html 渲染路径退化

具体调用链：
1. `chapterLoader.js` 的 `addParagraphIds()` 给每个 `<p>` 注入 `id="p-0"`, `id="p-1"` ...
2. 章节原始 HTML 本身也有大量 `id`（`Page_XX`, 章节锚点, 脚注锚点等）
3. mp-html 的 `parser.js:275-276`：当 `useAnchor` 启用时，每个有 `id` 的节点都调用 `expose()`
4. `expose()`（parser.js:211-217）遍历整个祖先栈，设置 `item.c = 1`
5. 在 `node.vue` 渲染时，`n.c` 为 truthy 的节点**跳过**高效的 `<rich-text>` 渲染（node.vue:73-77），转而走**递归 `<node>` 组件**渲染（node.vue:79-82）
6. 关键：在 APP-PLUS + VUE3 模式下，`node` 组件**未在 components 中注册**（node.vue:161-163 的条件编译 `#ifndef ((H5 || APP-PLUS) && VUE3)`）

数据佐证（ID 数量 = expose() 调用次数）：
- section-03: 247 `<p>` + 107 原有 ID = 354 次 expose()，140KB
- appendix: 171 `<p>` + 102 原有 ID = 273 次 expose()，113KB
- section-06: 39 `<p>` + 22 原有 ID = 61 次 expose()，78KB

**修复措施**：
1. `pages/reader/index.vue`：移除 `use-anchor` 属性、段落追踪逻辑（paragraphCache、buildParagraphCache、findCurrentParagraph 等）、navigateTo 调用，简化为纯 scrollTop 进度恢复
2. `data/chapterLoader.js`：移除 `addParagraphIds` 函数，`loadChapter` 返回纯字符串
3. `composables/useReadingProgress.js`：移除 `paragraphId` 字段
4. `scripts/parseBook.js`：`cleanHtml` 中移除无用 id 属性（`Page_XX`、`FN*`、`Footnote_*`）
5. 重新运行 `parseBook.js` 生成所有章节文件（ID 数量大幅减少）

**功能影响**：
- 阅读进度恢复从段落级精度降为 scrollTop 像素级精度（体验差异很小）
- 附录子章节锚点跳转暂时失效（改为跳转到章节顶部）

修改文件：`pages/reader/index.vue`、`data/chapterLoader.js`、`composables/useReadingProgress.js`、`scripts/parseBook.js`、`data/chapters/*.js`

### 2026-02-07 — mp-html node.vue 空填充节点 TypeError

修复上述问题后，H5 开发模式出现新错误：
```
TypeError: Cannot read properties of undefined (reading 'style')
```

**根因**：mp-html `node.vue:152` 的 `childs` watcher 中，当新节点列表比旧列表短时，用 `nodes.push({})` 填充空对象。空对象 `{}` 没有 `attrs` 属性，在模板渲染时一路 fall through 到 `node.vue:73` 的 `handler.isInline(n.name, n.attrs.style)`，`n.attrs` 为 undefined 触发 TypeError。

**尝试修复**：修改 `node_modules/mp-html/.../node/node.vue:152`，将 `nodes.push({})` 改为 `nodes.push({ name: '', attrs: {} })`。

**结果**：修改 node_modules 后错误仍然出现，可能是 HBuilderX 编译缓存未更新，或者还有其他触发路径。

**核心问题**：mp-html v2.5.2 对 Vue 3 的兼容性存在多处问题：
- `this.$set()` 是 Vue 2 API，Vue 3 中需要 compat 模式
- `node.vue` 的 `components` 注册在 APP-PLUS + VUE3 模式下被条件编译排除
- 空填充节点缺少必要属性导致模板渲染崩溃
- 这些问题在 H5 模式和 APP 模式下都会触发，只是表现不同

**待决策**：考虑将项目从 Vue 3 降回 Vue 2，彻底规避 mp-html 的 Vue 3 兼容性问题。mp-html 最初是为 Vue 2 设计的，Vue 2 模式下这些条件编译分支都能正常工作。
