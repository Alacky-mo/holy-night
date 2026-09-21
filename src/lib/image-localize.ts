/**
 * Notion 图片本地化 —— 构建期把 Notion 文件图片（S3 临时签名 URL）下载到本地静态目录
 *
 * 背景（PROGRESS.md 六.2）：Notion 上传文件返回的 URL 带 X-Amz-Expires=3600，约 1 小时后过期；
 * 纯 SSG 部署后若直接把签名 URL 写进 HTML，线上图片只有约 1 小时寿命。
 * 本模块在构建时下载图片并改写为同域静态路径 /images/...，外部图床（external）保持原样。
 *
 * 规则：
 * - 下载失败重试 3 次（指数退避），仍失败则回退原 URL 并记日志，绝不中断构建（DONT_DO #11）
 * - 模块级 URL 缓存去重，同一张图在多页面重复拉取时只下载一次
 * - 写入 public/images/（开发模式 Astro dev 直接服务）；构建产物拷贝由
 *   astro.config.mjs 中 local-images integration 的 astro:build:done 钩子负责
 */
import fs from 'node:fs';
import path from 'node:path';
import type { NotionBlock } from './notion';

const PUBLIC_IMAGES_DIR = path.resolve('public/images');

/** URL → 本地站点路径 缓存（去重，避免同一张图在多个页面重复下载） */
const CACHE = new Map<string, string>();

const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 是否为 Notion 内部文件 URL（S3 签名链接）：prod-files-secure 域名或带 X-Amz- 签名参数 */
function isNotionFileUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname.includes('prod-files-secure.s3.') ||
      u.searchParams.has('X-Amz-Expires') ||
      u.searchParams.has('X-Amz-Signature')
    );
  } catch {
    return false;
  }
}

/** 按 Content-Type / URL 扩展名决定本地文件扩展名，兜底 .jpg */
function pickExtension(url: string, contentType: string | null): string {
  if (contentType && EXT_BY_CONTENT_TYPE[contentType]) {
    return EXT_BY_CONTENT_TYPE[contentType];
  }
  const m = /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.exec(url);
  if (m) return m[1].toLowerCase() === 'jpeg' ? '.jpg' : `.${m[1].toLowerCase()}`;
  return '.jpg';
}

/**
 * 下载单张图片到 public/images/<siteBase><ext>，返回站点路径 /images/<siteBase><ext>。
 * siteBase 不含扩展名（如 posts/<pageId>/cover）；失败重试后回退原 URL。
 */
async function localizeOne(url: string, siteBase: string): Promise<string> {
  const cached = CACHE.get(url);
  if (cached) return cached;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get('content-type');
      const sitePath = `${siteBase}${pickExtension(url, contentType)}`;
      const absPath = path.join(PUBLIC_IMAGES_DIR, sitePath);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, buffer);
      const siteUrl = `/images/${sitePath}`;
      CACHE.set(url, siteUrl);
      return siteUrl;
    } catch (err) {
      lastError = err;
      if (attempt < 3) await sleep(500 * attempt);
    }
  }

  const reason = lastError instanceof Error ? lastError.message : String(lastError);
  console.log(
    `[images] 图片下载失败（重试 3 次后），回退原 URL：${url}。原因：${reason}`
  );
  return url;
}

/** 封面本地化：file 类型下载为 /images/posts/<pageId>/cover.<ext>；external / 无封面原样返回 */
export async function localizeCover(
  pageId: string,
  coverUrl: string | null
): Promise<string | null> {
  if (!coverUrl || !isNotionFileUrl(coverUrl)) return coverUrl;
  return localizeOne(coverUrl, `posts/${pageId}/cover`);
}

/**
 * 正文 image 块本地化：递归遍历块树，把 file 类型 image 的 URL 替换为本地路径。
 * 原地修改 block.image.file.url；external 保持原样；失败回退原 URL。
 */
export async function localizeBlocks(
  pageId: string,
  blocks: NotionBlock[]
): Promise<void> {
  for (const block of blocks) {
    if (block.type === 'image' && block.image.type === 'file') {
      const url = block.image.file.url;
      if (isNotionFileUrl(url)) {
        block.image.file.url = await localizeOne(url, `posts/${pageId}/${block.id}`);
      }
    }
    if (block.children.length > 0) {
      await localizeBlocks(pageId, block.children);
    }
  }
}
