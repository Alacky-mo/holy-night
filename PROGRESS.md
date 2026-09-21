# Holy Night 开发进度与交接说明

> 用途：阶段 4（部署上线）启动前的现状交接。新会话先读 `AGENT.md`、`DECISIONS.md`、`DONT_DO.md`，再读本文件与 `prompts/stage-4-deploy.md`。
> 最后更新：2026-09-21（阶段 3 完成）

## 一、项目一句话

个人内容创作博客「Holy Night」：Notion 作为 Headless CMS，**Astro 4 纯 SSG** 构建，Vue 3 岛屿做交互，Tailwind v3 + CSS 变量实现《魔法使之夜》深夜深金双主题，部署目标 Vercel。

## 二、总体进度

| 阶段 | 状态 | 提交 | 主要内容 |
|---|---|---|---|
| 0 初始化 | ✅ 已完成 | `ff7a4fa` | Astro4 + Tailwind v3 + Vue 岛屿 + Notion SDK 链路、.env 配置、空数据降级 |
| 1 页面 | ✅ 已完成 | `4c7efed` | 首页/归档/分类/标签/详情 5 页 + Notion 块渲染、分页、上下篇数据基础 |
| 2 视觉 | ✅ 已完成 | `e8c7e4b` | 双主题（深色默认/浅色）、魔法使之夜配色、Notion 全块样式、主题切换 |
| 3 交互 | ✅ 已完成 | `266fee5` | 目录跟随、返回顶部、上一篇/下一篇、响应式、入场动效、404、空状态、favicon |
| 4 部署 | ⬜ 未开始 | — | Vercel 部署、SEO、Notion 更新闭环（见 `prompts/stage-4-deploy.md`） |

当前分支 `main`，工作区干净。

## 三、技术栈与版本（实测）

- 运行环境：Node v22.23.2 / npm 10.9.8（AGENT 要求 Node 20+）
- 核心依赖：astro `4.16.19`、@astrojs/vue `4.5.3`、vue `3.5.43`、@notionhq/client `2.3.0`
- 构建/样式：tailwindcss `3.4.19`、postcss、autoprefixer、typescript `5.9.3`
- **尚未安装**：`@astrojs/sitemap`（阶段 4 需要）、sharp 等图片优化依赖
- 包管理固定用 **npm**；新增依赖必须更新 lock 文件（DONT_DO #12）

## 四、关键架构事实（部署/排障必读）

- **数据唯一出口**：`src/lib/notion.ts`。页面禁止直接 `new Client()`（DONT_DO #10）。
- **构建期拉取**：`getStaticPaths()` 调 Notion，运行时零服务端。密钥只在构建期可见，绝不进客户端 bundle（DONT_DO #4）。
- **URL 结构**：`/posts/[slug]`，slug 直接用 Notion 页面 id（非可读 slug）。
- **分页**：首页构建时渲染全部页段（`[data-post-page]`），`PaginationSync.vue` 岛屿按 `?page=N` 切换；纯静态 `Pagination.astro` 保留无 JS 降级。
- **正文渲染**：`src/lib/notion-render.ts` 自建块→HTML 映射，递归拉子块（最多 6 层），未识别块写构建日志不静默丢块。
- **降级原则**：环境变量缺失或 Notion 失败一律返回空数据 + 空状态提示，不让构建崩溃（DONT_DO #11）。
- **交互只在 `.vue` 岛屿**：`.astro` 组件零 JS（DONT_DO #9）。
- **字体**：Google Fonts（Noto Serif SC / Noto Sans SC / Playfair）已改为**非阻塞**加载（preload + onload + `display=swap` + preconnect），Lighthouse 关键优化，勿回退成渲染阻塞的 `rel=stylesheet`。
- **环境变量**：`.env` 不入库（已在 .gitignore），仅提交 `.env.example`；需要 `NOTION_TOKEN`、`NOTION_DATABASE_ID`。

## 五、当前数据与构建状态

- Notion 数据库当前仅 **1 篇已发布**：「新文章」（id `3e14a863-04fd-8082-80ec-dba946735575`，分类 杂文，2026-09-21，无封面）。
- 阶段 3 验证用的 12 篇测试文章（1 长文 + 11 分页）已全部归档到 Notion 回收站，可恢复。
- `npm run build` 当前产出 **6 个页面**：`/`、`/about`、`/archive`、`/categories/杂文/`、`/posts/新文章/`、`/404.html`。
- 首页 HTML 约 11KB（未 gzip），远低于阶段 4「gzip 后 <50KB」要求。
- 本地 `npm run preview`：4321 被占用时会自动切到 4322（排障时注意端口）。

## 六、阶段 4 前必须知道的两件事

### 1. 还没有 Git 远程仓库（阻塞 Vercel 接入）
- 目前只有本地 git 提交，**未配置任何 remote**。
- 阶段 4 第一步需：在 GitHub 建仓库 → 关联 remote → push `main` → Vercel 连接该仓库。
- 仓库无全局 git 身份，提交用：`git -c user.name="Holy Night" -c user.email="holy-night@local" commit ...`。

### 2. Notion 图片是 S3 临时签名 URL（强烈建议部署前先做图片本地化）
- 上传到 Notion 的图片（`file.type === 'file'`）返回的 URL 带 `X-Amz-Expires=3600`，**约 1 小时过期**；当前代码把签名 URL 直接写进 HTML。
- 纯 SSG 部署后，构建一次线上图片就只有约 1 小时寿命；外部图床链接（`external`）不受影响。
- 已确认可行的方案（已分析，待实现）：
  - 新增 `src/lib/image-localize.ts`，由 `notion.ts` 调用，构建时下载图片；
  - 封面命名 `public/images/posts/<pageId>/cover.<ext>`，正文图 `.../<blockId>.<ext>`，按 Content-Type 定扩展名；
  - **关键坑**：Astro 静态构建在 `getStaticPaths` 之前就已拷贝完 `public/`，临时写进 `public/` 不会进 `dist`，需在 `astro.config.mjs` 加一个 integration，用 `astro:build:done` 钩子把图片拷到 `dist/images/`；开发模式直接写 `public/images/` 即可；
  - `.gitignore` 加 `public/images/`；下载失败重试后回退原 URL 并记日志，不中断构建；
  - 只本地化 `file` 类型，`external` 保持原样。
- 本方案在 Vercel 部署后依然有效：签名 URL 只在构建的几分钟内被下载一次，之后产物里是同域永久静态资源。

## 七、阶段 4 任务清单（依据 prompts/stage-4-deploy.md）

1. **Vercel 部署**
   - Vercel 对 Astro 有零配置识别（输出目录 `dist`、构建命令 `npm run build`）；`vercel.json` 仅在确有需要时加。
   - Vercel 后台配置环境变量 `NOTION_TOKEN`、`NOTION_DATABASE_ID`。
   - 连接 GitHub 仓库后，push 自动构建。
2. **Notion 更新 → 重建闭环**
   - 生成 Vercel **Deploy Hook** URL。
   - 至少落地一种触发方式并写进 `DEPLOY.md`：推荐「Notion 数据库按钮 + Make.com 调 Webhook」；备选简单 cron（cron-job.org / GitHub Actions 定时 ping）、手动书签。
   - 可加每日定时 ping 作为兜底。
3. **SEO**
   - `BaseLayout.astro` 注入全局 meta：title、description、Open Graph、Twitter Card。
   - 详情页 title = 文章标题 + ` · Holy Night`，description = 摘要，OG 图 = 封面。
   - 安装并配置 `@astrojs/sitemap`（新依赖，更新 lock）。
   - 新增 `public/robots.txt`，允许抓取并指向 sitemap。
4. **性能**
   - 图片：`loading="lazy" decoding="async"` 已具备；结合图片本地化，可选 sharp 优化。
   - 字体：`display=swap`、只引必要字重（已做大部分）。
   - 检查未使用图标/样式是否 tree-shake；确认首页 gzip HTML <50KB。
5. **上线检查**：域名（可选）、百度/Google 站长提交 sitemap、RSS（可选）。

## 八、阶段 4 验收标准

- 公网可访问，所有页面正常。
- `curl https://<域名>/sitemap-index.xml` 返回 XML；`/robots.txt` 正确。
- 把一篇 Notion 文章从草稿改为已发布，触发构建后线上首页出现新文章。
- 分享链接在微信/Twitter 能正确预览标题与封面。
- Lighthouse **桌面端性能 ≥ 95、SEO = 100**（阶段 3 移动端实测：首页 96/100、详情 95/100、归档 100/100，可作基线）。

## 九、注意事项汇总（红线 & 易踩坑）

- 技术栈锁定：Astro 4 纯 SSG、Vue 3 岛屿、Tailwind v3、npm、Vercel；**禁止改 SSR/ISR**，禁止引入 React/Next/组件库。
- 视觉红线：标题必须衬线；动效 200–400ms ease-out，无循环动画；内容区最大 1200px（正文 800px）；代码块双主题统一深色。
- 入场/淡入动画**不要用 `animation-fill-mode: both/backwards`**（隐藏标签页会冻结在 opacity:0 导致空白）；`position:fixed` 浮层祖先不能残留 transform。
- 可访问性：详情页保持单一 `<main>` landmark；表单控件要 aria-label；图片留 width/height。
- 验证环境怪象（非代码 bug）：自动化浏览器标签页 `visibilityState=hidden` 时 CSS 动画冻结、rAF 不触发、程序化 scrollTo 不触发 scroll 事件；真实浏览器与 Lighthouse headless 正常。
- 每次宣称完成前必须跑 `npm run build`（DONT_DO #15）。
- 新决策追加 `DECISIONS.md`，新坑追加 `DONT_DO.md`，每里程碑 git 提交。

## 十、常用命令

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（默认 http://localhost:4321）
npm run build      # 构建到 dist/（拉取 Notion，需 .env）
npm run preview    # 预览构建产物
```
