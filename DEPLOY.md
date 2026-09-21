# Holy Night 部署与发布闭环说明

> 本文档面向阶段 4（部署上线），给出从「本地代码」到「线上可访问、Notion 更新自动触发重建」的完整操作步骤。
> 完成本文档所有步骤后，请回到 `PROGRESS.md` 对照验收标准逐项勾选。

---

## 0. 部署前的三个占位（必须先改）

代码里有两处**占位域名**，部署前请确认是否与你最终使用的域名一致：

| 文件 | 占位值 | 需要修改的场景 |
|---|---|---|
| `astro.config.mjs` → `site` | `https://holy-night.vercel.app` | 若你的 Vercel 项目名不是 `holy-night`（默认域名变为 `<项目名>.vercel.app`），或绑定了自定义域名，**必须改为真实域名**后重新 push |
| `public/robots.txt` → `Sitemap:` | `https://holy-night.vercel.app/sitemap-index.xml` | 同上，域名不同必须同步修改 |

> 为什么必须改：`site` 决定 sitemap 全部 URL 与 Open Graph 图片的绝对地址；`robots.txt` 的 Sitemap 指向若与真实域名不符，站长平台会报错。
>
> **最省事做法**：第 2 步在 Vercel 创建项目时，把项目名直接填 `holy-night`，默认域名就是 `https://holy-night.vercel.app`，与两处占位完全一致，**无需修改任何代码**。

---

## 1. 推送到 GitHub（Vercel 接入的前提）

当前仓库**没有远程地址**，需要你手动完成一次：

```bash
# 1. 在 github.com 新建一个空仓库（不要勾选 README/.gitignore，避免冲突），记下地址，如：
#    https://github.com/<你的用户名>/holy-night.git

# 2. 在项目根目录执行：
git remote add origin https://github.com/<你的用户名>/holy-night.git
git push -u origin main
```

> 本仓库无全局 git 身份，后续提交请用：
> `git -c user.name="Holy Night" -c user.email="holy-night@local" commit ...`

---

## 2. Vercel 导入与部署

1. 打开 [vercel.com](https://vercel.com) → **Add New… → Project** → 选择刚推送的 `holy-night` 仓库。
2. Framework Preset 会自动识别为 **Astro**（无需手动指定）：
   - Build Command：`npm run build`（Astro 默认，无需改）
   - Output Directory：`dist`（Astro 默认，无需改）
3. **Environment Variables** 添加两条（值从本地 `.env` 复制）：
   - `NOTION_TOKEN` = `secret_xxx...`
   - `NOTION_DATABASE_ID` = 你的数据库 id
4. 点击 **Deploy**。首次构建约 1–3 分钟。
5. 部署完成后打开默认域名 `<项目名>.vercel.app`，确认首页、文章、归档、404 正常。

> 不需要 `vercel.json`：Astro 4 纯静态输出在 Vercel 零配置即可工作（构建命令与输出目录均符合默认值）。只有将来需要自定义 header/redirect 时才考虑添加。

> 注意：**Notion 密钥只会出现在 Vercel 后台**，不会进入代码仓库（`.env` 已被 `.gitignore` 排除）。任何客户端 HTML 里都不会出现密钥（DONT_DO #4）。

---

## 3. Notion 更新 → 触发重建（核心闭环）

### 3.1 生成 Vercel Deploy Hook

1. Vercel 项目 → **Settings → Git → Deploy Hooks**。
2. 点击 **Create Hook**，名字随意（如 `notion-publish`），分支选 `main`。
3. 复制生成的 Hook URL，形如：
   `https://api.vercel.com/v1/integrations/deploy/<一串随机id>/<一串随机id>`
4. **对该 URL 发起一次 GET/POST 请求即触发一次生产构建**，无需登录凭证。

### 3.2 触发方案（三选一，推荐 A）

#### 方案 A（推荐）：Notion 数据库「发布时」按钮 + Make.com 调 Webhook

用 Notion 的 Button 功能在每条文章页放一个「发布」按钮，点了就调用 Make 场景 → Make 请求 Deploy Hook → 站点重建。

1. **注册 Make.com**（免费额度足够个人博客），创建一个新 Scenario。
2. 第一个模块选 **Webhook**（`Custom webhook`）：
   - 点击 **Create a webhook**，得到 Make 侧的回调 URL，复制。
3. 第二个模块选 **HTTP → Make a request**：
   - URL：填 **3.1 的 Vercel Deploy Hook URL**
   - Method：`POST`
   - Body：可留空（Vercel Hook 无需 payload）
4. 点 **Run once** 测试：Make 侧收到 Webhook 请求后应自动请求 Vercel，Vercel 开始构建，站点几分钟后更新。
5. **在 Notion 中创建 Button**（文章页顶部，或数据库视图里）：
   - 打开文章页 → `/button` → 选择 **Open page** 类操作 → 选 **Webhook** 类型（Notion Button 支持发送 Webhook）
   - 填入 **Make 侧的回调 URL**
   - 按钮命名为「发布」
6. 以后发布流程：写好文章 → 状态改为「已发布」→ 点页面里的「发布」按钮 → Make 转发给 Vercel → 几分钟后线上出现。

> 若 Notion 的 Button 不显示 Webhook 选项（个别账号/区域限制），退而用方案 B 或 C。

#### 方案 B：GitHub Actions 定时 ping（兜底，文件已就绪，推荐做）

**工作流文件已写好**：`.github/workflows/rebuild.yml`（每 30 分钟请求一次 Deploy Hook，支持 Actions 页手动触发）。只需两步启用：

1. 仓库 → **Settings → Secrets and variables → Actions → New repository secret**：
   - Name：`VERCEL_DEPLOY_HOOK`
   - Value：粘贴 3.1 的 Vercel Deploy Hook URL
2. 推送 `main` 后自动生效；可到 **Actions** 页选 `Rebuild site on schedule` → **Run workflow** 手动测试。

原理：GitHub 每 30 分钟在临时服务器上 `curl` 一次 Hook → Vercel 重建。免费额度足够（个人博客每月约 1440 次秒级任务）。

- 备选：cron-job.org 注册后同样填 Hook URL + 周期 30 分钟。
- 缺点：非实时；优点：零平台依赖、稳定兜底。

#### 方案 C：手动书签（最简）

浏览器收藏以下地址（`javascript:` 书签发起 GET 即可触发构建）：

```
javascript:fetch('<Vercel Deploy Hook URL>').then(r=>alert(r.ok?'已触发构建':'触发失败'))
```

优点：零第三方平台；缺点：需要手动点。

### 3.3 验证闭环

1. 在 Notion 新建一篇「状态=已发布」的文章。
2. 触发 Deploy Hook（任选方案）。
3. 等构建完成后刷新线上首页，应出现新文章。

---

## 4. 上线检查清单

### 4.1 域名（可选，强烈建议长期使用）

1. Vercel 项目 → **Settings → Domains** → 添加你的域名（如 `holynight.example.com`）。
2. 按提示在域名服务商配置 CNAME / A 记录。
3. 证书自动签发（Let's Encrypt），生效后**同步修改** `astro.config.mjs` 的 `site` 与 `public/robots.txt` 中的 sitemap 地址，重新 push。

### 4.2 站长平台提交 sitemap

- **Google Search Console**：添加资源（域名或网址前缀）→ 验证 → Sitemaps 提交 `https://<域名>/sitemap-index.xml`。
- **百度搜索资源平台**：添加站点 → 验证（建议文件验证或 CNAME）→ 普通收录 → sitemap 提交同上地址。
- 等待抓取即可；纯个人站点无需额外优化。

### 4.3 分享预览（微信 / Twitter）

- **微信**：把文章链接发给任意联系人/文件传输助手，预览卡片应显示标题、摘要与封面。
- **Twitter / X**：发一条含链接的推文，或使用 [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)（已停用则直接发推看预览）。
- 预览依赖 Open Graph 标签，本文档配套代码已在 `BaseLayout.astro` / `PostLayout.astro` 注入（标题、摘要、封面、canonical）。
- 若某篇文章无封面，分享卡片会是「summary」小卡（正常）。

### 4.4 RSS（可选增强）

- 需要新增依赖（如 `@astrojs/rss`）并写 `src/pages/rss.xml.js`，属于后续增强项，本阶段未实现。

---

## 5. 验收命令（部署完成后执行）

```bash
# 1. 所有页面正常（返回 200 且非空）
curl -I https://<域名>/
curl -I https://<域名>/posts/3e14a863-04fd-8082-80ec-dba946735575

# 2. sitemap
curl https://<域名>/sitemap-index.xml          # 应返回 XML
curl https://<域名>/robots.txt                 # 应返回允许抓取 + Sitemap 指向

# 3. 重构闭环：Notion 改文章状态 → 触发 Deploy Hook → 首页出现新文章

# 4. Lighthouse 桌面端（Chrome DevTools → Lighthouse）：
#    性能 ≥ 95，SEO = 100（阶段 3 本地基线：首页 96/100、详情 95/100、归档 100/100）
#    首页 HTML gzip 后约 4.4KB（远低于 50KB 上限，不含字体与图片）
```

---

## 6. 运维备忘

- **图片**：Notion 上传的图片在构建时会被下载到本站静态目录（`src/lib/image-localize.ts`），线上不依赖 1 小时过期的 S3 签名 URL；外部图床链接不受影响。下载失败自动回退原 URL 并记日志，不中断构建。
- **重新构建**：任何时刻手动触发，去 Vercel 项目页 **Deployments → Redeploy** 即可。
- **环境变量变更**：改完 Vercel 后台环境变量后需 Redeploy 生效。
- **本地开发**：`npm run dev` 时图片直接写入 `public/images/` 可即时预览；构建时由 `astro.config.mjs` 的钩子拷贝进 `dist/images/`。
