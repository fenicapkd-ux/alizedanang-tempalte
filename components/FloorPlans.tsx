"use client";
import React, { useState, useEffect } from "react";

interface FloorPlanItem {
  // DB fields mới
  id?: string;
  tab_id?: string;
  tab_name?: string;
  space_name?: string;
  space_name_en?: string;
  area_m2?: number;
  area_display?: string;
  beds?: number;
  baths?: number;
  balcony?: boolean;
  balcony_area_m2?: number;
  price_display?: string;
  status?: string;
  availability?: number;
  description?: string;
  description_en?: string;
  spec_left_label?: string;
  spec_left_value?: string;
  spec_right_label?: string;
  spec_right_value?: string;
  image_url?: string;
  image_3d_url?: string;
  tour_3d_url?: string;
  sort_order?: number;
  // Legacy fields (từ dict)
  name?: string;
  img?: string;
  spaceName?: string;
  desc?: string;
  specLeftLabel?: string;
  specLeftValue?: string;
  specRightLabel?: string;
  specRightValue?: string;
}

interface FloorPlansHeader {
  sectionTag?: string;
  sectionTag_en?: string;
  title?: string;
  title_en?: string;
  description?: string;
  description_en?: string;
}

interface FloorPlansProps {
  plans: FloorPlanItem[];
  header?: FloorPlansHeader;
  locale?: string;
  // Legacy compat
  data?: any;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open:       { label: "Đang Mở Bán", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  coming_soon: { label: "Sắp Ra Mắt", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  sold_out:   { label: "Đã Bán Hết", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  limited:    { label: "Sắp Hết", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
};

export default function FloorPlans({ plans = [], header, locale = "vi", data }: FloorPlansProps) {
  // Legacy compat — nếu dùng `data` prop cũ thì wrap lại
  const effectivePlans: FloorPlanItem[] = plans.length > 0
    ? plans
    : (data?.plans || []).map((p: any) => ({
        tab_id: p.id,
        tab_name: p.name,
        space_name: p.spaceName,
        image_url: p.img,
        description: p.desc,
        spec_left_label: p.specLeftLabel,
        spec_left_value: p.specLeftValue,
        spec_right_label: p.specRightLabel,
        spec_right_value: p.specRightValue,
      }));

  const effectiveHeader: FloorPlansHeader = header || {
    sectionTag: data?.sectionTag || "07 — Bản Đồ Không Gian",
    title: data?.title || "Bản Vẽ Độc Bản",
    description: data?.description || "",
  };

  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (effectivePlans.length > 0) {
      setActiveId(effectivePlans[0].tab_id || effectivePlans[0].id || "0");
    }
  }, [effectivePlans]);

  const sectionTag = (locale === "vi" ? effectiveHeader.sectionTag : effectiveHeader.sectionTag_en) || effectiveHeader.sectionTag || "";
  const title = (locale === "vi" ? effectiveHeader.title : effectiveHeader.title_en) || effectiveHeader.title || "";
  const desc = (locale === "vi" ? effectiveHeader.description : effectiveHeader.description_en) || effectiveHeader.description || "";

  const activePlan = effectivePlans.find(p => (p.tab_id || p.id) === activeId) || effectivePlans[0];

  if (!effectivePlans.length) return null;

  return (
    <section id="floorplans" className="pt-32 pb-32 bg-midnight-blue text-pearl-white border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16">
          <div className="max-w-3xl">
            <span className="text-[10px] text-gold tracking-[0.4em] uppercase font-light mb-6 block opacity-80">{sectionTag}</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[4rem] leading-[1.1] font-light tracking-tight">{title}</h2>
            {desc && <p className="mt-6 text-champagne/60 font-light text-sm max-w-2xl leading-[2]">{desc}</p>}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-8 md:space-x-12 mb-10 md:mb-14 border-b border-white/10 w-full overflow-x-auto pb-4 scrollbar-none">
          {effectivePlans.map((p) => {
            const pid = p.tab_id || p.id || String(p.sort_order);
            const pname = p.tab_name || p.name || "";
            const isActive = pid === activeId;
            return (
              <button
                key={pid}
                onClick={() => setActiveId(pid)}
                className={`pb-3 whitespace-nowrap font-light text-[11px] uppercase tracking-[0.2em] transition-all duration-300 border-b-2 ${
                  isActive ? "text-gold border-gold" : "text-champagne/40 border-transparent hover:text-pearl-white hover:border-white/20"
                }`}
              >
                {pname}
              </button>
            );
          })}
        </div>

        {/* Active Plan Detail */}
        {activePlan && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Floor Plan Image */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded border border-white/10 bg-jet-black/60 h-[480px] lg:h-[560px] flex items-center justify-center">
                {activePlan.image_url || activePlan.img ? (
                  <img
                    src={activePlan.image_url || activePlan.img}
                    className="max-w-full max-h-full object-contain p-6"
                    alt={activePlan.tab_name || activePlan.name}
                  />
                ) : (
                  <div className="text-center text-champagne/20 text-[11px] uppercase tracking-[0.3em]">
                    [ Mặt Bằng: {activePlan.tab_name || activePlan.name} ]
                  </div>
                )}

                {/* Status Badge */}
                {activePlan.status && STATUS_CONFIG[activePlan.status] && (
                  <div className={`absolute top-4 left-4 text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border ${STATUS_CONFIG[activePlan.status].color}`}>
                    {STATUS_CONFIG[activePlan.status].label}
                    {activePlan.availability ? ` — ${activePlan.availability} Căn` : ""}
                  </div>
                )}

                {/* 3D Tour Button */}
                {activePlan.tour_3d_url && (
                  <a
                    href={activePlan.tour_3d_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 flex items-center gap-2 bg-gold/90 text-jet-black text-[9px] uppercase tracking-widest font-bold px-4 py-2 rounded hover:bg-gold transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tour 3D
                  </a>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              {/* Space name */}
              <h3 className="font-serif text-2xl lg:text-3xl font-light mb-3 text-pearl-white">
                {(locale === "vi" ? activePlan.space_name : activePlan.space_name_en) || activePlan.space_name || activePlan.spaceName}
              </h3>

              {/* Price */}
              {activePlan.price_display && (
                <div className="text-gold text-xl font-light mb-6">{activePlan.price_display}</div>
              )}

              {/* Description */}
              <p className="text-champagne/60 mb-10 font-light leading-[2] text-sm">
                {(locale === "vi" ? activePlan.description : activePlan.description_en) || activePlan.description || activePlan.desc}
              </p>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-y-8 gap-x-8 pt-8 border-t border-white/10">
                {/* Phòng ngủ */}
                {(activePlan.beds !== undefined || activePlan.spec_left_value) && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-champagne/40 mb-2">
                      {activePlan.spec_left_label || "PHÒNG NGỦ"}
                    </span>
                    <span className="text-xl font-light text-gold">
                      {activePlan.spec_left_value || activePlan.beds}
                    </span>
                  </div>
                )}
                {/* Diện tích */}
                {(activePlan.area_display || activePlan.area_m2 || activePlan.spec_right_value) && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-champagne/40 mb-2">
                      {activePlan.spec_right_label || "DIỆN TÍCH"}
                    </span>
                    <span className="text-xl font-light text-pearl-white">
                      {activePlan.spec_right_value || activePlan.area_display || `${activePlan.area_m2}m²`}
                    </span>
                  </div>
                )}
                {/* Phòng tắm */}
                {activePlan.baths !== undefined && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-champagne/40 mb-2">PHÒNG TẮM</span>
                    <span className="text-xl font-light text-pearl-white">{activePlan.baths}</span>
                  </div>
                )}
                {/* Ban công */}
                {activePlan.balcony && activePlan.balcony_area_m2 && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-champagne/40 mb-2">BAN CÔNG</span>
                    <span className="text-xl font-light text-pearl-white">{activePlan.balcony_area_m2}m²</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-10 flex gap-3">
                <a
                  href="#contact"
                  className="flex-1 bg-gold text-jet-black text-center text-[10px] uppercase tracking-[0.2em] font-bold py-4 hover:bg-gold/90 transition-colors rounded"
                >
                  Đăng Ký Xem
                </a>
                <a
                  href={`tel:0799036842`}
                  className="flex items-center gap-2 border border-white/20 text-white/70 text-[10px] uppercase tracking-[0.2em] py-4 px-5 hover:border-gold/50 hover:text-gold transition-colors rounded"
                >
                  Gọi Ngay
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
