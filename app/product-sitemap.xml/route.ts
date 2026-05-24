import { NextResponse } from 'next/server';
import { getProducts } from '../../lib/medusa';

export const dynamic = 'force-dynamic'; // Medusa không available lúc build

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://alizedanang.net";
  const locales = ['vi', 'en'];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  try {
    let offset = 0;
    const limit = 100;
    let hasMoreProducts = true;

    while (hasMoreProducts) {
      const medusaData = await getProducts({ limit, offset });
      if (medusaData && Array.isArray(medusaData.products) && medusaData.products.length > 0) {
        medusaData.products.forEach((product: any) => {
          const lastMod = new Date(product.updated_at || new Date()).toISOString();
          locales.forEach((locale) => {
            xml += `
  <url>
    <loc>${baseUrl}/${locale}/shop/${product.handle}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
          });
        });
        
        if (medusaData.products.length < limit) {
          hasMoreProducts = false;
        } else {
          offset += limit;
        }
      } else {
        hasMoreProducts = false;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch Products for sitemap", error);
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
    },
  });
}

