import React from "react";
import PortalHeader from "../../../components/PortalHeader";
import PortalFooter from "../../../components/PortalFooter";
import HoverVideoCard from "../../../components/HoverVideoCard";
import { getDictionary } from "../../../dictionaries";
import { Metadata } from "next";
import { fetchGraphQL } from "../../../lib/graphql";
import Link from "next/link";

// force-dynamic: trang dùng fetchGraphQL (Redis no-store) — không thể ISR
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const portalSeo = dict.portal.projects.seo;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://alizedanang.net";

  return {
    title: portalSeo.title,
    description: portalSeo.description,
    keywords: portalSeo.keywords,
    openGraph: {
      title: portalSeo.title,
      description: portalSeo.description,
      images: [{ url: portalSeo.ogImage }],
      url: `${baseUrl}/${locale}/projects`,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/projects`,
    }
  };
}

export default async function ProjectsHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const data = dict.portal.projects;

  let dynamicProjects = [];

  try {
    const response: any = await fetchGraphQL(`
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
    `);
    if (response?.projects) {
      dynamicProjects = response.projects;
    }
  } catch (err) {
    console.error("Lỗi khi load Projects từ GraphQL:", err);
  }

  // Fallback to static data if no dynamic projects are found
  if (dynamicProjects.length === 0 && dict.portal.featuredProjects?.items) {
    dynamicProjects = dict.portal.featuredProjects.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.href,
      hero_img: item.img, // mapping for HoverVideoCard
      location: { name: item.location },
    }));
  }

  return (
    <div className="bg-[#070A10] min-h-screen text-pearl-white flex flex-col font-sans">
      <PortalHeader nav={dict.portal.nav} locale={locale} />

      <main className="flex-1 w-full flex-grow pb-32">
        {/* HERO HEADER */}
        <section className="relative pt-40 pb-12 md:pb-16 w-full flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0 opacity-40">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075')] bg-cover bg-center filter grayscale contrast-125 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-[#070A10] via-[#070A10]/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
             <span className="block text-gold text-[10px] md:text-sm tracking-[0.6em] font-light uppercase mb-6 animate-fade-in-up">
               {data.hero.titleLine1}
             </span>
             <h1 className="font-serif text-5xl md:text-7xl lg:text-[6rem] font-light text-pearl-white tracking-tighter leading-[1.1] mb-8 drop-shadow-2xl animate-fade-in-up" style={{animationDelay: '100ms'}}>
               {data.hero.titleLine2}
             </h1>
             <p className="text-champagne/80 text-base md:text-lg font-light tracking-wide max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '200ms'}}>
               {data.hero.description}
             </p>
          </div>
        </section>

        {/* PROJECTS GRID */}
        <section className="py-24 max-w-[1400px] mx-auto px-6 lg:px-12">
          {dynamicProjects.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-12">
              {dynamicProjects.map((project: any, idx: number) => (
                <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${(idx + 1) * 150}ms` }}>
                  <HoverVideoCard project={project} dict={data.card} locale={locale} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-jet-black/50 border border-white/5 rounded-xl backdrop-blur-sm">
               <svg className="w-16 h-16 mx-auto text-white/20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
               <h3 className="text-xl md:text-2xl font-light text-champagne/80 tracking-wide">{data.emptyState}</h3>
               <Link href={`/${locale}`} className="inline-block mt-8 text-gold text-sm uppercase tracking-widest border-b border-gold/30 pb-1 hover:border-gold transition-colors">
                 {locale === 'vi' ? 'Quay lại Trang Chủ' : 'Back to Home'}
               </Link>
            </div>
          )}
        </section>
      </main>

      <PortalFooter footer={dict.portal.footer} locale={locale} />
    </div>
  );
}
