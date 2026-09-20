# 阶段 0：项目初始化与环境搭建

> 每次新开会话，先把 `AGENT.md`、`DECISIONS.md`、`DONT_DO.md` 喂给 AI，再读本文件。

## 阶段目标
完成项目初始化搭建，打通「Notion 拉取数据 → 静态生成」的完整链路，输出可正常构建运行的空项目骨架。

## 具体任务

1. **初始化 Astro 4.x 项目**
   - 使用 `npm create astro@latest` 或手动初始化，锁定 Astro 4.x
   - 启用 TypeScript 严格模式
   - 配置 `astro.config.mjs`（`output: 'static'`）

2. **配置 Tailwind CSS v3**
   - 安装 `tailwindcss@3`、`postcss`、`autoprefixer`
   - 生成 `tailwind.config.mjs`，content 指向 `./src/**/*.{astro,html,js,jsx,ts,tsx,vue}`
   - 在 `src/styles/global.css` 顶部引入 `@tailwind base; @tailwind components; @tailwind utilities;`

3. **配置 Vue 3 岛屿组件**
   - 安装 `@astrojs/vue` 与 `vue@^3.4`
   - 在 `astro.config.mjs` 中接入 Vue 集成
   - 验证一个简单 `.vue` 组件能通过 `client:visible` 正常渲染

4. **安装 Notion SDK**
   - 安装 `@notionhq/client`
   - 在 `src/lib/notion.ts` 封装并导出以下方法：
     - `getPublishedPosts({ pageSize, startCursor? })`：拉取「状态=已发布」的文章，按「发布日期」倒序，返回标准化列表对象（id / slug / 标题 / 封面 / 分类 / 标签 / 摘要 / 发布日期）+ 分页游标
     - `getPostBySlug(slug)`：根据 slug 取单篇文章元数据 + 正文 blocks
   - 所有方法从环境变量读取 `NOTION_TOKEN`、`NOTION_DATABASE_ID`
   - 环境变量未配置或 Notion 请求失败时，优雅返回空数据并在控制台打印明确提示，**不得让构建崩溃**

5. **目录与基础布局**
   - 按 AGENT.md 第三节创建完整目录树
   - 写好 `layouts/BaseLayout.astro`（HTML 骨架、全局样式引入、主题初始化脚本防 FOUC）
   - 写好 `styles/global.css`，塞入 AGENT.md 第五节定义的全部 CSS 变量（`:root` 深色 + `.light` 浅色）

6. **首页临时验证**
   - `src/pages/index.astro` 临时调用 `getPublishedPosts({ pageSize: 10 })`
   - 页面上以最简单的方式列出文章标题即可（样式本阶段不要求）
   - 服务端控制台 `console.log` 打印拉取到的文章数量与标题

## 输出要求
- `npm run dev` 能正常启动开发服务器
- `npm run build` 能正常产出静态文件到 `./dist/`
- 首页能访问，控制台可见 Notion 拉取日志

## 验收标准
1. 项目启动与构建均无报错
2. 首页控制台成功打印从 Notion 获取的文章列表（未配密钥时打印「未配置环境变量」提示也算通过）
3. 目录结构与 AGENT.md 第三节完全一致
4. 写一个测试用 `.vue` 组件挂载到首页，Vue 岛屿渲染正常
5. `git status` 干净，`.env` 已在 `.gitignore` 中
