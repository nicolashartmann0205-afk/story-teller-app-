"use client";

import { Archetype } from "@/lib/data/archetypes";

interface ArchetypeCardProps {
  archetype: Archetype;
  isSelected: boolean;
  onSelect: () => void;
  onInfo?: (e: React.MouseEvent) => void;
}

export function ArchetypeCard({ archetype, isSelected, onSelect, onInfo }: ArchetypeCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 group
        ${
          isSelected
            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 ring-2 ring-purple-500 ring-opacity-50"
            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg hover:-translate-y-1"
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 bg-purple-500 rounded-full text-white z-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {onInfo && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInfo(e);
          }}
          className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-colors z-20 opacity-0 group-hover:opacity-100"
          title="Learn more"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      <div className="text-5xl mb-4">{archetype.icon}</div>
      
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        {archetype.name}
      </h3>
      
      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3">
        {archetype.tagline}
      </p>
      
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {archetype.description}
      </p>

      <div className="mt-auto pt-4">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
          Gift: {archetype.gift.split('.')[0]}
        </span>
      </div>
    </div>
  );
}
