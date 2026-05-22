"use client";
import React from 'react';
import { Popup } from 'react-map-gl/mapbox';
import Link from 'next/link';
import { useMapStore } from '../../store/useMapStore';

export default function MapPopup({ locale }: { locale: string }) {
  const popupInfo = useMapStore((state) => state.popupInfo);
  const setPopupInfo = useMapStore((state) => state.setPopupInfo);

  if (!popupInfo) return null;

  return (
    <Popup
      anchor="bottom"
      offset={{ bottom: [0, -35] }}
      longitude={popupInfo.type === 'project' ? popupInfo.lng : popupInfo.coordinates.lng}
      latitude={popupInfo.type === 'project' ? popupInfo.lat : popupInfo.coordinates.lat}
      onClose={() => setPopupInfo(null)}
      closeOnClick={false}
      className="text-jet-black z-50 property-map-popup"
    >
      <div className="w-[280px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {popupInfo.type === 'project' ? (
          <div className="p-4 flex flex-col gap-2">
            <div className="font-bold text-[10px] leading-tight text-gold tracking-widest uppercase text-center bg-jet-black py-1.5 rounded-md shadow-inner">
              SIÊU DỰ ÁN
            </div>
            <h3 className="font-serif text-lg font-bold text-jet-black">{popupInfo.name}</h3>
            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{popupInfo.hero_data?.description}</p>
            <Link href={`/${locale}/alize`} className="mt-2 block text-center bg-jet-black text-gold py-2 rounded-lg text-xs hover:bg-gold hover:text-jet-black transition-all duration-300 font-bold uppercase tracking-wider shadow-md">
              Khám Phá Dự Án
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="relative w-full h-32">
              <img src={popupInfo.img_url || '/images/can-ho-view-bien-my-khe-alize.webp'} alt={popupInfo.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-[#E53935] text-white px-2 py-1 rounded text-xs font-bold shadow-md">
                {popupInfo.price}
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <p className="text-sm font-semibold text-jet-black line-clamp-2">{popupInfo.name}</p>
              <Link href={`/${locale}/apartments/${popupInfo.id}`} className="mt-1 block text-center bg-[#070A10] text-white py-2 rounded-lg text-xs hover:bg-[#E53935] transition-colors font-bold shadow-md">
                Xem Chi Tiết
              </Link>
            </div>
          </div>
        )}
      </div>
    </Popup>
  );
}
