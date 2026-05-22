"use client";
import React from 'react';
import { useMapStore } from '../../store/useMapStore';

export default function MapLegend() {
  const displayMode = useMapStore((state) => state.displayMode);
  const setDisplayMode = useMapStore((state) => state.setDisplayMode);
  const setPopupInfo = useMapStore((state) => state.setPopupInfo);

  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 bg-jet-black/80 backdrop-blur-md border border-white/10 px-2 py-2 rounded-full flex gap-2 items-center shadow-2xl pointer-events-auto">
      <button 
        onClick={() => {
          setDisplayMode('project');
          setPopupInfo(null);
        }}
        className={`flex items-center gap-3 px-6 py-2.5 rounded-full transition-all duration-300 ${displayMode === 'project' ? 'bg-gold/20 border border-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'hover:bg-white/5 border border-transparent'}`}
      >
        <span className="text-xl">⭐</span>
        <span className={`text-[10px] uppercase font-bold tracking-widest ${displayMode === 'project' ? 'text-gold text-shadow' : 'text-gray-400'}`}>Dự Án</span>
      </button>
      <div className="w-[1px] h-6 bg-white/20" />
      <button 
        onClick={() => {
          setDisplayMode('property');
          setPopupInfo(null);
        }}
        className={`flex items-center gap-3 px-6 py-2.5 rounded-full transition-all duration-300 ${displayMode === 'property' ? 'bg-[#E53935]/20 border border-[#E53935]/50 shadow-[0_0_15px_rgba(229,57,53,0.2)]' : 'hover:bg-white/5 border border-transparent'}`}
      >
        <div className={`w-4 h-4 rounded transition-colors ${displayMode === 'property' ? 'bg-[#E53935] shadow-[0_0_10px_rgba(229,57,53,0.5)]' : 'bg-gray-600'}`} />
        <span className={`text-[10px] uppercase font-bold tracking-widest ${displayMode === 'property' ? 'text-white text-shadow' : 'text-gray-400'}`}>Căn Hộ Đơn Bán</span>
      </button>
    </div>
  );
}
