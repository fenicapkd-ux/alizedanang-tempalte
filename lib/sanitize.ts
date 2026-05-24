/**
 * HTML Sanitizer — Loại bỏ script/XSS khỏi nội dung WordPress/Medusa
 * Dùng isomorphic-dompurify hoạt động cả Server Component lẫn Client Component
 */
import DOMPurify from 'isomorphic-dompurify';

type SanitizeConfig = Parameters<typeof DOMPurify.sanitize>[1];

// Cấu hình whitelist: giữ lại các tag HTML thông thường của blog, chặn script/event handlers
const BLOG_CONFIG: SanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's', 'del', 'ins',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'blockquote', 'pre', 'code', 'kbd', 'samp',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'a', 'img', 'figure', 'figcaption', 'picture', 'source',
    'div', 'span', 'section', 'article', 'aside', 'header', 'footer',
    'hr', 'small', 'sub', 'sup', 'abbr', 'cite', 'q', 'mark',
    'iframe',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'srcset', 'alt', 'title', 'class', 'id',
    'width', 'height', 'style', 'target', 'rel',
    'loading', 'decoding', 'fetchpriority',
    'allowfullscreen', 'frameborder', 'allow',
    'colspan', 'rowspan', 'scope',
  ],
  ALLOW_DATA_ATTR: true,
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
};

// Cấu hình nhẹ hơn cho tiêu đề (chỉ cho phép inline formatting)
const TITLE_CONFIG: SanitizeConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'br'],
  ALLOWED_ATTR: ['class'],
};

// Cấu hình cho product description (Medusa)
const PRODUCT_CONFIG: SanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's',
    'ul', 'ol', 'li', 'h2', 'h3', 'h4',
    'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'width', 'height', 'target', 'rel'],
};

/** Sanitize HTML từ WordPress (blog, finance, news content) */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, BLOG_CONFIG) as string;
}

/** Sanitize tiêu đề — chỉ giữ inline formatting */
export function sanitizeTitle(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, TITLE_CONFIG) as string;
}

/** Sanitize product description từ Medusa */
export function sanitizeProduct(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, PRODUCT_CONFIG) as string;
}

/** Strip toàn bộ HTML — chỉ lấy plain text */
export function stripHtml(html: string): string {
  if (!html) return '';
  return (DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) as string).trim();
}
