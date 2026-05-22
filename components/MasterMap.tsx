"use client";
import React, { useState, useRef, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';
import useSupercluster from 'use-supercluster';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function MasterMap({ properties, projects, locale }: { properties: any[], projects: any[], locale: string }) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [displayMode, setDisplayMode] = useState<'project' | 'property'>('project');

  const initialLong = projects.length > 0 && projects[0].lng ? projects[0].lng : 108.2022;
  const initialLat = projects.length > 0 && projects[0].lat ? projects[0].lat : 16.0544;

  const [viewState, setViewState] = useState({
    longitude: initialLong,
    latitude: initialLat,
    zoom: 5.5
  });
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  // Lọc và format dữ liệu cho properties (Chỉ cluster properties nhỏ, projects lớn giữ nguyên)
  const points = useMemo(() => {
    if (displayMode !== 'property') return []; // Tối ưu: không tính toán nếu không hiển thị
    return (properties || [])
      .filter(p => p.coordinates)
      .map(p => ({
        type: 'Feature' as const,
        properties: { cluster: false, data: p, id: `prop-${p.id}`, itemType: 'property' },
        geometry: { type: 'Point' as const, coordinates: [p.coordinates.lng, p.coordinates.lat] }
      }));
  }, [properties, displayMode]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewState.zoom,
    options: { radius: 75, maxZoom: 20 }
  });

  const updateBounds = () => {
    if (mapRef.current) {
      const mapBounds = mapRef.current.getMap().getBounds();
      setBounds([
        mapBounds.getWest(),
        mapBounds.getSouth(),
        mapBounds.getEast(),
        mapBounds.getNorth()
      ]);
    }
  };

  return (
    <div className="w-full h-screen relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={updateBounds}
        onLoad={updateBounds}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* 1. MAPPING MEGA PROJECTS (Luôn hiển thị, điều chỉnh scale theo zoom) */}
        {displayMode === 'project' && projects.map((proj) => {
          if (!proj.lat || !proj.lng) return null;
          const projectScale = Math.max(0.4, Math.min(1.5, viewState.zoom / 12));
          const isSelected = popupInfo?.type === 'project' && popupInfo?.id === proj.id;
          return (
            <Marker
              key={`proj-${proj.id}`}
              longitude={proj.lng}
              latitude={proj.lat}
              anchor="bottom"
              onClick={e => {
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

        {/* 2. CLUSTERING INDIVIDUAL PROPERTIES */}
        {displayMode === 'property' && clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const props = cluster.properties as any;
          const { cluster: isCluster, point_count: pointCount, data } = props;

          if (isCluster) {
            const baseSize = Math.min(30 + (pointCount / points.length) * 20, 50);
            const clusterScale = Math.max(0.5, Math.min(1.5, viewState.zoom / 10));
            const size = baseSize * clusterScale;
            return (
              <Marker key={`cluster-${cluster.id}`} longitude={longitude} latitude={latitude} anchor="center">
                <div
                  className="bg-[#E53935] text-white rounded-full flex items-center justify-center font-bold cursor-pointer border-2 border-white/30 shadow-[0_0_15px_rgba(229,57,53,0.5)] transition-transform hover:scale-110"
                  style={{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.max(10, size / 2.5)}px` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id as number), 20);
                    mapRef.current?.flyTo({
                      center: [longitude, latitude],
                      zoom: expansionZoom,
                      duration: 500
                    });
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          const prop = data;
          const markerScale = Math.max(0.4, Math.min(1.2, viewState.zoom / 12));
          const isSelected = popupInfo?.type === 'property' && popupInfo?.id === prop.id;
          return (
            <Marker
              key={cluster.properties.id}
              longitude={prop.coordinates.lng}
              latitude={prop.coordinates.lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setPopupInfo({ ...prop, type: 'property' });
              }}
              style={{ zIndex: isSelected ? 10 : 1 }}
            >
              <div 
                className={`bg-[#E53935] text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer hover:bg-white hover:text-[#E53935] transition-all duration-300 shadow-lg ${isSelected ? 'ring-4 ring-[#E53935] ring-offset-2 ring-offset-[#070A10] shadow-[0_0_15px_rgba(229,57,53,0.6)]' : ''}`}
                style={{ transform: `scale(${isSelected ? markerScale * 1.1 : markerScale})`, transformOrigin: 'bottom center' }}
              >
                {prop.price}
              </div>
            </Marker>
          );
        })}

        {/* 3. POPUP MODAL */}
        {popupInfo && (
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
        )}
      </Map>

      {/* Floating Legend / Banner Overlay - Interactive Toggle */}
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
    </div>
  );
}
