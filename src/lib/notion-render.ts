/**
 * Notion 块 → HTML 最小映射（阶段 1）
 *
 * 支持：paragraph / heading_1-3 / bulleted_list_item / numbered_list_item /
 *      quote / image / divider / code
 * 附带回退：to_do / callout / toggle / bookmark / link_preview / table
 * 未识别块收集到 unsupported 集合，由调用方在构建日志中提示，不静默丢块。
 */
import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import type { NotionBlock } from './notion';

// ---------- 基础工具 ----------

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 取任意块上的 rich_text 字段（位于 block[type].rich_text，回退块用），严格类型，无 any */
function blockRichText(block: NotionBlock): RichTextItemResponse[] | null {
  const typed = (block as Record<string, unknown>)[block.type];
  const candidate = (typed as { rich_text?: unknown } | null)?.rich_text;
  return Array.isArray(candidate)
    ? (candidate as RichTextItemResponse[])
    : null;
}

// ---------- 富文本 ----------

export function richTextToHtml(items: RichTextItemResponse[]): string {
  return items
    .map((item) => {
      const text = escapeHtml(item.plain_text);
      if (!text) return '';
      let inner = text;
      const a = item.annotations;
      if (a.code) inner = `<code>${inner}</code>`;
      if (a.bold) inner = `<strong>${inner}</strong>`;
      if (a.italic) inner = `<em>${inner}</em>`;
      if (a.strikethrough) inner = `<s>${inner}</s>`;
      if (a.underline) inner = `<u>${inner}</u>`;
      if (item.type === 'equation') {
        inner = `<code class="notion-equation">${inner}</code>`;
      }
      // 仅外链输出 <a>；Notion 内部页面链接（/开头）在本站无对应路由，输出纯文本
      if (item.href && /^https?:\/\//.test(item.href)) {
        inner = `<a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
      }
      return inner;
    })
    .join('');
}

function plainTextOf(items: RichTextItemResponse[]): string {
  return items.map((t) => t.plain_text).join('');
}

// ---------- 标题锚点（供阶段 3 目录跟随使用） ----------

function headingId(text: string, index: number): string {
  const slug = text
    .toLowerCase()
    .replace(/[\s\p{P}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `h-${index}-${slug}`.slice(0, 80);
}

function headingHtml(
  level: 1 | 2 | 3,
  data: { rich_text: RichTextItemResponse[] },
  index: number
): string {
  const id = headingId(plainTextOf(data.rich_text), index);
  return `<h${level} id="${id}">${richTextToHtml(data.rich_text)}</h${level}>`;
}

// ---------- 表格（最小回退） ----------

function renderTable(block: NotionBlock): string {
  const rows = block.children.filter((c) => c.type === 'table_row');
  if (rows.length === 0) return '';
  const hasHeader = block.type === 'table' && block.table.has_column_header;
  const trs = rows
    .map((row, i) => {
      const cells = row.type === 'table_row' ? row.table_row.cells : [];
      const tag = hasHeader && i === 0 ? 'th' : 'td';
      return `<tr>${cells
        .map((cell) => `<${tag}>${richTextToHtml(cell)}</${tag}>`)
        .join('')}</tr>`;
    })
    .join('');
  return `<table>${trs}</table>`;
}

// ---------- 单块渲染 ----------

function renderBlock(
  block: NotionBlock,
  index: number,
  unsupported: Set<string>
): string {
  const childHtml =
    block.children.length > 0 ? blocksToHtml(block.children, unsupported) : '';

  switch (block.type) {
    case 'paragraph':
      return `<p>${richTextToHtml(block.paragraph.rich_text)}</p>${childHtml}`;
    case 'heading_1':
      return headingHtml(1, block.heading_1, index);
    case 'heading_2':
      return headingHtml(2, block.heading_2, index);
    case 'heading_3':
      return headingHtml(3, block.heading_3, index);
    case 'quote':
      return `<blockquote>${richTextToHtml(
        block.quote.rich_text
      )}${childHtml}</blockquote>`;
    case 'code': {
      const code = plainTextOf(block.code.rich_text);
      const lang = block.code.language || 'plain text';
      return `<figure class="notion-code"><pre><code class="language-${escapeHtml(
        lang
      )}">${escapeHtml(code)}</code></pre></figure>`;
    }
    case 'image': {
      const img = block.image;
      const src = img.type === 'file' ? img.file.url : img.external.url;
      const caption = richTextToHtml(img.caption);
      return `<figure class="notion-image"><img src="${escapeHtml(
        src
      )}" alt="${escapeHtml(plainTextOf(img.caption))}" loading="lazy" />${
        caption ? `<figcaption>${caption}</figcaption>` : ''
      }</figure>`;
    }
    case 'divider':
      return '<hr/>';
    case 'to_do': {
      const checked = block.to_do.checked ? 'checked' : '';
      return `<p class="notion-todo"><input type="checkbox" disabled ${checked} /> ${richTextToHtml(
        block.to_do.rich_text
      )}</p>${childHtml}`;
    }
    case 'callout':
      return `<blockquote class="notion-callout">${richTextToHtml(
        block.callout.rich_text
      )}${childHtml}</blockquote>`;
    case 'toggle':
      return `<details class="notion-toggle"><summary>${richTextToHtml(
        block.toggle.rich_text
      )}</summary>${childHtml}</details>`;
    case 'bookmark':
      return `<p class="notion-bookmark"><a href="${escapeHtml(
        block.bookmark.url
      )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
        block.bookmark.url
      )}</a></p>`;
    case 'link_preview':
      return `<p class="notion-bookmark"><a href="${escapeHtml(
        block.link_preview.url
      )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
        block.link_preview.url
      )}</a></p>`;
    case 'table':
      return `<figure class="notion-table">${renderTable(block)}</figure>`;
    case 'bulleted_list_item':
    case 'numbered_list_item':
      // 由 blocksToHtml 分组处理，此处不会单独出现
      return '';
    default: {
      const rt = blockRichText(block);
      if (rt) {
        return `<p class="notion-fallback">${richTextToHtml(rt)}</p>${childHtml}`;
      }
      unsupported.add(block.type);
      return '';
    }
  }
}

function renderListItem(block: NotionBlock, unsupported: Set<string>): string {
  const data =
    block.type === 'bulleted_list_item'
      ? block.bulleted_list_item
      : block.numbered_list_item;
  const childHtml =
    block.children.length > 0 ? blocksToHtml(block.children, unsupported) : '';
  return `<li>${richTextToHtml(data.rich_text)}${childHtml}</li>`;
}

// ---------- 块列表（连续同类列表项合并为 ul/ol） ----------

export function blocksToHtml(
  blocks: NotionBlock[],
  unsupported: Set<string> = new Set<string>()
): string {
  let html = '';

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (
      block.type === 'bulleted_list_item' ||
      block.type === 'numbered_list_item'
    ) {
      const listType = block.type;
      const tag = listType === 'bulleted_list_item' ? 'ul' : 'ol';
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === listType) {
        items.push(blocks[i]);
        i++;
      }
      i--; // 抵消 for 循环的自增
      html += `<${tag}>${items
        .map((item) => renderListItem(item, unsupported))
        .join('')}</${tag}>`;
    } else {
      html += renderBlock(block, i, unsupported);
    }
  }

  return html;
}

// ---------- 纯文本（阅读时长估算用） ----------

export function blocksToPlainText(blocks: NotionBlock[]): string {
  return blocks
    .map((block) => {
      const rt = blockRichText(block);
      const own = rt ? plainTextOf(rt) : '';
      const children = blocksToPlainText(block.children);
      return [own, children].filter(Boolean).join('\n');
    })
    .join('\n');
}
