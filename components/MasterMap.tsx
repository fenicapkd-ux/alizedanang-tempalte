"use client";
import React, { useRef, useEffect } from 'react';
import Map, { NavigationControl, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapStore } from '../store/useMapStore';
import MapLegend from './map/MapLegend';
import MapPopup from './map/MapPopup';
import ProjectMarkers from './map/ProjectMarkers';
import PropertyMarkers from './map/PropertyMarkers';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function MasterMap({ properties, projects, locale }: { properties: any[], projects: any[], locale: string }) {
  const mapRef = useRef<MapRef>(null);
  const viewState = useMapStore((state) => state.viewState);
  const setViewState = useMapStore((state) => state.setViewState);
  const setBounds = useMapStore((state) => state.setBounds);

  // Set initial view state based on first project if available
  useEffect(() => {
    if (projects && projects.length > 0 && projects[0].lng) {
      setViewState({
        longitude: projects[0].lng,
        latitude: projects[0].lat,
        zoom: 5.5
      });
    }
  }, [projects, setViewState]);

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

        {/* MAPPING MEGA PROJECTS */}
        <ProjectMarkers projects={projects} />

        {/* CLUSTERING INDIVIDUAL PROPERTIES */}
        <PropertyMarkers properties={properties} mapRef={mapRef} />

        {/* POPUP MODAL */}
        <MapPopup locale={locale} />
      </Map>

      {/* Interactive Toggle */}
      <MapLegend />
    </div>
  );
}
