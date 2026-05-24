import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24 hours ISR

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://alizedanang.net";
  const locales = ['vi', 'en'];
  
  const staticRoutes = [
    '', '/alize', '/alize/gallery', '/alize/architecture', '/alize/amenities', 
    '/alize/floorplans', '/alize/location', '/alize/services', '/alize/values', 
    '/alize/contact', '/properties', '/blog', '/shop', '/account', '/checkout', '/post-listing', '/tools', '/map', '/projects'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const now = new Date().toISOString();

  staticRoutes.forEach((route) => {
    locales.forEach((locale) => {
      xml += `
  <url>
    <loc>${baseUrl}/${locale}${route}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });
  });

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
    },
  });
}

