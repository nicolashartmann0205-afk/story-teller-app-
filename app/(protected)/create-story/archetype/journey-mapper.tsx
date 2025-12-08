"use client";

import { Archetype } from "@/lib/data/archetypes";
import { useState, useEffect } from "react";

interface JourneyMapperProps {
  archetype: Archetype;
  shadowType?: "tooMuch" | "tooLittle" | null; // Optional context
  onChange?: (journey: { start: string; middle: string; end: string }) => void;
  initialJourney?: { start: string; middle: string; end: string };
}

export function JourneyMapper({ archetype, shadowType, onChange, initialJourney }: JourneyMapperProps) {
  const [journey, setJourney] = useState({
    start: initialJourney?.start || "",
    middle: initialJourney?.middle || "",
    end: initialJourney?.end || "",
  });

  // If values change, notify parent
  useEffect(() => {
    if (onChange) {
      onChange(journey);
    }
  }, [journey, onChange]);

  // Default shadow for visual reference
  const startingShadow = shadowType && archetype.darkSides[shadowType] 
    ? archetype.darkSides[shadowType] 
    : archetype.darkSides.tooLittle;

  const handleInputChange = (field: "start" | "middle" | "end", value: string) => {
    setJourney(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Map Your Character's Arc
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400">
          Define how your character transforms from their shadow self to their true potential.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stage 1: The Shadow (Start) */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl">
              🌑
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100">The Beginning</h4>
              <p className="text-xs text-zinc-500">The Shadow State</p>
            </div>
          </div>
          
          <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700">
            <strong>Suggestion:</strong> Start with the {startingShadow.name} aspect ({shadowType === "tooMuch" ? "Excess" : "Deficiency"}).
          </div>

          <textarea
            value={journey.start}
            onChange={(e) => handleInputChange("start", e.target.value)}
            placeholder={`e.g. The hero is stuck in ${startingShadow.name.toLowerCase()} behavior...`}
            className="flex-1 w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            rows={4}
          />
        </div>

        {/* Stage 2: The Awakening (Middle) */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100">The Challenge</h4>
              <p className="text-xs text-purple-600 dark:text-purple-400">The Transformation</p>
            </div>
          </div>

          <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900/30">
             <strong>Suggestion:</strong> How do they face their fear or learn their lesson?
          </div>

          <textarea
            value={journey.middle}
            onChange={(e) => handleInputChange("middle", e.target.value)}
            placeholder="e.g. The hero is forced to confront their fear of..."
            className="flex-1 w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            rows={4}
          />
        </div>

        {/* Stage 3: The Mastery (End) */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center text-xl">
              {archetype.icon}
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100">The Resolution</h4>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">The Mastery</p>
            </div>
          </div>

          <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
             <strong>Suggestion:</strong> They embody the {archetype.name} and use the gift: {archetype.gift}.
          </div>

          <textarea
            value={journey.end}
            onChange={(e) => handleInputChange("end", e.target.value)}
            placeholder={`e.g. The hero finally embraces their role as the ${archetype.name}...`}
            className="flex-1 w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
