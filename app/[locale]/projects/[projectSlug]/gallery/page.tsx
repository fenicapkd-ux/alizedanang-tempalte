import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary } from "@/dictionaries";
import { fetchGraphQL } from "@/lib/graphql";
import { Metadata } from "next";

export const revalidate = 300;

const GALLERY_QUERY = `
  query GetProjectGallery($slug: String!) {
    project(slug: $slug) {
      name seo_data gallery_header
      gallery_categories {
        id tag tag_en title title_en description description_en sort_order
        images {
          id image_url alt_text alt_text_en caption is_cover sort_order
        }
      }
    }
  }
`;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; projectSlug: string }> }): Promise<Metadata> {
  const { locale, projectSlug } = await params;
  try {
    const data: any = await fetchGraphQL(GALLERY_QUERY, { slug: projectSlug }, { next: { revalidate: 300 } });
    const p = data?.project;
    const seo = p?.seo_data;
    return {
      title: `Gallery — ${p?.name || "ALIZE"} | Thư Viện Hình Ảnh`,
      description: seo?.description || "Thư viện hình ảnh thiết kế ấn tượng của dự án ALIZE Đà Nẵng.",
      openGraph: { title: `Gallery — ${p?.name || "ALIZE"}`, images: seo?.og_image ? [{ url: seo.og_image }] : [{ url: "/images/sky-pool-alize-da-nang.webp" }] },
    };
  } catch {
    return { title: "Gallery - ALIZE", description: "Thư viện hình ảnh ALIZE Đà Nẵng." };
  }
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string; projectSlug: string }> }) {
  const { locale, projectSlug } = await params;
  const dict = getDictionary(locale);
  const isVI = locale === "vi";

  let apiData: any = null;
  try {
    const data: any = await fetchGraphQL(GALLERY_QUERY, { slug: projectSlug }, { next: { revalidate: 300 } });
    apiData = data?.project;
  } catch {}

  const galleryHero = apiData?.gallery_header?.hero || {};
  const dbCategories: any[] = apiData?.gallery_categories || [];
  const dictGallery = dict.subpages.gallery;

  // Nếu có DB data dùng DB, không thì dùng dict
  const useDB = dbCategories.length > 0;

  const heroTag = galleryHero.tag || dictGallery.hero?.tag || "TRIỂN LÃM THỊ GIÁC";
  const heroTitle1 = galleryHero.title1 || dictGallery.hero?.title1 || "THƯ VIỆN ĐỘC BẢN";
  const heroTitle2 = galleryHero.title2 || dictGallery.hero?.title2 || "Mang Tầm Kiệt Tác";
  const heroDesc = galleryHero.desc || dictGallery.hero?.desc || "";
  const heroBg = galleryHero.bg_image || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053";

  const categories = useDB
    ? dbCategories.map((cat: any) => ({
        tag: isVI ? cat.tag : (cat.tag_en || cat.tag),
        title: isVI ? cat.title : (cat.title_en || cat.title),
        desc: isVI ? cat.description : (cat.description_en || cat.description),
        images: (cat.images || [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((img: any) => ({
            url: img.image_url,
            alt: isVI ? img.alt_text : (img.alt_text_en || img.alt_text),
            is_cover: img.is_cover,
          })),
      }))
    : [
        { tag: dictGallery.cat1?.tag, title: dictGallery.cat1?.title, desc: dictGallery.cat1?.desc, images: (dictGallery.cat1?.images || []).map((url: string) => ({ url, alt: "" })) },
        { tag: dictGallery.cat2?.tag, title: dictGallery.cat2?.title, desc: dictGallery.cat2?.desc, images: (dictGallery.cat2?.images || []).map((url: string) => ({ url, alt: "" })) },
        { tag: dictGallery.cat3?.tag, title: dictGallery.cat3?.title, desc: dictGallery.cat3?.desc, images: (dictGallery.cat3?.images || []).map((url: string) => ({ url, alt: "" })) },
      ].filter(c => c.images.length > 0);

  return (
    <div className="relative w-full overflow-hidden bg-jet-black text-pearl-white">
      <Header nav={dict.nav} locale={locale} projectSlug={projectSlug} />

      {/* HERO */}
      <section className="relative h-[75vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img loading="lazy" src={heroBg} alt="Gallery" className="w-full h-full object-cover brightness-[0.4]" />
          <div className="absolute inset-0 bg-gradient-to-t from-jet-black via-jet-black/50 to-transparent" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <span className="block text-gold text-[10px] tracking-[0.5em] font-light uppercase mb-6">{heroTag}</span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal text-pearl-white mb-6 tracking-tighter leading-[1.05]">
            {heroTitle1} <br /><span className="italic font-light text-pearl-white/90">{heroTitle2}</span>
          </h1>
          {heroDesc && <p className="text-champagne/70 text-base font-light max-w-2xl mx-auto leading-relaxed">{heroDesc}</p>}
        </div>
      </section>

      {/* GALLERY CATEGORIES */}
      {categories.map((cat, catIdx) => {
        const imgs = cat.images || [];
        const mainImg = imgs.find((i: any) => i.is_cover) || imgs[0];
        const sideImgs = imgs.filter((i: any) => i !== mainImg).slice(0, 4);
        const isOdd = catIdx % 2 === 1;

        return (
          <section key={catIdx} className={`py-20 lg:py-28 border-t border-white/5 ${isOdd ? "bg-midnight-blue" : "bg-jet-black"}`}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
              {/* Category Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-white/10">
                <div>
                  <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-3 block opacity-80">{cat.tag}</span>
                  <h2 className="font-serif text-3xl lg:text-4xl font-light text-pearl-white tracking-tight">{cat.title}</h2>
                </div>
                {cat.desc && (
                  <p className="text-[13px] text-champagne/50 font-light mt-4 md:mt-0 max-w-sm text-left md:text-right">{cat.desc}</p>
                )}
              </div>

              {/* Images Grid */}
              {imgs.length >= 3 ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Main large image */}
                  <div className="md:col-span-8 overflow-hidden group relative aspect-[16/10] bg-charcoal/20 rounded">
                    {mainImg && (
                      <img
                        loading="lazy"
                        src={mainImg.url}
                        alt={mainImg.alt || cat.title}
                        className="w-full h-full object-cover brightness-[0.75] group-hover:brightness-90 group-hover:scale-105 transition-all duration-700"
                      />
                    )}
                  </div>
                  {/* Side images */}
                  <div className="md:col-span-4 flex flex-col gap-4">
                    {sideImgs.slice(0, 2).map((img: any, i: number) => (
                      <div key={i} className="overflow-hidden relative aspect-[4/3] bg-charcoal/20 rounded">
                        <img
                          loading="lazy"
                          src={img.url}
                          alt={img.alt || ""}
                          className="w-full h-full object-cover brightness-[0.75] hover:brightness-90 hover:scale-105 transition-all duration-700"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Extra row images */}
                  {sideImgs.slice(2).map((img: any, i: number) => (
                    <div key={i} className={`md:col-span-${12 / Math.max(sideImgs.slice(2).length, 1)} overflow-hidden relative aspect-[4/3] bg-charcoal/20 rounded`}>
                      <img loading="lazy" src={img.url} alt={img.alt || ""} className="w-full h-full object-cover brightness-[0.75] hover:brightness-90 transition-all duration-700" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {imgs.map((img: any, i: number) => (
                    <div key={i} className="aspect-[4/3] overflow-hidden relative bg-charcoal/20 rounded">
                      <img loading="lazy" src={img.url} alt={img.alt || ""} className="w-full h-full object-cover brightness-75 hover:brightness-90 hover:scale-105 transition-all duration-700" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="py-20 bg-jet-black border-t border-white/5 text-center">
        <p className="text-champagne/50 text-sm font-light mb-6">Đặt lịch tham quan không gian thực tế</p>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.history.back(); }}
          className="inline-flex items-center gap-3 bg-gold text-jet-black font-bold text-[11px] uppercase tracking-[0.3em] px-8 py-4 hover:bg-gold/90 transition-colors"
        >
          Quay Lại Dự Án
        </a>
      </section>

      <Footer data={dict.footer} />
    </div>
  );
}
