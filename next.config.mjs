/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.1.14'],
  experimental: {
  },

  // ── SECURITY HEADERS (áp dụng cho tất cả response từ server) ──
  // Bổ sung thêm một tầng headers cố định ở server-side
  async headers() {
    return [
      {
        // Áp dụng cho tất cả các routes
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
          // HSTS: buộc HTTPS trong 2 năm
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // CSP cơ bản: chặn inline scripts ngoài whitelist
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.mapbox.com https://*.upstash.io wss://*.appwrite.io https:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        // Cache cho ảnh trong /images
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600' },
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
