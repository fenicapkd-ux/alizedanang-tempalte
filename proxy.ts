import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// ============================================================
// PROXY (MIDDLEWARE) — Locale redirect + Chống cào + Rate limit
// Chạy tại Vercel Edge Network, trước khi request tới server
// ============================================================

// ── REDIS (Upstash) ──────────────────────────────────────────
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ── CẤU HÌNH RATE LIMIT ──────────────────────────────────────
const RATE_LIMITS = {
  api:   { limit: 60,  windowSecs: 60 }, // API: 60 req/phút
  heavy: { limit: 20,  windowSecs: 60 }, // Trang nặng: 20 req/phút
  page:  { limit: 120, windowSecs: 60 }, // Trang thường: 120 req/phút
};

// ── BOT / SCRAPER BỊ CHẶN ────────────────────────────────────
const BLOCKED_USER_AGENTS = [
  'python-requests', 'scrapy', 'curl/', 'wget/',
  'httpx', 'aiohttp', 'go-http-client',
  'java/', 'okhttp', 'axios/',
  'semrushbot', 'ahrefsbot', 'dotbot', 'mj12bot',
  'blexbot', 'seokicks', 'turnitinbot',
  'masscan', 'zgrab', 'sqlmap', 'nikto',
  'nmap', 'libwww-perl',
];

// ── TRANG NẶNG (giới hạn chặt hơn) ──────────────────────────
const HEAVY_PATHS = ['/map', '/apartments', '/properties', '/projects'];

// ── LOCALE ───────────────────────────────────────────────────
const locales = ['vi', 'en'];
const defaultLocale = 'vi';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1'
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Bỏ qua static assets ────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/studio') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // ── 1. CHẶN BOT / SCRAPER THEO USER-AGENT ────────────────────
  if (BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // ── 2. CHẶN USER-AGENT TRỐNG (script thô) ────────────────────
  if (!userAgent || userAgent.length < 8) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // ── 3. RATE LIMITING ─────────────────────────────────────────
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
      return new NextResponse(
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
    }
  } catch {
    // Redis lỗi → cho đi qua, không làm sập app
  }

  // ── 4. LOCALE REDIRECT (logic gốc giữ nguyên) ────────────────
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit ?? RATE_LIMITS.page.limit));
  return response;
}

export const config = {
  matcher: [
    '/((?!api|studio|_next/static|_next/image|images|favicon.ico).*)',
  ],
};
