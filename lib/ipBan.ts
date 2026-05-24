/**
 * IP BAN SYSTEM — Tự động chặn IP kẻ tấn công
 * Dùng Upstash Redis để lưu trạng thái ban/strike
 *
 * Cơ chế:
 *   - Mỗi hành vi xâm nhập → cộng "strike" cho IP đó
 *   - Đủ ngưỡng strike → tự động ban IP trong khoảng thời gian nhất định
 *   - IP bị ban → tất cả request bị chặn ngay tại Edge
 */
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ── CẤU HÌNH ─────────────────────────────────────────────────────
const BAN_PREFIX    = 'ipban:';    // Key lưu trạng thái bị ban
const STRIKE_PREFIX = 'strike:';   // Key đếm số lần vi phạm

// Số giây ban tương ứng với mức độ vi phạm
export const BAN_DURATION = {
  SHORT:    60 * 60,        // 1 giờ
  MEDIUM:   60 * 60 * 6,   // 6 giờ
  LONG:     60 * 60 * 24,  // 24 giờ
  PERM:     60 * 60 * 24 * 30, // 30 ngày (thực tế = permanent)
};

// Số strike trước khi tự động ban
const STRIKE_THRESHOLD_SHORT  = 5;  // 5 strikes → ban 1 giờ
const STRIKE_THRESHOLD_MEDIUM = 10; // 10 strikes → ban 6 giờ
const STRIKE_THRESHOLD_LONG   = 20; // 20 strikes → ban 24 giờ

// Thời gian sống của strike counter (reset sau 1 giờ nếu không vi phạm tiếp)
const STRIKE_WINDOW_SECS = 3600;

// ── KIỂM TRA IP BỊ BAN ───────────────────────────────────────────
export async function isIpBanned(ip: string): Promise<{ banned: boolean; reason?: string; ttl?: number }> {
  try {
    const banKey = `${BAN_PREFIX}${ip}`;
    const reason = await redis.get<string>(banKey);
    if (reason) {
      const ttl = await redis.ttl(banKey);
      return { banned: true, reason, ttl };
    }
    return { banned: false };
  } catch {
    return { banned: false }; // Redis lỗi → cho qua, không làm sập app
  }
}

// ── GHI NHẬN VI PHẠM (STRIKE) ────────────────────────────────────
export async function recordStrike(
  ip: string,
  reason: string,
  autobanDurationSecs?: number
): Promise<{ strikes: number; banned: boolean }> {
  try {
    const strikeKey = `${STRIKE_PREFIX}${ip}`;

    // Nếu truyền vào autobanDurationSecs → ban ngay lập tức (không cần đợi ngưỡng)
    if (autobanDurationSecs) {
      await banIp(ip, reason, autobanDurationSecs);
      return { strikes: 1, banned: true };
    }

    // Cộng strike counter
    const strikes = await redis.incr(strikeKey);
    if (strikes === 1) {
      await redis.expire(strikeKey, STRIKE_WINDOW_SECS);
    }

    // Kiểm tra ngưỡng và tự động ban
    if (strikes >= STRIKE_THRESHOLD_LONG) {
      await banIp(ip, reason, BAN_DURATION.LONG);
      return { strikes, banned: true };
    } else if (strikes >= STRIKE_THRESHOLD_MEDIUM) {
      await banIp(ip, reason, BAN_DURATION.MEDIUM);
      return { strikes, banned: true };
    } else if (strikes >= STRIKE_THRESHOLD_SHORT) {
      await banIp(ip, reason, BAN_DURATION.SHORT);
      return { strikes, banned: true };
    }

    return { strikes, banned: false };
  } catch {
    return { strikes: 0, banned: false };
  }
}

// ── BAN IP THỦ CÔNG / TỰ ĐỘNG ────────────────────────────────────
export async function banIp(ip: string, reason: string, durationSecs: number): Promise<void> {
  try {
    const banKey = `${BAN_PREFIX}${ip}`;
    await redis.set(banKey, reason, { ex: durationSecs });
    // Reset strike counter sau khi ban (để tránh double-ban sau khi hết ban)
    await redis.del(`${STRIKE_PREFIX}${ip}`);
    console.warn(`[IPBan] Banned ${ip} for ${durationSecs}s — Reason: ${reason}`);
  } catch (err) {
    console.error('[IPBan] Redis error while banning IP:', err);
  }
}

// ── UNBAN IP (dùng trong admin nếu cần) ──────────────────────────
export async function unbanIp(ip: string): Promise<void> {
  try {
    await redis.del(`${BAN_PREFIX}${ip}`);
    await redis.del(`${STRIKE_PREFIX}${ip}`);
  } catch {}
}

// ── LẤY DANH SÁCH IP BỊ BAN (để admin xem) ──────────────────────
// Lưu ý: Upstash Redis Free tier không hỗ trợ SCAN, cần dùng SET riêng để track
export async function getStrikeCount(ip: string): Promise<number> {
  try {
    const count = await redis.get<number>(`${STRIKE_PREFIX}${ip}`);
    return count || 0;
  } catch {
    return 0;
  }
}
