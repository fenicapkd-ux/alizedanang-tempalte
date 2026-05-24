import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// ================================================================
// PROXY (MIDDLEWARE) — Bảo vệ tài nguyên Vercel tại Edge
// Thứ tự: Static → Malicious Path → Method → UA → Body
//         → SQLi/XSS Pattern → Rate Limit → Locale Redirect
// ================================================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ── CẤU HÌNH RATE LIMIT ─────────────────────────────────────────
const RATE_LIMITS = {
  api:   { limit: 60,  windowSecs: 60 },
  heavy: { limit: 20,  windowSecs: 60 },
  page:  { limit: 120, windowSecs: 60 },
};

// ── PATHS ĐỘC HẠI ────────────────────────────────────────────────
const MALICIOUS_PATHS = [
  '/wp-admin', '/wp-login', '/wp-content', '/wp-includes',
  '/xmlrpc.php', '/wp-json/v2/users',
  '/.env', '/.env.local', '/.env.production',
  '/.git', '/.gitignore', '/.github',
  '/config.php', '/configuration.php', '/config.yml',
  '/web.config', '/app.config',
  '/administrator', '/phpmyadmin', '/pma',
  '/cpanel', '/whm', '/plesk',
  '/shell', '/cmd', '/eval', '/upload.php',
  '/install.php', '/setup.php', '/info.php',
  '/package.json', '/package-lock.json', '/yarn.lock',
  '/node_modules',
  '/latest/meta-data', '/iam/security-credentials',
];

// ── PATTERN URL ĐỘC HẠI (SQLi, XSS, Path Traversal) ────────────
const MALICIOUS_URL_PATTERNS = [
  /(\.\.[\/\\]){2,}/,
  /<script[\s>]/i,
  /union\s+select/i,
  /select\s+.*\s+from/i,
  /insert\s+into/i,
  /drop\s+table/i,
  /;\s*(exec|execute|xp_|sp_)/i,
  /\beval\s*\(/i,
  /base64_decode\s*\(/i,
  /%3cscript/i,
  /javascript:/i,
  /on(load|error|click|mouse)\s*=/i,
];

// ── BOT / SCRAPER / SCANNER BỊ CHẶN ─────────────────────────────
const BLOCKED_USER_AGENTS = [
  'python-requests', 'scrapy', 'httpx', 'aiohttp', 'libwww-perl',
  'lwp-', 'go-http-client', 'java/', 'okhttp',
  'curl/', 'wget/', 'masscan', 'zgrab',
  'sqlmap', 'nikto', 'nmap', 'nuclei', 'dirbuster', 'gobuster',
  'wfuzz', 'ffuf', 'hydra',
  'semrushbot', 'ahrefsbot', 'dotbot', 'mj12bot',
  'blexbot', 'seokicks', 'turnitinbot', 'petalbot',
  'bytespider', 'claudebot', 'gptbot', 'ccbot',
];

// ── HTTP METHOD CHO PHÉP ─────────────────────────────────────────
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

// ── TRANG NẶNG ───────────────────────────────────────────────────
const HEAVY_PATHS = ['/map', '/apartments', '/properties', '/projects'];

// ── LOCALE ───────────────────────────────────────────────────────
const locales = ['vi', 'en'];
const defaultLocale = 'vi';

// ── SECURITY HEADERS ─────────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options':            'nosniff',
  'X-Frame-Options':                   'SAMEORIGIN',
  'X-XSS-Protection':                  '1; mode=block',
  'Referrer-Policy':                   'strict-origin-when-cross-origin',
  'Permissions-Policy':                'camera=(), microphone=(), geolocation=(self), payment=()',
  'Strict-Transport-Security':         'max-age=63072000; includeSubDomains; preload',
  'Cross-Origin-Resource-Policy':      'same-origin',
  'Cross-Origin-Opener-Policy':        'same-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
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

  // ── Bỏ qua static assets ─────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/studio') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const lowerPath = pathname.toLowerCase();

  // ── 1. CHẶN PATHS ĐỘC HẠI ────────────────────────────────────
  if (MALICIOUS_PATHS.some((p) => lowerPath.startsWith(p.toLowerCase()))) {
    return applySecurityHeaders(new NextResponse(null, { status: 404 }));
  }

  // ── 2. CHẶN URL CÓ PATTERN ĐỘC HẠI ──────────────────────────
  const fullUrl = decodeURIComponent(url);
  if (MALICIOUS_URL_PATTERNS.some((pattern) => pattern.test(fullUrl))) {
    return applySecurityHeaders(new NextResponse(null, { status: 400 }));
  }

  // ── 3. CHẶN HTTP METHOD KHÔNG HỢP LỆ ─────────────────────────
  if (!ALLOWED_METHODS.includes(request.method.toUpperCase())) {
    return new NextResponse(null, {
      status: 405,
      headers: { Allow: ALLOWED_METHODS.join(', ') },
    });
  }

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // ── 4. CHẶN USER-AGENT TRỐNG ─────────────────────────────────
  if (!userAgent || userAgent.length < 8) {
    return applySecurityHeaders(new NextResponse(null, { status: 403 }));
  }

  // ── 5. CHẶN BOT / SCANNER ────────────────────────────────────
  if (BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
    return applySecurityHeaders(new NextResponse(null, { status: 403 }));
  }

  // ── 6. CHẶN POST/PUT payload > 1MB ───────────────────────────
  if (request.method === 'POST' || request.method === 'PUT') {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 1_048_576) {
      return applySecurityHeaders(
        new NextResponse(
          JSON.stringify({ error: 'Payload quá lớn (tối đa 1MB)' }),
          { status: 413, headers: { 'Content-Type': 'application/json' } }
        )
      );
    }
  }

  // ── 7. RATE LIMITING ─────────────────────────────────────────
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
      return applySecurityHeaders(
        new NextResponse(
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
        )
      );
    }
  } catch {
    // Redis lỗi → cho đi qua
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

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!api|studio|_next/static|_next/image|images|favicon.ico).*)',
  ],
};
