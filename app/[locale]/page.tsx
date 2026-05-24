import React from "react";
import PortalHeader from "../../components/PortalHeader";
import PortalFooter from "../../components/PortalFooter";
import { getDictionary } from "../../dictionaries";
import { Metadata } from "next";

import HomeHero from "../../components/home/HomeHero";
import HomeFeaturedApartments from "../../components/home/HomeFeaturedApartments";
import HomeFeaturedProjects from "../../components/home/HomeFeaturedProjects";
import HomeLocations from "../../components/home/HomeLocations";
import HomeLatestProperties from "../../components/home/HomeLatestProperties";
import HomeProductsCarousel from "../../components/home/HomeProductsCarousel";
import HomeCategoryProducts from "../../components/home/HomeCategoryProducts";
import HomeTools from "../../components/home/HomeTools";
import HomeNews from "../../components/home/HomeNews";
import HomeFinance from "../../components/home/HomeFinance";

import { getHomeData } from "../../lib/homeService";

// force-dynamic: home page gọi Medusa + GraphQL, không prerender được khi build
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const portalSeo = dict.portal.seo;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://alizedanang.net";

  return {
    title: portalSeo.title,
    description: portalSeo.description,
    keywords: portalSeo.keywords,
    openGraph: {
      title: portalSeo.title,
      description: portalSeo.description,
      images: [{ url: portalSeo.ogImage }],
      url: `${baseUrl}/${locale}`,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
    }
  };
}

export default async function PortalHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const data = dict.portal;

  // Lấy dữ liệu thông qua tầng Service mới tạo theo chuẩn Clean Architecture
  const {
    featuredProperties,
    featuredApartments,
    shopProducts,
    shopCategories,
    dynamicProjects,
    wpPosts,
    financePosts
  } = await getHomeData(locale);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#070A10] text-pearl-white flex flex-col">
      <PortalHeader nav={data.nav} locale={locale} />
      
      <HomeHero data={data.hero} locale={locale} />
      
      <HomeFeaturedApartments featuredApartments={featuredApartments} locale={locale} />
      
      <HomeFeaturedProjects dynamicProjects={dynamicProjects} data={data.featuredProjects} locale={locale} />
      
      <HomeLocations data={data.locationsByCity} locale={locale} />
      
      <HomeLatestProperties featuredProperties={featuredProperties} locale={locale} />
      
      <HomeProductsCarousel shopProducts={shopProducts.slice(0, 8)} locale={locale} />
      
      <HomeCategoryProducts categories={shopCategories} products={shopProducts} locale={locale} />

      <HomeNews wpPosts={wpPosts} data={data.news} locale={locale} />
      
      <HomeFinance financePosts={financePosts} data={data.financeNews} locale={locale} />

      <HomeTools data={data.tools} locale={locale} />

      <PortalFooter footer={data.footer} locale={locale} />
    </div>
  );
}
