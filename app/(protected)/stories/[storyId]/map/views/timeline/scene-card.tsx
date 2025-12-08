"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Scene } from "../../map-context";

interface SceneCardProps {
  scene: Scene;
}

export function SceneCard({ scene }: SceneCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`w-64 shrink-0 p-4 border rounded-lg shadow-sm bg-white dark:bg-zinc-800 transition-colors cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-lg border-zinc-400 dark:border-zinc-600 z-50" : "hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {scene.title}
        </h4>
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          #{scene.order}
        </span>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 dark:bg-blue-400" 
            style={{ width: `${(scene.tension / 10) * 100}%` }}
          />
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 w-8 text-right">
          T:{scene.tension}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{scene.duration}m</span>
        {/* Placeholder for characters or other metadata */}
      </div>
    </div>
  );
}



