import { Client as NodeClient, Databases as NodeDatabases, Users as NodeUsers } from 'node-appwrite';

/**
 * CẤU HÌNH APPWRITE ADMIN SDK (Dành cho Server-side API Routes / Server Actions)
 * Sử dụng API Key siêu quyền lực để Server tương tác vượt quyền (Bypass permission).
 */

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";

// CHÚ Ý: Đây là Server Key — TUYỆT ĐỐI không dùng NEXT_PUBLIC_ prefix
// Phải được khai báo trong .env.local hoặc Vercel Environment Variables
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
if (!APPWRITE_API_KEY) {
  throw new Error(
    '[Appwrite Admin] Thiếu biến môi trường APPWRITE_API_KEY. ' +
    'Thêm vào .env.local hoặc Vercel Dashboard (không dùng NEXT_PUBLIC_ prefix).'
  );
}

export function createAdminClient() {
  const client = new NodeClient()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY!);

  return {
    get users() {
      return new NodeUsers(client);
    },
    get databases() {
      return new NodeDatabases(client);
    }
  };
}
