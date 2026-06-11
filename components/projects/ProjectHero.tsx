"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface ProjectHeroProps {
  tagline?: string;
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  bgImage?: string;
  bgVideo?: string;
  ctaText?: string;
  ctaHref?: string;
  locale?: string;
}

export default function ProjectHero({
  tagline = "LUXURY BEACHFRONT RESIDENCE",
  titleLine1 = "ALIZE",
  titleLine2 = "RESIDENCE",
  description = "Biểu tượng mới của giới thượng lưu bên bờ biển Mỹ Khê Đà Nẵng.",
  bgImage = "/images/sky-pool-alize-da-nang.webp",
  bgVideo,
  ctaText = "Khám Phá",
  ctaHref = "#overview",
  locale = "vi",
}: ProjectHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section id="hero" className="relative h-screen min-h-[700px] w-full flex items-end justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {bgVideo ? (
          <video
            ref={videoRef}
            src={bgVideo}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={bgImage}
            alt={titleLine1}
            className={`w-full h-[115%] -top-[8%] object-cover absolute transition-opacity duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
          />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-jet-black via-jet-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-jet-black/30 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto pb-24 md:pb-32 w-full">
        {/* Tagline */}
        <span className="block text-gold text-[9px] md:text-[11px] tracking-[0.5em] font-light uppercase mb-6 opacity-90">
          {tagline}
        </span>

        {/* Title */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-[7rem] font-normal text-pearl-white tracking-tighter leading-[1.0] mb-6">
          {titleLine1}
          <br />
          <span className="font-serif italic font-light text-pearl-white/90">{titleLine2}</span>
        </h1>

        {/* Description */}
        <p className="text-champagne/75 text-sm md:text-base lg:text-lg font-light tracking-wide max-w-2xl mx-auto leading-relaxed mb-10">
          {description}
        </p>

        {/* CTA */}
        <div className="flex items-center justify-center gap-4">
          <a
            href={ctaHref}
            className="inline-flex items-center gap-3 bg-transparent border border-gold/60 text-gold px-8 py-3.5 text-[10px] uppercase tracking-[0.3em] font-light hover:bg-gold hover:text-black transition-all duration-500"
          >
            {ctaText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-gold text-jet-black px-8 py-3.5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold/90 transition-all duration-300"
          >
            {locale === "vi" ? "Liên Hệ" : "Contact"}
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <div className="w-px h-12 bg-gradient-to-b from-gold/80 to-transparent animate-pulse" />
          <span className="text-[8px] uppercase tracking-[0.4em] text-champagne/50">Scroll</span>
        </div>
      </div>
    </section>
  );
}
