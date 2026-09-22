<script setup lang="ts">
/**
 * 文章目录岛屿（Vue 3）
 * - 桌面端（>1024px）：右侧悬浮固定目录（由 PostLayout 的 aside 承载）
 * - 平板/移动端（≤1024px）：右下角「目录」悬浮按钮，点击展开浮层
 * - IntersectionObserver 滚动高亮当前章节，点击平滑滚动到锚点
 * （阶段 5 只套样稿暖调目录样式，不重写交互逻辑）
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';

interface TocItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

const props = defineProps<{ headings: TocItem[] }>();

const activeId = ref<string>('');
const panelOpen = ref(false);
let observer: IntersectionObserver | null = null;

function goTo(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  panelOpen.value = false;
  // scroll-margin-top 已在 markdown.css 设定，scrollIntoView 自动避开吸顶导航
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  activeId.value = id;
  try {
    history.replaceState(null, '', `#${id}`);
  } catch {
    /* 忽略 history 写入失败 */
  }
}

function togglePanel(): void {
  panelOpen.value = !panelOpen.value;
}

onMounted(() => {
  if (props.headings.length === 0) return;

  // 初始高亮：优先匹配 URL hash（深链），否则默认第一项，避免页面顶部无高亮
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  if (hash && props.headings.some((h) => h.id === hash)) {
    activeId.value = hash;
  } else {
    activeId.value = props.headings[0].id;
  }

  // 观察区域：吸顶导航下方 70px 起，到视口 30% 高度为止的窄带
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) {
        activeId.value = visible[0].target.id;
      }
    },
    { rootMargin: '-70px 0px -70% 0px', threshold: 0 }
  );

  props.headings.forEach((h) => {
    const el = document.getElementById(h.id);
    if (el) observer?.observe(el);
  });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <div class="post-toc" v-if="headings.length > 0">
    <!-- 桌面端：内嵌侧栏 -->
    <nav class="toc-desktop" aria-label="文章目录">
      <p class="toc-title">目 次</p>
      <ul class="toc-list">
        <li v-for="h in headings" :key="h.id">
          <a
            :href="`#${h.id}`"
            :class="['toc-link', `level-${h.level}`, { active: activeId === h.id }]"
            @click.prevent="goTo(h.id)"
          >
            {{ h.text }}
          </a>
        </li>
      </ul>
    </nav>

    <!-- 平板 / 移动端：悬浮按钮 + 浮层 -->
    <div class="toc-mobile">
      <transition name="toc-fade">
        <nav v-if="panelOpen" class="toc-panel" aria-label="文章目录">
          <p class="toc-title">目 次</p>
          <ul class="toc-list">
            <li v-for="h in headings" :key="h.id">
              <a
                :href="`#${h.id}`"
                :class="['toc-link', `level-${h.level}`, { active: activeId === h.id }]"
                @click.prevent="goTo(h.id)"
              >
                {{ h.text }}
              </a>
            </li>
          </ul>
        </nav>
      </transition>
      <button
        type="button"
        class="toc-fab"
        :aria-expanded="panelOpen"
        aria-label="打开文章目录"
        @click="togglePanel"
      >
        目录
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-toc {
  font-family: var(--font-serif);
}
/* 琥珀「目 次」 + 发丝线竖条（样稿 .toc） */
.toc-title {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  letter-spacing: 0.3em;
  color: var(--amber);
  font-weight: 500;
}
.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 1px solid var(--hairline);
}
.toc-link {
  display: block;
  padding: 0.32rem 0 0.32rem 1rem;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--mist);
  text-decoration: none;
  border-left: 2px solid transparent;
  margin-left: -1px;
  transition: color 200ms ease-out, border-color 200ms ease-out;
}
.toc-link.level-2 {
  padding-left: 1.8rem;
}
.toc-link.level-3 {
  padding-left: 2.5rem;
  font-size: 0.78rem;
}
.toc-link:hover {
  color: var(--amber-soft);
}
.toc-link.active {
  color: var(--amber-soft);
  border-left-color: var(--amber);
}
html.light .toc-link:hover,
html.light .toc-link.active {
  color: #8a5a24;
}

/* 桌面端侧栏，移动端隐藏 */
.toc-desktop {
  display: none;
}
.toc-mobile {
  display: block;
}

/* 移动端悬浮按钮 */
.toc-fab {
  position: fixed;
  right: 1.25rem;
  bottom: 5.25rem;
  z-index: 30;
  padding: 0.55rem 1rem;
  font-family: var(--font-serif);
  font-size: 0.85rem;
  color: var(--amber);
  background: var(--glass-2);
  border: 1px solid rgba(216, 168, 102, 0.4);
  border-radius: 2px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: color 200ms ease-out, background-color 200ms ease-out,
    box-shadow 200ms ease-out, border-color 200ms ease-out;
}
.toc-fab:hover {
  background: rgba(216, 168, 102, 0.18);
  box-shadow: 0 0 14px rgba(216, 168, 102, 0.4);
}

/* 移动端浮层：不遮挡正文，独立浮层，可滚动 */
.toc-panel {
  position: fixed;
  right: 1.25rem;
  bottom: 8.5rem;
  z-index: 30;
  width: min(78vw, 300px);
  max-height: 55vh;
  overflow-y: auto;
  padding: 1rem 1.1rem;
  border: 1px solid var(--hairline-strong);
  border-radius: 3px;
  background: var(--glass-2);
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.45);
}

.toc-fade-enter-active,
.toc-fade-leave-active {
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}
.toc-fade-enter-from,
.toc-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* 桌面端（>1024px）：显示侧栏，隐藏移动端控件 */
@media (min-width: 1025px) {
  .toc-desktop {
    display: block;
  }
  .toc-mobile {
    display: none;
  }
}
</style>
