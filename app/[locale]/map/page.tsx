import React from "react";
import PortalHeader from "../../../components/PortalHeader";
import { getDictionary } from "../../../dictionaries";
import { Metadata } from "next";
import MasterMap from "../../../components/MasterMap";
import { fetchGraphQL } from "../../../lib/graphql";

export const revalidate = 300; // 5 phút — dữ liệu map không thay đổi thường xuyên

export const metadata: Metadata = {
  title: "Bản Đồ Bất Động Sản - G-Estate",
  description: "Trải nghiệm khám phá các dự án và căn hộ cao cấp qua Bản Đồ Tương Tác Ecosystem."
};

export default async function EcosystemMapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  // LẤY TOÀN BỘ DỮ LIỆU TỪ GRAPHQL ĐỂ VẼ BẢN ĐỒ
  let projects = [];
  let properties = [];

  const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql';

  try {
    const data: any = await fetchGraphQL(`
      query {
        projects {
          id
          name
          hero_data
          lat
          lng
          location {
            name
          }
        }
        properties {
          id
          name
          price
          img_url
          lat
          lng
        }
      }
    `);

    if (data) {
      projects = data.projects || [];
      properties = (data.properties || []).map((p: any) => ({
        ...p,
        coordinates: {
          lat: p.lat || 16.0544,
          lng: p.lng || 108.2022
        }
      }));
    }
  } catch (error) {
    console.warn("Lỗi kéo dữ liệu Ecosystem Map:", error);
  }

  return (
    <div className="relative w-full h-screen bg-[#070A10] text-pearl-white flex flex-col overflow-hidden">
      {/* Absolute Header with Transparent Background */}
      <div className="absolute top-0 left-0 w-full z-10 pointer-events-auto">
        <PortalHeader nav={dict.portal.nav} locale={locale} />
      </div>

      <div className="flex-1 w-full h-full">
        <MasterMap projects={projects} properties={properties} locale={locale} />
      </div>


    </div>
  );
}
