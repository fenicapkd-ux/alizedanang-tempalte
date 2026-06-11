import React from "react";

interface AmenityItem {
  id?: string;
  category_tag?: string;
  category_tag_en?: string;
  title?: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  image_url?: string;
  icon_name?: string;
  highlight_stat?: string;
  sort_order?: number;
  // legacy fallback
  tag?: string;
  img?: string;
  desc?: string;
}

interface AmenitiesHeader {
  sectionTag?: string;
  sectionTag_en?: string;
  title?: string;
  title_en?: string;
  description?: string;
  description_en?: string;
}

interface ProjectAmenitiesProps {
  amenities: AmenityItem[];
  header?: AmenitiesHeader;
  locale?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Tầng Thượng":     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Sky Level":        "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Tiện Ích Nội Khu": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Inner Area":       "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Tầng Thấp":       "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Ground Level":     "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

export default function ProjectAmenities({ amenities, header, locale = "vi" }: ProjectAmenitiesProps) {
  const sectionTag = (locale === "vi" ? header?.sectionTag : header?.sectionTag_en) || "05 — Đặc Quyền Thượng Lưu";
  const title = (locale === "vi" ? header?.title : header?.title_en) || "Trải Nghiệm Đẳng Cấp 5 Sao";
  const description = (locale === "vi" ? header?.description : header?.description_en) || "";

  // Group by category
  const grouped: Record<string, AmenityItem[]> = {};
  (amenities || []).forEach(item => {
    const cat = (locale === "vi" ? item.category_tag : item.category_tag_en) || item.category_tag || "Tiện Ích";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const hasGroups = Object.keys(grouped).length > 0;

  return (
    <section id="amenities" className="pt-32 pb-32 text-pearl-white border-t border-white/5 bg-midnight-blue">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16">
          <div className="max-w-3xl">
            <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-6 block opacity-80">
              {sectionTag}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[4rem] leading-[1.1] font-light tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-6 text-champagne/60 font-light text-sm max-w-2xl leading-[2]">{description}</p>
            )}
          </div>
        </div>

        {/* Grouped grid */}
        {hasGroups ? (
          <div className="space-y-16">
            {Object.entries(grouped).map(([catName, items]) => (
              <div key={catName}>
                {/* Category label */}
                <div className="flex items-center gap-4 mb-8">
                  <span className={`text-[9px] uppercase tracking-[0.3em] font-bold px-3 py-1.5 rounded-full border ${CATEGORY_COLORS[catName] || "bg-white/10 text-white/60 border-white/20"}`}>
                    {catName}
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((b, i) => {
                    const itemTitle = (locale === "vi" ? b.title : b.title_en) || b.title || "";
                    const itemDesc = (locale === "vi" ? b.description : b.description_en) || b.description || b.desc || "";
                    const imgSrc = b.image_url || b.img || "/images/can-ho-view-bien-my-khe-alize.webp";
                    return (
                      <div
                        key={b.id || i}
                        className="group border border-white/5 bg-charcoal/20 overflow-hidden rounded transition-all duration-500 hover:border-gold/30 hover:bg-charcoal/40"
                      >
                        {/* Image */}
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <img
                            loading="lazy"
                            decoding="async"
                            src={imgSrc}
                            className="w-full h-full object-cover filter brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-700"
                            alt={itemTitle}
                          />
                          {b.highlight_stat && (
                            <div className="absolute bottom-3 left-3 bg-gold/90 text-jet-black text-[8px] uppercase tracking-widest font-bold px-2.5 py-1 rounded">
                              {b.highlight_stat}
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-5">
                          <h3 className="font-serif text-base lg:text-lg font-light mb-2 text-pearl-white leading-snug">
                            {itemTitle}
                          </h3>
                          {itemDesc && (
                            <p className="text-champagne/50 text-[12px] font-light leading-relaxed line-clamp-3">
                              {itemDesc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-champagne/30 text-center py-16">Chưa có tiện ích nào được cập nhật.</p>
        )}
      </div>
    </section>
  );
}
