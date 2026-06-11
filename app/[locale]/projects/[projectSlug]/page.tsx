import React from "react";
import { redirect } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloorPlans from "@/components/FloorPlans";
import { Metadata } from "next";
import { fetchGraphQL, GET_PROJECT_BY_SLUG_QUERY } from "@/lib/graphql";
import ProjectHero from "@/components/projects/ProjectHero";
import ProjectAmenities from "@/components/projects/ProjectAmenities";
import ContactFormSection from "@/components/projects/ContactFormSection";

// ISR: revalidate mỗi 5 phút thay vì force-dynamic mỗi request
export const revalidate = 300;

// ─── Metadata từ DB ───────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; projectSlug: string }>;
}): Promise<Metadata> {
  const { locale, projectSlug } = await params;
  const dict = getDictionary(locale);

  try {
    const data: any = await fetchGraphQL(
      GET_PROJECT_BY_SLUG_QUERY,
      { slug: projectSlug },
      { next: { revalidate: 300 } }
    );
    const p = data?.project;
    const seo = p?.seo_data;
    if (seo) {
      const title = locale === "vi" ? seo.title : (seo.title_en || seo.title);
      const description = locale === "vi" ? seo.description : (seo.description_en || seo.description);
      return {
        title,
        description,
        keywords: seo.keywords,
        openGraph: {
          type: "website",
          title,
          description,
          images: seo.og_image ? [{ url: seo.og_image, width: seo.og_image_width || 1200, height: seo.og_image_height || 630 }] : [],
        },
        twitter: { card: "summary_large_image", title, description, images: seo.og_image ? [seo.og_image] : [] },
        alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
      };
    }
  } catch {}

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
  };
}

// ─── Main Page ────────────────────────────────────────────────────────
export default async function ProjectLandingPage({
  params,
}: {
  params: Promise<{ locale: string; projectSlug: string }>;
}) {
  const { locale, projectSlug } = await params;
  const dict = getDictionary(locale);

  // ── Fetch DB project data ──────────────────────────────────────────
  let apiData: any = null;
  try {
    const data: any = await fetchGraphQL(
      GET_PROJECT_BY_SLUG_QUERY,
      { slug: projectSlug },
      { next: { revalidate: 300 } }
    );
    apiData = data?.project || null;
  } catch (error) {
    console.warn("[ProjectPage] GraphQL error — using dict fallback:", error);
  }

  // ── REDIRECT nếu dự án có landing page riêng ──────────────────────────
  if (apiData?.landing_url_active && apiData?.landing_page_url) {
    redirect(apiData.landing_page_url);
    // redirect() throws internally, execution stops here
  }

  // ── Helper: prefer DB value, fallback to dict ──────────────────────
  const isVI = locale === "vi";

  // ── HERO data ──────────────────────────────────────────────────────
  const hero = apiData?.hero_data || {};
  const heroTagline = (isVI ? hero.tagline : hero.tagline_en) || dict.hero.tagline;
  const heroTitle1 = (isVI ? hero.titleLine1 : hero.titleLine1_en) || apiData?.brand_name || dict.hero.titleLine1;
  const heroTitle2 = (isVI ? hero.titleLine2 : hero.titleLine2_en) || dict.hero.titleLine2;
  const heroDesc = (isVI ? hero.description : hero.description_en) || dict.hero.description;
  const heroBgImage = hero.bg_image || apiData?.cover_image || "/images/sky-pool-alize-da-nang.webp";
  const heroBgVideo = hero.bg_video || "";
  const heroCtaText = (isVI ? hero.cta_text : hero.cta_text_en) || "Khám Phá";

  // ── OVERVIEW data ──────────────────────────────────────────────────
  const overview = apiData?.overview_data || {};
  const ovTag = (isVI ? overview.sectionTag : overview.sectionTag_en) || dict.overview.sectionTag;
  const ovTitle1 = (isVI ? overview.titleLine1 : overview.titleLine1_en) || dict.overview.titleLine1;
  const ovTitle2 = (isVI ? overview.titleLine2 : overview.titleLine2_en) || dict.overview.titleLine2;
  const ovDesc = (isVI ? overview.description : overview.description_en) || dict.overview.description;
  const ovImage = overview.image || "/images/du-an-alize-dan-nang-doc.webp";
  const ovDetails: { label: string; label_en?: string; value: string }[] =
    overview.details || dict.overview.details;

  // ── VALUES data ────────────────────────────────────────────────────
  const vals = apiData?.values_data || {};
  const valTag = (isVI ? vals.sectionTag : vals.sectionTag_en) || dict.values.sectionTag;
  const valTitle1 = (isVI ? vals.titleLine1 : vals.titleLine1_en) || dict.values.titleLine1;
  const valTitle2 = (isVI ? vals.titleLine2 : vals.titleLine2_en) || dict.values.titleLine2;
  const valItems: any[] = vals.items || dict.values.items;

  // ── LOCATION data ──────────────────────────────────────────────────
  const locData = apiData?.location_data || {};
  const locTag = (isVI ? locData.sectionTag : locData.sectionTag_en) || dict.location.sectionTag;
  const locTitle = (isVI ? locData.title : locData.title_en) || dict.location.title;
  const locMapImage = locData.map_image || "/images/vi-tri-du-an-alize-da-nang.webp";
  const locItems: any[] = locData.items || dict.location.items;
  const locConnectivity: any[] = locData.connectivity || [];
  const locEmbedMap = locData.embed_map_url || "";

  // ── ARCHITECTURE data ──────────────────────────────────────────────
  const arch = apiData?.architecture_data || {};
  const archSection1 = arch.section1 || {};
  const archSection2 = arch.section2 || {};
  const archHero = arch.hero || {};
  const archTag = dict.architecture.sectionTag;
  const archTitle = dict.architecture.title;
  const archDesc = dict.architecture.description;

  // ── AMENITIES ─────────────────────────────────────────────────────
  const amenitiesHeader = apiData?.amenities_header || {};
  const dbAmenities: any[] = apiData?.amenities || [];
  const amenities = dbAmenities.length > 0 ? dbAmenities : dict.amenities.items;

  // ── FLOORPLANS ────────────────────────────────────────────────────
  const floorplansHeader = apiData?.floorplans_header;
  const dbFloorplans: any[] = apiData?.floorplans || [];

  // ── CONTACT data ──────────────────────────────────────────────────
  const contactData = apiData?.contact_data || {};
  const ctHotline = contactData.hotline || "0799.036.842";
  const ctZalo = contactData.zalo || "0799036842";
  const ctAddress = contactData.sales_gallery_address || contactData.address || "Võ Nguyên Giáp, Sơn Trà, Đà Nẵng";
  const ctTitle = (isVI ? contactData.form_title : contactData.form_title_en) || "Đăng Ký Tham Quan";
  const ctDesc = (isVI ? contactData.description : contactData.description_en) || "";

  // ── JSON-LD Schema ─────────────────────────────────────────────────
  const seo = apiData?.seo_data || {};
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: apiData?.name || dict.hero.titleLine1,
    description: heroDesc,
    image: heroBgImage,
    url: seo.canonical || `https://alizedanang.net/${locale}/projects/${projectSlug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: apiData?.address || "Võ Nguyên Giáp",
      addressLocality: apiData?.city || "Đà Nẵng",
      addressCountry: "VN",
    },
    offers: apiData?.price_from
      ? {
          "@type": "Offer",
          price: String(apiData.price_from),
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
        }
      : undefined,
  };

  return (
    <div className="relative w-full overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header nav={dict.nav} locale={locale} projectSlug={projectSlug} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <ProjectHero
        tagline={heroTagline}
        titleLine1={heroTitle1}
        titleLine2={heroTitle2}
        description={heroDesc}
        bgImage={heroBgImage}
        bgVideo={heroBgVideo || undefined}
        ctaText={heroCtaText}
        locale={locale}
      />

      {/* ── OVERVIEW ─────────────────────────────────────────────── */}
      <section id="overview" className="pt-32 pb-24 bg-jet-black text-pearl-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-28 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-8 block opacity-80">{ovTag}</span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.8rem] font-light mb-10 tracking-tight leading-[1.1]">
                {ovTitle1}<br /><span className="italic font-serif text-pearl-white/70">{ovTitle2}</span>
              </h2>
              <p className="text-champagne/70 font-light leading-[2] mb-10 text-sm md:text-base pr-0 lg:pr-10">{ovDesc}</p>
              <div className="space-y-3 mb-10 text-sm font-light text-champagne/80 pr-0 lg:pr-10">
                {ovDetails.map((item: any, idx: number) => (
                  <div key={idx} className="flex border-b border-white/10 pb-3">
                    <span className="w-[45%] text-gold uppercase tracking-widest text-[10px]">
                      {isVI ? item.label : (item.label_en || item.label)}
                    </span>
                    <span className="w-[55%] text-pearl-white">{item.value}</span>
                  </div>
                ))}
              </div>
              {/* Quick stats from DB */}
              {apiData && (
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                  {apiData.total_units && (
                    <div className="text-center">
                      <div className="text-2xl font-serif font-light text-gold">{apiData.total_units.toLocaleString()}</div>
                      <div className="text-[9px] uppercase tracking-widest text-champagne/40 mt-1">Căn</div>
                    </div>
                  )}
                  {apiData.total_floors && (
                    <div className="text-center">
                      <div className="text-2xl font-serif font-light text-gold">{apiData.total_floors}</div>
                      <div className="text-[9px] uppercase tracking-widest text-champagne/40 mt-1">Tầng</div>
                    </div>
                  )}
                  {apiData.price_display && (
                    <div className="text-center">
                      <div className="text-lg font-serif font-light text-gold">{apiData.price_display}</div>
                      <div className="text-[9px] uppercase tracking-widest text-champagne/40 mt-1">Giá Từ</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="aspect-[3/4] relative overflow-hidden bg-charcoal/20 rounded">
                <img
                  loading="lazy"
                  decoding="async"
                  src={ovImage}
                  alt={apiData?.name || "Tổng Quan Dự Án"}
                  className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.1]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────── */}
      <section id="values" className="pt-32 pb-24 bg-jet-black text-pearl-white border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-6 block opacity-80">{valTag}</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.8rem] font-light tracking-tight">
              {valTitle1}<br /><span className="italic font-serif text-pearl-white/70">{valTitle2}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            {valItems.map((v: any, i: number) => (
              <div key={i} className="border-t border-gold/30 pt-8 group">
                <span className="text-gold font-serif text-3xl font-light mb-6 block">{v.number}</span>
                <h3 className="text-xl font-light mb-4 tracking-wide">{isVI ? v.title : (v.title_en || v.title)}</h3>
                {v.highlight_stat && (
                  <div className="inline-block text-[9px] uppercase tracking-widest bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full mb-4">
                    {v.highlight_stat}
                  </div>
                )}
                <p className="text-[13px] text-champagne/60 leading-relaxed font-light">{isVI ? v.desc : (v.desc_en || v.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATION ─────────────────────────────────────────────── */}
      <section id="location" className="pt-32 pb-24 text-pearl-white bg-[#070A10] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-6 block opacity-80">{locTag}</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.8rem] font-light tracking-tight">{locTitle}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-16">
            <div className="lg:col-span-7">
              {locEmbedMap ? (
                <div className="aspect-square relative overflow-hidden rounded border border-white/10">
                  <iframe
                    src={locEmbedMap}
                    className="w-full h-full grayscale"
                    loading="lazy"
                    title="Google Maps"
                  />
                </div>
              ) : (
                <div className="aspect-square relative overflow-hidden rounded">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={locMapImage}
                    alt="Vị trí dự án"
                    className="w-full h-full object-cover filter contrast-[1.2] brightness-75"
                  />
                </div>
              )}
            </div>
            <div className="lg:col-span-5 space-y-12">
              {locItems.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-6">
                  <span className="text-gold/40 font-serif text-3xl font-light shrink-0">{item.num || `0${i + 1}`}</span>
                  <div>
                    <h3 className="text-lg font-light mb-3 tracking-wide text-pearl-white">
                      {isVI ? item.title : (item.title_en || item.title)}
                    </h3>
                    <p className="text-[13px] text-champagne/60 leading-relaxed font-light">
                      {isVI ? item.desc : (item.desc_en || item.desc)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Connectivity chips */}
          {locConnectivity.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {locConnectivity.map((conn: any, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                  <span className="text-gold text-[10px] uppercase tracking-widest">{conn.label}</span>
                  <span className="text-pearl-white text-xs font-medium">{conn.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ARCHITECTURE ─────────────────────────────────────────── */}
      <section id="architecture" className="pt-32 pb-24 bg-jet-black text-pearl-white border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Hero Architecture */}
          {archHero.bg_image && (
            <div className="relative h-[400px] rounded overflow-hidden mb-24">
              <img src={archHero.bg_image} alt="Architecture" className="w-full h-full object-cover brightness-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                {archHero.tag && <span className="text-[9px] uppercase tracking-[0.5em] text-gold/80 mb-4">{archHero.tag}</span>}
                {archHero.title1 && (
                  <h2 className="font-serif text-4xl md:text-6xl font-light text-pearl-white">
                    {archHero.title1} <span className="italic">{archHero.title2}</span>
                  </h2>
                )}
                {archHero.desc && <p className="text-champagne/60 mt-4 max-w-2xl text-sm font-light leading-relaxed">{archHero.desc}</p>}
              </div>
            </div>
          )}

          {/* Section 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center mb-24">
            <div className="lg:col-span-6 border-l border-gold/40 pl-10 h-full flex flex-col justify-center">
              {archSection1.tag && <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-8 block opacity-80">{archSection1.tag}</span>}
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-10 tracking-tight leading-[1.1]">
                {archSection1.title1 || archTag}<br />
                <span className="italic font-serif text-pearl-white/70">{archSection1.title2 || archTitle}</span>
              </h2>
              <p className="text-champagne/70 font-light leading-[2] text-sm mb-6">{archSection1.desc1 || archDesc}</p>
              {archSection1.desc2 && <p className="text-champagne/50 font-light leading-[2] text-sm">{archSection1.desc2}</p>}
            </div>
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] relative overflow-hidden rounded">
                  <img
                    loading="lazy"
                    src={archSection1.image1 || "/images/phoi-canh-can-ho-view-bien-du-an-alize.webp"}
                    alt="Architecture 1"
                    className="w-full h-full object-cover brightness-75 hover:brightness-90 transition-all duration-700"
                  />
                </div>
                <div className="aspect-[3/4] relative overflow-hidden rounded mt-8">
                  <img
                    loading="lazy"
                    src={archSection1.image2 || "/images/sky-pool-alize-da-nang.webp"}
                    alt="Architecture 2"
                    className="w-full h-full object-cover brightness-75 hover:brightness-90 transition-all duration-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Traditional vs Contemporary */}
          {(archSection2.title1 || archSection2.desc1) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="aspect-[4/3] relative overflow-hidden rounded">
                  <img
                    loading="lazy"
                    src={archSection2.image || "/images/du-an-alize-dan-nang-doc.webp"}
                    alt="Architecture Section 2"
                    className="w-full h-full object-cover brightness-75"
                  />
                </div>
              </div>
              <div className="lg:col-span-6 order-1 lg:order-2">
                {archSection2.tag && <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-6 block opacity-80">{archSection2.tag}</span>}
                <div className="flex gap-6 mb-8">
                  <div className="text-3xl font-serif font-light text-pearl-white/30">{archSection2.title1}</div>
                  <div className="text-3xl font-serif font-light text-gold">{archSection2.title2}</div>
                </div>
                {archSection2.desc1 && <p className="text-champagne/70 font-light leading-[2] text-sm mb-4">{archSection2.desc1}</p>}
                {archSection2.desc2 && <p className="text-champagne/50 font-light leading-[2] text-sm">{archSection2.desc2}</p>}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── AMENITIES ────────────────────────────────────────────── */}
      <ProjectAmenities
        amenities={amenities}
        header={dbAmenities.length > 0 ? amenitiesHeader : undefined}
        locale={locale}
      />

      {/* ── FLOORPLANS ───────────────────────────────────────────── */}
      <FloorPlans
        plans={dbFloorplans}
        header={floorplansHeader}
        locale={locale}
        data={dbFloorplans.length === 0 ? dict.floorplans : undefined}
      />

      {/* ── CONTACT ──────────────────────────────────────────────── */}
      <section id="contact" className="pt-32 pb-24 bg-[#070A10] text-pearl-white border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Info */}
            <div>
              <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-6 block opacity-80">
                {contactData.tag || "Liên Hệ"}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6 tracking-tight">
                {contactData.title1 || "Trở Thành"}<br />
                <span className="italic font-serif text-pearl-white/70">{contactData.title2 || "Chủ Nhân"}</span>
              </h2>
              {ctDesc && <p className="text-champagne/60 font-light leading-[2] text-sm mb-10">{ctDesc}</p>}
              <div className="space-y-4">
                <a href={`tel:${ctHotline.replace(/\./g, "")}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 border border-gold/30 rounded-full flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.3em] text-champagne/40 mb-0.5">{contactData.hotline_label || "Hotline"}</div>
                    <div className="text-lg font-light text-gold">{ctHotline}</div>
                  </div>
                </a>
                <a href={`https://zalo.me/${ctZalo}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 border border-blue-500/30 rounded-full flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.502 3.66 1.38 5.193L2 22l4.867-1.366A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm3.5 14.5l-1.5-.5c-.5-.167-1-.333-1.5-.167-.5.167-1 .5-1.5.667-.5.167-1.333-.333-2.5-1.5-1.167-1.167-1.667-2-1.5-2.5.167-.5.5-1 .667-1.5.167-.5 0-1-.167-1.5l-.5-1.5a.5.5 0 00-.5-.5h-.5c-.5 0-1 .167-1.5.833-.5.667-.833 1.667-.833 2.5 0 1.833 1.5 4 3.333 5.667C9.667 18.667 12 20 13.833 20c.833 0 1.833-.333 2.5-.833.667-.5.833-1 .833-1.5v-.5c0-.333-.167-.5-.5-.667z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.3em] text-champagne/40 mb-0.5">{contactData.zalo_label || "Zalo"}</div>
                    <div className="text-base font-light text-pearl-white">
                      {contactData.zalo_text || "Chat Ngay"} → {ctZalo}
                    </div>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-champagne/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.3em] text-champagne/40 mb-0.5">{contactData.address_label || "Showroom"}</div>
                    <div className="text-sm font-light text-pearl-white/70">{ctAddress}</div>
                    {contactData.open_hours && (
                      <div className="text-[11px] text-champagne/40 mt-1">{contactData.open_hours}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <ContactFormSection
              title={ctTitle}
              projectName={apiData?.name || ""}
              projectId={apiData?.id || projectSlug}
              hotline={ctHotline}
              locale={locale}
              apiUrl={process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:3001"}
            />
          </div>
        </div>
      </section>

      <Footer data={dict.footer} />
    </div>
  );
}
