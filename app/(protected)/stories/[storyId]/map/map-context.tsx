"use client";

import { createContext, useContext, useState, useEffect, useOptimistic, useTransition } from "react";
import { updateSceneOrder, updateMapSettings, createSceneAction } from "./actions";

// Types
export type ViewMode = "timeline" | "arc" | "characters";

export interface Scene {
  id: string;
  title: string;
  order: number;
  tension: number;
  duration: string; // numeric string
  description?: string;
  // ... other fields
}

export interface StoryMap {
  id: string;
  currentView: ViewMode;
  zoomLevel: string; // numeric string
  activeFilters: any[]; // Update with real type
  structureOverlayVisible?: boolean;
}

interface MapContextType {
  scenes: Scene[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  reorderScene: (activeId: string, overId: string) => void;
  addScene: (title: string) => void;
  isLoading: boolean;
  storyId: string;
  structureOverlayVisible: boolean;
  toggleStructureOverlay: () => void;
  selectedStructureId: string;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ 
  children, 
  initialScenes, 
  initialMap, 
  storyId,
  initialStructureId = "heros-journey" // Default
}: { 
  children: React.ReactNode; 
  initialScenes: Scene[]; 
  initialMap: StoryMap;
  storyId: string;
  initialStructureId?: string;
}) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [viewMode, setViewModeState] = useState<ViewMode>((initialMap.currentView as ViewMode) || "timeline");
  const [zoomLevel, setZoomLevelState] = useState<number>(parseFloat(initialMap.zoomLevel) || 1.0);
  const [structureOverlayVisible, setStructureOverlayVisible] = useState(initialMap.structureOverlayVisible ?? true);
  const [isPending, startTransition] = useTransition();

  // Optimistic updates for drag and drop could be implemented here or in the view component
  // For simplicity, we'll manage state here.

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    startTransition(async () => {
      await updateMapSettings(storyId, { currentView: mode });
    });
  };

  const toggleStructureOverlay = () => {
    setStructureOverlayVisible((prev) => {
      const newValue = !prev;
      startTransition(async () => {
        await updateMapSettings(storyId, { structureOverlayVisible: newValue });
      });
      return newValue;
    });
  };

  const setZoomLevel = (level: number) => {
    setZoomLevelState(level);
    // Debounce this in a real app
    startTransition(async () => {
      await updateMapSettings(storyId, { zoomLevel: level.toString() });
    });
  };

  const reorderScene = (activeId: string, overId: string) => {
    const oldIndex = scenes.findIndex((s) => s.id === activeId);
    const newIndex = scenes.findIndex((s) => s.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newScenes = [...scenes];
      const [movedScene] = newScenes.splice(oldIndex, 1);
      newScenes.splice(newIndex, 0, movedScene);

      // Update orders
      const updatedScenes = newScenes.map((scene, index) => ({
        ...scene,
        order: index + 1,
      }));

      setScenes(updatedScenes);

      startTransition(async () => {
        await updateSceneOrder(storyId, updatedScenes.map(s => ({ id: s.id, order: s.order })));
      });
    }
  };

  const addScene = (title: string) => {
    startTransition(async () => {
      const result = await createSceneAction(storyId, title);
      if (result.success && result.scene) {
        setScenes([...scenes, result.scene as unknown as Scene]);
      }
    });
  };

  return (
    <MapContext.Provider
      value={{
        scenes,
        viewMode,
        setViewMode,
        zoomLevel,
        setZoomLevel,
        reorderScene,
        addScene,
        isLoading: isPending,
        storyId,
        structureOverlayVisible,
        toggleStructureOverlay,
        selectedStructureId: initialStructureId,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
}



