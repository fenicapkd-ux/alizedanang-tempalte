import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24 hours ISR

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://alizedanang.net";
  const locales = ['vi', 'en'];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  try {
    const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || 'https://atservice.vn/wp-json/wp/v2';
    let catPage = 1;
    let hasMoreCats = true;

    while (hasMoreCats) {
      const res = await fetch(`${WP_API}/categories?hide_empty=true&per_page=100&page=${catPage}`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
        const categories = await res.json();
        if (Array.isArray(categories)) {
          categories.forEach((cat) => {
            locales.forEach((locale) => {
              xml += `
  <url>
    <loc>${baseUrl}/${locale}/blog/category/${cat.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
            });
          });
        }
        if (catPage >= totalPages) hasMoreCats = false;
        else catPage++;
      } else {
        hasMoreCats = false;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch Categories for sitemap", error);
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
    },
  });
}

