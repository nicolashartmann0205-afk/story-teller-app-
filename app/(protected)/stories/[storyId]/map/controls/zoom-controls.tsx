"use client";

import { useMap } from "../map-context";

export function ZoomControls() {
  const { zoomLevel, setZoomLevel } = useMap();

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.1, 0.25));
  };

  const handleReset = () => {
    setZoomLevel(1.0);
  };

  return (
    <div className="flex bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
      <button
        onClick={handleZoomOut}
        className="px-2 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded"
        aria-label="Zoom Out"
      >
        -
      </button>
      <button
        onClick={handleReset}
        className="px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono min-w-[3rem] text-center hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded"
      >
        {Math.round(zoomLevel * 100)}%
      </button>
      <button
        onClick={handleZoomIn}
        className="px-2 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded"
        aria-label="Zoom In"
      >
        +
      </button>
    </div>
  );
}












