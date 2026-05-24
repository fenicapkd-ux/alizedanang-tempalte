import { redis } from './redis';
import { NextResponse } from 'next/server';

interface RateLimitOptions {
  /** Số lượng request tối đa trong khoảng thời gian */
  limit: number;
  /** Khoảng thời gian tính bằng giây */
  windowSecs: number;
  /** Prefix cho Redis key, nên khác nhau giữa các API */
  prefix?: string;
}

/**
 * Kiểm tra rate limit bằng Sliding Window Counter.
 * 
 * @returns null nếu còn trong giới hạn, hoặc NextResponse 429 nếu bị chặn.
 */
export async function rateLimit(
  ip: string,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const { limit, windowSecs, prefix = 'rl' } = options;
  const key = `${prefix}:${ip}`;

  try {
    // Dùng INCR + EXPIRE để tạo Sliding Window Counter
    const current = await redis.incr(key);

    // Chỉ set expire khi lần đầu tiên (tránh reset window)
    if (current === 1) {
      await redis.expire(key, windowSecs);
    }

    if (current > limit) {
      const ttl = await redis.ttl(key);
      return NextResponse.json(
        {
          error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
          retryAfter: ttl > 0 ? ttl : windowSecs,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(ttl > 0 ? ttl : windowSecs),
          },
        }
      );
    }

    return null; // Chưa bị giới hạn
  } catch (err) {
    // Nếu Redis lỗi, cho phép request đi qua để tránh outage
    console.warn('[RateLimit] Redis error, bypassing rate limit:', err);
    return null;
  }
}

/**
 * Lấy IP từ request header (hỗ trợ Vercel, Nginx proxy).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
