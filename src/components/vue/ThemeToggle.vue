<script setup lang="ts">
/**
 * 主题切换岛屿组件（Vue 3，仅在可见时注水 client:visible）
 * 在 <html> 上切换 .light 类，CSS 变量主题随之切换（AGENT.md 5.2）
 */
function toggleTheme(): void {
  const root = document.documentElement;
  const isLight = root.classList.toggle('light');
  try {
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  } catch {
    /* localStorage 不可用时静默忽略，仅本次生效 */
  }
}
</script>

<template>
  <button type="button" class="theme-toggle" @click="toggleTheme">主题</button>
</template>

<style scoped>
.theme-toggle {
  padding: 0.35rem 0.9rem;
  font-family: var(--font-serif);
  font-size: 0.85rem;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  cursor: pointer;
  transition: all 300ms ease-out;
}
.theme-toggle:hover {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(233, 199, 107, 0.08));
  border-color: var(--accent);
}
</style>
