# Holy Night 交接文档：右下角「画框陪读」有珠组件（阶段 6）

> 用途：让执行会话在
>
> **不改动任何现有组件逻辑**
>
> 的前提下，把「读书的有珠」玻璃画框接入全站。
> 阅读顺序：
>
> `AGENT.md`
>
>  → 
>
> `DECISIONS.md`
>
>  → 
>
> `DONT_DO.md`
>
>  → 本文 → 
>
> `prompts/stage-6-alice-companion.md`
>
> 。
> 创建：2026-09-23。方案已由所有者拍板，素材已备好，
>
> **项目代码尚未改动**
>
> 。



***

## 1. 目标与现状



* 在页面右下角增加一个《魔法使之夜》「读书的有珠」玻璃画框：**默认是一张完全静止的原画**（低头读书），鼠标悬停 / 键盘聚焦 / 移动端点击时，画框内播放由官方 CG 差分帧制作的「抬头→转头→说话→闭眼」微动影像，约 13.7 秒一圈、无缝循环；交互结束即回到静止。

* 所有者明确要求：**风格不得与现有项目冲突；画框边界过渡自然**。

* 阶段 0–5 已完成（Astro 4 纯 SSG + Vue 3 岛屿 + Tailwind v3 + 双世界主题）。本阶段为纯增量。

## 2. 合规性说明（为什么不违反红线）



| 红线                                                            | 本方案的处理                                                                        |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| DONT\_DO #7「禁止页面出现持续循环动画」                                     | 画框**默认完全静止**；微动 WebP 仅在 hover /focus-within/ 点击时才可见，停止交互即隐藏，页面上不存在任何自动运行的循环动画 |
| DONT\_DO #9「交互走 .vue 岛屿，.astro 零 JS」                          | 新建 `AliceCompanion.vue`，以 `client:load` 挂载                                    |
| DONT\_DO #24「fixed 浮层祖先不得残留 transform/filter/backdrop-filter」 | 组件在 `BaseLayout.astro` 中与 `<BackToTop />` 同级、直接挂在 `<body>` 下                  |
| DONT\_DO #23「入场动画不用 fill-mode backwards/both」                 | 入场 keyframes 不设 fill-mode，自然态可见                                               |
| DONT\_DO #5「不偏离双世界配色 / 不引入扁平卡通」                               | 画框全部使用现有 CSS 变量（玻璃、发丝线、月白、琥珀、雾灰）；影像为官方原画                                      |
| 技术栈红线 #1 / #12                                                | **零新增依赖**，纯 Vue + CSS；`astro.config.mjs`、`tailwind.config.mjs` 无需改动           |

## 3. 交付素材（已制作完成）

源素材：游戏 CG `ev0104「読書する有珠」` 差分帧（1120×992，32bpp，无 alpha，全部带室内背景，故采用「整幅 CG 装入玻璃画框」而非抠成立绘）。

成品文件（当前位于 `C:\UserData\alice_work\assets\`）：



| 文件                        | 规格                                              | 用途             |
| ------------------------- | ----------------------------------------------- | -------------- |
| `alice-reading-idle.png`  | 640×567，373KB                                   | 默认静止帧（aa：低头读书） |
| `alice-reading-live.webp` | 640×567，167KB，动画 WebP，22 帧、一圈 13.65s、首尾同帧无缝循环   | 交互时播放的微动影像     |
| 素材备份小样                    | `C:\UserData\alice_work\sample1_idle_live.webp` | 效果预览，不入库       |

**入库命令（PowerShell，执行会话第一步运行）：**



```
New-Item -ItemType Directory -Force "C:\Users\34727\Documents\My-Software-Journey\projects\holy-night\public\characters\alice" | Out-Null

Copy-Item "C:\UserData\alice\_work\assets\\\*" "C:\Users\34727\Documents\My-Software-Journey\projects\holy-night\public\characters\alice\\" -Recurse
```

> 目录约定：角色素材入 
>
> `public/characters/`
>
> （参照背景图入 
>
> `public/backgrounds/`
>
>  的先例）；
>
> **不可放&#x20;**
>
> `public/images/`
>
> （该目录被 .gitignore 忽略，DONT_DO #29）。

## 4. 需要改动 / 新增的文件清单



| 文件                                                          | 动作              | 说明              |
| ----------------------------------------------------------- | --------------- | --------------- |
| `public/characters/alice/alice-reading-idle.png`            | 新增              | 见 §3            |
| `public/characters/alice/alice-reading-live.webp`           | 新增              | 见 §3            |
| `src/components/vue/AliceCompanion.vue`                     | **新增**          | 唯一的新组件，完整规格见 §5 |
| `src/layouts/BaseLayout.astro`                              | **改 2 行**       | 见 §6，不触碰任何现有行   |
| `DECISIONS.md`                                              | 末尾追加 1 行        | 见 §7            |
| `AGENT.md`                                                  | 5.4 节追加 1 条组件说明 | 见 §7            |
| `DONT_DO.md`                                                | **不改**          | 方案合规，无新增禁止项     |
| `astro.config.mjs` / `tailwind.config.mjs` / `package.json` | **不改**          | 零新依赖、零配置变更      |

## 5. 组件规格：`src/components/vue/AliceCompanion.vue`

### 5.1 DOM 结构



```
\<aside class="alice-companion" aria-label="读书的有珠，装饰性小窗">

&#x20; \<div class="alice-frame" tabindex="0" role="img"

&#x20;      @click="togglePlay">

&#x20;   \<img class="alice-img alice-idle" src="/characters/alice/alice-reading-idle.png"

&#x20;        alt="" aria-hidden="true" width="640" height="567" />

&#x20;   \<img class="alice-img alice-live" src="/characters/alice/alice-reading-live.webp"

&#x20;        alt="" aria-hidden="true" width="640" height="567" />

&#x20;   \<!-- 边缘过渡层：暗角 + 底边沉色，见 5.3 -->

&#x20;   \<span class="alice-vignette" aria-hidden="true">\</span>

&#x20;   \<span class="alice-caption">Quiet reading\</span>

&#x20; \</div>

&#x20; \<button type="button" class="alice-close" aria-label="收起小窗" @click="dismiss">×\</button>

\</aside>
```

### 5.2 脚本逻辑（`<script setup lang="ts">`）



* `dismissed = ref(false)`；`onMounted` 时读 `localStorage.getItem('alice-companion-dismissed')`，为 `'1'` 则不渲染（try/catch 包裹，隐私模式静默）。

* `playing = ref(false)`；`togglePlay()`：仅在 `matchMedia('(hover: none)').matches`（触屏设备）下切换 `playing`；桌面端点击不做反应（hover 已由 CSS 处理）。

* `dismiss()`：`localStorage.setItem('alice-companion-dismissed','1')` 后 `dismissed.value = true`。

* 禁止 `any`；两图同尺寸绝对叠放，live 图常驻 DOM（保证预加载），仅靠 opacity 显隐。

### 5.3 画框与「边界自然过渡」样式（核心要求，逐字落实）



```
.alice-companion {

&#x20; position: fixed;

&#x20; right: 1.25rem;

&#x20; bottom: 5rem;              /\* 桌面：BackToTop(bottom1.25 + 高2.6) 的上方 \*/

&#x20; z-index: 25;

&#x20; animation: alice-in 350ms ease-out;   /\* 无 fill-mode，符合 #23 \*/

}

@keyframes alice-in {

&#x20; from { opacity: 0; transform: translateY(10px); }

&#x20; to   { opacity: 1; transform: translateY(0); }

}

.alice-frame {

&#x20; position: relative;

&#x20; width: 300px;

&#x20; padding: 9px;

&#x20; border-radius: 6px;

&#x20; background: var(--glass-2);

&#x20; border: 1px solid var(--hairline-strong);

&#x20; backdrop-filter: blur(10px);

&#x20; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.42),

&#x20;             inset 0 1px 0 var(--hairline);

&#x20; cursor: pointer;

&#x20; outline: none;

&#x20; transition: border-color 300ms ease-out, box-shadow 300ms ease-out;

}

.alice-frame:hover,

.alice-frame:focus-visible {

&#x20; border-color: var(--amber);

&#x20; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.42),

&#x20;             0 0 16px rgba(216, 168, 102, 0.16),

&#x20;             inset 0 1px 0 var(--hairline);

}

/\* CG 画面区 \*/

.alice-img {

&#x20; display: block;

&#x20; width: 100%;

&#x20; height: auto;

&#x20; border-radius: 3px;

}

.alice-live {

&#x20; position: absolute;

&#x20; inset: 9px;                 /\* 与 padding 对齐 \*/

&#x20; width: calc(100% - 18px);

&#x20; opacity: 0;

&#x20; transition: opacity 350ms ease-out;

}

.alice-frame:hover .alice-live,

.alice-frame:focus-within .alice-live,

.alice-frame.playing .alice-live { opacity: 1; }

/\* ① 暗角：CG 四边沉入画框，消除硬边 \*/

.alice-vignette {

&#x20; position: absolute;

&#x20; inset: 9px;

&#x20; border-radius: 3px;

&#x20; pointer-events: none;

&#x20; box-shadow: inset 0 0 26px 10px rgba(10, 14, 28, 0.52);

}

/\* ② 底边沉色：沙发下缘渐变进玻璃底色（用 ::after 亦可，二选一实现） \*/

.alice-frame::after {

&#x20; content: '';

&#x20; position: absolute;

&#x20; left: 9px; right: 9px; bottom: 9px;

&#x20; height: 42px;

&#x20; border-radius: 0 0 3px 3px;

&#x20; background: linear-gradient(transparent, rgba(22, 28, 48, 0.78));

&#x20; pointer-events: none;

}

.alice-caption {

&#x20; position: absolute;

&#x20; bottom: 16px; left: 18px;

&#x20; font-family: var(--font-latin);

&#x20; font-style: italic;

&#x20; font-size: 11px;

&#x20; color: var(--mist);

&#x20; letter-spacing: 0.04em;

&#x20; pointer-events: none;

&#x20; transition: color 300ms ease-out;

}

.alice-frame:hover .alice-caption { color: var(--amber-soft); }

.alice-close {

&#x20; position: absolute;

&#x20; top: -9px; right: -7px;

&#x20; width: 20px; height: 20px;

&#x20; border-radius: 50%;

&#x20; font-size: 13px; line-height: 1;

&#x20; color: var(--mist);

&#x20; background: var(--glass-2);

&#x20; border: 1px solid var(--hairline-strong);

&#x20; cursor: pointer;

&#x20; transition: color 200ms ease-out, border-color 200ms ease-out;

}

.alice-close:hover { color: var(--silver); border-color: var(--silver); }
```

浅色主题（`html.light`）下需要覆盖两处过渡色，保证边界同样自然：



```
html.light .alice-vignette { box-shadow: inset 0 0 26px 10px rgba(90, 70, 45, 0.26); }

html.light .alice-frame::after { background: linear-gradient(transparent, rgba(248, 244, 235, 0.82)); }
```

### 5.4 响应式与避让

右下角现有住户（实测）：`BackToTop`（right/bottom 1.25rem）；≤1024px 时 `PostToc` 目录按钮 bottom 5.25rem、目录浮层 bottom 8.5rem。



```
@media (max-width: 1024px) {

&#x20; .alice-companion { right: auto; left: 1.25rem; bottom: 1.25rem; }

&#x20; .alice-frame { width: 232px; }

}

@media (max-width: 380px) {

&#x20; .alice-frame { width: 196px; padding: 7px; }

&#x20; .alice-live, .alice-vignette { inset: 7px; width: calc(100% - 14px); }

&#x20; .alice-frame::after { left: 7px; right: 7px; bottom: 7px; }

}
```

### 5.5 减少动效（注意：WebP 动图不受 CSS animation 控制，必须直接隐藏）



```
@media (prefers-reduced-motion: reduce) {

&#x20; .alice-companion { animation: none; }

&#x20; .alice-live { display: none; }

}
```

`togglePlay()` 内另加判断：`matchMedia('(prefers-reduced-motion: reduce)').matches` 为真时直接 return。

## 6. BaseLayout.astro 的精确改法（仅两行增量）

文件：`src/layouts/BaseLayout.astro`



1. 第 6 行 `import BackToTop from '../components/vue/BackToTop.vue';` **下方**新增一行：



```
import AliceCompanion from '../components/vue/AliceCompanion.vue';
```



1. 第 106 行 `<BackToTop client:load />` **下方**新增一行：



```
&#x20;   \<AliceCompanion client:load />
```

不改动、不重排任何其他内容。

## 7. 规范文件登记

`DECISIONS.md`**&#x20;末尾追加：**



```
\| 2026-09-23 | 右下角「画框陪读」组件 | 新增 Vue 岛屿 AliceCompanion（client:load），默认静态原画、hover/focus/触屏点击才播放 CG 差分微动 WebP（13.65s 无缝循环）；素材入 public/characters/alice/ | 所有者选定「画框陪读」方案；官方原画零新依赖，交互触发播放故不违反 DONT\_DO#7 | 放弃常驻旋转跳舞（违反 #7，除非未来专门豁免）与 Live2D（重依赖）；放弃抠图（CG 无 alpha 且坐姿边缘复杂） |
```

`AGENT.md`**&#x20;5.4 节组件与动效列表末尾追加一条：**



```
\- 画框陪读小窗（AliceCompanion 岛屿）：右下角玻璃画框，默认静态原画，hover/focus/点击播放微动；桌面位于 BackToTop 上方，≤1024px 移左下角，可关闭（localStorage 记忆）
```

## 8. 验收标准



1. `npm run build` 通过（DONT\_DO #15），无控制台报错、无资源 404、无 `any`、无新增依赖、无配置文件改动。

2. 桌面（含 1440 / 1024）：画框位于右下角、BackToTop 上方，二者不重叠；页面加载后**画框完全静止**，无任何自动动画。

3. 悬停 / 键盘聚焦画框：live 影像以 350ms 淡入并循环播放，边框转琥珀、标签转淡琥珀；移出 / 失焦后影像淡出、回到静止。

4. 移动端（320 / 360 / 390 实机模拟）：画框在左下角，不与右下角目录按钮、BackToTop 重叠，无横向溢出；点击播放 / 再点停止。

5. 画框边界无硬切：CG 四边有暗角沉入、底边渐变融入玻璃；深色 / 浅色双主题下过渡均自然。

6. 关闭按钮生效且刷新后不再出现；`prefers-reduced-motion` 下无入场动画、live 影像永不出现。

7. 既有功能（导航、分页、目录、主题切换、SEO、背景三层）无任何回退；Lighthouse 无明显下降。

8. `DECISIONS.md`、`AGENT.md` 已按 §7 登记；完成后 git 提交，建议信息：`阶段 6：右下角画框陪读有珠组件`。