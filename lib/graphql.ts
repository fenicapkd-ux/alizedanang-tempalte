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

// ── PROJECTS QUERIES ───────────────────────────────────────────────────

/** Dùng cho danh sách trang /projects và trang chủ HomeFeaturedProjects */
export const GET_PROJECTS_QUERY = `
  query GetProjects {
    projects {
      id slug name name_en brand_name tagline
      status type segment
      price_from price_to price_display price_per_m2
      developer developer_logo
      total_floors total_units total_area_m2
      certificate handover_date
      thumbnail_img thumbnail_video cover_image
      is_published is_featured is_new_badge sort_order
      landing_page_url landing_url_active
      location { id slug name name_en lat lng }
      address district city lat lng
    }
  }
`;

/** Dùng cho trang chủ — chỉ lấy featured projects */
export const GET_PROJECTS_FEATURED_QUERY = `
  query GetFeaturedProjects {
    projects {
      id slug name name_en brand_name tagline status type
      price_display thumbnail_img cover_image
      is_featured is_new_badge
      landing_page_url landing_url_active
      location { name }
    }
  }
`;

/** Dùng cho trang landing page dự án — đầy đủ tất cả sections và relations */
export const GET_PROJECT_BY_SLUG_QUERY = `
  query GetProject($slug: String!) {
    project(slug: $slug) {
      id slug name name_en brand_name tagline tagline_en
      status type segment
      price_from price_to price_display price_per_m2 price_unit
      address street ward district city lat lng
      developer developer_logo developer_website designer interior_designer
      constructor_company management_company distributor
      total_area_m2 build_area_m2 park_area_m2 build_density_pct
      total_towers total_floors total_basement total_units
      total_shophouses total_penthouses parking_capacity
      certificate ownership_type license_no
      start_date completion_date handover_date
      thumbnail_img thumbnail_video cover_image
      is_published is_featured is_new_badge view_count
      landing_page_url landing_url_active

      hero_data
      overview_data
      values_data
      location_data
      architecture_data
      amenities_header
      services_header
      floorplans_header
      gallery_header
      contact_data
      seo_data

      location { id slug name name_en lat lng }

      amenities {
        id category_tag category_tag_en title title_en
        description description_en image_url icon_name highlight_stat sort_order
      }

      floorplans {
        id tab_id tab_name space_name space_name_en
        area_m2 area_display beds baths living_rooms floors balcony balcony_area_m2
        price_from price_display price_per_m2 status availability
        description description_en
        spec_left_label spec_left_value spec_right_label spec_right_value
        image_url image_3d_url image_exterior_url tour_3d_url sort_order
      }

      services {
        id icon_type icon_url title title_en description description_en sort_order
      }

      gallery_categories {
        id tag tag_en title title_en description description_en sort_order
        images {
          id image_url thumbnail_url webp_url alt_text caption is_cover sort_order
        }
      }

      media {
        id type title title_en url embed_url thumbnail_url duration_seconds is_featured sort_order
      }
    }
  }
`;

