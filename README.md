# Holy Night（圣夜）

个人内容创作博客。在 **Notion** 里写作，构建时自动发布为静态网站——无需数据库、无需服务端，改完文章状态即可上线。

线上地址：<https://holy-night.vercel.app>

## 特性

- **Notion 作为 Headless CMS**：文章正文、分类、标签、封面全部来自 Notion 数据库，状态改为「已发布」即上线
- **双主题视觉**：「午后」羊皮纸亮色与「夜」深蓝夜色，跟随系统并可手动切换，记忆用户偏好
- **完整的 Notion 块渲染**：标题、列表、引用、代码块、图片、分割线等正文块静态渲染
- **SEO 开箱即用**：Open Graph / Twitter Card、自动 sitemap、robots.txt、语义化标签
- **岛屿式交互**：Astro 静态输出为主，Vue 3 按需注入（主题切换、目录、分页、返回顶部）
- **响应式**：桌面 / 平板 / 移动端自适应，正文排版为长文阅读优化

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Astro 4（纯静态 SSG） |
| 交互 | Vue 3 岛屿组件（Astro Islands） |
| 样式 | Tailwind CSS v3 + CSS 变量双主题 |
| 内容 | Notion API（`@notionhq/client`），构建时拉取 |
| 部署 | Vercel 静态托管 |
| 自动更新 | GitHub Actions 定时触发 Vercel 重建 |

## 工作原理

```
Notion 数据库  ──构建时拉取──▶  Astro 静态页面  ──部署──▶  Vercel
     ▲                                                    │
     └──────── 改文章状态为「已发布」◀── 每 30 分钟自动重建 ─┘
```

所有页面在构建期生成纯 HTML/JS/CSS，访客请求的是静态文件，因此打开快、没有运行时服务成本。

## 本地开发

环境要求：Node.js 18+。

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（复制样例后填入真实值）
cp .env.example .env

# 3. 启动本地开发服务器（默认 http://localhost:4321）
npm run dev

# 4. 构建到 dist/ 并本地预览
npm run build
npm run preview
```

`.env` 需要两个变量（已在 `.gitignore` 中，不会入库）：

```
NOTION_TOKEN=secret_xxx                 # Notion 集成密钥
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxx     # 文章数据库 ID
```

### Notion 数据库结构

数据库需包含以下属性，且集成（Integration）已被邀请访问该数据库：

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| 标题 | Title | 文章标题 |
| 分类 | Select | 单选分类 |
| 标签 | Multi-select | 多选标签 |
| 发布日期 | Date | 文章日期 |
| 封面 | Files | 封面图（可空） |
| 状态 | Status | 选项为「已发布」时才会出现在站点 |

文章 URL 直接使用 Notion 页面 ID 作为 slug；正文图片在构建期下载到本地并托管，避免 Notion 图片链接过期。

## 部署

### Vercel（推荐）

1. 在 Vercel 导入本仓库，框架预设会自动识别为 Astro；
2. 在项目 Settings → Environment Variables 中配置 `NOTION_TOKEN`、`NOTION_DATABASE_ID`；
3. push 到 `main` 即自动部署。

> 若绑定了自定义域名，需同步修改 `astro.config.mjs` 中的 `site` 字段（sitemap 与 Open Graph 的绝对 URL 依赖它）。

### 定时重建（让 Notion 改动自动上线）

`.github/workflows/rebuild.yml` 每 30 分钟触发一次 Vercel Deploy Hook：

1. Vercel → Settings → Git → Deploy Hooks，创建 Hook 并复制 URL；
2. GitHub 仓库 → Settings → Secrets and variables → Actions，添加 `VERCEL_DEPLOY_HOOK`；
3. 推送后生效，也可在 Actions 页面手动触发。

## 项目结构

```
src/
├── pages/              # 页面路由：首页 / 归档 / 关于 / 文章 / 分类 / 标签 / 404
├── layouts/            # BaseLayout、PostLayout
├── components/
│   ├── astro/          # 静态组件（导航、页脚、卡片、时间轴、Notion 块等）
│   └── vue/            # 交互岛屿（主题切换、目录、分页、返回顶部）
├── lib/                # Notion 拉取、块渲染、图片本地化
└── styles/             # 全局样式与 Markdown 排版（CSS 变量双主题）
public/
├── backgrounds/        # 固定背景素材
├── favicon.svg
└── robots.txt
.github/workflows/      # 定时重建工作流
prompts/                # 各阶段开发提示词（存档）
```

## 说明

- `node_modules/`、`dist/`、`.env`、`design/`（本地设计素材）均不入库，见 `.gitignore`。
- 更多开发约定、决策记录与进度见 `AGENT.md`、`DECISIONS.md`、`DONT_DO.md`、`PROGRESS.md`、`DEPLOY.md`。
