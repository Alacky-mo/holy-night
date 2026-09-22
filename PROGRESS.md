# Holy Night 开发进度与交接说明

> 用途：阶段 5（视觉重设计·双世界）交接。新会话先读 
>
> `AGENT.md`
>
> 、
>
> `DECISIONS.md`
>
> 、
>
> `DONT_DO.md`
>
> ，再读本文件与 
>
> `prompts/stage-5-redesign.md`
>
> 、
>
> `REDESIGN_HANDOFF.md`
>
> 、
>
> `design/魔法使之夜风格重设计方案.md`
>
> 、
>
> `design/mockup/holy-night-redesign.html`
>
> （样稿 = 视觉唯一基准，以它为准）。
> 最后更新：2026-09-22（阶段 5 验收修复：引言带羽化/午后协调、sticky footer、页脚羽化）

## 一、项目一句话

个人内容创作博客「Holy Night」：Notion 作为 Headless CMS，**Astro 4 纯 SSG** 构建，Vue 3 岛屿做交互，Tailwind v3 + CSS 变量实现《魔法使之夜》「双世界」双主题（冷调外景「夜」+ 暖调馆内「午后」），部署目标 Vercel。

## 二、总体进度



| 阶段    | 状态    | 提交        | 主要内容                                                        |
| ----- | ----- | --------- | ----------------------------------------------------------- |
| 0 初始化 | ✅ 已完成 | `ff7a4fa` | Astro4 + Tailwind v3 + Vue 岛屿 + Notion SDK 链路、.env 配置、空数据降级 |
| 1 页面  | ✅ 已完成 | `4c7efed` | 首页 / 归档 / 分类 / 标签 / 详情 5 页 + Notion 块渲染、分页、上下篇数据基础          |
| 2 视觉  | ✅ 已完成 | `e8c7e4b` | 双主题（深色默认 / 浅色）、魔法使之夜配色、Notion 全块样式、主题切换                     |
| 3 交互  | ✅ 已完成 | `266fee5` | 目录跟随、返回顶部、上一篇 / 下一篇、响应式、入场动效、404、空状态、favicon                |
| 4 部署  | 🔶 代码就绪 · 待用户部署 | `fd47136` | SEO（OG/Twitter/sitemap/robots）、图片本地化、DEPLOY.md；Git 远程 / Vercel / Deploy Hook 需用户操作（见 `DEPLOY.md`） |
| 5 重设计 | ✅ 已完成 | `96908f3` | 「双世界」视觉重设计：月白+琥珀 token 迁移、固定背景三层、Hero/丝带/引言带、暖调文章面板、菱形归档时间轴、导航滚动毛玻璃、Cormorant 西文字体、背景图入库 `public/backgrounds/` |

当前分支 `main`。

## 三、技术栈与版本（实测）



* 运行环境：Node v22.23.2 /npm 10.9.8（AGENT 要求 Node 20+）

* 核心依赖：astro `4.16.19`、@astrojs/vue `4.5.3`、vue `3.5.43`、@notionhq/client `2.3.0`

* 构建 / 样式：tailwindcss `3.4.19`、postcss、autoprefixer、typescript `5.9.3`

* **阶段 4 新增**：`@astrojs/sitemap@^3.2.1`（**锁定 3.2.1，勿升 3.3+**，见 DONT_DO #28）；未引入 sharp，图片优化走「构建期下载本地化」，懒加载已具备

* 包管理固定用 **npm**；新增依赖必须更新 lock 文件（DONT\_DO #12）

## 四、关键架构事实（部署 / 排障必读）



* **数据唯一出口**：`src/lib/notion.ts`。页面禁止直接 `new Client()`（DONT\_DO #10）。

* **构建期拉取**：`getStaticPaths()` 调 Notion，运行时零服务端。密钥只在构建期可见，绝不进客户端 bundle（DONT\_DO #4）。

* **URL 结构**：`/posts/[slug]`，slug 直接用 Notion 页面 id（非可读 slug）。

* **分页**：首页构建时渲染全部页段（`[data-post-page]`），`PaginationSync.vue` 岛屿按 `?page=N` 切换；纯静态 `Pagination.astro` 保留无 JS 降级。

* **正文渲染**：`src/lib/notion-render.ts` 自建块→HTML 映射，递归拉子块（最多 6 层），未识别块写构建日志不静默丢块。

* **降级原则**：环境变量缺失或 Notion 失败一律返回空数据 + 空状态提示，不让构建崩溃（DONT\_DO #11）。

* **交互只在&#x20;**`.vue`**&#x20;岛屿**：`.astro` 组件零 JS（DONT\_DO #9）。

* **字体**：Google Fonts（Noto Serif SC / Noto Sans SC / Cormorant Garamond）已改为**非阻塞**加载（preload + onload + `display=swap` + preconnect），Lighthouse 关键优化，勿回退成渲染阻塞的 `rel=stylesheet`。西文/数字/丝带走 Cormorant Garamond（`--font-latin`）。

* **环境变量**：`.env` 不入库（已在 .gitignore），仅提交 `.env.example`；需要 `NOTION_TOKEN`、`NOTION_DATABASE_ID`。

## 五、当前数据与构建状态



* Notion 数据库当前 **4 篇已发布**：独行者、《小城与远方》、测试杂文：在便利店门口想起的事、新文章（阶段 5 构建时实测）。

* 阶段 3 验证用的 12 篇测试文章（1 长文 + 11 分页）已全部归档到 Notion 回收站，可恢复。

* `npm run build` 当前产出 **14 个页面**：`/`、`/about`、`/archive`、3 个分类页、4 篇文章页、3 个标签页、`/404.html`。

* 固定背景图 5 张入 `public/backgrounds/`（bg-clouds / bg-slope / bg-night / bg-warm / bg-stairs，均为无角色无 Logo 原画局部；`bg-clouds` 已按实测把裁剪收到源图 0.40*h 去除 OST 标题残字，见 `design/fix_clouds.py` 注释）。

* 首页 HTML 约 11KB（未 gzip），远低于阶段 4「gzip 后 <50KB」要求。

* 本地 `npm run preview`：4321 被占用时会自动切到 4322（排障时注意端口）。

## 六、阶段 5 已完成的代码工作（视觉重设计·双世界）

### 1. 主题 token 迁移（`src/styles/global.css`）

* 主强调色 鎏金 → **月白 `--silver #e7e9f2`**（冷区标题/主强调）+ **琥珀 `--amber #d8a866`**（暖区/hover）；次强调 `--amber-soft`；点缀雪光青 `--ice #9fd4e2`；`--warm-panel #1c1815` / `--warm-text #e6ddd0`；玻璃/发丝线 token 全部重命名。
* 浅色「午后」：羊皮纸底 `#e6e2d8`，`--warm-panel #f5efe2`，正文 `#332d26`；代码块深色底 + 冰青竖条**双主题统一**（DONT_DO #18 已同步更新）。
* 全仓旧 token 引用清零（构建期 grep 验证无残留）。

### 2. 固定背景三层 + 视图语义（BaseLayout / global.css）

* `<body data-view="home|post|archive|default">` 切换背景：`.bg-layer`（原画局部，filter 压暗/提亮）+ `.bg-scrim`（径向+线性遮罩）+ `.bg-grain`（颗粒，`mix-blend-mode:overlay`），三者 `position:fixed; pointer-events:none`。
* 文章页 = 馆内暖调（bg-warm + 暖褐遮罩），归档页 = 雪夜（bg-night + 夜空遮罩），其余 = 云隙光冷调（bg-clouds）。
* 背景图 5 张入库 `public/backgrounds/`；`design/fix_clouds.py` 裁剪收到 0.40*h（实测标题位于源图 0.46*h 起，注释已说明）。

### 3. 组件

* **NavBar**：滚动前透明，`NavBarScroll.vue` 岛屿切 `.scrolled` 毛玻璃（`--glass-2` + blur14px + 发丝线）；品牌含琥珀四角星；链接发丝下划线（hover 琥珀 / 激活银白）；激活态构建期静态判定（零 JS）。
* **ThemeToggle**：描边小框「午后 / 夜」，文案跟随样稿（显示切换目标）；localStorage 持久化不变。
* **PostCard**：3px 圆角 + 银白发丝细边 + 玻璃底；hover 上浮 2px + 琥珀边框 + 极淡琥珀外发光；封面 16:9 hover 放大 1.03；无封面渲染空画框（内嵌细边 + 中央四角星）。
* **Footer**：木楼梯背景（bg-stairs）+ 强压暗遮罩 + 中央四角星 + 致谢行 `Visual inspiration from Witch on the Holy Night (TYPE-MOON)`（不暗示官方授权）。
* **ArchiveTimeline**：Cormorant 大字年份 + 琥珀发丝线；左侧竖线 + 45° 菱形节点（hover 转琥珀）；`.cat` 移到 global.css 通用。

### 4. 页面

* **index**：Hero 复刻 OST 封面（云隙光 + 银白衬线大标题 + 燕尾丝带 `WITCH ON THE HOLY NIGHT` + 竖排 SCROLL）；「最新文章」分区头（四角星 + 发丝线）；雪坡引言带（bg-slope + 日文引言 + 中文注）；分页与 PaginationSync 保留。
* **archive**：归档头（丝带 `ARCHIVE` + 21:9 云隙画框）+ 时间线。
* **PostLayout**：居中暖暗面板（浅色羊皮纸），21:9 题图；右侧 240px 目录结构与移动端浮层逻辑保留，只套暖调样式；正文 800px 约束不变；`PostPrevNext` 改暖调。
* **markdown.css**：琥珀 h2（浅色转焦糖 `#8a5a24`）、blockquote 琥珀竖条+斜体、代码块深色底+冰青竖条、行内 code 琥珀底；全块样式迁移新 token。注：浅色主题下 blockquote / 行内 code / 正文链接 / 目录高亮在羊皮纸面板上按可读性转焦糖（样稿此处保持 `--amber-soft` 会近不可见，属实现期微调）。
* **PostToc**：标题改「目 次」，琥珀高亮 + 发丝竖线，浅色高亮转焦糖。
* 404 / about / 分类 / 标签：统一冷调玻璃，token 同步。
* **favicon**：四角星改月白 `#e7e9f2`。
* 字体：移除 Playfair，新增 Cormorant Garamond 500/600（preload 与 noscript 两处同步）。

### 5. 验证记录（2026-09-22）

* `npm run build` 通过，14 页，无控制台错误。
* 真实浏览器：1440/390/360/320 × 深色，1440/320 × 浅色，逐页截图目检无横向溢出、无裁切、token 色值抽样命中（面板 `#1c1815` 精确）。**注意**：headless Chrome `--headless=new` 的 `--window-size=390` 实际 CSS 视口宽为 **500**（最小宽度，PNG 尺寸≠CSS 视口）；真移动端验证须用同源 iframe 探针（固定宽度 iframe，DOMContentLoaded 后挂到 body），见第 6 节。
* 交互实测：主题切换（label 午后⇄夜 + localStorage）、导航滚动毛玻璃、移动端目录浮层（打开/点击跳转/关闭/URL hash）、控制台零报错。
* 已知说明：`bg-slope` 街景含少量日文警示牌文字，属场景元素，交接清单已批准为上线素材。

### 6. 验收修复（2026-09-22，用户反馈）

* **引言带（`.band`）**：去掉上下 1px 硬边框（"裁剪线"）；改为双层伪元素——`::before` 图片层带 `mask-image` 上下羽化（16% 外透明），`::after` 遮罩层沉入底色。午后模式：雪坡图片 `brightness(1.55)` 提亮、遮罩改羊皮纸、引言文字转深色，消除"亮底夹暗带"。
* **页脚（Footer）**：去掉顶部硬边框；背景图与渐变移入 `::before` 并加顶部 12% 羽化；午后模式改羊皮纸渐变（楼梯作暖调纹理）；窄屏（≤640px）底部加 4.6rem 留白，避免返回顶部按钮压住致谢行。
* **sticky footer**：`body` 改 flex 列，`main { flex:1 0 auto }`、`footer { flex-shrink:0 }`——关于等短内容页页脚钉在视口底部。
* **午后背景层次**：浅色云雾被洗得太平（"背景颜色稍显不足"），背景提亮 1.35→1.18、浅色 scrim 中段 0.55→0.42、底段 0.92→0.86，云雾层次更明显。
* 移动端（≤640px）引言带小字收紧（0.8rem / 字距 0.08em），修复 390px 末字因字距溢出。
* 复验：1440 与 390/320（iframe 探针）× 双主题逐页截图，引言带/页脚均无硬线、无裁切、无横向溢出。

## 七、阶段 4 已完成的代码工作

### 1. Notion 图片本地化（已实现并验证）

* 新增 `src/lib/image-localize.ts`：构建期下载 Notion `file` 图片到 `public/images/posts/<pageId>/`（封面 `cover.<ext>`、正文 `<blockId>.<ext>`，按 Content-Type 定扩展名）；`external` 图床不处理。
* `src/lib/notion.ts` 接入：`getPublishedPosts` 封面本地化（模块级 URL 缓存去重）、`getPostBySlug` 封面 + 正文块递归本地化。
* `astro.config.mjs` 加 local-images integration：`astro:build:done` 把 `public/images/` 拷入 `dist/images/`（Astro 构建在 `getStaticPaths` 前已拷完 `public/`，必须补拷，DONT_DO #31）。
* `.gitignore` 已加 `public/images/`（不入库，Vercel 每次构建重新拉取）。
* 失败重试 3 次后回退原 URL 并记日志，不中断构建；冒烟测试已验证成功下载与失败回退两条路径。

### 2. SEO 基础（已实现并验证）

* `BaseLayout.astro`：注入 `og:site_name/type/title/description/image`、Twitter Card、canonical；`ogType` / `ogImage` / `canonicalPath` 通过 props 透传。
* `PostLayout.astro`：详情页 `og:type=article`、OG 图 = 封面、canonical = `/posts/<slug>`；title = 文章标题 · Holy Night（已有）。
* `@astrojs/sitemap@3.2.1`：生成 `sitemap-index.xml` + `sitemap-0.xml`（已验证）。
* `public/robots.txt`：允许抓取 + Sitemap 指向（已验证）。
* **占位域名**：`astro.config.mjs` `site` 与 robots.txt 均暂为 `https://holy-night.vercel.app`，部署后按真实域名同步修改（DONT_DO #30）。

### 3. 性能

* 首页 HTML：raw 11.9KB → **gzip 4.4KB**（要求 <50KB，达标）；详情页 gzip 3.6KB。
* 字体已非阻塞（preload + onload + swap）；图片懒加载已具备；无未使用图标（仅 favicon.svg）。

## 八、仍需用户完成的部署动作（见 DEPLOY.md 逐步操作）

1. GitHub 建空仓库 → `git remote add origin` + `push main`（当前无远程）。
2. Vercel 导入仓库，配置环境变量 `NOTION_TOKEN` / `NOTION_DATABASE_ID`，Deploy。
3. 生成 Deploy Hook URL。
4. 落地至少一种触发方案（推荐 Notion 按钮 + Make.com；备选 cron / 手动书签）。
5. 可选：绑定域名（改两处占位）、站长平台提交 sitemap、RSS（本阶段未做）。
6. 验证：所有页面正常、sitemap/robots 返回、Notion 改状态触发重建、微信/Twitter 分享预览、Lighthouse 桌面 ≥95/100。

## 九、阶段 4 验收标准



* 公网可访问，所有页面正常。

* `curl https://<域名>/sitemap-index.xml` 返回 XML；`/robots.txt` 正确。

* 把一篇 Notion 文章从草稿改为已发布，触发构建后线上首页出现新文章。

* 分享链接在微信 / Twitter 能正确预览标题与封面。

* Lighthouse **桌面端性能 ≥ 95、SEO = 100**（阶段 3 移动端实测：首页 96/100、详情 95/100、归档 100/100，可作基线）。

## 十、注意事项汇总（红线 & 易踩坑）



* 技术栈锁定：Astro 4 纯 SSG、Vue 3 岛屿、Tailwind v3、npm、Vercel；**禁止改 SSR/ISR**，禁止引入 React/Next/ 组件库。

* 视觉红线：标题必须衬线；动效 200–400ms ease-out，无循环动画；内容区最大 1200px（正文 800px）；代码块双主题统一深色。

* 入场 / 淡入动画**不要用&#x20;**`animation-fill-mode: both/backwards`（隐藏标签页会冻结在 opacity:0 导致空白）；`position:fixed` 浮层祖先不能残留 transform。

* 可访问性：详情页保持单一 `<main>` landmark；表单控件要 aria-label；图片留 width/height。

* 验证环境怪象（非代码 bug）：自动化浏览器标签页 `visibilityState=hidden` 时 CSS 动画冻结、rAF 不触发、程序化 scrollTo 不触发 scroll 事件；真实浏览器与 Lighthouse headless 正常。

* 阶段 4 新增红线：`@astrojs/sitemap` 锁定 `^3.2.1`（3.3+ 与 Astro 4.16 不兼容，DONT_DO #28）；`public/images/` 不入库（#29）；改域名须同步 `astro.config.mjs site` 与 `robots.txt`（#30）；图片本地化必须经 build:done 拷贝钩子（#31）。

* 每次宣称完成前必须跑 `npm run build`（DONT\_DO #15）。

* 新决策追加 `DECISIONS.md`，新坑追加 `DONT_DO.md`，每里程碑 git 提交。

## 十一、常用命令



```
npm install        # 安装依赖

npm run dev        # 本地开发（默认 http://localhost:4321）

npm run build      # 构建到 dist/（拉取 Notion + 下载图片，需 .env）

npm run preview    # 预览构建产物

# 本仓库无全局 git 身份，提交用：
git -c user.name="Holy Night" -c user.email="holy-night@local" commit -m "阶段 4：..."
```