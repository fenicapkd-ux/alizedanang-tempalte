import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24 hours ISR

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://alizedanang.net";

  let blogTotalPages = 1;
  let financeTotalPages = 1;

  try {
    const BLOG_API = process.env.NEXT_PUBLIC_WP_API_URL || 'https://atservice.vn/wp-json/wp/v2';
    const res = await fetch(`${BLOG_API}/posts?per_page=100&page=1`, { next: { revalidate: 3600 } });
    if (res.ok) {
      blogTotalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
    }
  } catch (error) {
    console.warn("Failed to fetch Blog total pages for sitemap index", error);
  }

  try {
    const FINANCE_API = process.env.NEXT_PUBLIC_FINANCE_WP_API_URL || 'https://atservice.com.vn/wp-json/wp/v2';
    const res = await fetch(`${FINANCE_API}/posts?per_page=100&page=1`, { next: { revalidate: 3600 } });
    if (res.ok) {
      financeTotalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
    }
  } catch (error) {
    console.warn("Failed to fetch Finance total pages for sitemap index", error);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const staticSitemaps = ['page-sitemap.xml', 'category-sitemap.xml', 'product-sitemap.xml', 'property-sitemap.xml'];
  for (const sm of staticSitemaps) {
    xml += `
  <sitemap>
    <loc>${baseUrl}/${sm}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
  }

  // Dynamic Blog Sitemaps
  for (let i = 1; i <= Math.max(1, blogTotalPages); i++) {
    xml += `
  <sitemap>
    <loc>${baseUrl}/post-sitemap-${i}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
  }

  // Dynamic Finance Sitemaps
  for (let i = 1; i <= Math.max(1, financeTotalPages); i++) {
    xml += `
  <sitemap>
    <loc>${baseUrl}/finance-sitemap-${i}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
  }

  xml += `
</sitemapindex>
<!-- XML Sitemap generated similarly to Yoast SEO -->
`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
    },
  });
}

