import React from "react";
import { getDictionary } from "@/dictionaries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloorPlans from "@/components/FloorPlans";
import { Metadata } from "next";
import { fetchGraphQL } from "@/lib/graphql";

// force-dynamic: dùng fetchGraphQL (Redis no-store) — không thể ISR
export const dynamic = 'force-dynamic';

import ProjectHero from "@/components/projects/ProjectHero";
import ProjectAmenities from "@/components/projects/ProjectAmenities";

export async function generateMetadata({ params }: { params: Promise<{ locale: string, projectSlug: string }> }): Promise<Metadata> {
  const { locale, projectSlug } = await params;
  const dict = getDictionary(locale);
  return {
    title: dict.seo.title,
    description: dict.seo.description,
    keywords: dict.seo.keywords,
    openGraph: {
      type: "website",
      title: dict.seo.title,
      description: dict.seo.description,
      images: [{ url: dict.seo.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.seo.title,
      description: dict.seo.description,
      images: [dict.seo.ogImage],
    }
  };
}

export default async function ProjectLandingPage({ params }: { params: Promise<{ locale: string, projectSlug: string }> }) {
  const { locale, projectSlug } = await params;
  const dict = getDictionary(locale);

  // FETCH GRAPHQL DATA TỪ BACKEND
  const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql';
  const query = `
    query {
      project(slug: "${projectSlug}") {
        id
        name
        hero_data
        location {
          name
        }
        amenities {
          id
          title
          description
          image_url
        }
        floorplans {
          id
          name
          beds
          baths
          area
          image_url
        }
      }
    }
  `;

  let apiData = null;
  try {
    const data: any = await fetchGraphQL(query);
    apiData = data?.project;
  } catch (error) {
    console.warn("Lỗi kết nối Backend, Dùng tạm dữ liệu tĩnh (Dict)");
  }

  // --- MERGE DYNAMIC DATA WITH STATIC FALLBACK ---
  const dynamicHeroLine1 = apiData?.name || dict.hero.titleLine1;
  const dynamicHeroLine2 = apiData?.hero_data?.titleLine2 || dict.hero.titleLine2;
  const dynamicHeroDesc = apiData?.hero_data?.description || dict.hero.description;
  const dynamicTagline = apiData?.location?.name ? `TẠI ${apiData.location.name.toUpperCase()}` : dict.hero.tagline;
  const dynamicAmenities = apiData ? apiData.amenities : dict.amenities.items;

  // Xử lý nạp Floorplans Động từ GraphQL
  let dynamicFloorplansObj = dict.floorplans;
  if (apiData) {
    const freshPlans = (apiData.floorplans || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      spaceName: p.name,
      img: p.image_url || null,
      desc: `Diện tích: ${p.area || '?'} m2. Thiết kế sang trọng với không gian mở lấy ánh sáng tự nhiên.`,
      specLeftLabel: 'PHÒNG NGỦ',
      specLeftValue: p.beds ? p.beds.toString() : 'N/A',
      specRightLabel: 'GIAN TẮM',
      specRightValue: p.baths ? p.baths.toString() : 'N/A'
    }));
    dynamicFloorplansObj = { ...dict.floorplans, plans: freshPlans };
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": dynamicHeroLine1,
    "description": dynamicHeroDesc,
    "image": apiData?.floorplans?.[0]?.image_url || "https://alizedanang.net/images/sky-pool-alize-da-nang.webp",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": apiData?.location?.name || "Đà Nẵng",
      "addressCountry": "VN"
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header nav={dict.nav} locale={locale} projectSlug={projectSlug} />
      
      <ProjectHero 
        dynamicTagline={dynamicTagline} 
        dynamicHeroLine1={dynamicHeroLine1} 
        dynamicHeroLine2={dynamicHeroLine2} 
        dynamicHeroDesc={dynamicHeroDesc} 
      />

      {/* OVERVIEW SECTION */}
      <section id="overview" className="pt-40 pb-32 bg-jet-black text-pearl-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-8 block opacity-80">{dict.overview.sectionTag}</span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-[4rem] font-light mb-12 tracking-tight leading-[1.1]">
                {dict.overview.titleLine1}<br /><span className="italic font-serif text-pearl-white/70">{dict.overview.titleLine2}</span>
              </h2>
              <p className="text-champagne/70 font-light leading-[2] mb-12 text-sm md:text-base pr-0 lg:pr-10">{dict.overview.description}</p>
              <div className="space-y-4 mb-8 md:mb-12 text-sm font-light text-champagne/80 pr-0 lg:pr-10">
                {dict.overview.details.map((item, idx) => (
                  <div key={idx} className="flex border-b border-white/10 pb-3">
                    <span className="w-[45%] text-gold uppercase tracking-widest text-[10px]">{item.label}</span>
                    <span className="w-[55%] text-pearl-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="aspect-[3/4] relative overflow-hidden bg-charcoal/20 rounded">
                <img loading="lazy" decoding="async" src="/images/du-an-alize-dan-nang-doc.webp" alt="ALize Overview" className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.1]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section id="values" className="pt-40 pb-32 bg-jet-black text-pearl-white border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-24">
            <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-6 block opacity-80">{dict.values.sectionTag}</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[4rem] font-light tracking-tight">{dict.values.titleLine1}<br /><span className="italic font-serif text-pearl-white/70">{dict.values.titleLine2}</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
            {dict.values.items.map((v, i) => (
              <div key={i} className="border-t border-gold/30 pt-8">
                <span className="text-gold font-serif text-3xl font-light mb-6 block">{v.number}</span>
                <h3 className="text-xl font-light mb-4 tracking-wide">{v.title}</h3>
                <p className="text-[13px] text-champagne/60 leading-relaxed font-light">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION SECTION */}
      <section id="location" className="pt-40 pb-32 text-pearl-white bg-[#070A10] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-24">
            <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-6 block opacity-80">{dict.location.sectionTag}</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[4rem] font-light tracking-tight">{dict.location.title}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-7">
              <div className="aspect-square relative overflow-hidden rounded">
                <img loading="lazy" decoding="async" src="/images/vi-tri-du-an-alize-da-nang.webp" alt="Location Map" className="w-full h-full object-cover filter contrast-[1.2] brightness-75" />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-16">
              {dict.location.items.map((img, i) => (
                <div key={i} className="flex items-start">
                  <span className="text-gold/40 font-serif text-3xl font-light mr-8">{img.num}</span>
                  <div>
                    <h3 className="text-xl font-light mb-4 tracking-wide text-pearl-white">{img.title}</h3>
                    <p className="text-[13px] text-champagne/60 leading-relaxed font-light">{img.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE SECTION */}
      <section id="architecture" className="pt-40 pb-32 bg-jet-black text-pearl-white border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32 items-center">
            <div className="lg:col-span-6 border-l border-gold/40 pl-10 h-full flex flex-col justify-center">
              <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-8 block opacity-80">{dict.architecture.sectionTag}</span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-[4rem] font-light mb-12 tracking-tight leading-[1.1]">{dict.architecture.title}</h2>
              <p className="text-champagne/70 font-light leading-[2] text-sm md:text-base pr-0 lg:pr-10">{dict.architecture.description}</p>
            </div>
            <div className="lg:col-span-6">
              <div className="aspect-[4/5] md:aspect-square relative overflow-hidden bg-charcoal/20 rounded">
                <img loading="lazy" decoding="async" src="/images/phoi-canh-can-ho-view-bien-du-an-alize.webp" alt="Architecture" className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.1] grayscale-[20%]" />
              </div>
            </div>
        </div>
      </section>

      <ProjectAmenities dict={dict} dynamicAmenities={dynamicAmenities} />

      {/* FLOORPLANS */}
      <FloorPlans data={dynamicFloorplansObj} />

      <Footer data={dict.footer} />
    </div>
  );
}
