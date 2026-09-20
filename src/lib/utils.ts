/**
 * 通用工具函数：日期格式化、阅读时长估算等。
 */

/** 将 ISO 日期（如 2026-09-21T12:00:00.000Z）格式化为 YYYY-MM-DD */
export function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 按中文字数估算阅读时长（分钟）。
 * @param text 正文纯文本
 * @param cpm 每分钟阅读字数，默认 400
 */
export function estimateReadingTime(text: string, cpm = 400): number {
  const charCount = text.replace(/\s/g, '').length;
  return Math.max(1, Math.round(charCount / cpm));
}
