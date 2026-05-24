/**
 * HTML Sanitizer — Loại bỏ script/XSS khỏi nội dung WordPress/Medusa
 * Pure regex-based — KHÔNG dùng jsdom/DOMPurify → tương thích Vercel serverless
 * isomorphic-dompurify bị loại bỏ do jsdom gây ERR_REQUIRE_ESM trên Vercel
 */

// ── Regex patterns ────────────────────────────────────────────────────
/** Xoá toàn bộ nội dung <script>...</script> */
const RE_SCRIPT = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi;

/** Xoá toàn bộ nội dung <style>...</style> */
const RE_STYLE = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style\s*>/gi;

/** Xoá event handler attributes (onclick, onerror, onload, ...) */
const RE_EVENTS = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;

/** Thay javascript: bằng void: để vô hiệu hóa JS URL */
const RE_JS_URL = /javascript\s*:/gi;

/** Xoá data:text/html XSS vector */
const RE_DATA_HTML = /data\s*:\s*text\/html/gi;

/** Xoá các thẻ nguy hiểm: script, object, embed, applet, base, meta, form, iframe (nếu cần) */
const RE_DANGEROUS_OPEN = /<(script|object|embed|applet|base|meta|link|form)\b[^>]*\/?>/gi;
const RE_DANGEROUS_CLOSE = /<\/(script|object|embed|applet|base|meta|link|form)\s*>/gi;

/** Xoá các attribute nguy hiểm ngay cả khi tên không phải "on*" */
const RE_DANGEROUS_ATTRS = /\s+(srcdoc|xlink:href)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;

// ── Core sanitize ─────────────────────────────────────────────────────
function applyCoreSanitize(html: string): string {
  return html
    .replace(RE_SCRIPT, '')
    .replace(RE_STYLE, '')
    .replace(RE_DANGEROUS_OPEN, '')
    .replace(RE_DANGEROUS_CLOSE, '')
    .replace(RE_EVENTS, '')
    .replace(RE_DANGEROUS_ATTRS, '')
    .replace(RE_JS_URL, 'void:')
    .replace(RE_DATA_HTML, '');
}

/** Sanitize HTML từ WordPress (blog, finance, news content) */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return applyCoreSanitize(html);
}

/** Sanitize tiêu đề — chỉ giữ inline text, strip hầu hết tags */
export function sanitizeTitle(html: string): string {
  if (!html) return '';
  // Với title, strip tất cả tag ngoại trừ <b>, <i>, <em>, <strong>, <br>
  return applyCoreSanitize(html)
    .replace(/<(?!\/?(?:b|i|em|strong|br)\b)[^>]+>/gi, '');
}

/** Sanitize product description từ Medusa */
export function sanitizeProduct(html: string): string {
  if (!html) return '';
  return applyCoreSanitize(html);
}

/** Strip toàn bộ HTML — chỉ lấy plain text */
export function stripHtml(html: string): string {
  if (!html) return '';
  return applyCoreSanitize(html)
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}
