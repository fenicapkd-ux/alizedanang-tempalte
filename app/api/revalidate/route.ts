import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '../../../lib/rateLimit';

/**
 * API xóa cache Next.js — Yêu cầu xác thực bằng REVALIDATE_SECRET
 * Sử dụng: GET /api/revalidate?path=/vi/blog&secret=<REVALIDATE_SECRET>
 *          POST /api/revalidate với header Authorization: Bearer <REVALIDATE_SECRET>
 */

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

function isAuthorized(request: NextRequest): boolean {
  if (!REVALIDATE_SECRET) {
    // Nếu chưa cấu hình secret → chặn hoàn toàn để tránh bị khai thác
    return false;
  }

  // Kiểm tra query param: ?secret=xxx
  const secretParam = request.nextUrl.searchParams.get('secret');
  if (secretParam && secretParam === REVALIDATE_SECRET) return true;

  // Kiểm tra Authorization header: Bearer xxx
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader === `Bearer ${REVALIDATE_SECRET}`) return true;

  return false;
}

export async function GET(request: NextRequest) {
  // Rate limit: chỉ cho 10 request/phút per IP
  const ip = getClientIp(request);
  const limited = await rateLimit(ip, { limit: 10, windowSecs: 60, prefix: 'rl:revalidate' });
  if (limited) return limited;

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get('path');

  if (path) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now(), type: 'path', path });
  }

  // Mặc định xóa cache trang chủ
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true, now: Date.now(), message: 'Cleared all routes' });
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 request/phút per IP
  const ip = getClientIp(request);
  const limited = await rateLimit(ip, { limit: 10, windowSecs: 60, prefix: 'rl:revalidate' });
  if (limited) return limited;

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true, now: Date.now(), message: 'Cache cleared via POST' });
}
