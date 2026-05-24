import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/appwrite.admin';
import { ID } from 'node-appwrite';
import { rateLimit, getClientIp } from '../../../../lib/rateLimit';

/**
 * API để Admin gửi tin nhắn trả lời Khách
 */
export async function POST(req: Request) {
  // Rate limit: 30 requests / 60s per IP
  const ip = getClientIp(req);
  const rateLimitRes = await rateLimit(ip, { limit: 30, windowSecs: 60, prefix: 'rl:admin-send' });
  if (rateLimitRes) return rateLimitRes;

  try {
    const payload = await req.json();
    const { content, targetUserId } = payload; // targetUserId chính là senderId của khách để khách biết tin này thuộc về phòng chat của mình

    if (!content || !targetUserId) {
      return NextResponse.json({ error: "Missing content or targetUserId" }, { status: 400 });
    }

    const { databases } = createAdminClient();
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "chat_db";
    const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || "messages";

    // Tạo Document
    const newDoc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        content: content,
        senderId: targetUserId, // Gắn senderId là ID của khách để luồng real-time bên client của khách dễ lọc tin nhắn thuộc phiên của mình
        senderType: 'agent' // Đánh dấu là Admin (Tư vấn viên) trả lời
      }
    );

    return NextResponse.json({ success: true, document: newDoc });

  } catch (error: any) {
    console.error("Admin Send Reply Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
