import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary } from "@/dictionaries";
import { fetchGraphQL } from "@/lib/graphql";
import { Metadata } from "next";

export const revalidate = 300;

const SERVICES_QUERY = `
  query GetProjectServices($slug: String!) {
    project(slug: $slug) {
      name services_header
      services {
        id icon_type title title_en description description_en sort_order
      }
    }
  }
`;

// Icon type → icon SVG map
const SERVICE_ICONS: Record<number, React.ReactNode> = {
  1: ( // Concierge
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  2: ( // Security
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  3: ( // F&B
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  4: ( // Spa
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  5: ( // Valet
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; projectSlug: string }> }): Promise<Metadata> {
  const { locale, projectSlug } = await params;
  try {
    const data: any = await fetchGraphQL(SERVICES_QUERY, { slug: projectSlug }, { next: { revalidate: 300 } });
    const p = data?.project;
    return {
      title: `Dịch Vụ — ${p?.name || "ALIZE"} | Kim Cương Đẳng Cấp`,
      description: "Dịch vụ quản gia 24/7, spa 5 sao, an ninh toàn diện cho cư dân ALIZE.",
    };
  } catch {
    return { title: "Dịch Vụ - ALIZE" };
  }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string; projectSlug: string }> }) {
  const { locale, projectSlug } = await params;
  const dict = getDictionary(locale);
  const isVI = locale === "vi";

  let apiData: any = null;
  try {
    const data: any = await fetchGraphQL(SERVICES_QUERY, { slug: projectSlug }, { next: { revalidate: 300 } });
    apiData = data?.project;
  } catch {}

  const svcHeader = apiData?.services_header || {};
  const dbServices: any[] = apiData?.services || [];
  const dictSvc = dict.subpages.services;

  const useDB = dbServices.length > 0;

  const sectionTag = isVI ? svcHeader.sectionTag : (svcHeader.sectionTag_en || svcHeader.sectionTag || dictSvc.tag);
  const title1 = isVI ? svcHeader.titleLine1 : (svcHeader.titleLine1_en || svcHeader.titleLine1 || dictSvc.title1);
  const title2 = isVI ? svcHeader.titleLine2 : (svcHeader.titleLine2_en || svcHeader.titleLine2 || dictSvc.title2);
  const desc = isVI ? svcHeader.description : (svcHeader.description_en || svcHeader.description || dictSvc.desc);
  const serviceImage = svcHeader.service_image || "https://images.unsplash.com/photo-1551882547-ff40c0d13c11?q=80&w=1974";

  const services = useDB
    ? dbServices.map((s: any) => ({
        icon_type: s.icon_type || 1,
        title: isVI ? s.title : (s.title_en || s.title),
        desc: isVI ? s.description : (s.description_en || s.description),
      }))
    : dictSvc.items.map((item: any, i: number) => ({ icon_type: item.iconType || (i + 1), title: item.title, desc: item.desc }));

  return (
    <div className="relative w-full overflow-hidden bg-jet-black text-pearl-white">
      <Header nav={dict.nav} locale={locale} projectSlug={projectSlug} />
      <div className="pt-24 lg:pt-32">
        <section className="pt-20 pb-24 bg-jet-black border-t border-white/5">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            {/* Left — Header + Service list */}
            <div className="lg:col-span-7 border-l border-gold/40 pl-10 h-full flex flex-col justify-center">
              <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-8 block opacity-80">{sectionTag}</span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] font-light mb-10 tracking-tight leading-[1.1]">
                {title1} <span className="italic">{title2}</span>
              </h1>
              {desc && <p className="text-champagne/70 font-light leading-[2] text-sm md:text-base mb-12 max-w-2xl">{desc}</p>}

              <div className="space-y-4">
                {services.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-5 p-6 bg-charcoal/20 border border-white/5 rounded-xl hover:border-gold/20 hover:bg-charcoal/40 transition-all duration-300"
                  >
                    <div className="w-14 h-14 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-gold shrink-0 group-hover:bg-gold/20 transition-colors">
                      {SERVICE_ICONS[item.icon_type] || SERVICE_ICONS[1]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-light text-pearl-white mb-2 group-hover:text-gold transition-colors">{item.title}</h3>
                      <p className="text-sm font-light text-champagne/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Image */}
            <div className="lg:col-span-5">
              <div className="aspect-[4/5] relative overflow-hidden bg-charcoal/20 rounded-2xl">
                <img
                  loading="lazy"
                  src={serviceImage}
                  alt="Dịch Vụ ALIZE"
                  className="w-full h-full object-cover brightness-[0.65]"
                />
                {/* Overlay card */}
                <div className="absolute bottom-6 left-6 right-6 bg-jet-black/80 backdrop-blur-md border border-white/10 rounded-xl p-5">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-gold/80 mb-2">Tiêu Chuẩn</div>
                  <div className="font-serif text-xl font-light text-pearl-white">5 Sao Quốc Tế</div>
                  <div className="text-xs text-champagne/50 mt-1">Phục vụ 24/7 — {services.length} Dịch Vụ Đặc Quyền</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer data={dict.footer} />
    </div>
  );
}
