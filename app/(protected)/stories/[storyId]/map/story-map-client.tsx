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
import { ImageIcon, Loader2 } from "lucide-react";

function MapContent() {
  const {
    viewMode,
    generateSceneVisuals,
    isGeneratingVisuals,
    visualGenerationError,
    clearVisualGenerationError,
  } = useMap();
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
          <button
            type="button"
            onClick={() => generateSceneVisuals("cinematic")}
            disabled={isGeneratingVisuals}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-60"
          >
            {isGeneratingVisuals ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating visuals...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                Generate Visuals
              </>
            )}
          </button>
          <AddSceneButton />
        </div>
      </div>
      {visualGenerationError && (
        <div className="mx-4 mt-3 rounded-md border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
          <span>{visualGenerationError}</span>
          <button
            type="button"
            onClick={clearVisualGenerationError}
            className="underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}

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



