<script setup lang="ts">
/**
 * 画框陪读小窗（Vue 3，client:load 全局挂载）
 * 默认完全静止的读书 CG；hover / 键盘聚焦由 CSS 淡入微动 WebP，
 * 触屏设备点击切换播放；交互结束回到静止。可关闭，状态记 localStorage。
 */
import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'alice-companion-dismissed';

const dismissed = ref(false);
const playing = ref(false);

onMounted(() => {
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === '1') {
      dismissed.value = true;
    }
  } catch {
    /* 隐私模式等 localStorage 不可用场景：静默保持默认显示 */
  }
});

function togglePlay(): void {
  // 减少动效偏好下永不播放（live 图同时被 CSS 直接隐藏）
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // 桌面端的播放由 hover / focus 的 CSS 负责，点击不反应；仅触屏设备点击切换
  if (!window.matchMedia('(hover: none)').matches) return;
  playing.value = !playing.value;
}

function dismiss(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* 静默：即使未写入记忆，本次收起仍然生效 */
  }
  dismissed.value = true;
}
</script>

<template>
  <aside v-if="!dismissed" class="alice-companion" aria-label="读书的有珠，装饰性小窗">
    <div
      class="alice-frame"
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
      <!-- 边缘过渡层：暗角 + 底边沉色，消除 CG 硬边 -->
      <span class="alice-vignette" aria-hidden="true"></span>
      <span class="alice-caption">Quiet reading</span>
    </div>
    <button type="button" class="alice-close" aria-label="收起小窗" @click="dismiss">
      ×
    </button>
  </aside>
</template>

<style scoped>
.alice-companion {
  position: fixed;
  right: 1.25rem;
  bottom: 5rem; /* 桌面：BackToTop(bottom1.25 + 高2.6) 的上方 */
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

.alice-frame {
  position: relative;
  width: 300px;
  padding: 9px;
  border-radius: 6px;
  background: var(--glass-2);
  border: 1px solid var(--hairline-strong);
  backdrop-filter: blur(10px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 var(--hairline);
  cursor: pointer;
  outline: none;
  transition: border-color 300ms ease-out, box-shadow 300ms ease-out;
}

.alice-frame:hover,
.alice-frame:focus-visible {
  border-color: var(--amber);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.42),
    0 0 16px rgba(216, 168, 102, 0.16),
    inset 0 1px 0 var(--hairline);
}

/* CG 画面区：两图同尺寸绝对叠放 */
.alice-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 3px;
}

.alice-live {
  position: absolute;
  inset: 9px; /* 与 padding 对齐 */
  width: calc(100% - 18px);
  opacity: 0;
  transition: opacity 350ms ease-out;
}

.alice-frame:hover .alice-live,
.alice-frame:focus-within .alice-live,
.alice-frame.playing .alice-live {
  opacity: 1;
}

/* ① 暗角：CG 四边沉入画框，消除硬边 */
.alice-vignette {
  position: absolute;
  inset: 9px;
  border-radius: 3px;
  pointer-events: none;
  box-shadow: inset 0 0 26px 10px rgba(10, 14, 28, 0.52);
}

/* ② 底边沉色：沙发下缘渐变进玻璃底色 */
.alice-frame::after {
  content: '';
  position: absolute;
  left: 9px;
  right: 9px;
  bottom: 9px;
  height: 42px;
  border-radius: 0 0 3px 3px;
  background: linear-gradient(transparent, rgba(22, 28, 48, 0.78));
  pointer-events: none;
}

.alice-caption {
  position: absolute;
  bottom: 16px;
  left: 18px;
  font-family: var(--font-latin);
  font-style: italic;
  font-size: 11px;
  color: var(--mist);
  letter-spacing: 0.04em;
  pointer-events: none;
  transition: color 300ms ease-out;
}

.alice-frame:hover .alice-caption {
  color: var(--amber-soft);
}

.alice-close {
  position: absolute;
  top: -9px;
  right: -7px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 13px;
  line-height: 1;
  color: var(--mist);
  background: var(--glass-2);
  border: 1px solid var(--hairline-strong);
  cursor: pointer;
  transition: color 200ms ease-out, border-color 200ms ease-out;
}

.alice-close:hover {
  color: var(--silver);
  border-color: var(--silver);
}

/* 浅色主题：覆盖两处过渡色，边界同样自然 */
html.light .alice-vignette {
  box-shadow: inset 0 0 26px 10px rgba(90, 70, 45, 0.26);
}

html.light .alice-frame::after {
  background: linear-gradient(transparent, rgba(248, 244, 235, 0.82));
}

/* 响应式避让：≤1024px 移到左下角，避开右下角目录按钮与 BackToTop */
@media (max-width: 1024px) {
  .alice-companion {
    right: auto;
    left: 1.25rem;
    bottom: 1.25rem;
  }
  .alice-frame {
    width: 232px;
  }
}

@media (max-width: 380px) {
  .alice-frame {
    width: 196px;
    padding: 7px;
  }
  .alice-live,
  .alice-vignette {
    inset: 7px;
    width: calc(100% - 14px);
  }
  .alice-frame::after {
    left: 7px;
    right: 7px;
    bottom: 7px;
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
}
</style>
