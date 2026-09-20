<script setup lang="ts">
/**
 * 分页行为岛屿（client:load）
 *
 * 纯 SSG 下 ?page=N 无法在构建时区分页面，因此：
 * - 首页构建时渲染全部页段（[data-post-page]），默认只显示第 1 页
 * - 本岛屿读取 URL ?page= 切换可见页段、更新页码高亮、同步 history
 * 静态 Pagination.astro 负责页码链接结构（无 JS 时链接仍可跳转）
 */
import { onMounted, ref } from 'vue';

const props = defineProps<{
  totalPages: number;
}>();

const currentPage = ref(1);
let sections: HTMLElement[] = [];

function readPageFromUrl(): number {
  const raw = Number(new URLSearchParams(window.location.search).get('page'));
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(Math.floor(raw), props.totalPages);
}

function applyPage(page: number): void {
  currentPage.value = page;
  sections.forEach((el) => {
    el.hidden = Number(el.dataset.postPage) !== page;
  });
  document
    .querySelectorAll<HTMLElement>('.pagination a[data-page]')
    .forEach((link) => {
      const active = Number(link.dataset.page) === page;
      link.classList.toggle('current', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
}

function go(page: number): void {
  const target = Math.min(Math.max(1, page), props.totalPages);
  const url = new URL(window.location.href);
  if (target === 1) url.searchParams.delete('page');
  else url.searchParams.set('page', String(target));
  history.pushState({}, '', url);
  applyPage(target);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

onMounted(() => {
  sections = Array.from(
    document.querySelectorAll<HTMLElement>('[data-post-page]')
  );
  applyPage(readPageFromUrl());

  // 事件委托：接管静态页码链接点击
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const link = target?.closest<HTMLAnchorElement>('.pagination a[data-page]');
    if (!link) return;
    event.preventDefault();
    go(Number(link.dataset.page));
  });

  // 浏览器前进/后退
  window.addEventListener('popstate', () => {
    applyPage(readPageFromUrl());
  });
});
</script>

<template>
  <span class="pagination-sync" aria-hidden="true"></span>
</template>

<style scoped>
.pagination-sync {
  display: none;
}
</style>
