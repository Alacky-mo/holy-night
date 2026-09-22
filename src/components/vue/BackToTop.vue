<script setup lang="ts">
/**
 * 返回顶部岛屿（Vue 3，client:load 全局挂载）
 * 滚动超过一屏后淡入，固定右下角；点击平滑滚动回顶部。
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';

const visible = ref(false);

function onScroll(): void {
  // 仅在跨越阈值时更新，避免不必要的响应式写入；Vue 自身会批量更新 DOM
  visible.value = window.scrollY > window.innerHeight;
}

function toTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <button
    type="button"
    class="back-to-top"
    :class="{ show: visible }"
    aria-label="返回顶部"
    @click="toTop"
  >
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 5l7 8h-4v6h-6v-6H5l7-8z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  color: var(--silver-dim);
  background: var(--glass-2);
  border: 1px solid var(--hairline-strong);
  border-radius: 50%;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: opacity 200ms ease-out, transform 200ms ease-out,
    visibility 200ms ease-out, box-shadow 200ms ease-out,
    background-color 200ms ease-out;
}
.back-to-top.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.back-to-top:hover {
  color: var(--silver);
  border-color: var(--silver);
  box-shadow: 0 0 14px rgba(231, 233, 242, 0.2);
}
</style>
