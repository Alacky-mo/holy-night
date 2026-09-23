# Holy Night 项目总纲

> 本文件是项目最高规则。每次新开 AI 会话，必须先完整读取本文件、`DECISIONS.md`、`DONT_DO.md`，确认理解后再开始任何编码工作。

## 一、项目概述

- **项目名称**：Holy Night（圣夜）
- **仓库目录**：`holy-night/`
- **项目定位**：个人内容创作博客，涵盖杂文、书评、影评
- **核心目标**：极致的前端展示效果与交互体验 + 便捷的 Notion 内容管理
- **访问规模**：纯个人使用，日均访问几十到几百
- **架构模式**：Headless CMS（Notion API）+ 前端自定义
- **渲染模式**：纯 SSG 静态生成，构建时拉取 Notion 数据，运行时零服务端
- **视觉风格**：游戏《魔法使之夜》「双世界」气质——冷たい外の世界（雾中磨砂玻璃、月白文字）与暖かい館の内（灯下暖暗/羊皮纸阅读面板），典籍排版

## 二、技术栈规范（强制）

| 层 | 选型 | 版本/说明 |
|---|---|---|
| 构建框架 | Astro | 4.x，默认 SSG output |
| 交互组件 | Vue 3 | 3.4+，岛屿化按需注入（`client:visible` / `client:load`） |
| 样式方案 | Tailwind CSS | v3.x + CSS 变量主题系统 |
| 内容 SDK | @notionhq/client | 官方 SDK，仅在构建时调用 |
| 包管理 | npm | Node 20+，锁文件入库 |
| 部署目标 | Vercel | 提交代码自动触发构建 |

## 三、目录结构约定

```
holy-night/
├── AGENT.md              # 本文件
├── DECISIONS.md          # 架构决策记录
├── DONT_DO.md            # 禁止清单
├── prompts/              # 分阶段开发提示词
│   ├── stage-0-setup.md
│   ├── stage-1-pages.md
│   ├── stage-2-theme.md
│   ├── stage-3-interactions.md
│   └── stage-4-deploy.md
├── .env.example          # 环境变量样例（真实 .env 不入库）
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── src/
    ├── layouts/              # 页面布局（.astro）
    │   ├── BaseLayout.astro      # 全局基础布局
    │   └── PostLayout.astro     # 文章详情页布局
    ├── components/
    │   ├── astro/            # 纯静态展示组件（.astro，零 JS）
    │   │   ├── NavBar.astro
    │   │   ├── PostCard.astro
    │   │   ├── Pagination.astro
    │   │   ├── ArchiveTimeline.astro
    │   │   └── Footer.astro
    │   └── vue/              # 交互组件（.vue）
    │       ├── ThemeToggle.vue
    │       └── PostToc.vue
    ├── pages/                # 路由（.astro）
    │   ├── index.astro           # 首页 / 文章列表
    │   ├── posts/[slug].astro    # 文章详情
    │   ├── categories/[category].astro
    │   ├── tags/[tag].astro
    │   ├── archive.astro
    │   └── about.astro
    ├── lib/
    │   ├── notion.ts         # Notion API 封装（唯一数据出口）
    │   └── utils.ts         # 日期、阅读时长等工具
    ├── styles/
    │   ├── global.css       # 全局样式 + CSS 变量主题
    │   └── markdown.css     # Notion/Markdown 块渲染样式
    └── assets/              # 字体、图标等静态资源
```

## 四、编码规范

1. **命名**
   - 组件文件 / 组件名：PascalCase（`PostCard.astro`、`ThemeToggle.vue`）
   - 工具函数 / 变量：camelCase
   - CSS 类名：kebab-case，优先 Tailwind 原子类，自定义样式集中在 `styles/`
2. **组件原则**
   - 纯展示内容一律用 `.astro`，默认零 JS 输出
   - 仅交互功能（主题切换、目录跟随）用 `.vue`，通过 Astro 岛屿指令按需加载
   - 组件职责单一， props 显式声明类型
3. **数据约定**
   - 所有 Notion 调用只能从 `src/lib/notion.ts` 导出
   - 页面数据通过 `getStaticPaths()` 在构建时预取
   - 密钥只走环境变量，禁止硬编码、禁止出现在客户端 bundle
4. **TypeScript**：严格模式，props / API 返回值必须有类型定义，禁止 `any`

## 五、视觉设计规范（强制）

### 5.1 整体气质
「双世界」：冷たい外の世界（外景冷调：夜蓝 / 紫灰 / 雪光青 / 银白，首页 / 导航 / 归档用雾中磨砂玻璃）与暖かい館の内（馆内暖调：木褐 / 琥珀烛光 / 羊皮纸，文章页「灯下夜读」面板）。记忆点为首页 Hero 复刻 OST 封面（云隙光 + 银白衬线大标题 + 白色燕尾丝带）。克制、精致，不堆砌特效；固定背景为无角色原画局部 + 遮罩 + 颗粒三层。

### 5.2 配色（CSS 变量，见 `styles/global.css`）

**深色主题「夜」（默认）**
- 页面底色：`--night-1 #10162a` → `--night-2 #1a2036`（大部分被固定背景遮住）
- 玻璃/卡片：`--glass rgba(18,24,42,.46)` / `--glass-2 rgba(22,28,48,.62)` + `backdrop-filter: blur`
- 主强调色（冷区/标题）：月白 `--silver #e7e9f2`
- 暖区/hover：琥珀 `--amber #d8a866`；次强调：`--amber-soft #e9c7a0`
- 正文：`--ink #d9dce6`；次要文字：雾灰 `--mist #8b91a6`
- 点缀：雪光青 `--ice #9fd4e2`（仅代码竖条/魔法点缀）；坡道雪影紫灰 `--dusk #51557e`
- 发丝线：`--hairline rgba(231,233,242,.14)` / `--hairline-strong .32`
- 暖面板：`--warm-panel #1c1815` / `--warm-text #e6ddd0`

**浅色主题「午后」**
- 页面底色：羊皮纸 `#e6e2d8` → `#efe9dd`；玻璃 `rgba(248,244,235,.66)` / `rgba(250,247,240,.82)`
- 标题/文字转冷深色：`--silver #3a3f52`、`--ink #332d26`；面板变羊皮纸 `#f5efe2`，h2 转焦糖 `#8a5a24`
- 代码块不变：双主题统一深色底 `#141a2c` + 雪光青左竖条

### 5.3 排版
- 标题：衬线字体（Noto Serif SC / Songti SC / SimSun），中等字重，标题用月白 `--silver`
- 西文 / 数字 / 丝带：Cormorant Garamond（500/600，`--font-latin`）
- 正文：无衬线（Noto Sans SC），行高 1.8，字距适中
- 标签 / 时间 / 页码：小号衬线

### 5.4 组件与动效
- 文章卡片（画框）：圆角 3px，1px 银白发丝细边，半透明玻璃底；hover 上浮 2px + 边框转琥珀 + 极淡琥珀外发光（烛光）；封面 16:9 hover 缓慢放大 1.03；无封面渲染空画框 + 中央四角星
- 分类标签：琥珀描边小框，hover 淡琥珀底
- 按钮：无填充 + 银白/琥珀细边框，hover 填充淡色
- 导航栏：滚动前透明，滚动后 `--glass-2` + 14px 模糊 + 底部发丝线；品牌含四角星（琥珀色），链接发丝下划线（hover 琥珀、激活银白）
- 主题按钮：描边小框「午后 / 夜」
- 内容区：最大宽度 1200px，居中，两侧留白；文章正文单列 800px
- 代码块：双主题统一深色底 + 雪光青（`#9fd4e2`）左竖条
- 动效：过渡 200–400ms，`ease-out`，只过渡具体属性，无循环动画，克制优雅；支持 `prefers-reduced-motion`
- 画框陪读小窗（AliceCompanion 岛屿，仅文章页 PostLayout 挂载）：CG 四边透明羽化、无实体框，默认静态原画，hover/focus/点击播放微动；桌面右下角 BackToTop 上方（176px），≤1024 移左下角（140/120px）；右上角有珠头像为开合开关，收起状态 localStorage 记忆

## 六、Notion 内容模型

文章数据库（单一 Database）字段严格如下：

| 字段名 | Notion 属性类型 | 用途 | 规则 |
|---|---|---|---|
| 标题 | title | 文章标题 | 必填 |
| 封面 | files | 列表/详情头图 | 建议 16:9 |
| 分类 | select | 一级分类 | 杂文 / 书评 / 影评 |
| 标签 | multi_select | 二级标签 | 自由添加 |
| 摘要 | rich_text | 列表页摘要 | ≤100 字 |
| 发布日期 | date | 排序与归档依据 | 倒序 |
| 状态 | select | 发布控制 | 草稿 / 已发布，仅拉取「已发布」 |
| 正文 | page content | 文章主体 | Notion 原生块 |

## 七、环境变量

`.env`（不入库）：
```
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
提供 `.env.example` 模板。

## 八、开发流程约定

1. 严格按 `prompts/stage-*` 顺序推进，每阶段验收通过再进入下一阶段
2. 新发现的架构决策 → 追加到 `DECISIONS.md`
3. 新踩的坑 / 新的禁止项 → 追加到 `DONT_DO.md`
4. 每个里程碑完成后 git 提交一次
