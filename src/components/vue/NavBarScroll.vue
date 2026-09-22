<script setup lang="ts">
/**
 * 导航滚动毛玻璃岛屿（Vue 3，client:load）
 * 滚动超过阈值给 #site-nav 加 .scrolled（毛玻璃 + 底部发丝线），
 * 滚动显隐直接在 scroll 监听里读 scrollY 赋值（DONT_DO #27）。
 */
import { onMounted, onBeforeUnmount } from 'vue';

function onScroll(): void {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 12);
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
  <span class="nav-scroll-observer" aria-hidden="true"></span>
</template>

<style scoped>
.nav-scroll-observer {
  display: none;
}
</style>
