/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.1.14'],
  experimental: {
  },

  // ── ENV VARS: hardcode tại build time — Vercel không cần set thêm ──
  env: {
    NEXT_PUBLIC_WP_API_URL: process.env.NEXT_PUBLIC_WP_API_URL || 'https://atservice.vn/wp-json/wp/v2',
    NEXT_PUBLIC_FINANCE_WP_API_URL: process.env.NEXT_PUBLIC_FINANCE_WP_API_URL || 'https://atservice.com.vn/wp-json/wp/v2',
  },

  // ── SECURITY HEADERS + CLOUDFLARE CACHE RULES ───────────────────
  async headers() {
    return [
      // ── 1. Security headers cho toàn bộ routes ────────────────
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',             value: 'nosniff' },
          { key: 'X-Frame-Options',                    value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',                   value: '1; mode=block' },
          { key: 'Referrer-Policy',                    value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',                 value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
          { key: 'Strict-Transport-Security',          value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Resource-Policy',       value: 'same-origin' },
          { key: 'Cross-Origin-Opener-Policy',         value: 'same-origin' },
          { key: 'X-Permitted-Cross-Domain-Policies',  value: 'none' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://static.cloudflareinsights.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.mapbox.com https://*.upstash.io wss://*.appwrite.io https://atservice.vn https://*.atservice.vn https://atservice.com.vn https://*.atservice.com.vn https:",
              "frame-src 'self' https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },

      // ── 3. Ảnh /images — Cloudflare cache 7 ngày ────────────────
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control',     value: 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400' },
          { key: 'CDN-Cache-Control', value: 'max-age=604800' },
        ],
      },

      // ── 4. Trang blog — Cloudflare cache 1 giờ + Early Hints ────
      {
        source: '/:locale(vi|en)/blog(.*)',
        headers: [
          { key: 'Cache-Control',     value: 'public, s-maxage=3600, stale-while-revalidate=1800' },
          { key: 'CDN-Cache-Control', value: 'max-age=3600' },
          { key: 'Link',              value: '</images/can-ho-view-bien-my-khe-alize.webp>; rel=preload; as=image' },
        ],
      },

      // ── 5. Trang finance — Cloudflare cache 1 giờ ───────────────
      {
        source: '/:locale(vi|en)/finance(.*)',
        headers: [
          { key: 'Cache-Control',     value: 'public, s-maxage=3600, stale-while-revalidate=1800' },
          { key: 'CDN-Cache-Control', value: 'max-age=3600' },
        ],
      },

      // ── 6. Trang chủ — Cloudflare cache 60 giây + Early Hints ───
      {
        source: '/:locale(vi|en)',
        headers: [
          { key: 'Cache-Control',     value: 'public, s-maxage=60, stale-while-revalidate=30' },
          { key: 'CDN-Cache-Control', value: 'max-age=60' },
          { key: 'Link',              value: '</images/can-ho-view-bien-my-khe-alize.webp>; rel=preload; as=image' },
        ],
      },

      // ── 7. Sitemap XML — Cloudflare cache 24 giờ ────────────────
      {
        source: '/(.*sitemap.*|robots.txt)',
        headers: [
          { key: 'Cache-Control',     value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600' },
          { key: 'CDN-Cache-Control', value: 'max-age=86400' },
        ],
      },

      // ── 8. API routes — KHÔNG cache tại Cloudflare ──────────────
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control',     value: 'no-store, no-cache, must-revalidate' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.atservice.vn',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.atservice.com.vn',
        port: '',
        pathname: '/**',
      },
    ],
    // Giới hạn kích thước ảnh để tránh bị lạm dụng image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 3600,
  },

  async rewrites() {
    return [
      {
        source: '/api/medusa/:path*',
        destination: `${process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"}/:path*`
      },
      {
        source: '/post-sitemap-:id.xml',
        destination: '/post-sitemap/:id'
      },
      {
        source: '/finance-sitemap-:id.xml',
        destination: '/finance-sitemap/:id'
      }
    ];
  },
};

export default nextConfig;
