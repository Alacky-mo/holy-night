/**
 * Notion API 封装 —— 项目唯一数据出口（DONT_DO #10）
 *
 * 规则：
 * - 所有 Notion 调用只能从这里导出，页面不得直接 `new Client()`
 * - 密钥只从环境变量读取（NOTION_TOKEN / NOTION_DATABASE_ID），绝不进入客户端 bundle（DONT_DO #4）
 * - 环境变量未配置或请求失败时优雅返回空数据，绝不让构建崩溃（DONT_DO #11）
 */
import { Client, isFullBlock, isFullPage } from '@notionhq/client';
import type {
  BlockObjectResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

// ---------- 对外类型 ----------

/** 文章标准化元数据 */
export interface PostMeta {
  /** Notion 页面 id（同时作为 slug 使用，见 DECISIONS.md「文章 URL」条目） */
  id: string;
  slug: string;
  title: string;
  /** 封面图 URL（16:9 建议），无封面为 null */
  cover: string | null;
  category: string | null;
  tags: string[];
  /** 列表页摘要，≤100 字 */
  excerpt: string;
  /** ISO 日期字符串，未填写为 null */
  publishedAt: string | null;
}

/** 单篇文章完整数据：元数据 + 正文 blocks */
export interface PostDetail {
  meta: PostMeta;
  blocks: BlockObjectResponse[];
}

/** 分页结果 */
export interface PaginatedPosts {
  posts: PostMeta[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface GetPublishedPostsParams {
  pageSize?: number;
  startCursor?: string;
}

// ---------- 客户端初始化（含环境变量校验） ----------

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;

function createClient(): Client | null {
  if (!token || !databaseId) {
    console.log(
      '[notion] 未配置环境变量 NOTION_TOKEN / NOTION_DATABASE_ID，返回空数据。请复制 .env.example 为 .env 并填写。'
    );
    return null;
  }
  return new Client({ auth: token });
}

// ---------- 属性解析（strict 模式，无 any） ----------

type PropertyValue = PageObjectResponse['properties'][string];

function extractPlainText(prop: PropertyValue): string {
  if (prop.type === 'title' || prop.type === 'rich_text') {
    return prop[prop.type]
      .map((t) => t.plain_text)
      .join('')
      .trim();
  }
  return '';
}

function extractSelect(prop: PropertyValue): string | null {
  return prop.type === 'select' ? (prop.select?.name ?? null) : null;
}

function extractMultiSelect(prop: PropertyValue): string[] {
  if (prop.type !== 'multi_select') return [];
  return prop.multi_select
    .map((s) => s.name)
    .filter((name): name is string => Boolean(name));
}

function extractDate(prop: PropertyValue): string | null {
  return prop.type === 'date' ? (prop.date?.start ?? null) : null;
}

function extractFileUrl(prop: PropertyValue): string | null {
  if (prop.type !== 'files') return null;
  const file = prop.files[0];
  if (!file) return null;
  if (file.type === 'file') return file.file.url;
  if (file.type === 'external') return file.external.url;
  return null;
}

function extractPostMeta(page: PageObjectResponse): PostMeta {
  const props = page.properties;
  return {
    id: page.id,
    slug: page.id,
    title: extractPlainText(props['标题']) || 'Untitled',
    cover: extractFileUrl(props['封面']),
    category: extractSelect(props['分类']),
    tags: extractMultiSelect(props['标签']),
    excerpt: extractPlainText(props['摘要']),
    publishedAt: extractDate(props['发布日期']),
  };
}

// ---------- 对外方法 ----------

/**
 * 拉取「状态=已发布」的文章，按「发布日期」倒序（Notion 内容模型见 AGENT.md 第六节）。
 * 环境变量未配置或请求失败时返回空列表，不抛错。
 */
export async function getPublishedPosts(
  params: GetPublishedPostsParams = {}
): Promise<PaginatedPosts> {
  const { pageSize = 10, startCursor } = params;
  const client = createClient();
  if (!client || !databaseId) {
    return { posts: [], hasMore: false, nextCursor: null };
  }

  try {
    const response = await client.databases.query({
      database_id: databaseId,
      page_size: pageSize,
      start_cursor: startCursor,
      filter: {
        property: '状态',
        select: { equals: '已发布' },
      },
      sorts: [{ property: '发布日期', direction: 'descending' }],
    });

    const posts = response.results.filter(isFullPage).map(extractPostMeta);
    const titles = posts.map((p) => p.title).join('、') || '（无）';
    console.log(`[notion] 拉取到 ${posts.length} 篇文章：${titles}`);

    return {
      posts,
      hasMore: response.has_more,
      nextCursor: response.next_cursor,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.log(
      `[notion] Notion 拉取失败，返回空数据（构建不中断）。原因：${reason}`
    );
    return { posts: [], hasMore: false, nextCursor: null };
  }
}

/** 递归拉取某个 block 的全部子块（分页合并） */
async function fetchAllBlocks(
  client: Client,
  blockId: string
): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await client.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    });
    blocks.push(...response.results.filter(isFullBlock));
    hasMore = response.has_more;
    cursor = response.next_cursor ?? undefined;
  }

  return blocks;
}

/**
 * 根据 slug（= Notion 页面 id）取单篇文章元数据 + 正文 blocks。
 * 未找到或请求失败时返回 null，不抛错。
 */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const client = createClient();
  if (!client) return null;

  try {
    const page = await client.pages.retrieve({ page_id: slug });
    if (!isFullPage(page)) {
      console.log(`[notion] 页面 ${slug} 缺少完整属性，返回 null。`);
      return null;
    }
    const blocks = await fetchAllBlocks(client, slug);
    return { meta: extractPostMeta(page), blocks };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.log(
      `[notion] 获取文章失败（slug=${slug}），返回 null。原因：${reason}`
    );
    return null;
  }
}
