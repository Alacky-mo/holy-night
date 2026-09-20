import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  // 纯 SSG 静态生成（DONT_DO #3：禁止 SSR/ISR）
  output: 'static',
  integrations: [
    // Vue 3 岛屿组件，按需注入（client:visible / client:load）
    vue(),
  ],
});
