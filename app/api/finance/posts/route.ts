import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '../../../../lib/rateLimit';

export async function GET(request: Request) {
  // Rate limit: 30 requests / 60s per IP
  const ip = getClientIp(request);
  const rateLimitRes = await rateLimit(ip, { limit: 30, windowSecs: 60, prefix: 'rl:finance-posts' });
  if (rateLimitRes) return rateLimitRes;

  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const per_page = searchParams.get('per_page') || '10';
  const categoryId = searchParams.get('category');
  
  const WP_API = process.env.NEXT_PUBLIC_FINANCE_WP_API_URL || 'https://atservice.com.vn/wp-json/wp/v2';

  try {
    let url = `${WP_API}/posts?_embed=1&per_page=${per_page}&page=${page}`;
    if (categoryId) {
      url += `&categories=${categoryId}`;
    }

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch WP posts' }, { status: res.status });
    }

    const totalPages = res.headers.get('x-wp-totalpages') || '1';
    const posts = await res.json();

    return NextResponse.json({
      posts,
      totalPages: parseInt(totalPages, 10),
      currentPage: parseInt(page, 10)
    });
  } catch (error) {
    console.error("API Error fetching finance posts:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
