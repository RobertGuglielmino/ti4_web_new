import { create } from 'zustand'

type SettingsStore = {
  // State properties
  hoveredTile: string;
  zoomLevel: number;
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  enableOverlays: boolean;
  showTechLayer: boolean;
  showPDSLayer: boolean;
  showDistanceLayer: boolean;
  showControlLayer: boolean;
  showControlTokens: boolean;
  showExhaustedPlanets: boolean;

  // Actions
  setHoveredTile: (id: string) => void;
  clearHoveredTile: () => void;
  setZoomLevel: (level: number) => void;
  toggleLeftSidebarVisible: () => void;
  toggleRightSidebarVisible: () => void;
  toggleEnableOverlays: () => void;
  toggleShowTechLayer: () => void;
  toggleShowPDSLayer: () => void;
  toggleShowDistanceLayer: () => void;
  toggleShowControlLayer: () => void;
  toggleShowControlTokens: () => void;
  toggleShowExhaustedPlanets: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({

  hoveredTile: "",
  zoomLevel: 100,
  leftSidebarVisible: false,
  rightSidebarVisible: false,
  enableOverlays: false,
  showTechLayer: false,
  showPDSLayer: false,
  showDistanceLayer: false,
  showControlLayer: false,
  showControlTokens: false,
  showExhaustedPlanets: false,

  setHoveredTile: (id: string) => set((state) => ({
    ...state,
    hoveredTile: id
  })),
  clearHoveredTile: () => set((state) => ({
    ...state,
    hoveredTile: ""
  })),
  setZoomLevel: (level: number) => set((state) => ({
    ...state,
    zoomLevel: level
  })),
  toggleLeftSidebarVisible: () => set((state) => ({
    ...state,
    leftSidebarVisible: !state.leftSidebarVisible,
  })),
  toggleRightSidebarVisible: () => set((state) => ({
    ...state,
    rightSidebarVisible: !state.rightSidebarVisible,
  })),
  toggleEnableOverlays: () => set((state) => ({
    ...state,
    enableOverlays: !state.enableOverlays,
  })),
  toggleShowTechLayer: () => set((state) => ({
    ...state,
    showTechLayer: !state.showTechLayer,
  })),
  toggleShowPDSLayer: () => set((state) => ({
    ...state,
    showPDSLayer: !state.showPDSLayer,
  })),
  toggleShowDistanceLayer: () => set((state) => ({
    ...state,
    showDistanceLayer: !state.showDistanceLayer,
  })),
  toggleShowControlLayer: () => set((state) => ({
    ...state,
    showControlLayer: !state.showControlLayer,
  })),
  toggleShowControlTokens: () => set((state) => ({
    ...state,
    showControlTokens: !state.showControlTokens,
  })),
  toggleShowExhaustedPlanets: () => set((state) => ({
    ...state,
    showExhaustedPlanets: !state.showExhaustedPlanets,
  })),
}));
