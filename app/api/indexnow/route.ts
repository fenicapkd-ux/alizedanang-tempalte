import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '../../../lib/rateLimit';

/**
 * API submit URL lên IndexNow — Yêu cầu xác thực + chỉ accept URL của chính domain
 * Sử dụng: GET /api/indexnow?secret=<INDEXNOW_SECRET>&url=https://alizedanang.net/...
 */

const INDEXNOW_SECRET = process.env.INDEXNOW_SECRET;
const ALLOWED_DOMAIN = 'alizedanang.net';

function isAuthorized(request: Request): boolean {
  if (!INDEXNOW_SECRET) return false;

  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get('secret');
  if (secretParam === INDEXNOW_SECRET) return true;

  const authHeader = request.headers.get('authorization') || '';
  if (authHeader === `Bearer ${INDEXNOW_SECRET}`) return true;

  return false;
}

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Chỉ cho phép https + đúng domain — chống SSRF
    return parsed.protocol === 'https:' && (
      parsed.hostname === ALLOWED_DOMAIN ||
      parsed.hostname.endsWith(`.${ALLOWED_DOMAIN}`)
    );
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  // Rate limit: 10 request/phút per IP
  const ip = getClientIp(request);
  const limited = await rateLimit(ip, { limit: 10, windowSecs: 60, prefix: 'rl:indexnow' });
  if (limited) return limited;

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get('url');

  const host = ALLOWED_DOMAIN;
  const key = 'alize-indexnow-key';
  const keyLocation = `https://${ALLOWED_DOMAIN}/alize-indexnow-key.txt`;

  // Nếu có url param, validate trước khi dùng (chống SSRF)
  let urlList: string[];
  if (urlParam) {
    if (!isAllowedUrl(urlParam)) {
      return NextResponse.json(
        { error: 'URL không hợp lệ — chỉ chấp nhận URL của alizedanang.net' },
        { status: 400 }
      );
    }
    urlList = [urlParam];
  } else {
    urlList = [
      `https://${ALLOWED_DOMAIN}/vi/blog`,
      `https://${ALLOWED_DOMAIN}/vi/shop`,
      `https://${ALLOWED_DOMAIN}/vi/finance`,
    ];
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation, urlList }),
    });

    if (response.ok || response.status === 202) {
      return NextResponse.json({ success: true, message: 'Submitted to IndexNow', urlList });
    }

    const errorText = await response.text();
    return NextResponse.json(
      { success: false, message: 'IndexNow submission failed', status: response.status, errorText },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
