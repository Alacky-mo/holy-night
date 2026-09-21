# Holy Night 开发禁止清单

> 每踩一个坑就往这里加一条。AI 看到任何代码即将违反下列任一条，必须停下并说明。

## 技术栈红线
1. 禁止擅自更换核心技术栈，引入 AGENT.md 未声明的依赖（如 React、Next.js、Nest.js 等）
2. 禁止使用 Element Plus、Ant Design Vue、Naive UI 等第三方组件库——所有 UI 组件必须自定义实现
3. 禁止把项目改成 SSR / ISR 模式，必须保持纯 SSG 输出
4. 禁止在客户端 bundle 中出现 `NOTION_TOKEN`、`NOTION_DATABASE_ID` 等任何密钥

## 视觉红线
5. 禁止偏离「魔法使之夜」配色与排版规范，禁止引入高饱和亮色、扁平卡通风、Material Design 默认观感
6. 禁止使用粗黑无衬线字体作为文章标题——标题必须是衬线体
7. 禁止滥用动效：任何过渡超过 500ms、任何页面出现持续循环动画，都是越界
8. 禁止改宽内容区——最大宽度固定 1200px
18. 禁止把正文代码块背景做成随浅色主题变浅——代码块在双主题下统一深色底 + 金色左竖条，是刻意设计（典籍感 + 代码可读性）
19. 禁止用 `* { transition: all }` 之类的全局过渡——只对颜色/背景/边框/box-shadow/transform 等具体属性过渡，时长控制在 200–400ms，避免页面加载与布局抖动

## 架构红线
9. 禁止在 `.astro` 静态组件里写前端交互逻辑；交互一律走 `.vue` 岛屿组件
10. 禁止在页面里直接 `new Client()` 调 Notion——所有数据访问必须走 `src/lib/notion.ts`
11. 禁止在 Notion 拉取失败时让构建直接崩溃；阶段0 起就要优雅降级（空列表 + 提示）
12. 禁止新增依赖前不更新 `package.json` 锁文件

## 工程红线
13. 禁止使用 TypeScript `any` 类型
14. 禁止提交 `.env` 到 git；必须提供 `.env.example`
15. 禁止在未运行 `npm run build` 验证的情况下宣称某阶段完成
16. 禁止在 Astro 服务端代码里用 `process.env` 读取 `.env` 变量——Astro/Vite 只把 `.env` 注入 `import.meta.env`（`src/lib/notion.ts` 已做 `import.meta.env` 优先、`process.env` 兜底的双读）
17. 禁止假设 Notion 正文只有顶层块——缩进/嵌套内容以子块形式存在，必须递归拉取，否则会丢块

## 阶段 3 交互与动效
23. 禁止给入场/淡入动画用 `animation-fill-mode: both`（或 `backwards`）——隐藏标签页（后台加载、部分无头/自动化环境）会冻结 CSS 动画在首帧，元素会被定格在 `opacity:0` 导致正文永久空白。统一用无 fill（默认 none），让元素自然态保持可见，动画只做渐进增强
24. 禁止让 `position: fixed` 的浮层（移动端目录、返回顶部）的祖先元素残留 `transform`/`filter`/`backdrop-filter`——这些属性会让该祖先成为 fixed 元素的包含块，导致 fixed 退化成相对页面定位。入场动画结束后必须 `transform: none`，且浮层不要放在带 transform 的容器内
25. 禁止用渲染阻塞的方式引入 Google Fonts（`rel="stylesheet"` 直接挂 head）——中文字体分片多，慢网下会把 LCP 拖到 10s 级。必须 `preload as=style` + `onload` 切换 + `<noscript>` 兜底，并保留 `display=swap`
26. 禁止在详情页只写 `<article>` 而没有 `<main>` landmark——屏幕阅读器依赖唯一 main 地标；结构应为 `<main class="content"><article>…</article></main>`。Notion 待办复选框（disabled 也要）必须带 `aria-label`，封面 `<img>` 必须有 width/height 固有尺寸
27. 禁止在自动化/隐藏标签页里用 `requestAnimationFrame` 驱动首屏可见性（如滚动显隐）——该环境 rAF 不触发；滚动显隐直接在 scroll 监听里读 `scrollY` 赋值即可，真实浏览器与 Lighthouse 均正常

## 阶段 4 部署与 SEO
28. 禁止升级 `@astrojs/sitemap` 到 3.3+（含 3.7.x）——其 `astro:build:done` 读 Astro 5 的 `_routes` 字段，Astro 4.16 下构建报 `Cannot read properties of undefined (reading 'reduce')`；保持 `^3.2.1`，升级 Astro 主版本时再一并评估
29. 禁止把 `public/images/` 提交入库——构建期下载的 Notion 图片由 Vercel 每次构建重新生成，已加入 `.gitignore`；提交只会造成噪音与过期图片
30. 禁止让 `astro.config.mjs` 的 `site` 与 `public/robots.txt` 的 Sitemap 指向不一致——改域名（绑定自定义域名）必须两处同步修改，否则 sitemap URL 与 OG 图绝对地址指向错误域名
31. 禁止给 Notion 图片本地化直接写 `public/images/` 而不经 `astro:build:done` 拷贝钩子——Astro 构建在 `getStaticPaths` 拉数据（下载图片）之前就已拷贝 `public/` 进 `dist/`，不补拷则线上图片缺失
