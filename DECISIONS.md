# Holy Night 架构决策记录

> 每一条重要技术决策都在此登记。新决策追加到表格末尾，附日期与原因。AI 不得擅自推翻已记录的决策。

| 日期 | 决策内容 | 选择方案 | 决策原因 | 权衡 |
|---|---|---|---|---|
| 2026-09-21 | 构建框架 | Astro 4.x | 原生 SSG 优化极致；岛屿架构让静态内容零 JS，仅交互组件按需注入；内容站首选 | 放弃 Nuxt/Next.js，二者对纯静态内容站偏重 |
| 2026-09-21 | CMS 方案 | Notion API | 写作体验极佳，零运维，内容管理成本最低；纯个人使用无需自建后台 | 放弃 Strapi/Ghost，省去部署与维护成本；代价是构建时拉取、无实时更新 |
| 2026-09-21 | 样式方案 | Tailwind CSS v3 + CSS 变量 | 原子类开发效率高；双主题用 CSS 变量切换最干净；自定义能力足以还原游戏风格 | 放弃 Element Plus / Ant Design Vue，避免组件库默认样式污染视觉风格 |
| 2026-09-21 | 交互方案 | Vue 3 岛屿组件 | 只给主题切换、目录跟随等交互注入 JS，其余页面零 JS | 不上全局 Vue 运行时，保持 SSG 轻量化 |
| 2026-09-21 | 渲染模式 | 纯 SSG | 访问最快、部署成本最低、天然 SEO 友好；个人博客更新频率低 | 不上 SSR/ISR，避免引入运行时服务器复杂度 |
| 2026-09-21 | 视觉风格 | 魔法使之夜：深色夜空 + 鎏金 + 衬线典籍 | 差异化视觉，匹配内容创作博客的典雅气质 | 深色为默认主题，浅色作为适配补充 |
| 2026-09-21 | 部署平台 | Vercel | Astro 官方一键部署，免费额度足够；支持环境变量与 Deploy Hook | 放弃 Netlify/GitHub Pages，Vercel 与 Astro 集成最顺 |
| 2026-09-21 | 文章 URL | `/posts/[slug]`，slug 由 Notion 页面 id 生成 | 简单稳定，无需额外 slug 字段；Notion id 保证唯一 | 牺牲了 URL 可读性，换取内容模型最小化 |
| 2026-09-21 | 首页分页 | 构建时渲染全部页段（`[data-post-page]`），`PaginationSync.vue` 岛屿按 `?page=N` 切换 | 纯 SSG 无法按 query 参数预渲染；静态 `Pagination.astro` 保留无 JS 降级链接，交互逻辑全部在 Vue 岛屿（DONT_DO #9） | 放弃 `/page/2` 多路由方案；遵循提示词约定的 `?page=` 形式 |
| 2026-09-21 | 正文渲染 | 自建 `src/lib/notion-render.ts` 做最小块→HTML 映射，递归拉取子块树 | 不引入 markdown 转换库，零新依赖、输出可控；Notion 嵌套内容以子块存在，递归拉取避免丢块 | 非常规块类型先做富文本回退，未识别类型写构建日志，不静默丢块 |
| 2026-09-21 | Notion 图片 | 阶段 1 直接引用 API 返回的图片 URL | 实现最简，封面/插图可立即显示 | Notion 内部文件为 S3 签名 URL（约 1 小时过期）；后续阶段需改为构建时下载本地化，属已知待办 |
| 2026-09-21 | 字体加载 | Google Fonts CDN 引入 Noto Serif SC / Noto Sans SC / Playfair Display，靠其 unicode-range 自动分片，系统字体栈兜底 | 中文字体整包数 MB 不适合自托管；CDN 分片后按需加载，打开失败时 Songti SC / PingFang SC 等衬线/黑体兜底 | 代价是依赖外部 CDN；离线或网络受限下退化为系统字体，视觉不崩 |
| 2026-09-21 | 双主题实现 | 全部颜色走 CSS 变量（`:root` 深色 + `html.light` 浅色），切换 `<html>` 类；400ms 背景/文字过渡；头部内联脚本在首绘前恢复 localStorage 防 FOUC | 变量切换最干净，无 JS 重渲染；过渡统一 400ms 符合 AGENT.md 5.4 | 代码块在浅色主题下仍保持深色底（典籍感 + 代码可读性），不随主题变浅 |
| 2026-09-21 | 阅读宽度 | 内容区上限 1200px（卡片网格/列表），文章正文单列 800px 居中 | 长文行宽过宽影响阅读；800px 是中文长文舒适行长，仍在 1200 约束内 | 卡片页用满网格宽度，仅正文页收窄 |
| 2026-09-21 | 目录锚点 | 目录提取（`extractHeadings`）与正文渲染（`headingHtml`）共用同一个 `headingId()`，且遍历顺序严格对齐（含列表分组 index） | 保证目录链接 `#id` 与正文标题 id 逐字匹配，避免两套 id 生成逻辑漂移 | 目录 id 算法改动必须同时影响渲染与提取，单点维护 |
| 2026-09-21 | 目录响应式 | 桌面（>1024px）走 `aside` 内 sticky 侧栏（240px，正文 800px + gap 3rem 居中）；≤1024px 隐藏侧栏，改右下角「目录」悬浮按钮 + fixed 浮层 | 窄屏侧栏挤占正文；浮层按需展开、不常驻、不挤压布局，符合「移动端目录不占正文」 | 侧栏与浮层各渲染一份 `<ul>`，共享同一个 `activeId` 状态 |
| 2026-09-21 | 入场动画 | `page-enter` / `img-fade-in` 用 `@keyframes` 但**不设 fill-mode**（默认 none） | 用 `backwards/both` 会在动画未启动时把元素定格在 `opacity:0`：后台/隐藏标签页里 CSS 动画冻结，正文会永久空白；无 fill 时元素自然态为可见，动画只做渐进增强 | 放弃 fill 带来的「首帧必为 0」确定性，换取内容在任何渲染调度下都可见 |
| 2026-09-21 | 字体加载 | Google Fonts 样式表改为 `rel=preload as=style` + `onload` 切换 stylesheet，`<noscript>` 兜底；保留 `display=swap` 与 preconnect | 渲染阻塞的字体 CSS 在模拟慢网下把 LCP 拖到 10.1s（性能 71）；非阻塞后首屏先用系统衬线/黑体渲染，字体到位再替换，LCP 降到 2.7s（性能 95+） | 首屏可能短暂显示系统字体（FOUT），以可见性优先；去掉未使用的 Playfair 斜体 |
| 2026-09-21 | 移动端导航 | <768px 采用「精简链接」（缩小 brand/字号/间距），不引入汉堡菜单 | 仅 3 个导航项，375px 一行放得下；汉堡需要额外 JS 岛屿与开关状态，收益不抵复杂度 | 未来导航项增多时再改汉堡 |
| 2026-09-21 | 可访问性 | 详情页以 `<main>` 为 landmark、正文包 `<article>`；Notion 待办复选框加 `aria-label`；卡片封面补 `width/height` 固有尺寸 | Lighthouse 可访问性要求单一 main landmark、表单控件有标签、图片预留尺寸防 CLS | 封面按 16:9 容器 `object-fit:cover`，width/height 仅作固有提示，CSS 控制显示 |
| 2026-09-21 | 站点图标 | 自绘 `public/favicon.svg`（深蓝底 + 金色四角星）并在 BaseLayout 引入 | 消除浏览器自动请求 `/favicon.ico` 产生的 404 控制台报错；SVG 单文件适配深色 | 未提供传统 ico，现代浏览器均支持 SVG favicon |
