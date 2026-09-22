# Holy Night 重设计交接文档（阶段 5：视觉重设计）

> 用途：让新会话快速理解「项目已完成到哪、重设计做了什么、下一步怎么落地」。
> 阅读顺序：`AGENT.md` → `DECISIONS.md` → `DONT_DO.md` → 本文 → `design/魔法使之夜风格重设计方案.md` → 用浏览器打开 `design/mockup/holy-night-redesign.html`。
> 最后更新：2026-09-22（重设计方案与样稿已确认，项目代码尚未改动）。

---

## 1. 一句话现状

博客 Holy Night（Astro 4 纯 SSG + Vue 3 岛屿 + Tailwind v3 + Notion CMS + Vercel）的**功能阶段 0–4 已全部完成**（阶段 4 部署代码就绪、待用户手动上线）；在此之上又完成了一轮**视觉重设计的方案与高保真样稿**，但**还没有改动任何 `src/` 项目代码**。下一阶段（阶段 5）的任务是把样稿落地到真实项目。

---

## 2. 项目总进度

| 阶段 | 状态 | 说明 |
|---|---|---|
| 0 初始化 | ✅ 已完成 | Astro4 + Tailwind v3 + Vue 岛屿 + Notion 链路、空数据降级 |
| 1 页面 | ✅ 已完成 | 首页 / 归档 / 分类 / 标签 / 详情 / 关于 + Notion 块渲染、分页、上下篇 |
| 2 视觉（旧·鎏金） | ✅ 已完成 | 即将被阶段 5 取代的鎏金双主题 |
| 3 交互 | ✅ 已完成 | 目录跟随、返回顶部、响应式、入场动效、404、空状态、favicon |
| 4 部署/SEO | 🔶 代码就绪·待用户部署 | OG/Twitter/sitemap/robots、图片本地化、`DEPLOY.md`；GitHub/Vercel/Deploy Hook 需用户操作 |
| **5 视觉重设计** | 🎨 **方案+样稿已确认，代码未动** | 本文交接对象 |

> 阶段 0–4 的细节、实测版本号、构建命令见 `PROGRESS.md` 与 `DEPLOY.md`，本文件不重复。

---

## 3. 这轮重设计为什么发生

- 所有者对现有「深邃夜空 + 鎏金描边」视觉不满意，提供了 6 张《魔法使之夜》官方/同人图，要求体现游戏气质，并提出「背景放游戏原背景、组件偏透明」的方向。
- 对 6 张图做量化取色（脚本 `design/sample_colors.py`，证据见方案第 3 节），结论：**金色几乎不是游戏的颜色**——OST 封面 Logo 是白色明朝体 + 白色丝带；标志色是三组：外景冷调（夜蓝/紫灰/雪光青/银白）、馆内暖调（木褐/琥珀/羊皮纸）、月白（标题主强调）。
- 设计概念定为 **「双世界」：冷たい外の世界 / 暖かい館の内**：
  - 首页 / 归档 / 导航 / 列表 = 雾中冷调磨砂玻璃，月白文字；
  - 文章页 = 暖调「馆内夜读」面板，琥珀小标题、纸色正文；
  - 记忆点 = 首页 Hero 复刻 OST 封面（云隙光 + 银白衬线大标题 + 白色燕尾丝带）。
- 所有者的「透明组件 + 原图背景」方向保留，但必须用**三层背景（原图 + 遮罩 + 颗粒）**保证可读性，背景只做「空气」、按页面语义切换。

### 所有者已拍板（2026-09-22，可直接执行）

1. **颜色改动全部通过**：主强调色鎏金 `#d4af37` → **月白 `#e7e9f2`（冷区）/ 琥珀 `#d8a866`（暖区/hover）**；代码块左竖条金色 → **雪光青 `#9fd4e2`**（深色底不变）。
2. **背景采用「无角色、无 Logo 的原画局部」**（方案第 9 节策略 1），重度压暗/模糊/颗粒化；不使用 AI 生成图。
3. 文章页「暖暗面板 / 午后羊皮纸」双世界方向随样稿一并确认。

---

## 4. 设计产物清单（都在 `design/`）

| 路径 | 内容 | 去向 |
|---|---|---|
| `design/mockup/holy-night-redesign.html` | 单文件高保真样稿：首页/归档/样章三视图 + 「午后/夜」双主题，hash 路由 | **阶段 5 的视觉唯一基准**，逐组件对照实现 |
| `design/魔法使之夜风格重设计方案.md` | 12 节方案：取色证据、双世界、token、背景分层、组件规范、动效边界、版权、落地清单 | 实施依据 |
| `design/mockup/assets/bg-clouds.jpg` | 首页固定背景：云隙光（OST 封面顶部） | 上线素材（见 §7 注） |
| `design/mockup/assets/bg-slope.jpg` | 首页坡道引言带：雪坡小镇（无角色） | 上线素材 |
| `design/mockup/assets/bg-night.jpg` | 归档固定背景：雪夜天空带 + 烘焙雪粒（无角色） | 上线素材 |
| `design/mockup/assets/bg-warm.jpg` | 文章页固定背景：午后窗光木地板（无角色） | 上线素材 |
| `design/mockup/assets/bg-stairs.jpg` | 页脚背景：木楼梯书堆（无角色） | 上线素材 |
| `design/mockup/assets/cover-*.jpg`（6 张） | 样稿卡片/题图演示图，**多数含角色** | ❌ 不入库、不上线；真实封面来自 Notion |
| `design/*.py`（6 个） | `prep_assets / fix_clouds / fix_crops / fix_night_bg / fix_warm_bg / sample_colors`，可复现裁剪/模糊/取色 | 保留，改素材时重跑 |
| `design/mockup/_shots/` | 自检截图（桌面/移动/双主题） | 仅留档，不交付 |

**样稿已验证**：桌面 1440/1414、移动 320/360/390 实机视口，双主题，无横向溢出；代码块内部横滚；导航 320px 不裁切。

---

## 5. 落地前必须先改的规范文件（决策已批准，先登记后写码）

`DECISIONS.md` 规定 AI 不得擅自推翻已记录决策。所有者已批准，阶段 5 第一步应先更新规范，再动组件：

1. **`AGENT.md`**
   - 第一节「视觉风格」、5.1 整体气质：「鎏金描边」改为「双世界：冷たい外の世界（夜蓝/月白/雾）+ 暖かい館の内（木褐/琥珀/羊皮纸）」。
   - 5.2 配色：整段替换为方案 5.1/5.2 的 token（深色「夜」+ 浅色「午后」）。
   - 5.3 排版：西文/数字/丝带新增 **Cormorant Garamond**（中文仍 Noto Serif SC / Noto Sans SC）。
   - 5.4：卡片改 3px 圆角 + 银白细边 + 烛光 hover；导航滚动后毛玻璃；代码块竖条改雪光青。
2. **`DONT_DO.md` 第 18 条**：「代码块统一深色底 + **金色**左竖条」改为「统一深色底 + **雪光青 `#9fd4e2`** 左竖条」，其余表述不变。
3. **`DECISIONS.md`**：追加 2026-09-22 决策行——主色改月白/琥珀双世界、代码块竖条改雪光青、文章页暖暗/羊皮纸面板、固定背景三层（无角色原画局部）、新增 Cormorant 字体、背景图入库目录 `public/backgrounds/`。

---

## 6. 样稿 → 真实项目 映射

### 6.1 设计 token（样稿 `:root` 为唯一来源）

样稿用新变量名，项目用旧变量名，需整体迁移（代码量小，建议直接换成新名，不要长期保留两套）：

| 项目现变量（global.css） | 迁移到 |
|---|---|
| `--bg-page` / `--bg-page-end`（渐变） | `--night-1:#10162a` / `--night-2:#1a2036`（底色，大部分被固定背景遮住） |
| `--bg-card` rgba(20,27,48,.7) | `--glass` rgba(18,24,42,.46) / `--glass-2` rgba(22,28,48,.62) |
| `--accent` #d4af37（金，全站唯一强调） | **拆成两个语义**：`--silver` #e7e9f2（冷区/主强调）+ `--amber` #d8a866（暖区/hover） |
| `--accent-warm` #e9c76b | `--amber-soft` #e9c7a0 |
| `--text-primary` #e0e2eb | `--ink` #d9dce6（标题用 `--silver`） |
| `--text-secondary` #8a90a8 | `--mist` #8b91a6 |
| `--border` rgba(金,.3) | `--hairline` rgba(231,233,242,.14) / `--hairline-strong` .32 |
| 新增 | `--dusk` #51557e、`--silver-dim` #aeb6cc、`--ice` #9fd4e2、`--warm-panel` #1c1815、`--warm-text` #e6ddd0 |
| `--code-bg` #141a2a / `--code-border` 金 | 底用 `#141a2c` 不变；竖条改 `--ice` |
| `--font-serif` / `--font-sans` | 保留，新增 `--font-latin: 'Cormorant Garamond', …` |

浅色（`html.light`）成套见方案 5.2（羊皮纸 `#e6e2d8`/`#f5efe2`，文字转冷深色）。

### 6.2 组件 / 页面映射

| 样稿 | 真实项目文件 | 动作 |
|---|---|---|
| 三层固定背景 `.bg-layer/.bg-scrim/.bg-grain` + `body[data-view]` | `src/layouts/BaseLayout.astro` | 加 3 个 fixed 层 + 颗粒 data-URI；BaseLayout 增加 `view` prop 写到 `<body data-view>` |
| `.nav` 滚动前透明、滚动后毛玻璃、四角星品牌、发丝下划线 | `src/components/astro/NavBar.astro` | 改样式；**滚动切 class 是 JS，必须放进 Vue 岛屿**（见 §7 坑 2） |
| `.theme-btn`「午后/夜」 | `src/components/vue/ThemeToggle.vue` | 逻辑不变，文案/描边样式改为样稿 |
| Hero + 丝带 + SCROLL + 雪坡引言带 `.band` | `src/pages/index.astro` | 新增区块（纯静态 .astro） |
| `.card` 画框卡 + 空画框无封面态 | `src/components/astro/PostCard.astro` | 3px 圆角/银白细边/烛光 hover；无封面渲染空画框 + 四角星 |
| `.post-wrap/.toc/.panel` 暖暗阅读面板 | `src/layouts/PostLayout.astro` + `src/styles/markdown.css` + `src/components/vue/PostToc.vue` | 面板暖底、琥珀 h2、blockquote、冰青代码竖条。**注意差异**：样稿目录在左 220px，真实项目目录在右 240px 且带移动端悬浮按钮（`PostToc.vue`）；建议保留现有右侧结构与移动端浮层，只套样稿的暖调目录样式，避免重写交互 |
| `.archive-head/.tl` 菱形节点时间线 | `src/pages/archive.astro` + `src/components/astro/ArchiveTimeline.astro` | 丝带 + 云框 + 菱形节点（45° 方块） |
| 楼梯背景页脚 + 四角星 | `src/components/astro/Footer.astro` | 加背景与压暗遮罩 |
| 四角星 favicon | `public/favicon.svg` | 金色四角星 → 银白四角星（深底） |
| 分类/标签/关于/404 | `src/pages/categories/*`、`tags/*`、`about.astro`、`404.astro` | 样稿未覆盖，统一套冷调玻璃（用 home/default 背景），不新造风格 |

### 6.3 背景图按页面切换

- `data-view` 取值：`home`（首页）、`archive`（归档）、`post`（文章）、其余页给一个默认冷调（建议复用 home 云层或纯 `--night-1` 渐变，实施时定）。
- 各页遮罩值、`background-position`、`filter` 直接抄样稿 `body[data-view="…"]` 三段与 `html.light …` 三段。

---

## 7. 实施时最容易踩的坑（先读）

1. **背景图目录不能放 `public/images/`**：该目录已被 `.gitignore` 忽略（专供构建期下载的 Notion 图片，DONT_DO #29），提交了也不会上线。请新建**入库目录 `public/backgrounds/`** 放 5 张 bg-*.jpg；CSS 里用 `/backgrounds/bg-*.jpg` 引用。
2. **`.astro` 里禁止写前端交互 JS（DONT_DO #9）**：样稿里导航滚动切 `.scrolled`、主题切换、目录高亮都是内联 JS；真实项目里滚动效果要新建/复用 Vue 岛屿（如 `NavBarScroll.vue`，`client:load`），主题/目录沿用现有岛屿。丝带、卡片、时间线、引言带、页脚是纯 CSS，正常写 .astro。
3. **`position:fixed` 背景层的包含块**：祖先若残留 `transform/filter/backdrop-filter` 会让 fixed 退化（DONT_DO #24）。入场动画结束后必须 `transform:none`（现有 global.css 已这么做，迁移时保留）；颗粒/背景层放在 BaseLayout 最外层。
4. **入场动画不要用 `animation-fill-mode:both/backwards`（DONT_DO #23）**：样稿 `.view` 动画也遵守；迁移视图淡入时沿用无 fill 写法。
5. **动效边界**：过渡只在 200–400ms、只过渡具体属性（禁止 `transition:all`，DONT_DO #19）；**不做飘雪/星光闪烁/背景呼吸等循环动画**——雪粒已烘焙进 `bg-night.jpg`；支持 `prefers-reduced-motion`。
6. **宽度红线不动**：内容区 1200px、文章正文 800px（DONT_DO #8；样稿面板内栏 760px 是视觉稿，落地以既有 800px 约束为准）。
7. **字体非阻塞**：Cormorant Garamond 加进 BaseLayout 现有的 `preload as=style + onload` 链接（preload 与 noscript 两处 URL 都要改），禁止回退成渲染阻塞的 `rel=stylesheet`（DONT_DO #25）。样稿用的 `miaoda.feishu.cn` 字体镜像只用于本地样稿，真实项目仍走 Google Fonts。
8. **技术栈不变**：Astro 4 纯 SSG、Vue 3 岛屿、Tailwind v3、无组件库、无 `any`、无 SSR；`@astrojs/sitemap` 锁 `^3.2.1`（#28）。
9. **bg-clouds 顶部素材带一小块 OST 标题残字**：当前靠首页遮罩底部沉色完全盖住，但文件下缘仍有白色字形碎片。入库前把 `design/fix_clouds.py` 的裁剪从 `0.54*h` 收到约 `0.50*h` 重跑一次，做到文件本身无 Logo。
10. **headless 截图坑（验证用）**：本机 headless Chrome `--window-size=390` 实际 CSS 视口约 500，移动验证以真实浏览器 DevTools 设备模拟为准；整页截图对 `position:fixed` 背景有拼接伪影，属正常。

---

## 8. 建议实施顺序（阶段 5）

1. 改 §5 三个规范文件并登记决策（先立规矩）。
2. 地基：迁移 `global.css` token（双主题）、新增背景三层/颗粒/丝带/画框/四角星/时间线工具类；BaseLayout 加背景层 + `view` prop；字体加 Cormorant；favicon 换银星。
3. 背景图入库：新建 `public/backgrounds/`，按 §7-9 清理 bg-clouds 后放入 5 张 bg。
4. 组件：NavBar（含滚动岛屿）、ThemeToggle、PostCard（含空画框）、Footer、ArchiveTimeline。
5. 页面：index（Hero+引言带）、archive（雪夜头）、PostLayout + markdown.css（暖面板）、其余页统一冷调。
6. 验证（见 §9），通过后 git 提交（本仓库无全局身份，提交命令见 `PROGRESS.md` §10）。

---

## 9. 验收标准（阶段 5）

- `npm run build` 通过（DONT_DO #15），无控制台报错、无资源 404、无 `any`、无新增未登记依赖。
- 桌面 1440、移动 320/360/390 视口：首页/归档/文章/分类/标签/关于/404 均无横向溢出、无文字裁切；正文 800px 不变。
- 双主题切换无闪烁、刷新保持；浅/深下背景遮罩对比度足够，正文清晰。
- 视觉与样稿逐项一致（token、丝带、画框卡、空画框、菱形时间线、暖面板、冰青代码竖条、楼梯页脚）。
- 动效 200–400ms、无循环动画、reduced-motion 生效；入场动画无 fill-mode。
- 入库的背景图无角色、无 Logo、无标题残字；`public/images/` 仍未入库。
- Lighthouse 不明显回退（阶段 4 基线：桌面性能 ≥95、SEO 100）。

---

## 10. 版权与上线

- 5 张背景来自 TYPE-MOON 原画，即使无角色 + 重度处理，公开部署仍有版权风险（所有者已知情并选择此方案）。建议在页脚或 about 加一行致谢：`Visual inspiration from Witch on the Holy Night (TYPE-MOON)`，不暗示官方授权。
- 文章卡封面**不得**使用含角色的 cover-*.jpg；真实封面走 Notion 字段（本地化管线已就绪），无封面文章用空画框态。
- 阶段 4 的部署动作（GitHub/Vercel/Deploy Hook/域名）仍未完成，见 `DEPLOY.md`；阶段 5 可与之并行，但视觉上线前先在本地 `npm run build && npm run preview` 确认。

---

## 11. 仍需所有者提供 / 拍板

- 页脚致谢文案是否采用、放在页脚还是 about。
- 分类/标签/关于页的默认背景（复用云层 or 纯夜色），实施时可先按默认冷调做，再微调。
- 阶段 4 部署何时进行（与本阶段解耦）。
