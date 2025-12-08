"use client";

import { useRef } from "react";
import { MapProvider, Scene, StoryMap } from "./map-context";
import { ViewSelector } from "./controls/view-selector";
import { ZoomControls } from "./controls/zoom-controls";
import { AddSceneButton } from "./controls/add-scene-button";
import { ExportButton } from "./controls/export-button";
import { AIAnalysisPanel } from "./ai-analysis/panel";
import { TimelineView } from "./views/timeline/timeline-view";
import { EmotionalArcView } from "./views/emotional-arc/emotional-arc-view";
import { CharacterTracksView } from "./views/character-tracks/character-tracks-view";
import { useMap } from "./map-context";

function MapContent() {
  const { viewMode } = useMap();
  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <ViewSelector />
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
          <ZoomControls />
        </div>
        <div className="flex items-center gap-4">
          <ExportButton targetRef={mapRef} />
          <AddSceneButton />
        </div>
      </div>

      {/* View Area */}
      <div className="flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 relative">
        <div ref={mapRef} className="absolute inset-0 overflow-auto p-8">
          {viewMode === "timeline" && <TimelineView />}
          {viewMode === "arc" && <EmotionalArcView />}
          {viewMode === "characters" && <CharacterTracksView />}
        </div>
        <AIAnalysisPanel />
      </div>
    </div>
  );
}

export function StoryMapClient({
  initialScenes,
  initialMap,
  storyId,
}: {
  initialScenes: Scene[];
  initialMap: StoryMap;
  storyId: string;
}) {
  return (
    <MapProvider
      initialScenes={initialScenes}
      initialMap={initialMap}
      storyId={storyId}
    >
      <MapContent />
    </MapProvider>
  );
}



