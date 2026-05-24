"use client";
/**
 * CloudflareTurnstile — Widget chống bot cho form
 * Dùng @marsidev/react-turnstile (wrapper chính thức của Cloudflare Turnstile)
 *
 * Cách dùng:
 *   <CloudflareTurnstile onVerify={(token) => setTurnstileToken(token)} />
 *
 * Sau đó gửi token lên server để verify tại /api/turnstile/verify
 */
import { Turnstile } from "@marsidev/react-turnstile";

interface CloudflareTurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
}

export default function CloudflareTurnstile({
  onVerify,
  onError,
  onExpire,
  theme = "dark",
  size = "normal",
}: CloudflareTurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    // Nếu chưa cấu hình siteKey → không render (không block form)
    return null;
  }

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onVerify}
      onError={onError}
      onExpire={onExpire}
      options={{
        theme,
        size,
        language: "vi",
      }}
      style={{ marginTop: "12px" }}
    />
  );
}
