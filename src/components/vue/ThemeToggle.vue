<script setup lang="ts">
/**
 * 主题切换岛屿组件（Vue 3，client:load 立即注水）
 * 在 <html> 上切换 .light 类，CSS 变量主题随之切换（AGENT.md 5.2）。
 * 文案跟随样稿：显示当前主题切换目标（浅色时显示「夜」，深色时显示「午后」）。
 * localStorage 持久化 + BaseLayout 内联脚本首绘前恢复（防 FOUC）。
 */
import { ref, onMounted } from 'vue';

const label = ref('午后');

function syncLabel(): void {
  label.value = document.documentElement.classList.contains('light') ? '夜' : '午后';
}

function toggleTheme(): void {
  const root = document.documentElement;
  const isLight = root.classList.toggle('light');
  try {
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  } catch {
    /* localStorage 不可用时静默忽略，仅本次生效 */
  }
  syncLabel();
}

onMounted(syncLabel);
</script>

<template>
  <button
    type="button"
    class="theme-btn"
    aria-label="切换「午后 / 夜」主题"
    @click="toggleTheme"
  >
    {{ label }}
  </button>
</template>

<style scoped>
/* 描边小框「午后 / 夜」（样稿 .theme-btn） */
.theme-btn {
  font-family: var(--font-serif);
  font-size: 0.85rem;
  color: var(--silver-dim);
  background: none;
  border: 1px solid var(--hairline-strong);
  border-radius: 2px;
  padding: 0.28rem 0.8rem;
  cursor: pointer;
  transition: color 250ms ease-out, border-color 250ms ease-out,
    background-color 250ms ease-out;
}
.theme-btn:hover {
  color: var(--silver);
  border-color: var(--silver);
}
</style>
