import { NextRequest, NextResponse } from 'next/server';

/**
 * API xác thực Cloudflare Turnstile token từ client
 * POST /api/turnstile/verify  { token: string }
 *
 * Dùng trong server-side validation khi submit form có Turnstile
 */

const CF_SECRET_KEY = process.env.CF_TURNSTILE_SECRET_KEY;

export async function POST(request: NextRequest) {
  if (!CF_SECRET_KEY) {
    // Nếu chưa cấu hình → cho qua (không block)
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    const body = await request.json();
    const token = body?.token as string | undefined;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    // Lấy IP người dùng để gửi kèm (tăng độ chính xác verify)
    const ip =
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      undefined;

    // Gọi Cloudflare siteverify API
    const formData = new URLSearchParams();
    formData.append('secret', CF_SECRET_KEY);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);

    const cfResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      }
    );

    const result = await cfResponse.json();

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Xác minh thất bại. Vui lòng thử lại.', codes: result['error-codes'] },
      { status: 403 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
