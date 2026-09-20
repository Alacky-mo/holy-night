<script setup lang="ts">
/**
 * 主题切换岛屿组件（Vue 3，client:load 立即注水）
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
  <button
    type="button"
    class="theme-toggle"
    aria-label="切换深浅主题"
    @click="toggleTheme"
  >
    主题
  </button>
</template>

<style scoped>
.theme-toggle {
  padding: 0.3rem 0.9rem;
  font-family: var(--font-serif);
  font-size: 0.85rem;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  cursor: pointer;
  /* 主题切换 400ms 过渡（阶段 2） */
  transition: color 400ms ease-out, border-color 400ms ease-out,
    background 400ms ease-out, box-shadow 400ms ease-out;
}
.theme-toggle:hover {
  /* 无填充 + 金色细边框，hover 填充淡金渐变（AGENT.md 5.4） */
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(233, 199, 107, 0.08));
  border-color: var(--accent);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.25);
}
</style>
