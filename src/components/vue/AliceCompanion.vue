<script setup lang="ts">
/**
 * 画框陪读小窗（Vue 3，client:load，仅文章页挂载）
 * CG 无实体画框，四边透明羽化融入页面；默认完全静止，
 * hover / 键盘聚焦 / 触屏点击才淡入微动 WebP。
 * 右上角有珠头像为开合开关，收起后仅余头像；状态记 localStorage。
 */
import { ref } from 'vue';

const COLLAPSE_KEY = 'alice-companion-collapsed';
const LEGACY_KEY = 'alice-companion-dismissed';

/**
 * 初始开合状态必须在 setup 首次渲染时确定：
 * v-show 的初始值在 hydration 时直接生效，避免 onMounted
 * 再翻转导致 Transition 不执行、舞台关不掉。
 * SSG 阶段无 window，返回 false（服务端初始 HTML 为展开）。
 */
function readCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // 一次性迁移旧版「永久关闭」标记
    if (window.localStorage.getItem(LEGACY_KEY) === '1') {
      window.localStorage.setItem(COLLAPSE_KEY, '1');
      window.localStorage.removeItem(LEGACY_KEY);
    }
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    /* 隐私模式等 localStorage 不可用场景：默认展开 */
    return false;
  }
}

const collapsed = ref(readCollapsed());
const playing = ref(false);

function toggleCollapsed(): void {
  const next = !collapsed.value;
  collapsed.value = next;
  if (next) playing.value = false;
  try {
    if (next) {
      window.localStorage.setItem(COLLAPSE_KEY, '1');
    } else {
      window.localStorage.removeItem(COLLAPSE_KEY);
    }
  } catch {
    /* 静默：即使未写入记忆，本次开合仍然生效 */
  }
}

function togglePlay(): void {
  // 减少动效偏好下永不播放（live 图同时被 CSS 直接隐藏）
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // 桌面端播放由 hover / focus 的 CSS 负责，点击不反应；仅触屏设备点击切换
  if (!window.matchMedia('(hover: none)').matches) return;
  playing.value = !playing.value;
}
</script>

<template>
  <aside class="alice-companion" aria-label="读书的有珠，装饰性小窗">
    <!-- 开合状态用 data 属性承载：Vue 岛屿 hydration 时 class 补丁不可靠，
         data-* 属性能被正确补丁（见收起态 CSS 选择器） -->
    <div class="alice-inner" :data-collapsed="collapsed ? '1' : '0'">
      <Transition name="alice-fade">
        <div
          v-show="!collapsed"
          class="alice-stage"
          :class="{ playing }"
          tabindex="0"
          role="img"
          @click="togglePlay"
        >
          <img
            class="alice-img alice-idle"
            src="/characters/alice/alice-reading-idle.png"
            alt=""
            aria-hidden="true"
            width="640"
            height="567"
          />
          <img
            class="alice-img alice-live"
            src="/characters/alice/alice-reading-live.webp"
            alt=""
            aria-hidden="true"
            width="640"
            height="567"
          />
        </div>
      </Transition>
      <button
        type="button"
        class="alice-avatar-btn"
        :aria-label="collapsed ? '显示读书小窗' : '收起读书小窗'"
        @click="toggleCollapsed"
      >
        <img
          src="/characters/alice/alice-avatar.png"
          alt=""
          aria-hidden="true"
          width="72"
          height="72"
        />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.alice-companion {
  position: fixed;
  right: 1rem;
  bottom: 6.5rem; /* 桌面：收起态头像位于 BackToTop 上方 */
  z-index: 25;
  animation: alice-in 350ms ease-out; /* 无 fill-mode，符合 DONT_DO #23 */
}

@keyframes alice-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alice-inner {
  position: relative;
}

/* CG 舞台：无实体框，四边 mask 羽化 */
.alice-stage {
  position: relative;
  width: 176px;
  cursor: pointer;
  outline: none;
  -webkit-mask-image:
    linear-gradient(to right, transparent 0, #000 14%, #000 86%, transparent 100%),
    linear-gradient(to bottom, transparent 0, #000 12%, #000 84%, transparent 100%);
  mask-image:
    linear-gradient(to right, transparent 0, #000 14%, #000 86%, transparent 100%),
    linear-gradient(to bottom, transparent 0, #000 12%, #000 84%, transparent 100%);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}

/* 降级：不支持遮罩交集时，用单层椭圆羽化 */
@supports not ((mask-composite: intersect) or (-webkit-mask-composite: source-in)) {
  .alice-stage {
    -webkit-mask-image: radial-gradient(
      ellipse 80% 76% at 50% 48%,
      #000 56%,
      transparent 94%
    );
    mask-image: radial-gradient(ellipse 80% 76% at 50% 48%, #000 56%, transparent 94%);
  }
}

/* 开合淡入淡出 */
.alice-fade-enter-active,
.alice-fade-leave-active {
  transition: opacity 250ms ease-out;
}
.alice-fade-enter-from,
.alice-fade-leave-to {
  opacity: 0;
}

/* 两图同尺寸叠放；live 默认隐藏，交互时淡入 */
.alice-img {
  display: block;
  width: 100%;
  height: auto;
}
.alice-live {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity: 0;
  transition: opacity 350ms ease-out;
}
.alice-stage:hover .alice-live,
.alice-stage:focus-within .alice-live,
.alice-stage.playing .alice-live {
  opacity: 1;
}

/* 头像开合开关：位于舞台右上角，略压边缘 */
.alice-avatar-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  overflow: hidden;
  background: var(--glass-2);
  border: 1px solid var(--hairline-strong);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
}
.alice-avatar-btn img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.alice-avatar-btn:hover,
.alice-avatar-btn:focus-visible {
  border-color: var(--amber);
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.35),
    0 0 12px rgba(216, 168, 102, 0.28);
  outline: none;
}

/* 收起态：舞台隐藏，头像锚定角落锚点
   用 data-collapsed 属性而非 class：Vue 岛屿 hydration 时 class 补丁不可靠 */
.alice-inner[data-collapsed='1'] .alice-avatar-btn {
  top: 0;
  right: 0;
}

/* 响应式：≤1024 移到左下角，避开右下角目录按钮与 BackToTop */
@media (max-width: 1024px) {
  .alice-companion {
    right: auto;
    left: 1rem;
    bottom: 1rem;
  }
  .alice-stage {
    width: 140px;
  }
  .alice-inner[data-collapsed='1'] .alice-avatar-btn {
    top: 0;
    right: auto;
    left: 0;
  }
}

@media (max-width: 380px) {
  .alice-stage {
    width: 120px;
  }
  .alice-avatar-btn {
    width: 30px;
    height: 30px;
    top: -10px;
    right: -10px;
  }
}

/* 减少动效：动图不受 CSS animation 控制，必须直接隐藏 */
@media (prefers-reduced-motion: reduce) {
  .alice-companion {
    animation: none;
  }
  .alice-live {
    display: none;
  }
  .alice-fade-enter-active,
  .alice-fade-leave-active {
    transition: none;
  }
}
</style>
