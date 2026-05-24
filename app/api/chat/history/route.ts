import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/appwrite.admin';
import { Query } from 'node-appwrite';
import { rateLimit, getClientIp } from '../../../../lib/rateLimit';

/**
 * Lấy toàn bộ lịch sử chat bằng danh nghĩa Admin
 * Tránh việc phải setup phức tạp Quyền (Permissions) trên Appwrite Console
 */
export async function GET(request: Request) {
  // Rate limit: 20 requests / 30s per IP
  const ip = getClientIp(request);
  const rateLimitRes = await rateLimit(ip, { limit: 20, windowSecs: 30, prefix: 'rl:chat-history' });
  if (rateLimitRes) return rateLimitRes;

  try {
    const { databases } = createAdminClient();
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "chat_db";
    const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || "messages";

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.orderDesc("$createdAt"), // Lấy tin nhắn mới nhất
        Query.limit(1000) // Tối đa 1000 tin để test
      ]
    );

    // Xử lý nhóm data theo người dùng (Tạo danh sách các phòng chat)
    const messages = response.documents.reverse(); // Đảo lại theo thứ tự cũ đến mới

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("Admin Fetch History Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
