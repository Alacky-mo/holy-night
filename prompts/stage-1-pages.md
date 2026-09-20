# 阶段 1：核心页面与基础内容渲染

> 前置：阶段 0 验收通过。新会话先读三个配置文件，再读本文件。

## 阶段目标
完成 5 个核心页面的结构与数据渲染，实现完整的内容浏览逻辑。本阶段只关心「数据对、路由通」，样式保持最简即可。

## 具体任务

1. **全局布局**
   - 完善 `BaseLayout.astro`：顶部 `NavBar`（Logo「Holy Night」+ 首页/归档/关于 三个链接）+ `<slot />` + 底部 `Footer`
   - 主题切换按钮先占位（交互在阶段 2 做）

2. **首页 / 文章列表 `src/pages/index.astro`**
   - 调用 `getPublishedPosts({ pageSize: 10 })`
   - 渲染 `PostCard.astro` 列表：封面缩略图、标题、分类、摘要、发布日期
   - 接入 `Pagination.astro`（本阶段可先做静态页码占位，分页逻辑可用 query 参数 `?page=2`）

3. **文章详情 `src/pages/posts/[slug].astro`**
   - 通过 `getStaticPaths()` 遍历所有已发布文章生成静态路径
   - `PostLayout.astro` 渲染：标题、分类标签、发布日期、阅读时长（`utils.ts` 中实现按中文字数估算）、正文 blocks
   - 正文渲染：实现 Notion 块 → HTML 的最小映射（paragraph / heading1-3 / bulleted_list_item / numbered_list_item / quote / image / divider / code）

4. **分类页 `src/pages/categories/[category].astro`**
   - `getStaticPaths()` 从所有文章聚合出分类列表
   - 按分类过滤文章，复用 `PostCard`

5. **标签页 `src/pages/tags/[tag].astro`**
   - 同上，按标签过滤

6. **归档页 `src/pages/archive.astro`**
   - 拉取全部已发布文章
   - 按「发布年份」降序分组，输出年份 + 该年文章列表结构（时间轴样式在阶段 2 做）

7. **关于页 `src/pages/about.astro`**
   - 独立静态页，写一段占位自我介绍

## 输出要求
- 所有路由可访问
- 数据全部来自 Notion 构建时预取
- 点击文章卡片能跳到详情页，详情页正文渲染完整

## 验收标准
1. `/`、`/posts/[slug]`、`/categories/xxx`、`/tags/xxx`、`/archive`、`/about` 全部可访问
2. 首页分页点击后 URL 正确，内容正确切换
3. 分类、标签筛选结果准确
4. 归档页按年份倒序分组，每年内文章按日期倒序
5. 详情页 Notion 正文块渲染无丢块（对照 Notion 原文档抽查一篇长文）
6. `npm run build` 无报错，`dist/` 输出全部页面 HTML
