import { create } from 'zustand';

interface MapState {
  displayMode: 'project' | 'property';
  setDisplayMode: (mode: 'project' | 'property') => void;
  popupInfo: any | null;
  setPopupInfo: (info: any | null) => void;
  viewState: { longitude: number; latitude: number; zoom: number };
  setViewState: (viewState: { longitude: number; latitude: number; zoom: number }) => void;
  bounds: [number, number, number, number] | null;
  setBounds: (bounds: [number, number, number, number] | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  displayMode: 'project',
  setDisplayMode: (mode) => set({ displayMode: mode }),
  popupInfo: null,
  setPopupInfo: (info) => set({ popupInfo: info }),
  viewState: { longitude: 108.2022, latitude: 16.0544, zoom: 5.5 },
  setViewState: (viewState) => set({ viewState }),
  bounds: null,
  setBounds: (bounds) => set({ bounds }),
}));
