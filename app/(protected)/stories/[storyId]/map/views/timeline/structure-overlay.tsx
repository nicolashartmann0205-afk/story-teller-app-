"use client";

import { useMap } from "../../map-context";
import { structureDefinitions } from "@/lib/data/structures";
import { cn } from "@/lib/utils";

export function StructureOverlay() {
  const { selectedStructureId, structureOverlayVisible, scenes } = useMap();
  
  if (!structureOverlayVisible || !selectedStructureId) return null;
  
  const structure = structureDefinitions[selectedStructureId];
  if (!structure) return null;

  // Calculate total scenes or duration to map beats
  // For simple visualization, we map beats to percentage of the container width
  // In a real horizontal timeline, this would align with scene widths
  
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
      <div className="relative w-full h-full">
        {/* Render Act Dividers */}
        {Object.entries(structure.acts).map(([actNum, act]) => {
          // Calculate position based on accumulated percentage
          // This is a simplification. Ideally, acts are ranges.
          // Let's assume standard 25/50/25 split positions: 0, 25, 75, 100
          let left = 0;
          let width = act.percentage;
          if (actNum === "2") left = structure.acts[1].percentage;
          if (actNum === "3") left = structure.acts[1].percentage + structure.acts[2].percentage;
          
          return (
            <div 
              key={`act-${actNum}`}
              className="absolute top-0 bottom-0 border-l border-r border-dashed border-purple-300/50 bg-purple-50/10"
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              <div className="absolute top-2 left-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                Act {actNum}: {act.name}
              </div>
            </div>
          );
        })}

        {/* Render Beat Markers */}
        {structure.beats.map((beat) => (
          <div
            key={beat.id}
            className="absolute bottom-0 transform -translate-x-1/2 flex flex-col items-center group"
            style={{ left: `${beat.positionPercentage}%` }}
          >
            <div className={cn(
              "w-0.5 h-full bg-purple-400/30 absolute bottom-6",
              beat.required ? "bg-purple-500/50" : "bg-purple-300/30"
            )} />
            <div className="relative">
              <div className={cn(
                "w-3 h-3 rounded-full border-2 bg-white z-10 mb-1 cursor-help transition-transform hover:scale-125",
                beat.required ? "border-purple-600" : "border-purple-300"
              )} />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[150px] bg-gray-900/90 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50">
                <div className="font-bold">{beat.name}</div>
                <div className="text-gray-300 text-[10px]">{beat.description}</div>
              </div>
            </div>
            <div className="text-[10px] font-medium text-purple-600 mt-1 max-w-[60px] text-center leading-tight truncate">
              {beat.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

