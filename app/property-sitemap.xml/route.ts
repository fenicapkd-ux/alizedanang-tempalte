import { NextResponse } from 'next/server';
import { getProperties } from '../../lib/propertyService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://alizedanang.net";
  const locales = ['vi', 'en'];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  try {
    const properties = await getProperties('vi'); 
    const uniqueProjectIds = new Set<string>();

    const now = new Date().toISOString();

    if (Array.isArray(properties) && properties.length > 0) {
      properties.forEach((prop) => {
        if (prop.projectId) uniqueProjectIds.add(prop.projectId);
        locales.forEach((locale) => {
          xml += `
  <url>
    <loc>${baseUrl}/${locale}/apartments/${prop.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
      });
    }

    // Projects
    const projectSubRoutes = ['', '/gallery', '/architecture', '/amenities', '/floorplans', '/location', '/services', '/values', '/contact'];
    uniqueProjectIds.forEach((projectId) => {
      if (projectId === 'alize') return; 
      
      projectSubRoutes.forEach(subRoute => {
        locales.forEach((locale) => {
          xml += `
  <url>
    <loc>${baseUrl}/${locale}/projects/${projectId}${subRoute}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${subRoute === '' ? '0.9' : '0.7'}</priority>
  </url>`;
        });
      });
    });

  } catch (error) {
    console.warn("Failed to fetch Properties for sitemap", error);
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
    },
  });
}

