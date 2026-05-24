import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// ================================================================
// PROXY (MIDDLEWARE) — Bảo vệ toàn diện tài nguyên Vercel
// Thứ tự kiểm tra: Static → Malicious Path → Method → UA → Body
//                  → Rate Limit → Locale Redirect
// ================================================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ── CẤU HÌNH RATE LIMIT ─────────────────────────────────────────
const RATE_LIMITS = {
  api:   { limit: 60,  windowSecs: 60 }, // API: 60 req/phút
  heavy: { limit: 20,  windowSecs: 60 }, // Trang nặng: 20 req/phút
  page:  { limit: 120, windowSecs: 60 }, // Trang thường: 120 req/phút
};

// ── PATHS ĐỘC HẠI (kẻ tấn công thường quét) ────────────────────
// Chặn ngay tại Edge, không tốn serverless invocation
const MALICIOUS_PATHS = [
  // WordPress/PHP probing
  '/wp-admin', '/wp-login', '/wp-content', '/wp-includes',
  '/xmlrpc.php', '/wp-json/v2/users',
  // Env file leaking
  '/.env', '/.env.local', '/.env.production',
  '/.git', '/.gitignore', '/.github',
  // Shell/config leaking
  '/config.php', '/configuration.php', '/config.yml',
  '/web.config', '/app.config',
  // Admin panels scanning
  '/admin', '/administrator', '/phpmyadmin', '/pma',
  '/cpanel', '/whm', '/plesk',
  // Common vulnerability probing
  '/shell', '/cmd', '/eval', '/upload.php',
  '/install.php', '/setup.php', '/info.php',
  // Node.js specific
  '/package.json', '/package-lock.json', '/yarn.lock',
  '/node_modules',
  // AWS metadata (SSRF)
  '/latest/meta-data', '/iam/security-credentials',
];

// ── PATTERN URL ĐỘC HẠI (SQLi, XSS, Path Traversal) ────────────
const MALICIOUS_URL_PATTERNS = [
  /(\.\.[\/\\]){2,}/,                        // Path traversal: ../../etc/passwd
  /<script[\s>]/i,                           // XSS inline script
  /union\s+select/i,                         // SQL injection
  /select\s+.*\s+from/i,                     // SQL injection
  /insert\s+into/i,                          // SQL injection
  /drop\s+table/i,                           // SQL injection
  /;\s*(exec|execute|xp_|sp_)/i,             // SQL stored proc injection
  /\beval\s*\(/i,                            // Code injection
  /base64_decode\s*\(/i,                     // PHP obfuscation
  /%3cscript/i,                              // URL-encoded XSS
  /javascript:/i,                            // JavaScript protocol
  /on(load|error|click|mouse)\s*=/i,         // Event handler injection
];

// ── BOT / SCRAPER / SCANNER BỊ CHẶN ────────────────────────────
const BLOCKED_USER_AGENTS = [
  // Scripting languages & HTTP libs
  'python-requests', 'scrapy', 'httpx', 'aiohttp', 'libwww-perl',
  'lwp-', 'go-http-client', 'java/', 'okhttp',
  // CLI tools
  'curl/', 'wget/', 'masscan', 'zgrab',
  // Security scanners
  'sqlmap', 'nikto', 'nmap', 'nuclei', 'dirbuster', 'gobuster',
  'wfuzz', 'ffuf', 'hydra', 'burpsuite',
  // SEO crawlers (tốn băng thông)
  'semrushbot', 'ahrefsbot', 'dotbot', 'mj12bot',
  'blexbot', 'seokicks', 'turnitinbot', 'petalbot',
  'bytespider', 'claudebot', 'gptbot', 'ccbot',
];

// ── HTTP METHOD CHO PHÉP ─────────────────────────────────────────
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

// ── TRANG NẶNG (giới hạn chặt hơn) ─────────────────────────────
const HEAVY_PATHS = ['/map', '/apartments', '/properties', '/projects'];

// ── LOCALE ──────────────────────────────────────────────────────
const locales = ['vi', 'en'];
const defaultLocale = 'vi';

// ── SECURITY HEADERS ─────────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options':    'nosniff',
  'X-Frame-Options':           'SAMEORIGIN',
  'X-XSS-Protection':          '1; mode=block',
  'Referrer-Policy':           'strict-origin-when-cross-origin',
  'Permissions-Policy':        'camera=(), microphone=(), geolocation=(self), payment=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1'
  );
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.href;

  // ── Bỏ qua static assets (không tốn Edge compute) ────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/studio') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ── 1. CHẶN PATHS ĐỘC HẠI ────────────────────────────────────
  // Bất kỳ ai quét /.env, /wp-admin, /phpMyAdmin → 404 ngay tại Edge
  const lowerPath = pathname.toLowerCase();
  if (MALICIOUS_PATHS.some((p) => lowerPath.startsWith(p.toLowerCase()))) {
    // Trả 404 thay vì 403 để không lộ thông tin
    return new NextResponse(null, { status: 404 });
  }

  // ── 2. CHẶN URL CÓ PATTERN ĐỘC HẠI (SQLi / XSS / Path Traversal) ──
  const fullUrl = decodeURIComponent(url);
  if (MALICIOUS_URL_PATTERNS.some((pattern) => pattern.test(fullUrl))) {
    return new NextResponse(null, { status: 400 });
  }

  // ── 3. CHẶN HTTP METHOD KHÔNG HỢP LỆ ─────────────────────────
  if (!ALLOWED_METHODS.includes(request.method.toUpperCase())) {
    return new NextResponse(null, {
      status: 405,
      headers: { Allow: ALLOWED_METHODS.join(', ') },
    });
  }

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // ── 4. CHẶN USER-AGENT TRỐNG / QUÁ NGẮN ─────────────────────
  if (!userAgent || userAgent.length < 8) {
    return new NextResponse(null, { status: 403 });
  }

  // ── 5. CHẶN BOT / SCRAPER THEO USER-AGENT ────────────────────
  if (BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
    return new NextResponse(null, { status: 403 });
  }

  // ── 6. CHẶN POST với Content-Length quá lớn (>1MB) ────────────
  if (request.method === 'POST' || request.method === 'PUT') {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 1_048_576) {
      return new NextResponse(
        JSON.stringify({ error: 'Payload quá lớn (tối đa 1MB)' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ── 7. RATE LIMITING THEO LOẠI ROUTE ─────────────────────────
  const ip = getClientIp(request);
  const isApi = pathname.startsWith('/api/');
  const isHeavy = HEAVY_PATHS.some((p) => pathname.includes(p));
  const { limit, windowSecs } = isApi
    ? RATE_LIMITS.api
    : isHeavy
    ? RATE_LIMITS.heavy
    : RATE_LIMITS.page;

  const prefix = isApi ? 'mw:api' : isHeavy ? 'mw:heavy' : 'mw:page';
  const key = `${prefix}:${ip}`;

  try {
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, windowSecs);

    if (current > limit) {
      const ttl = await redis.ttl(key);
      const res = new NextResponse(
        JSON.stringify({ error: 'Too Many Requests', retryAfter: ttl > 0 ? ttl : windowSecs }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(ttl > 0 ? ttl : windowSecs),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
      return applySecurityHeaders(res);
    }
  } catch {
    // Redis lỗi → cho đi qua, không làm sập app
  }

  // ── 8. LOCALE REDIRECT ────────────────────────────────────────
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const redirectRes = NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
    );
    return applySecurityHeaders(redirectRes);
  }

  // ── Thêm Security Headers vào tất cả response ────────────────
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!api|studio|_next/static|_next/image|images|favicon.ico).*)',
  ],
};
