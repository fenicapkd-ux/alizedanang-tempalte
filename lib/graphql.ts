import { redis } from './redis';

export const GRAPHQL_API_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://api-estate.vercel.app/graphql';

/**
 * Hàm gọi API GraphQL chung (Dành cho Server Component hoặc thư mục ServerActions)
 * Sử dụng native `fetch` của Next.js với tham số cấu hình caching
 */
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, any> = {},
  options: RequestInit = { next: { revalidate: 60 } }
): Promise<T> {
  const cacheKey = `graphql_cache:${JSON.stringify({ query, variables })}`;

  // Skip Redis trong build phase — Redis dùng no-store fetch gây DYNAMIC_SERVER_USAGE
  // khi Next.js cố prerender tĩnh các trang có revalidate/ISR
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  if (!isBuildPhase) {
    try {
      const cachedData = await redis.get<T>(cacheKey);
      if (cachedData) {
        console.log(`[GraphQL Cache] ⚡ Trả về dữ liệu từ Upstash Redis cache`);
        return cachedData;
      }
    } catch (err) {
      console.warn('[GraphQL Cache] Cảnh báo khi đọc từ Redis:', err);
    }
  }

  console.log(`[GraphQL Fetch] Đang gửi yêu cầu tới: ${GRAPHQL_API_URL}`);
  try {
    const response = await fetch(GRAPHQL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`GraphQL Fetch Error: ${response.statusText}`);
    }

    const { data, errors } = await response.json();
    if (errors && errors.length > 0) {
      console.warn('GraphQL Request Warnings:', JSON.stringify(errors));
      throw new Error(errors[0].message);
    }

    // Ghi vào Redis chỉ khi không trong build phase
    if (!isBuildPhase) {
      try {
        await redis.set(cacheKey, data, { ex: 60 });
        console.log(`[GraphQL Cache] ✅ Đã lưu dữ liệu vào Redis (TTL: 60s)`);
      } catch (err) {
        console.warn('[GraphQL Cache] Lỗi khi lưu vào Redis:', err);
      }
    }

    return data as T;
  } catch (error: any) {
    console.warn(`⚠️ [GraphQL] Mạng chưa sẵn sàng (${error?.message || 'Failed'}), chuyển sang chế độ Offline Fallback cho: ${GRAPHQL_API_URL}`);
    throw error;
  }
}

// ============== CÁC CÂU LỆNH TRUY VẤN MẪU (QUERIES) ============== //

export const GET_PROPERTIES_QUERY = `
  query GetProperties {
    properties {
      id
      transaction_type
      property_category
      is_new
      name
      project_id
      project_name
      price
      price_num
      location
      beds
      baths
      area
      area_num
      description
      img_url
      gallery
      legal_status
      furniture
      house_direction
      balcony_direction
      floors
      frontage
      entrance_width
      agent_name
      agent_phone
      agent_zalo
      agent_avatar
      video_url
      tour_3d_url
      lat
      lng
    }
  }
`;

export const GET_BLOGS_QUERY = `
  query GetBlogs {
    blogs {
      id
      slug
      title
      date
      description
      img_url
    }
  }
`;
