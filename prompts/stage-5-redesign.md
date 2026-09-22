# 阶段 5：视觉重设计落地（《魔法使之夜》「双世界」）

> 前置：阶段 0–4 已完成（功能与部署代码就绪）。本阶段只做视觉，不改技术栈、不改内容模型、不改数据链路。

## 开工前必读（按顺序，读完再动手）

1. `AGENT.md`、`DECISIONS.md`、`DONT_DO.md`（项目最高规则）
2. `REDESIGN_HANDOFF.md`（本轮重设计交接，含完整映射与坑）
3. `design/魔法使之夜风格重设计方案.md`（设计依据，12 节）
4. 用浏览器打开 `design/mockup/holy-night-redesign.html`（**视觉唯一基准**：首页 / 归档 / 样章三视图 + 右上角「午后/夜」双主题）

## 背景与已拍板决策（无需再问，直接执行）

所有者已确认：

1. 弃用鎏金：主强调色改为**月白 `#e7e9f2`（冷区）/ 琥珀 `#d8a866`（暖区与 hover）**；代码块左竖条金色 → **雪光青 `#9fd4e2`**（深色底不变）。
2. 设计概念「双世界」：列表/导航/归档为冷调雾中磨砂玻璃，文章页为暖调「馆内夜读」面板。
3. 固定背景使用**无角色、无 Logo 的原画局部**（已在 `design/mockup/assets/` 备好 5 张 bg-*.jpg），三层处理（原图 + 遮罩 + 颗粒），不做飘雪等循环动画。
4. 记忆点：首页 Hero 复刻 OST 封面（云隙光 + 银白衬线大标题 + 白色燕尾丝带）。

## 具体任务

### 0. 先更新规范（决策已批准，先登记后写码）

- 改 `AGENT.md`：第一节视觉风格、5.1、5.2（整段换成方案 5.1/5.2 token）、5.3（新增 Cormorant Garamond）、5.4（卡片 3px 圆角银白细边、烛光 hover、滚动毛玻璃导航、代码块冰青竖条）。
- 改 `DONT_DO.md` 第 18 条：代码块竖条由金色改为雪光青 `#9fd4e2`，深色底/双主题统一不变。
- 在 `DECISIONS.md` 末尾追加 2026-09-22 决策：主色改月白/琥珀双世界、代码块竖条改冰青、文章页暖暗/羊皮纸面板、固定背景三层（无角色原画局部）、新增 Cormorant、背景图入库目录 `public/backgrounds/`。

### 1. 地基

- `src/styles/global.css`：按方案 5.1/5.2 整体迁移双主题 token（变量对照见 `REDESIGN_HANDOFF.md` §6.1）；新增背景三层、颗粒（SVG feTurbulence data-URI）、四角星、丝带（clip-path 燕尾）、画框卡、空画框、菱形时间线等工具类。
- `src/layouts/BaseLayout.astro`：加 `.bg-layer/.bg-scrim/.bg-grain` 三个 fixed 层；新增 `view` prop（home/archive/post/default）写到 `<body data-view>`，按样稿三段 `body[data-view=…]` 切背景与遮罩；favicon 引用保持。
- 字体：在现有**非阻塞** Google Fonts 链接（preload + onload + noscript 两处）加入 Cormorant Garamond 500/600，禁止回退成渲染阻塞式 `rel=stylesheet`。
- `public/favicon.svg`：金色四角星改银白四角星（深底）。

### 2. 背景素材入库

- 新建 **`public/backgrounds/`**（注意：**不能放 `public/images/`**，该目录被 .gitignore 忽略、专供 Notion 图片）。
- 把 `design/mockup/assets/` 的 `bg-clouds/bg-slope/bg-night/bg-warm/bg-stairs.jpg` 复制进去；入库前把 `design/fix_clouds.py` 裁剪由 `0.54*h` 收到约 `0.50*h` 重跑，去除 bg-clouds 下缘残留的 OST 标题字形。
- `cover-*.jpg` 含角色，**不入库不上线**；文章封面仍走 Notion 字段。

### 3. 组件（视觉对照样稿）

- `NavBar.astro`：银白品牌 + 四角星、链接发丝下划线（hover 琥珀、激活银白）、滚动前透明 / 滚动后 `--glass-2` + 14px 模糊 + 底部发丝线；**滚动切 class 是交互，放进 Vue 岛屿**（新建 `NavBarScroll.vue` `client:load`，或等效做法），`.astro` 内不写 JS。
- `ThemeToggle.vue`：逻辑与 localStorage/防 FOUC 不变，样式与文案改为描边小框「午后 / 夜」。
- `PostCard.astro`：3px 圆角、1px 银白发丝边、玻璃底、hover 上浮 2px + 边框转琥珀 + 极淡琥珀外发光、封面 16:9 缓慢放大；**无封面文章渲染空画框（内嵌细边 + 中央四角星）**。
- `Footer.astro`：木楼梯背景 + 强压暗遮罩 + 中央四角星；加一行致谢 `Visual inspiration from Witch on the Holy Night (TYPE-MOON)`（不暗示官方授权）。
- `ArchiveTimeline.astro` + `archive.astro`：归档头（丝带 ARCHIVE + 云框）、年份 Cormorant 大字 + 发丝线、左侧竖线 + 菱形节点（45° 方块）、hover 节点转琥珀。

### 4. 页面

- `index.astro`：Hero（云隙光背景 + 银白 `Holy Night` + 白色丝带 `WITCH ON THE HOLY NIGHT` + 副标题 + 竖排 SCROLL）、「最新文章」分隔、卡片栅格、雪坡引言带（日文句 + 中文小注，唯一抒情段）。
- `PostLayout.astro` + `markdown.css` + `PostToc.vue`：居中暖暗面板（浅色为羊皮纸）、21:9 题图、琥珀 h2、blockquote 琥珀竖条、**代码块深色底 + 冰青竖条**、行内 code 琥珀底。注意样稿目录在左、真实项目目录在右（240px）且带移动端悬浮按钮——**保留现有右侧目录结构与移动端浮层逻辑**，只套样稿的暖调目录样式，不重写交互。
- `categories/[category]`、`tags/[tag]`、`about.astro`、`404.astro`：样稿未覆盖，统一套冷调玻璃与默认背景，不新造风格。

### 5. 约束（违反即返工）

- 技术栈锁定：Astro 4 纯 SSG、Vue 3 岛屿、Tailwind v3、npm、Vercel；不引入组件库/新 UI 依赖/SSR；不用 `any`；Notion 数据只走 `src/lib/notion.ts`。
- 交互只在 `.vue` 岛屿，`.astro` 零 JS；数据仍在构建期拉取。
- 内容区 1200px、文章正文 800px 不变；过渡 200–400ms、只过渡具体属性（禁 `transition:all`）；无循环动画；入场动画无 fill-mode；fixed 浮层祖先不残留 transform；支持 `prefers-reduced-motion`。
- 改造完成后更新 `PROGRESS.md`（或在本文件 / REDESIGN_HANDOFF 标注完成状态）。

## 输出要求

- 全站视觉与样稿一致：双主题切换流畅、无闪烁、刷新保持；三视图（首页/归档/文章）以及分类/标签/关于/404 无样式错乱、无横向滚动。
- 背景在浅/深双主题下遮罩对比度足够，正文清晰；入库背景无角色、无 Logo、无标题残字。
- 不破坏阶段 0–4 的既有功能（分页、目录跟随、上下篇、SEO、图片本地化、空状态降级）。

## 验收标准

1. `npm run build` 通过（DONT_DO #15），无控制台报错、无资源 404、无新增未登记依赖。
2. 桌面 1440、移动 320/360/390 实机视口逐页检查无横向溢出、无文字裁切、无导航换行。
3. 与样稿逐项核对：token、丝带 Hero、画框卡与空画框、雪坡引言带、菱形时间线、暖暗/羊皮纸面板、冰青代码竖条、楼梯页脚、四角星 favicon。
4. 双主题在 320px 下也不溢出；代码块在窄屏内部横滚不撑破面板。
5. `AGENT.md / DECISIONS.md / DONT_DO.md` 已同步更新；`public/backgrounds/` 入库、`public/images/` 仍未入库。
6. Lighthouse 不明显回退（阶段 4 基线：桌面性能 ≥95、SEO 100）。
7. 完成后 git 提交（提交信息示例：`阶段 5：魔法使之夜双世界视觉重设计`）。
