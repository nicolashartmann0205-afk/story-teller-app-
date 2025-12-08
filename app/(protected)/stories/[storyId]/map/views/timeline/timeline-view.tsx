"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMap } from "../../map-context";
import { SceneCard } from "./scene-card";
import { StructureOverlay } from "./structure-overlay";

export function TimelineView() {
  const { scenes, reorderScene } = useMap();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require drag distance to prevent accidental drags on clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderScene(active.id as string, over.id as string);
    }
  };

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-500 dark:text-zinc-400">
        <p>No scenes yet. Add your first scene to get started!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-x-auto p-8">
        <div className="relative min-w-max min-h-[400px] flex items-center">
          {/* Structure Overlay Background */}
          <StructureOverlay />
          
          <div className="relative z-10 flex gap-4 items-center px-8 py-12 min-w-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={scenes.map((s) => s.id)}
                strategy={horizontalListSortingStrategy}
              >
                {scenes.map((scene) => (
                  <SceneCard key={scene.id} scene={scene} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
}
