import { getProperties } from "./propertyService";
import { fetchGraphQL } from "./graphql";

export interface HomeData {
  featuredProperties: any[];
  featuredApartments: any[];
  shopProducts: any[];
  shopCategories: any[];
  dynamicProjects: any[];
  wpPosts: any[];
  financePosts: any[];
}

export async function getHomeData(locale: string): Promise<HomeData> {
  let featuredProperties: any[] = [];
  let featuredApartments: any[] = [];
  let shopProducts: any[] = [];
  let shopCategories: any[] = [];
  let dynamicProjects: any[] = [];
  let wpPosts: any[] = [];
  let financePosts: any[] = [];

  const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || 'https://atservice.vn/wp-json/wp/v2';
  const FINANCE_WP_API = process.env.NEXT_PUBLIC_FINANCE_WP_API_URL || 'https://atservice.com.vn/wp-json/wp/v2';

  // Chạy TẤT CẢ các truy vấn một cách song song để tiết kiệm thời gian (Parallel Fetching)
  const [
    recentPropertiesRes,
    medusaProductsRes,
    medusaCategoriesRes,
    graphqlProjectsRes,
    wpRes,
    financeRes
  ] = await Promise.allSettled([
    getProperties(locale),
    import('./medusa').then(m => m.getProducts({ limit: 20 })),
    import('./medusa').then(m => m.getProductCategories()),
    fetchGraphQL(`
      query {
        projects {
          id
          name
          slug
          hero_data
          location {
            name
          }
        }
      }
    `, {}, { next: { revalidate: 60 } }),
    fetch(`${WP_API}/posts?per_page=8&_embed`, { next: { revalidate: 3600 } }),
    fetch(`${FINANCE_WP_API}/posts?per_page=4&_embed`, { next: { revalidate: 3600 } })
  ]);

  // --- Xử lý kết quả Properties ---
  if (recentPropertiesRes.status === 'fulfilled') {
    const allProps = recentPropertiesRes.value;
    featuredProperties = allProps.slice(0, 8);
    featuredApartments = allProps.filter((p: any) => p.propertyCategory === 'apartments').slice(0, 8);
  }

  // --- Xử lý kết quả Medusa ---
  if (medusaProductsRes.status === 'fulfilled' && medusaProductsRes.value?.products) {
    shopProducts = medusaProductsRes.value.products;
  } else if (medusaProductsRes.status === 'rejected') {
    console.warn("Lỗi kéo dữ liệu Shop Products:", medusaProductsRes.reason);
  }

  if (medusaCategoriesRes.status === 'fulfilled' && medusaCategoriesRes.value?.product_categories) {
    shopCategories = medusaCategoriesRes.value.product_categories;
  } else if (medusaCategoriesRes.status === 'rejected') {
    console.warn("Lỗi kéo dữ liệu Shop Categories:", medusaCategoriesRes.reason);
  }

  // --- Map Categories to Products ---
  if (shopCategories.length > 0 && shopProducts.length > 0) {
    await Promise.all(shopCategories.map(async (cat) => {
      try {
        const { getProducts } = await import('./medusa');
        const cpRes = await getProducts({ category_id: [cat.id], limit: 20 });
        if (cpRes.products) {
          cpRes.products.forEach((cp: any) => {
            const p = shopProducts.find(prod => prod.id === cp.id);
            if (p) {
              if (!p.categories) p.categories = [];
              if (!p.categories.some((existing: any) => existing.id === cat.id)) {
                p.categories.push({ id: cat.id, name: cat.name });
              }
            }
          });
        }
      } catch (e) {}
    }));
  }

  // --- Xử lý kết quả GraphQL Projects ---
  if (graphqlProjectsRes.status === 'fulfilled') {
    const data: any = graphqlProjectsRes.value;
    if (data?.projects) dynamicProjects = data.projects;
  } else {
    console.warn("Lỗi kéo dữ liệu Project:", graphqlProjectsRes.reason);
  }

  // --- Xử lý kết quả WordPress News ---
  if (wpRes.status === 'fulfilled') {
    const wpResponse = wpRes.value;
    if (wpResponse.ok) {
      try {
        wpPosts = await wpResponse.json();
      } catch (e) {
        console.warn("Lỗi parse JSON WP News:", e);
      }
    }
  } else {
    console.warn("Lỗi fetch WP News:", wpRes.reason);
  }

  // --- Xử lý kết quả Finance News ---
  if (financeRes.status === 'fulfilled') {
    const response = financeRes.value;
    if (response.ok) {
      try {
        financePosts = await response.json();
      } catch (e) {
        console.warn("Lỗi parse JSON Finance News:", e);
      }
    }
  } else {
    console.warn("Lỗi fetch Finance News:", financeRes.reason);
  }

  return {
    featuredProperties,
    featuredApartments,
    shopProducts,
    shopCategories,
    dynamicProjects,
    wpPosts,
    financePosts
  };
}
