import { Client, Databases, Account, ID, Storage } from 'appwrite';

/**
 * CẤU HÌNH APPWRITE CLIENT (Dành cho Trình Duyệt / Browser Session)
 * 
 * NEXT_PUBLIC_APPWRITE_ENDPOINT: Bạn đã cấp "https://fra.cloud.appwrite.io/v1"
 * NEXT_PUBLIC_APPWRITE_PROJECT_ID: Điền ID của Project tương ứng với API Key.
 */

export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "REPLACE_WITH_YOUR_PROJECT_ID";
export const APPWRITE_DATABASE_ID = "chat_db";
export const APPWRITE_COLLECTION_ID = "messages";

export const client = new Client();

// Khởi tạo SDK Client (Sẽ chạy ở Browser)
if (typeof window !== "undefined") {
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
} else {
  // Tránh lỗi khi chạy SSR
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Helper Setup Database (Nếu chưa có, API Server của Appwrite sẽ tạo)
export const setupAnonymousSession = async () => {
  try {
    const session = await account.get();
    return session;
  } catch (err: any) {
    if (err.code === 401) {
      // 401 Unauthorized -> Người dùng chưa có session -> Tạo Anonymous
      console.log('Tạo phiên ẩn danh mới (Browser Session)...');
      return await account.createAnonymousSession();
    }
    throw err;
  }
};
