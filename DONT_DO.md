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
