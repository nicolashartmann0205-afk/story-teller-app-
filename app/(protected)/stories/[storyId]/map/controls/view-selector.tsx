"use client";

import { useMap, ViewMode } from "../map-context";

export function ViewSelector() {
  const { viewMode, setViewMode } = useMap();

  const views: { id: ViewMode; label: string; icon: string }[] = [
    { id: "timeline", label: "Timeline", icon: "📅" },
    { id: "arc", label: "Emotional Arc", icon: "📈" },
    { id: "characters", label: "Character Tracks", icon: "👥" },
  ];

  return (
    <div className="flex bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => setViewMode(view.id)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewMode === view.id
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <span>{view.icon}</span>
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </div>
  );
}






