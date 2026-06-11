import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloorPlans from "@/components/FloorPlans";
import { getDictionary } from "@/dictionaries";
import { fetchGraphQL } from "@/lib/graphql";
import { Metadata } from "next";

export const revalidate = 300;

const FP_QUERY = `
  query GetProjectFloorplans($slug: String!) {
    project(slug: $slug) {
      name floorplans_header
      floorplans {
        id tab_id tab_name space_name space_name_en
        area_m2 area_display beds baths balcony balcony_area_m2
        price_from price_display price_per_m2 status availability
        description description_en
        spec_left_label spec_left_value spec_right_label spec_right_value
        image_url image_3d_url tour_3d_url sort_order
      }
    }
  }
`;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; projectSlug: string }> }): Promise<Metadata> {
  const { locale, projectSlug } = await params;
  try {
    const data: any = await fetchGraphQL(FP_QUERY, { slug: projectSlug }, { next: { revalidate: 300 } });
    const p = data?.project;
    return {
      title: `Mặt Bằng Căn Hộ — ${p?.name || "ALIZE"} | Bản Vẽ Độc Bản`,
      description: "Khám phá các loại căn hộ từ Studio đến Penthouse tại ALIZE Đà Nẵng với mặt bằng thiết kế tinh tế.",
    };
  } catch {
    return { title: "Mặt Bằng - ALIZE" };
  }
}

export default async function FloorPlansPage({ params }: { params: Promise<{ locale: string; projectSlug: string }> }) {
  const { locale, projectSlug } = await params;
  const dict = getDictionary(locale);

  let apiData: any = null;
  try {
    const data: any = await fetchGraphQL(FP_QUERY, { slug: projectSlug }, { next: { revalidate: 300 } });
    apiData = data?.project;
  } catch {}

  const dbFloorplans: any[] = apiData?.floorplans || [];
  const floorplansHeader = apiData?.floorplans_header;

  return (
    <div className="relative w-full overflow-hidden bg-jet-black text-pearl-white">
      <Header nav={dict.nav} locale={locale} projectSlug={projectSlug} />
      <div className="pt-24 lg:pt-32">
        <FloorPlans
          plans={dbFloorplans}
          header={floorplansHeader}
          locale={locale}
          data={dbFloorplans.length === 0 ? dict.floorplans : undefined}
        />
      </div>
      <Footer data={dict.footer} />
    </div>
  );
}
