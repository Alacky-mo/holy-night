# 阶段 6：右下角「画框陪读」有珠组件

> 前置：阶段 0–5 已完成。本阶段为**纯增量**：新增 1 个 Vue 岛屿组件、2 个素材文件，只在 `BaseLayout.astro` 加两行；不改技术栈、不改配置文件、不改任何现有组件逻辑、不新增依赖。

## 开工前必读（按顺序，读完再动手）

1. `AGENT.md`、`DECISIONS.md`、`DONT_DO.md`（项目最高规则）
2. `ALICE_COMPANION_HANDOFF.md`（**本阶段唯一实施依据**：含素材、DOM、全部 CSS、精确改法与验收）
3. 参考现有岛屿写法：`src/components/vue/BackToTop.vue`（fixed 定位、挂载位置、过渡规范的范例）

## 背景与已拍板决策（无需再问，直接执行）

所有者已确认：

1. 采用「画框陪读」方案：右下角玻璃画框内是《魔法使之夜》读书 CG，**默认完全静止**；hover / 键盘聚焦 / 移动端点击时才播放官方 CG 差分帧微动 WebP（13.65s 一圈、无缝循环），交互结束回到静止。
2. 风格必须与现有「双世界」完全一致，全部使用现有 CSS 变量；**画框边界过渡自然**（暗角沉入 + 底边渐变，无硬切）。
3. 素材已由前序会话制作完成：`C:\UserData\alice_work\assets\alice-reading-idle.png` 与 `alice-reading-live.webp`，无需重新生成。
4. 已放弃的方向（不要重做）：常驻旋转跳舞（违反 DONT_DO #7）、Live2D（重依赖）、CG 抠图（无 alpha 通道、坐姿边缘复杂）。

## 具体任务

### 1. 素材入库

- 新建目录 `public/characters/alice/`（**不可放 `public/images/`**，该目录被 .gitignore 忽略，DONT_DO #29）。
- 把 `C:\UserData\alice_work\assets\` 下两个文件复制进去（命令见交接文档 §3）。

### 2. 新建组件 `src/components/vue/AliceCompanion.vue`

- 严格按 `ALICE_COMPANION_HANDOFF.md` §5 的 DOM 结构、脚本逻辑与样式实现：
  - 两图同尺寸绝对叠放，live 图常驻 DOM 预加载、默认 `opacity:0`；hover / focus-within / `.playing` 时 350ms 淡入。
  - 脚本：`dismissed` 状态读 `localStorage('alice-companion-dismissed')`；触屏设备点击切换 `playing`（用 `matchMedia('(hover: none)')` 判断）；关闭按钮写入收起状态。禁止 `any`。
  - 边界过渡：`.alice-vignette` 内阴影暗角 + `.alice-frame::after` 底边沉色渐变；浅色主题覆盖对应颜色（交接 §5.3 给了完整值）。
  - 响应式：桌面 `right:1.25rem; bottom:5rem`；≤1024px 移到左下角、宽 232px；≤380px 宽 196px。
  - `prefers-reduced-motion`：无入场动画、`.alice-live { display:none }`（动图不受 CSS animation 控制，必须直接隐藏），点击逻辑同步拦截。
  - 入场动画 keyframes 不设 fill-mode（DONT_DO #23）。

### 3. 挂载到布局（仅两行增量）

- `src/layouts/BaseLayout.astro`：在 `import BackToTop ...` 下加 `import AliceCompanion from '../components/vue/AliceCompanion.vue';`；在 `<BackToTop client:load />` 下加 `<AliceCompanion client:load />`。精确位置见交接文档 §6。不得改动其他任何行。

### 4. 登记规范（先登记后写码的惯例）

- `DECISIONS.md` 末尾追加交接文档 §7 给出的 2026-09-23 决策行。
- `AGENT.md` 5.4 节末尾追加「画框陪读小窗」组件说明。
- `DONT_DO.md` 不改；`astro.config.mjs`、`tailwind.config.mjs`、`package.json` 不改。

### 5. 约束（违反即返工）

- 零新增 npm 依赖、零组件库、零 SSR、零 `any`；交互只在 `.vue` 岛屿，`.astro` 不写 JS。
- 页面上**不得出现任何自动运行的循环动画**（DONT_DO #7）：微动只能由交互触发。
- 过渡只对具体属性、时长 200–400ms，禁止 `transition: all`（#19）；fixed 组件直接挂 body、祖先无 transform/filter/backdrop-filter（#24）。
- 内容区 1200px / 正文 800px 不受影响。

## 输出要求

- 桌面与移动端画框位置正确、与 BackToTop / 移动端目录按钮互不重叠，无横向溢出。
- 双主题下画框材质、暗角、底边渐变均自然，CG 边缘无硬切；交互播放 / 停止流畅。
- 不破坏阶段 0–5 任何既有功能与视觉。

## 验收标准

1. `npm run build` 通过，无控制台报错、无资源 404、无新增依赖、无配置文件变更。
2. 桌面 1440/1024：画框静止于右下角 BackToTop 上方；hover / 键盘聚焦播放微动、边框转琥珀；移出 / 失焦恢复静止。
3. 移动 320/360/390：画框在左下角、不溢出，点击播放 / 停止；不遮挡目录按钮与 BackToTop。
4. 深色 / 浅色双主题下边界过渡均自然（暗角 + 底边渐变）。
5. 关闭后刷新不再出现；`prefers-reduced-motion` 下无动效。
6. `DECISIONS.md`、`AGENT.md` 已登记；Lighthouse 无明显回退。
7. 完成后 git 提交，建议信息：`阶段 6：右下角画框陪读有珠组件`。
