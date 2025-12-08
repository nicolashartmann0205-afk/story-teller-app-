"use client";

import { Archetype } from "@/lib/data/archetypes";
import { useState, useEffect } from "react";

interface DarkSidesExplorerProps {
  archetype: Archetype;
  onChange?: (state: { tooMuch: boolean; tooLittle: boolean }) => void;
  initialState?: { tooMuch: boolean; tooLittle: boolean };
}

export function DarkSidesExplorer({
  archetype,
  onChange,
  initialState = { tooMuch: false, tooLittle: false },
}: DarkSidesExplorerProps) {
  const [selection, setSelection] = useState(initialState);

  useEffect(() => {
    if (onChange) {
      onChange(selection);
    }
  }, [selection, onChange]);

  const toggleSelection = (side: "tooMuch" | "tooLittle") => {
    setSelection(prev => ({
      ...prev,
      [side]: !prev[side]
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          The Shadow Side
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400">
          Every gift has a shadow. Select the struggles your character faces (choose one or both).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Too Much (Excess) */}
        <div
          onClick={() => toggleSelection("tooMuch")}
          className={`
            relative p-6 rounded-xl border-2 transition-all cursor-pointer overflow-hidden group
            ${
              selection.tooMuch
                ? "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500"
                : "border-zinc-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-700 bg-white dark:bg-zinc-900"
            }
          `}
        >
          <div className={`absolute top-4 right-4 w-6 h-6 rounded border flex items-center justify-center transition-colors ${selection.tooMuch ? "bg-red-500 border-red-500 text-white" : "border-zinc-300"}`}>
             {selection.tooMuch && <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 pr-8">
              <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                The Excess
              </h4>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                Too Much
              </span>
            </div>
            
            <h5 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
              {archetype.darkSides.tooMuch.name}
            </h5>
            
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
              {archetype.darkSides.tooMuch.description}
            </p>

            <div className="text-sm text-zinc-500 dark:text-zinc-400 italic border-l-2 border-red-200 dark:border-red-800 pl-3">
              "When {archetype.name.toLowerCase()} energy runs wild, it becomes oppressive."
            </div>
          </div>
        </div>

        {/* Too Little (Deficiency) */}
        <div
          onClick={() => toggleSelection("tooLittle")}
          className={`
            relative p-6 rounded-xl border-2 transition-all cursor-pointer overflow-hidden group
            ${
              selection.tooLittle
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-zinc-900"
            }
          `}
        >
          <div className={`absolute top-4 right-4 w-6 h-6 rounded border flex items-center justify-center transition-colors ${selection.tooLittle ? "bg-blue-500 border-blue-500 text-white" : "border-zinc-300"}`}>
             {selection.tooLittle && <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 pr-8">
              <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                The Deficiency
              </h4>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">
                Too Little
              </span>
            </div>
            
            <h5 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-2">
              {archetype.darkSides.tooLittle.name}
            </h5>
            
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
              {archetype.darkSides.tooLittle.description}
            </p>

            <div className="text-sm text-zinc-500 dark:text-zinc-400 italic border-l-2 border-blue-200 dark:border-blue-800 pl-3">
              "When {archetype.name.toLowerCase()} energy is suppressed, it leaves a void."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
