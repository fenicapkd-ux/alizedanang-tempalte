"use client";
import React, { useMemo } from 'react';
import { Marker } from 'react-map-gl/mapbox';
import useSupercluster from 'use-supercluster';
import { useMapStore } from '../../store/useMapStore';

export default function PropertyMarkers({ properties, mapRef }: { properties: any[], mapRef: any }) {
  const displayMode = useMapStore((state) => state.displayMode);
  const viewState = useMapStore((state) => state.viewState);
  const bounds = useMapStore((state) => state.bounds);
  const popupInfo = useMapStore((state) => state.popupInfo);
  const setPopupInfo = useMapStore((state) => state.setPopupInfo);

  const points = useMemo(() => {
    if (displayMode !== 'property') return [];
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

  if (displayMode !== 'property') return null;

  return (
    <>
      {clusters.map((cluster) => {
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
            onClick={(e) => {
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
    </>
  );
}
