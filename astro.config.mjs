import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

/**
 * local-images integration：Notion 图片在构建期（getStaticPaths）才下载进 public/images/，
 * 而 Astro 拷贝 public/ 到 dist/ 发生在此之前，因此用 astro:build:done 钩子补拷一次。
 * 详见 PROGRESS.md 六.2 与 src/lib/image-localize.ts。
 */
function localImagesIntegration() {
  return {
    name: 'local-images',
    hooks: {
      'astro:build:done': () => {
        const src = path.resolve('public/images');
        if (fs.existsSync(src)) {
          const dest = path.resolve('dist/images');
          fs.cpSync(src, dest, { recursive: true });
          console.log('[images] 已将 public/images/ 拷贝到 dist/images/（图片本地化）');
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  // 纯 SSG 静态生成（DONT_DO #3：禁止 SSR/ISR）
  output: 'static',
  // 站点域名：占位为 Vercel 默认域名，部署后如项目名/域名不同，必须改为真实域名
  //（sitemap 与 Open Graph 绝对 URL 均依赖此字段，见 DEPLOY.md「域名」一节）
  site: 'https://holy-night.vercel.app',
  integrations: [
    // Vue 3 岛屿组件，按需注入（client:visible / client:load）
    vue(),
    // 自动生成 sitemap-index.xml（页面级 sitemap-0.xml 分片）
    sitemap(),
    localImagesIntegration(),
  ],
});
