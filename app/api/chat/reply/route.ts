import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/appwrite.admin';
import { ID } from 'node-appwrite';
import { rateLimit, getClientIp } from '../../../../lib/rateLimit';

export async function POST(req: Request) {
  // Rate limit: 10 requests / 60s per IP (chống spam chat)
  const ip = getClientIp(req);
  const rateLimitRes = await rateLimit(ip, { limit: 10, windowSecs: 60, prefix: 'rl:chat-reply' });
  if (rateLimitRes) return rateLimitRes;

  try {
    const payload = await req.json();
    const { content, senderId, senderType } = payload;

    if (senderType === 'agent') {
      return NextResponse.json({ success: true, message: 'Ignore if it is already agent' });
    }

    const { databases } = createAdminClient();
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "chat_db";
    const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || "messages";

    // Auto-reply logic basic
    let replyContent = "Chào bạn! Đây là trợ lý ảo G-Estate. ";
    const userMsg = content.toLowerCase();

    if (userMsg.includes('chào') || userMsg.includes('hi')) {
       replyContent += "Tôi có thể hỗ trợ gì cho bạn hôm nay?";
    } else if (userMsg.includes('dự án') || userMsg.includes('project')) {
       replyContent = "Dự án bạn đang quan tâm thuộc khu vực nào ạ? Hiện tại ALIZE Residence đang mở bán với giá tốt.";
    } else {
       replyContent = "Cảm ơn bạn đã nhắn tin. Chuyên viên của chúng tôi sẽ liên hệ lại với bạn trong ít phút do hiện tại đường dây đang bận. Gọi hotline: 0988.xxx.xxx nếu cần gấp.";
    }

    // Giả lập Agent đang gõ chữ 1.5s
    await new Promise(res => setTimeout(res, 1500));

    await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        content: replyContent,
        senderId: 'SYSTEM_AGENT',
        senderType: 'agent'
      }
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Auto Reply Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
