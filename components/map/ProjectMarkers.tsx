"use client";
import React from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { useMapStore } from '../../store/useMapStore';

export default function ProjectMarkers({ projects }: { projects: any[] }) {
  const displayMode = useMapStore((state) => state.displayMode);
  const viewState = useMapStore((state) => state.viewState);
  const popupInfo = useMapStore((state) => state.popupInfo);
  const setPopupInfo = useMapStore((state) => state.setPopupInfo);

  if (displayMode !== 'project') return null;

  return (
    <>
      {projects.map((proj) => {
        if (!proj.lat || !proj.lng) return null;
        const projectScale = Math.max(0.4, Math.min(1.5, viewState.zoom / 12));
        const isSelected = popupInfo?.type === 'project' && popupInfo?.id === proj.id;
        
        return (
          <Marker
            key={`proj-${proj.id}`}
            longitude={proj.lng}
            latitude={proj.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo({ ...proj, type: 'project' });
            }}
            style={{ zIndex: isSelected ? 10 : 1 }}
          >
            <div 
              className={`bg-gold text-jet-black px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:bg-white transition-all duration-300 flex items-center gap-2 border-2 border-white/20 whitespace-nowrap ${isSelected ? 'ring-4 ring-gold ring-offset-2 ring-offset-[#070A10] shadow-[0_0_20px_rgba(212,175,55,0.6)]' : 'shadow-lg shadow-gold/30'}`}
              style={{ transform: `scale(${isSelected ? projectScale * 1.1 : projectScale})`, transformOrigin: 'bottom center' }}
            >
              <span>⭐</span> {proj.name}
            </div>
          </Marker>
        );
      })}
    </>
  );
}
